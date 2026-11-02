# TypeScript integration contracts and examples
```ts
export type ReviewState = 'candidate'|'review_pending'|'verified'|'blocked';
export type IntegrationMode = 'DIRECT_API'|'OFFICIAL_EMBED'|'EXTERNAL_LINK'|'METADATA_ONLY'|'CACHE_ALLOWED'|'DOWNLOAD_ALLOWED'|'REHOST_ALLOWED'|'ITEM_LEVEL_REVIEW'|'UNKNOWN_USAGE';
export interface Provenance { provider:string; sourceId:string; canonicalUrl:string; version?:string; retrievedAt:string; rightsId?:string; reviewState:ReviewState }
export interface TafsirRecord { id:string; resourceId:string; verseKey:`${number}:${number}`; language:string; textHtml:string; edition?:string; provenance:Provenance }
export interface HadithRecord { id:string; collectionId:string; bookId?:string; hadithNumber:string; arabic?:string; translation?:string; narrator?:string; isnad?:string; grade?:{text:string;assessor?:string;sourceUrl?:string}; editorialReview:ReviewState; provenance:Provenance }
export interface Reciter { id:string; name:string; provider:string }
export interface Recitation { id:string; reciterId:string; narration?:string; provider:string }
export interface AudioTrack { id:string; recitationId:string; surah:number; streamUrl?:string; rightsId?:string; provenance:Provenance }
export interface AyahAudio { trackId:string; verseKey:`${number}:${number}`; startMs?:number; endMs?:number; url?:string }
export interface MediaRecord { id:string; kind:'video'|'image'|'manuscript'|'audio'; title:string; externalId:string; canonicalUrl:string; thumbnailUrl?:string; embedUrl?:string; durationSeconds?:number; attribution?:string; provenance:Provenance }
export interface KidsContentRecord extends MediaRecord { ageBand:'6-8'|'9-12'|'13-15'|'family'; format:'story'|'video'|'audio'|'activity'|'printable'; summary:string; parentNotes?:string; depictionReviewed:boolean }
export interface SearchDocument { id:string; domain:string; entityId:string; route:string; title:string; body:string; language:string; sourceId:string; versionId?:string; availability:string; reviewState:ReviewState }
export interface TafsirProvider { getByVerse(resourceId:string,verseKey:string):Promise<TafsirRecord[]> }
export interface HadithProvider { search(query:string,cursor?:string):Promise<{items:HadithRecord[];nextCursor?:string}> }
export interface AudioProvider { listReciters():Promise<Reciter[]>; getTrack(recitationId:string,surah:number):Promise<AudioTrack|null> }
export interface GeocodingProvider { searchCity(query:string):Promise<{id:string;city:string;countryCode:string;lat:number;lng:number;timezone?:string}[]> }
```

