import { useSyncExternalStore } from "react";
import type { PrayerLocation, PrayerCalculationSettings } from "@/visual-golden/services/prayer/types";
import { findLocation } from "@/visual-golden/services/prayer/locations";

export type ThemeMode = "dark" | "light";
export type UiLang = "ar" | "en";
export type ShellPanel = null | "favorites" | "notes" | "journey" | "notifications";
export interface FavoriteItem { id: string; title: string; path: string; at: number; }
export interface NoteItem { id: string; title: string; body: string; at: number; }
export interface JourneyEvent { id: string; kind: "visit" | "bookmark" | "note"; label: string; path?: string; at: number; }
interface InstitutionState {
 theme: ThemeMode; lang: UiLang; panel: ShellPanel; hydrated: boolean;
 favorites: FavoriteItem[]; notes: NoteItem[]; journey: JourneyEvent[]; visits: Record<string, number>;
 notifyLeadMin: 5|10|15|30; notifyPrayers: string[]; notifySound: boolean;
 locationId: string; customLocation: PrayerLocation|null; calc: PrayerCalculationSettings; recentLocationIds: string[];
 hydrate:()=>void; setTheme:(t:ThemeMode)=>void; setLang:(l:UiLang)=>void; setPanel:(p:ShellPanel)=>void;
 toggleFavorite:(item:Omit<FavoriteItem,"at">)=>void; addNote:(title:string,body:string)=>void; removeNote:(id:string)=>void;
 recordVisit:(path:string,label:string)=>void; setNotify:(patch:Partial<Pick<InstitutionState,"notifyLeadMin"|"notifyPrayers"|"notifySound">>)=>void;
 setLocation:(loc:PrayerLocation)=>void; setCalc:(patch:Partial<PrayerCalculationSettings>)=>void;
}
const KEY="yra-visual-golden-v1";
let state: InstitutionState;
const listeners=new Set<()=>void>();
const emit=()=>listeners.forEach(fn=>fn());
function save(){ if(typeof window==='undefined')return; const {panel,hydrated,...persisted}=state; try{localStorage.setItem(KEY,JSON.stringify(persisted));}catch{} }
function patch(p:Partial<InstitutionState>){ state={...state,...p}; save(); emit(); }
const actions = {
 hydrate(){ if(typeof window==='undefined')return; try{const raw=localStorage.getItem(KEY); if(raw){ const s=JSON.parse(raw); state={...state,...s,hydrated:true}; } else state={...state,hydrated:true}; }catch{state={...state,hydrated:true};} emit(); },
 setTheme(theme:ThemeMode){patch({theme});}, setLang(lang:UiLang){patch({lang});}, setPanel(panel:ShellPanel){state={...state,panel}; emit();},
 toggleFavorite(item:Omit<FavoriteItem,"at">){ const exists=state.favorites.some(f=>f.id===item.id); const favorites=exists?state.favorites.filter(f=>f.id!==item.id):[{...item,at:Date.now()},...state.favorites].slice(0,40); const journey=exists?state.journey:[{id:`j-${Date.now()}`,kind:"bookmark" as const,label:item.title,path:item.path,at:Date.now()},...state.journey].slice(0,40); patch({favorites,journey});},
 addNote(title:string,body:string){const note={id:`n-${Date.now()}`,title,body,at:Date.now()}; patch({notes:[note,...state.notes].slice(0,50),journey:[{id:`j-${Date.now()}`,kind:"note" as const,label:title,at:Date.now()},...state.journey].slice(0,40)});},
 removeNote(id:string){patch({notes:state.notes.filter(n=>n.id!==id)});},
 recordVisit(path:string,label:string){const visits={...state.visits,[path]:(state.visits[path]??0)+1}; const last=state.journey[0]; if(last?.kind==='visit'&&last.path===path){patch({visits});return;} patch({visits,journey:[{id:`v-${Date.now()}`,kind:"visit" as const,label,path,at:Date.now()},...state.journey].slice(0,40)});},
 setNotify(patchValue:Partial<Pick<InstitutionState,"notifyLeadMin"|"notifyPrayers"|"notifySound">>){patch(patchValue);},
 setLocation(loc:PrayerLocation){const known=findLocation(loc.id); const recents=[loc.id,...state.recentLocationIds.filter(id=>id!==loc.id)].slice(0,6); patch({locationId:loc.id,customLocation:known?null:loc,recentLocationIds:recents});},
 setCalc(p:Partial<PrayerCalculationSettings>){patch({calc:{...state.calc,...p}});},
};
const initialTheme:ThemeMode=typeof document!=="undefined"&&document.documentElement.dataset.initialTheme==="light"?"light":"dark";
state={theme:initialTheme,lang:"ar",panel:null,hydrated:false,favorites:[],notes:[],journey:[],visits:{},notifyLeadMin:10,notifyPrayers:["Fajr","Dhuhr","Asr","Maghrib","Isha"],notifySound:false,locationId:"ae-auh",customLocation:null,calc:{method:8,school:0,highLatitude:"auto"},recentLocationIds:["ae-auh"],...actions};
const subscribe=(listener:()=>void)=>{ listeners.add(listener); return ()=>{ listeners.delete(listener); }; };
export function useInstitution<T>(selector:(s:InstitutionState)=>T):T{ return useSyncExternalStore(subscribe,()=>selector(state),()=>selector(state)); }
export function currentLocation():PrayerLocation{return state.customLocation??findLocation(state.locationId)??findLocation("ae-auh")!;}