Backend-only Quran Foundation sample (credential and SDK docs: https://api-docs.quran.foundation/docs/quickstart/). Error, token cache and retry are simplified for clarity; wire into an existing backend adapter:
```ts
let tokenCache: {value:string;expiresAt:number}|undefined;
async function qfToken():Promise<string> {
  if(tokenCache && Date.now()<tokenCache.expiresAt) return tokenCache.value;
  const id=process.env.QF_CLIENT_ID!, secret=process.env.QF_CLIENT_SECRET!;
  const auth=Buffer.from(`${id}:${secret}`).toString('base64');
  const r=await fetch('https://prelive-oauth2.quran.foundation/oauth2/token',{
    method:'POST',headers:{Authorization:`Basic ${auth}`,'Content-Type':'application/x-www-form-urlencoded'},
    body:'grant_type=client_credentials&scope=content',signal:AbortSignal.timeout(10000)
  });
  if(!r.ok) throw new Error(`QF token HTTP ${r.status}`);
  const v=await r.json() as {access_token:string;expires_in:number};
  tokenCache={value:v.access_token,expiresAt:Date.now()+Math.max(0,v.expires_in-90)*1000};
  return v.access_token;
}
export async function qfGet<T>(path:string):Promise<T>{
  if(!path.startsWith('/content/api/v4/')) throw Error('Unexpected QF path');
  for(let attempt=0;attempt<3;attempt++){
    const token=await qfToken();
    const r=await fetch('https://apis-prelive.quran.foundation'+path,{
      headers:{'x-auth-token':token,'x-client-id':process.env.QF_CLIENT_ID!},
      signal:AbortSignal.timeout(10000)
    });
    if(r.status===401 && attempt===0){tokenCache=undefined;continue;}
    if((r.status===429||r.status>=500)&&attempt<2){
      await new Promise(resolve=>setTimeout(resolve,500*2**attempt+Math.random()*250));continue;
    }
    if(!r.ok) throw Error(`QF HTTP ${r.status}`);
    return await r.json() as T;
  }
  throw Error('QF retries exhausted');
}
// Production: switch *both* hosts and credentials together after provider approval.
```

MP3Quran documented reciter response; list first, avoid guessing specific server:
```ts
type Mp3Reciter={id:number;name:string;moshaf:Array<{id:number;name:string;server:string;surah_list:string}>};
export async function mp3Reciters():Promise<Mp3Reciter[]>{
 const r=await fetch('https://mp3quran.net/api/v3/reciters?language=eng',{signal:AbortSignal.timeout(10000)});
 if(!r.ok)throw Error(`MP3Quran HTTP ${r.status}`);
 const data=await r.json() as {reciters:Mp3Reciter[]};
 if(!Array.isArray(data.reciters))throw Error('Invalid reciters response');
 return data.reciters;
}
```

IIIF Presentation 3 sample inspected live:
```tsx
import {useEffect,useState} from 'react';
type Canvas={id:string;type:'Canvas';label?:Record<string,string[]>;items?:Array<{items?:Array<{body?:{id:string;type:string;service?:Array<{id:string}>}}>} >};
export function IiifPages({manifestUrl}:{manifestUrl:string}){
 const [pages,setPages]=useState<Array<{id:string;src:string;label:string}>>([]);
 useEffect(()=>{const c=new AbortController(); fetch(manifestUrl,{signal:c.signal}).then(r=>{if(!r.ok)throw Error(String(r.status));return r.json()}).then((m:{type:string;items?:Canvas[]})=>{
  if(m.type!=='Manifest')throw Error('Use a Presentation 2 adapter for this item');
  setPages((m.items??[]).flatMap((x,i)=>{const body=x.items?.flatMap(p=>p.items??[]).find(a=>a.body?.type==='Image')?.body;
   return body?.id?[{id:x.id,src:body.id,label:x.label?.en?.[0]??`Page ${i+1}`}]:[];}));
 }).catch(e=>{if(e.name!=='AbortError')console.error(e)});return()=>c.abort()},[manifestUrl]);
 return <div>{pages.map(p=><figure key={p.id}><img loading="lazy" src={p.src} alt={p.label}/><figcaption>{p.label}</figcaption></figure>)}</div>;
}
```
For huge canvases use an IIIF-aware deep-zoom viewer and the declared ImageService; don't request originals just to build thumbnails. CORS/rights are item-specific.

YouTube curated embed (ID from search API, no HTML injection):
```tsx
export function Video({id,title}:{id:string;title:string}){
 if(!/^[A-Za-z0-9_-]{11}$/.test(id))return null;
 return <iframe title={title} loading="lazy" src={`https://www.youtube-nocookie.com/embed/${id}`}
 allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin"/>;
}
```

Qibla already implemented in `client/src/visual-golden/services/prayer/qibla.ts`. Test with independent formula/reference rather than duplicate code:
```ts
import {qiblaBearing} from '../client/src/visual-golden/services/prayer/qibla';
const bearing=qiblaBearing(24.4539,54.3773);
if(!(bearing>250&&bearing<270))throw Error(`unexpected Abu Dhabi bearing ${bearing}`);
```
