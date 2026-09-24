#!/usr/bin/env python3
from __future__ import annotations
import csv, hashlib, json, re, urllib.request
from collections import Counter, defaultdict
from pathlib import Path

ROOT=Path("research/library-acquisition/2026-09-23")
INPUT=ROOT/"inputs"
URL="https://zenodo.org/records/17767721/files/OpenITI_metadata_2025-1-9.tsv?download=1"
MD5="cb2226f64264efa964df9ef659d40199"
BASE="df5da118675ef79529b119f55e956387f501289e"
BRANCH="research/library-acquisition-20260923-deep1"

def null(v):
    if v is None: return None
    s=str(v).strip()
    return None if not s or s.upper() in {"NULL","UNVERIFIED"} else s

def safe(s):
    return re.sub(r"[^A-Za-z0-9._-]+","_",str(s or "")).strip("_")

def norm_ar(s):
    s=str(s or "").translate(str.maketrans({"أ":"ا","إ":"ا","آ":"ا","ٱ":"ا","ى":"ي","ـ":""}))
    s=re.sub(r"[\u064B-\u065F\u0670\u06D6-\u06ED]","",s)
    s=re.sub(r"""[“”"'´.,،؛:!?؟()\[\]{}\-–—]"""," ",s)
    return re.sub(r"\s+"," ",s).strip().lower()

def strip_paren(s):
    return re.sub(r"\([^)]*\)","",str(s or "")).strip()

def first_url(s):
    m=re.search(r"https?://[^\s]+",str(s or ""))
    return m.group(0).rstrip("),;") if m else None

def category(tags,title):
    t=(str(tags or "")+" "+str(title or "")).upper(); a=str(title or "")
    if "_TAFSIR" in t or "TAFSIR" in t or "تفسير" in a: return "B-التفسير","تفسير"
    if ("_QURAN" in t or "QURAN" in t) and "_TAFSIR" not in t: return "A-القرآن وعلومه","علوم القرآن/المصحف"
    if any(x in t for x in ["_HADITH","HADITH","_SUNAN","_MASANID"]): return "C-الحديث النبوي","حديث وعلومه"
    if any(x in t for x in ["_SIRA","SIRA","MAGHAZI"]) or any(x in a for x in ["السيرة","المغازي","الشمائل"]): return "D-السيرة النبوية","السيرة والمغازي"
    if "الصحابة" in a or "SAHABA" in t: return "E-الصحابة رضي الله عنهم","تراجم الصحابة"
    if "أمهات المؤمنين" in a or "أهل البيت" in a: return "F-أمهات المؤمنين وأهل البيت","تراجم"
    if "التابعين" in a: return "G-التابعون وتابعو التابعين","طبقات"
    if any(x in t for x in ["_TARAJIM","TARAJIM","_TABAQAT"]) or any(x in a for x in ["طبقات","تراجم","وفيات","أعلام"]): return "H-التراجم والطبقات","تراجم وطبقات"
    if any(x in t for x in ["_CAQAID","AQID","_MILAL"]) or any(x in a for x in ["العقيدة","التوحيد"]): return "I-العقيدة","العقيدة والفرق"
    if any(x in t for x in ["_USUL","_QAWACID"]) or any(x in a for x in ["أصول الفقه","القواعد الفقهية","المقاصد"]): return "K-أصول الفقه والقواعد","أصول وقواعد"
    if "_FIQH" in t or "FIQH" in t or "الفقه" in a: return "J-الفقه","فقه"
    if "FATAWA" in t or "فتاوى" in a: return "L-الفتاوى","فتاوى"
    if "_ZUHD" in t or any(x in a for x in ["الزهد","الأذكار","الأخلاق","الرقائق"]): return "M-الزهد والرقائق والأخلاق","زهد وآداب"
    if "_TARIKH" in t or "HISTORY" in t or "تاريخ" in a: return "N-التاريخ الإسلامي","تاريخ"
    if "_BULDAN" in t or any(x in a for x in ["البلدان","رحلة","المسالك","الممالك"]): return "O-الجغرافيا والرحلات","جغرافيا ورحلات"
    if any(x in a for x in ["المرأة","النساء","الأسرة"]): return "R-المرأة والأسرة","المرأة والأسرة"
    if any(x in a for x in ["الأطفال","الطفل"]): return "S-الطفل","تعليم الطفل"
    if any(x in a for x in ["فهرس","فهارس","كشاف","موسوعة"]): return "T-الموسوعات والفهارس","فهارس وموسوعات"
    if any(x in t for x in ["_NAHW","_SARF","_LUGHA","_BALAGHA","_GHARIB","_SHICR","_ADAB"]) or any(x in a for x in ["النحو","الصرف","معجم"]): return "P-اللغة العربية","لغة وأدب"
    if any(x in t for x in ["_AKHLAQ","_ADHKAR","_RAQAIQ"]): return "M-الزهد والرقائق والأخلاق","زهد وآداب"
    return "UNCLASSIFIED_OPENITI",None

def read_csv(path):
    with path.open("r",encoding="utf-8-sig",newline="") as f: return list(csv.DictReader(f))

def write_csv(path,rows,headers):
    with path.open("w",encoding="utf-8-sig",newline="") as f:
        w=csv.DictWriter(f,fieldnames=headers,extrasaction="ignore",lineterminator="\n");w.writeheader()
        for row in rows:
            out={}
            for h in headers:
                v=row.get(h)
                if isinstance(v,(list,dict)): v=json.dumps(v,ensure_ascii=False,separators=(",",":"))
                out[h]="" if v is None else v
            w.writerow(out)

def write_json(path,obj):
    path.write_text(json.dumps(obj,ensure_ascii=False,separators=(",",":"))+"\n",encoding="utf-8")

def get_openiti():
    p=Path("/tmp/OpenITI_metadata_2025-1-9.tsv")
    req=urllib.request.Request(URL,headers={"User-Agent":"YaRasoolAllah-Research/1.0"})
    with urllib.request.urlopen(req,timeout=240) as r: data=r.read()
    got=hashlib.md5(data).hexdigest()
    if got!=MD5: raise RuntimeError(f"OpenITI MD5 mismatch {got}")
    p.write_bytes(data)
    with p.open("r",encoding="utf-8-sig",newline="") as f: return list(csv.DictReader(f,delimiter="\t"))

def provider_registry(seed):
    out=[dict(x) for x in seed if x.get("provider_id") not in {"internet_archive","hathitrust","worldcat"}]
    fixed=[
      {"provider_id":"internet_archive","provider_name":"Internet Archive","provider_type":"large_public_digital_archive","tier":"TIER_4","country":"United States","institutional_owner":"Internet Archive","homepage":"https://archive.org/","catalog_url":"https://archive.org/advancedsearch.php","search_url":"https://archive.org/services/search/v1/scrape","api_docs_url":"https://archive.org/developers/index-apis.html","api_base_url":"https://archive.org/metadata/{identifier}","bulk_data_url":"","metadata_download_url":"https://archive.org/services/search/v1/scrape","terms_url":"https://archive.org/about/terms.php","rights_url":"https://help.archive.org/help/rights/","credential_required":"FALSE","api_key_required":"FALSE","pagination_method":"cursor","rate_limit_if_known":"honor 429/Retry-After","bulk_access_available":"PARTIAL","commercial_reuse_notes":"item-level only","redistribution_notes":"download availability is not a rights grant","preferred_ingestion_method":"metadata -> item manifest -> rights review","verification_status":"VERIFIED_2026-09-23"},
      {"provider_id":"hathitrust_digital_library","provider_name":"HathiTrust Digital Library","provider_type":"academic_library_repository","tier":"TIER_2","country":"United States / international","institutional_owner":"HathiTrust","homepage":"https://www.hathitrust.org/","catalog_url":"https://catalog.hathitrust.org/","search_url":"https://catalog.hathitrust.org/Search/Home","api_docs_url":"https://www.hathitrust.org/member-libraries/resources-for-librarians/data-resources/bibliographic-api/","api_base_url":"https://catalog.hathitrust.org/api/volumes/brief/{id_type}/{id_value}.json","bulk_data_url":"https://www.hathitrust.org/member-libraries/resources-for-librarians/data-resources/hathifiles/","metadata_download_url":"https://www.hathitrust.org/files/hathifiles/hathi_file_list.json","terms_url":"https://www.hathitrust.org/the-collection/terms-conditions/","rights_url":"https://www.hathitrust.org/the-collection/search-access/access-use-policy/","credential_required":"metadata no; research text yes","api_key_required":"FALSE for metadata","pagination_method":"Hathifiles/OAI-PMH","rate_limit_if_known":"","bulk_access_available":"TRUE metadata","commercial_reuse_notes":"metadata/content differ","redistribution_notes":"Full View does not imply rehosting","preferred_ingestion_method":"Hathifiles/OAI first","verification_status":"VERIFIED_2026-09-23"},
      {"provider_id":"google_books","provider_name":"Google Books and Google Books API","provider_type":"commercial_bibliographic_discovery","tier":"TIER_5","country":"United States","institutional_owner":"Google","homepage":"https://books.google.com/","catalog_url":"https://books.google.com/","search_url":"https://www.googleapis.com/books/v1/volumes?q={query}","api_docs_url":"https://developers.google.com/books/docs/v1/using","api_base_url":"https://www.googleapis.com/books/v1/volumes","bulk_data_url":"","metadata_download_url":"","terms_url":"https://developers.google.com/books/terms","rights_url":"https://developers.google.com/books/docs/v1/reference/volumes","credential_required":"bounded public search; key recommended","api_key_required":"RECOMMENDED","pagination_method":"startIndex/maxResults<=40","rate_limit_if_known":"observed 429 shared quota","bulk_access_available":"FALSE","commercial_reuse_notes":"no default local-content permission","redistribution_notes":"accessInfo is not a licence","preferred_ingestion_method":"metadata enrichment/remote preview","verification_status":"VERIFIED_2026-09-23"},
      {"provider_id":"worldcat_oclc","provider_name":"WorldCat / OCLC","provider_type":"bibliographic_union_catalog","tier":"TIER_5","country":"United States / global","institutional_owner":"OCLC and member libraries","homepage":"https://search.worldcat.org/","catalog_url":"https://search.worldcat.org/","search_url":"https://search.worldcat.org/","api_docs_url":"https://www.oclc.org/developer/api/oclc-apis/worldcat-search-api.en.html","api_base_url":"https://developer.api.oclc.org/wcv2","bulk_data_url":"","metadata_download_url":"","terms_url":"https://www.oclc.org/developer/support/terms-and-conditions.en.html","rights_url":"https://www.oclc.org/en/worldcat/cooperative-quality/policy.html","credential_required":"TRUE","api_key_required":"TRUE","pagination_method":"credentialed API","rate_limit_if_known":"","bulk_access_available":"NOT_CLEARED","commercial_reuse_notes":"contract/policy governed","redistribution_notes":"mass use needs permission","preferred_ingestion_method":"reconciliation/discovery unless licensed","verification_status":"VERIFIED_2026-09-23"}
    ]
    out.extend(fixed)
    oi=next((x for x in out if x.get("provider_id")=="openiti_kitab"),None)
    if not oi:
        oi={"provider_id":"openiti_kitab","provider_name":"OpenITI / KITAB Project"};out.append(oi)
    oi.update({"provider_type":"academic_digital_humanities_corpus","tier":"TIER_1","homepage":"https://openiti.org/","catalog_url":"https://kitab-project.org/metadata","search_url":"https://kitab-corpus-metadata.azurewebsites.net/","api_docs_url":"https://kitab-project.org/docs/openITI","api_base_url":"https://github.com/OpenITI/RELEASE","bulk_data_url":"https://zenodo.org/records/17767721","metadata_download_url":URL,"rights_url":"https://kitab-project.org/docs/openITI","credential_required":"FALSE","api_key_required":"FALSE","bulk_access_available":"TRUE","commercial_reuse_notes":"CC BY-NC-SA 4.0","redistribution_notes":"BY-NC-SA; preserve URI/provenance","preferred_ingestion_method":"official release metadata + tagged text paths","verification_status":"VERIFIED_2026-09-23_RELEASE_2025.1.9"})
    return out

def main():
    rows=get_openiti()
    sc=Counter(r.get("subcorpus") for r in rows)
    assert len(rows)==14107 and sc==Counter({"ara":13320,"per":354,"MSS":433})
    br=[r for r in rows if r.get("subcorpus")!="MSS"]; mr=[r for r in rows if r.get("subcorpus")=="MSS"]
    keys={s:{r.get("book") for r in rows if r.get("subcorpus")==s and r.get("book")} for s in ("ara","per")}
    assert len(keys["ara"])==8755 and len(keys["per"])==351 and len(keys["ara"]|keys["per"])==9106
    aks={s:{r["version_uri"].split(".")[0] for r in rows if r.get("subcorpus")==s} for s in ("ara","per")}
    assert len(aks["ara"])==3373 and len(aks["per"])==262 and len(aks["ara"]|aks["per"])==3618

    grouped=defaultdict(list)
    for r in br: grouped[r["book"]].append(r)
    works=[]; people={}; editions={}; dvs=[]
    for book,rs in grouped.items():
        p=next((x for x in rs if str(x.get("status","")).lower()=="pri"),rs[0])
        au=p["version_uri"].split(".")[0]; pid=None if "Quran" in au else "openiti_person_"+safe(au)
        c1,c2=category(p.get("tags"),p.get("title_ar"))
        alts=[]
        for r in rs:
            for x in (r.get("title_ar") or "").split("::")[1:]+(r.get("title_lat") or "").split("::")[1:]:
                x=x.strip()
                if x and x not in alts: alts.append(x)
        w={"work_id":"openiti_work_"+safe(book),"canonical_title_ar":(p.get("title_ar") or "").split("::")[0].strip() or None,"canonical_title_en":(p.get("title_lat") or "").split("::")[0].strip() or None,"alternate_titles":alts,"normalized_title_ar":norm_ar((p.get("title_ar") or "").split("::")[0]),"author_id":pid,"author_name_ar":(p.get("author_ar") or "").split("::")[0].strip() or None,"author_name_en":(p.get("author_lat") or "").split("::")[0].strip() or None,"author_death_hijri":int(p["date"]) if str(p.get("date","")).isdigit() and int(p["date"])>=10 else None,"category_primary":c1,"category_secondary":c2,"subjects":[x.strip() for x in (p.get("tags") or "").split("::") if x.strip()],"era":("OpenITI date code "+p["date"]) if p.get("date") else None,"language_original":p.get("language"),"description_short":"OpenITI work record; edition/version objects are separate.","work_status":"OPENITI_RELEASE_WORK","bibliographic_source":"OpenITI metadata 2025.1.9","bibliographic_source_url":"https://zenodo.org/records/17767721","openiti_book_uri":book,"version_count":len(rs),"has_uncorrected_ocr":any(str(x.get("uncorrected_OCR","")).lower()=="true" for x in rs),"seed_work_ids":[]}
        works.append(w)
        if pid and au not in people:
            people[au]={"person_id":pid,"canonical_name_ar":w["author_name_ar"],"canonical_name_en":w["author_name_en"],"kunya":None,"nisba":None,"known_as":null(p.get("author_lat_shuhra")),"birth_year_hijri":None,"death_year_hijri":w["author_death_hijri"],"birth_year_ce":None,"death_year_ce":None,"era":w["era"],"region":None,"roles":["author"],"schools":[],"teachers":[],"students":[],"works_count":0,"authority_ids":[],"wikidata_id":None,"viaf_id":None,"isni_id":None,"openiti_person_id":au,"biography_sources":["https://kitab-corpus-metadata.azurewebsites.net/"]}
        for r in rs:
            ed=(r.get("ed_info") or "").strip(); eid=None
            if ed:
                ek=book+"||"+ed
                if ek not in editions:
                    editions[ek]={"edition_id":"openiti_edition_"+safe(r.get("id") or r["version_uri"]),"work_id":w["work_id"],"edition_title":w["canonical_title_ar"] or w["canonical_title_en"],"publisher":None,"publication_city":None,"publication_country":None,"publication_year":None,"edition_number":None,"volume_count":None,"editor":None,"reviewer":None,"translator":None,"isbn":None,"series":None,"print_notes":ed,"bibliographic_record_url":first_url(ed)}
                eid=editions[ek]["edition_id"]
            lp=r.get("local_path") or ""; ocr=str(r.get("uncorrected_OCR","")).lower()=="true"
            landing="https://github.com/OpenITI/RELEASE/blob/v2025.1.9/"+lp
            dvs.append({"digital_version_id":"openiti_dv_"+safe(r["version_uri"]),"work_id":w["work_id"],"edition_id_if_known":eid,"provider":"OpenITI / KITAB Project","provider_record_id":r["version_uri"],"canonical_landing_url":landing,"read_online_url":landing,"direct_file_url":"https://raw.githubusercontent.com/OpenITI/RELEASE/v2025.1.9/"+lp,"api_url":None,"repository_url":"https://github.com/OpenITI/RELEASE/tree/v2025.1.9","openiti_uri":r["version_uri"],"archive_identifier":None,"doi":None,"handle":None,"urn":None,"iiif_manifest":None,"format":"TXT_MARKDOWN","file_size_if_known":None,"page_count_if_known":None,"volume_number":None,"ocr_available":ocr,"ocr_quality":"OCR_NEEDS_REVIEW" if ocr else "NOT_OCR_FLAGGED_BY_PROVIDER","searchable_text":True,"table_of_contents_available":"UNVERIFIED","chapter_structure_available":"OPENITI_MARKUP_PRESENT_OR_UNVERIFIED_BY_VERSION","checksum_if_provider_gives_it":None,"reading_capability":"CAN_IMPORT_TEXT","reading_capability_reason":"Machine-readable OpenITI version; preserve original; not a critical-edition claim.","viewer_strategy":"TEXT_READER","download_capability":"DOWNLOAD_ALLOWED","rights_status":"CLEARED_WITH_ATTRIBUTION","rights_notes":"CC BY-NC-SA 4.0; no commercial permission by default.","local_storage_recommendation":"HOST_ON_PROJECT_STORAGE","storage_condition":"Only when deployment/use complies with CC BY-NC-SA 4.0.","ingestion_priority":"P2" if ocr else "P1","provider_status":r.get("status"),"source_tags":r.get("tags")})
    cnt=Counter(w["author_id"] for w in works if w["author_id"])
    for p in people.values(): p["works_count"]=cnt[p["person_id"]]
    assert len(works)==9106 and len(dvs)==13674

    seed=read_csv(INPUT/"seed-works.csv"); index=defaultdict(list)
    for w in works:
        for t in [w["canonical_title_ar"]]+w["alternate_titles"]:
            x=norm_ar(strip_paren(t))
            if x:index[x].append(w)
    matched=0; pending=[]
    for s in seed:
        k=norm_ar(strip_paren(s.get("canonical_title_ar"))); ms=index.get(k,[])
        if len(ms)==1:
            ms[0]["seed_work_ids"].append(s["work_id"]); matched+=1
            if ms[0]["category_primary"]=="UNCLASSIFIED_OPENITI" and s.get("category_primary"):
                ms[0]["category_primary"]=s["category_primary"]; ms[0]["category_secondary"]=s.get("category_secondary")
        else:
            pending.append({"work_id":"seed_"+s["work_id"],"canonical_title_ar":s.get("canonical_title_ar"),"canonical_title_en":s.get("canonical_title_en"),"alternate_titles":[],"normalized_title_ar":k,"author_id":None,"author_name_ar":s.get("author_name_ar"),"author_name_en":None,"author_death_hijri":null(s.get("author_death_hijri")),"category_primary":s.get("category_primary") or "UNCLASSIFIED_SEED","category_secondary":s.get("category_secondary"),"subjects":[],"era":s.get("era"),"language_original":s.get("language_original"),"description_short":None,"work_status":"UNVERIFIED_SEED_REQUIRES_BIBLIOGRAPHIC_SOURCE_URL","bibliographic_source":s.get("bibliographic_source"),"bibliographic_source_url":null(s.get("bibliographic_source_url")),"openiti_book_uri":None,"version_count":0,"has_uncorrected_ocr":False,"seed_work_ids":[s["work_id"]]})
    allworks=works+pending

    ext=[
      ("df_ia_ArIslamicbooks_01_70259_pdf","PDF","https://archive.org/download/ArIslamicbooks/01_70259.pdf",11399993,None,"md5:9a06696fc85205295f8e7d895b090184",False),
      ("df_ia_ArIslamicbooks_01_70259_epub","EPUB","https://archive.org/download/ArIslamicbooks/01_70259.epub",3364659,None,"md5:a8addb2f12e7b52bbad133ce6f348d4d",True),
      ("df_ia_ArIslamicbooks_01_70259_djvu_txt","OCR_TEXT","https://archive.org/download/ArIslamicbooks/01_70259_djvu.txt",1145715,None,"md5:e4a38487e25a1568b816562b5cf5e322",True),
      ("df_ia_ArIslamicbooks_01_70259_hocr","HTML_OCR","https://archive.org/download/ArIslamicbooks/01_70259_hocr.html",19389734,None,"md5:b9f02603c03cbd50ebe4b96797925a41",True),
      ("df_ia_ArIslamicbooks_01_70259_jp2_zip","JP2_IMAGE_SET","https://archive.org/download/ArIslamicbooks/01_70259_jp2.zip",368476543,616,"md5:61bbbf222545567ac5ab6edab253092b",False)
    ]
    for did,fmt,durl,size,pages,checksum,ocr in ext:
        dvs.append({"digital_version_id":did,"work_id":None,"edition_id_if_known":None,"provider":"Internet Archive","provider_record_id":"ArIslamicbooks","canonical_landing_url":"https://archive.org/details/ArIslamicbooks","read_online_url":"https://archive.org/details/ArIslamicbooks","direct_file_url":durl,"api_url":"https://archive.org/metadata/ArIslamicbooks","repository_url":None,"openiti_uri":None,"archive_identifier":"ArIslamicbooks","doi":None,"handle":None,"urn":None,"iiif_manifest":None,"format":fmt,"file_size_if_known":size,"page_count_if_known":pages,"volume_number":None,"ocr_available":ocr or "UNVERIFIED","ocr_quality":"OCR_NEEDS_REVIEW" if ocr else None,"searchable_text":True if fmt in {"OCR_TEXT","HTML_OCR"} else "UNVERIFIED","table_of_contents_available":"UNVERIFIED","chapter_structure_available":"UNVERIFIED","checksum_if_provider_gives_it":checksum,"reading_capability":"EXTERNAL_READER_ONLY","reading_capability_reason":"Unresolved package file; identity and rights are not established.","viewer_strategy":"EXTERNAL_LINK","download_capability":"DOWNLOAD_REQUIRES_LICENSE_REVIEW","rights_status":"NEEDS_ITEM_LEVEL_REVIEW","rights_notes":"Technical access is not a reuse grant.","local_storage_recommendation":"DO_NOT_INGEST","storage_condition":"Resolve work/edition/rights first.","ingestion_priority":"P4","provider_status":None,"source_tags":None})

    mss=[]
    for r in mr:
        lp=r.get("local_path") or ""
        mss.append({"manuscript_id":"openiti_mss_"+safe(r["version_uri"]),"work_id":None,"record_type":"TRANSCRIPTION","institution":null(r.get("institution_lat")) or null(r.get("institution_ar")),"collection":None,"shelfmark":null(r.get("shelfmark")),"catalog_title":None,"catalog_url":null(r.get("catalog_ref")) or null(r.get("ed_info")),"digitized_url":null(r.get("ed_info")),"iiif_manifest":None,"folio_count":None,"date":None,"place":null(r.get("city_lat")) or null(r.get("city_ar")),"scribe":None,"material":None,"script":None,"language":r.get("language"),"description":"OpenITI MSS machine-readable transcription; page-image rights are separate.","rights_statement":"OpenITI transcription under CC BY-NC-SA 4.0; image rights separate","rights_url":"https://kitab-project.org/docs/openITI","download_allowed":True,"local_hosting_allowed":True,"attribution":"OpenITI URI "+r["version_uri"],"image_resolution":None,"ocr_available":str(r.get("uncorrected_OCR","")).lower()=="true","rights_status":"CLEARED_WITH_ATTRIBUTION","ingestion_priority":"P1","transcription_url":"https://raw.githubusercontent.com/OpenITI/RELEASE/v2025.1.9/"+lp})
    qdl=[
      {"manuscript_id":"qdl_ms_delhi_arabic_1919","work_id":None,"record_type":"IIIF_IMAGE_MANUSCRIPT","institution":"British Library","collection":"Oriental Manuscripts","shelfmark":"Delhi Arabic 1919","catalog_title":"Folios from four manuscripts on scientific subjects","catalog_url":"https://www.qdl.qa/archive/81055/vdc_100052731448.0x000013","digitized_url":"https://www.qdl.qa/archive/81055/vdc_100052731448.0x000013","iiif_manifest":"https://www.qdl.qa/en/iiif/81055/vdc_100036848060.0x000001/manifest","folio_count":None,"date":None,"place":None,"scribe":None,"material":None,"script":"Arabic script","language":"Arabic","description":"Verified QDL/British Library IIIF item.","rights_statement":"Public Domain","rights_url":"https://www.qdl.qa/archive/81055/vdc_100052731448.0x000013","download_allowed":True,"local_hosting_allowed":"NEEDS_PROVIDER_REUSE_POLICY_CONFIRMATION_FOR_DERIVATIVE_HOSTING","attribution":"Cite British Library shelfmark and QDL item.","image_resolution":"IIIF","ocr_available":"UNVERIFIED","rights_status":"PUBLIC_DOMAIN","ingestion_priority":"P1","transcription_url":None},
      {"manuscript_id":"qdl_ms_or_5916_tadhkirat_kahhalin","work_id":None,"record_type":"IIIF_IMAGE_MANUSCRIPT","institution":"British Library","collection":"Oriental Manuscripts","shelfmark":"Or 5916","catalog_title":"Tadhkirat al-kaḥḥālīn تذكرة الكحّالين","catalog_url":"https://www.qdl.qa/en/archive/81055/vdc_100069802848.0x000068","digitized_url":"https://www.qdl.qa/en/archive/81055/vdc_100069802848.0x000068","iiif_manifest":"https://www.qdl.qa/en/iiif/81055/vdc_100049747259.0x000001/manifest","folio_count":198,"date":None,"place":None,"scribe":None,"material":None,"script":"Arabic script","language":"Arabic","description":"Verified QDL/British Library IIIF item.","rights_statement":"Public Domain","rights_url":"https://www.qdl.qa/en/archive/81055/vdc_100069802848.0x000068","download_allowed":True,"local_hosting_allowed":"NEEDS_PROVIDER_REUSE_POLICY_CONFIRMATION_FOR_DERIVATIVE_HOSTING","attribution":"Cite British Library Or 5916 and QDL item.","image_resolution":"IIIF","ocr_available":"UNVERIFIED","rights_status":"PUBLIC_DOMAIN","ingestion_priority":"P1","transcription_url":None},
      {"manuscript_id":"qdl_ms_add_ms_23379_ajaib_aqalim","work_id":None,"record_type":"IIIF_IMAGE_MANUSCRIPT","institution":"British Library","collection":"Oriental Manuscripts","shelfmark":"Add MS 23379","catalog_title":"‘Ajā’ib al-aqālīm al-sab‘ah عجائب الأقاليم السبعة","catalog_url":"https://qdl.qa/en/archive/81055/vdc_100044787050.0x00006d","digitized_url":"https://qdl.qa/en/archive/81055/vdc_100044787050.0x00006d","iiif_manifest":"https://www.qdl.qa/en/iiif/81055/vdc_100027677075.0x000001/manifest","folio_count":68,"date":None,"place":None,"scribe":None,"material":None,"script":"Arabic script","language":"Arabic","description":"Verified QDL/British Library IIIF item.","rights_statement":"Public Domain","rights_url":"https://qdl.qa/en/archive/81055/vdc_100044787050.0x00006d","download_allowed":True,"local_hosting_allowed":"NEEDS_PROVIDER_REUSE_POLICY_CONFIRMATION_FOR_DERIVATIVE_HOSTING","attribution":"Cite British Library Add MS 23379 and QDL item.","image_resolution":"IIIF","ocr_available":"UNVERIFIED","rights_status":"PUBLIC_DOMAIN","ingestion_priority":"P1","transcription_url":None}
    ]
    mss += qdl

    providers=provider_registry(read_csv(INPUT/"seed-provider-registry.csv"))
    rights=[
      {"rights_id":"rights_openiti_release_2025_1_9","provider":"OpenITI / KITAB Project","resource_id":"release_2025.1.9","rights_page_url":"https://kitab-project.org/docs/openITI","license_name":"CC BY-NC-SA 4.0","license_spdx_if_known":"CC-BY-NC-SA-4.0","public_domain":False,"open_access":True,"commercial_use_allowed":False,"redistribution_allowed":True,"local_hosting_allowed":True,"offline_storage_allowed":True,"derivatives_allowed":True,"attribution_required":True,"share_alike_required":True,"territorial_limitations":None,"rights_notes":"NonCommercial + Attribution + ShareAlike.","rights_status":"CLEARED_WITH_ATTRIBUTION","rights_checked_on":"2026-09-23"},
      {"rights_id":"rights_ia_provider_default","provider":"Internet Archive","resource_id":"provider_default","rights_page_url":"https://help.archive.org/help/rights/","license_name":None,"license_spdx_if_known":None,"public_domain":"UNVERIFIED","open_access":"UNVERIFIED","commercial_use_allowed":"UNVERIFIED","redistribution_allowed":"UNVERIFIED","local_hosting_allowed":"UNVERIFIED","offline_storage_allowed":"UNVERIFIED","derivatives_allowed":"UNVERIFIED","attribution_required":"UNVERIFIED","share_alike_required":"UNVERIFIED","territorial_limitations":"Item-dependent","rights_notes":"Provider does not guarantee item copyright status.","rights_status":"NEEDS_ITEM_LEVEL_REVIEW","rights_checked_on":"2026-09-23"},
      {"rights_id":"rights_hathi_metadata","provider":"HathiTrust","resource_id":"bibliographic_metadata","rights_page_url":"https://www.hathitrust.org/member-libraries/resources-for-librarians/metadata-in-the-digital-library/metadata-sharing-and-use-policy/","license_name":"CC0 metadata contribution policy","license_spdx_if_known":"CC0-1.0","public_domain":True,"open_access":True,"commercial_use_allowed":True,"redistribution_allowed":True,"local_hosting_allowed":True,"offline_storage_allowed":True,"derivatives_allowed":True,"attribution_required":False,"share_alike_required":False,"territorial_limitations":"policy caveats","rights_notes":"Metadata only.","rights_status":"CLEARED","rights_checked_on":"2026-09-23"},
      {"rights_id":"rights_hathi_volume_content","provider":"HathiTrust","resource_id":"digitized_volume_content","rights_page_url":"https://www.hathitrust.org/the-collection/search-access/access-use-policy/","license_name":"Item-level","license_spdx_if_known":None,"public_domain":"ITEM_LEVEL","open_access":"ITEM_LEVEL","commercial_use_allowed":"ITEM_LEVEL","redistribution_allowed":"ITEM_LEVEL","local_hosting_allowed":"ITEM_LEVEL","offline_storage_allowed":"ITEM_LEVEL","derivatives_allowed":"ITEM_LEVEL","attribution_required":"ITEM_LEVEL","share_alike_required":"ITEM_LEVEL","territorial_limitations":"item/territory/digitizer","rights_notes":"Full View is not enough.","rights_status":"NEEDS_ITEM_LEVEL_REVIEW","rights_checked_on":"2026-09-23"},
      {"rights_id":"rights_google_books_api","provider":"Google Books","resource_id":"api_and_volume_content","rights_page_url":"https://developers.google.com/books/terms","license_name":"API Terms + item rights","license_spdx_if_known":None,"public_domain":"ITEM_AND_COUNTRY_LEVEL","open_access":"ITEM_AND_COUNTRY_LEVEL","commercial_use_allowed":"NO_DEFAULT_PERMISSION","redistribution_allowed":"NO_DEFAULT_PERMISSION","local_hosting_allowed":"NO_DEFAULT_PERMISSION","offline_storage_allowed":"ITEM_AND_TERMS_LEVEL","derivatives_allowed":"NO_DEFAULT_PERMISSION","attribution_required":"UNVERIFIED","share_alike_required":"UNVERIFIED","territorial_limitations":"country-sensitive","rights_notes":"Access signals are not reuse rights.","rights_status":"NEEDS_LICENSE_REVIEW","rights_checked_on":"2026-09-23"},
      {"rights_id":"rights_worldcat_metadata","provider":"WorldCat / OCLC","resource_id":"worldcat_data","rights_page_url":"https://www.oclc.org/en/worldcat/cooperative-quality/policy.html","license_name":"OCLC policy/terms","license_spdx_if_known":None,"public_domain":False,"open_access":False,"commercial_use_allowed":"NEEDS_AGREEMENT","redistribution_allowed":"NEEDS_AGREEMENT","local_hosting_allowed":"NEEDS_AGREEMENT","offline_storage_allowed":"NEEDS_AGREEMENT","derivatives_allowed":"NEEDS_AGREEMENT","attribution_required":"POLICY_GOVERNED","share_alike_required":"UNVERIFIED","territorial_limitations":None,"rights_notes":"Mass use needs permission.","rights_status":"NEEDS_CREDENTIAL","rights_checked_on":"2026-09-23"}
    ]
    for x in qdl:
        rights.append({"rights_id":"rights_"+x["manuscript_id"],"provider":"QDL / British Library","resource_id":x["manuscript_id"],"rights_page_url":x["rights_url"],"license_name":"Public Domain item statement","license_spdx_if_known":None,"public_domain":True,"open_access":True,"commercial_use_allowed":"PROVIDER_POLICY_REVIEW","redistribution_allowed":"PROVIDER_POLICY_REVIEW","local_hosting_allowed":"PROVIDER_POLICY_REVIEW","offline_storage_allowed":"PROVIDER_POLICY_REVIEW","derivatives_allowed":"PROVIDER_POLICY_REVIEW","attribution_required":True,"share_alike_required":False,"territorial_limitations":None,"rights_notes":"Prefer remote IIIF pending derivative-rehosting policy review.","rights_status":"PUBLIC_DOMAIN","rights_checked_on":"2026-09-23"})

    datasets=[
      {"dataset_id":"openiti_2025_1_9_metadata","provider_id":"openiti_kitab","name":"OpenITI 2025.1.9 metadata TSV","domain":"Corpus metadata","description":"Official release metadata.","docs_url":"https://kitab-project.org/OpenITI-Release-version-2025-1-9/","endpoint":URL,"auth_type":"Public","credential_required":False,"query_examples":["download TSV"],"pagination":"bulk file","rate_limit":None,"response_format":"TSV","languages":["Arabic","Persian","MSS languages"],"record_count_if_known":14107,"bulk_dump":True,"bulk_dump_url":URL,"license":"CC BY-NC-SA 4.0","rights_url":"https://kitab-project.org/docs/openITI","last_verified":"2026-09-23"},
      {"dataset_id":"ia_scraping_api","provider_id":"internet_archive","name":"Internet Archive Scraping API","domain":"Catalogue discovery","description":"Cursor metadata search.","docs_url":"https://archive.org/help/aboutsearch.htm","endpoint":"https://archive.org/services/search/v1/scrape","auth_type":"Public","credential_required":False,"query_examples":["q=mediatype:texts AND language:Arabic"],"pagination":"cursor","rate_limit":"honor 429","response_format":"JSON","languages":["Arabic","English"],"record_count_if_known":101249,"bulk_dump":False,"bulk_dump_url":None,"license":None,"rights_url":"https://help.archive.org/help/rights/","last_verified":"2026-09-23"},
      {"dataset_id":"hathitrust_hathifiles","provider_id":"hathitrust_digital_library","name":"Hathifiles","domain":"Metadata inventory","description":"Monthly full + daily deltas.","docs_url":"https://www.hathitrust.org/member-libraries/resources-for-librarians/data-resources/hathifiles/","endpoint":"https://www.hathitrust.org/files/hathifiles/hathi_file_list.json","auth_type":"Public metadata","credential_required":False,"query_examples":["hathi_full_ snapshot"],"pagination":"bulk","rate_limit":None,"response_format":"TSV.GZ","languages":["Multilingual"],"record_count_if_known":None,"bulk_dump":True,"bulk_dump_url":"https://www.hathitrust.org/files/hathifiles/hathi_file_list.json","license":"CC0 metadata caveat","rights_url":"https://www.hathitrust.org/member-libraries/resources-for-librarians/metadata-in-the-digital-library/metadata-sharing-and-use-policy/","last_verified":"2026-09-23"},
      {"dataset_id":"hathitrust_oai_pmh","provider_id":"hathitrust_digital_library","name":"HathiTrust OAI-PMH","domain":"Bibliographic metadata","description":"MARC21/DC XML.","docs_url":"https://www.hathitrust.org/member-libraries/resources-for-librarians/data-resources/oai-feed/","endpoint":"https://oai.hathitrust.org/","auth_type":"Public metadata","credential_required":False,"query_examples":["ListRecords&metadataPrefix=marc21"],"pagination":"resumptionToken","rate_limit":None,"response_format":"XML","languages":["Multilingual"],"record_count_if_known":None,"bulk_dump":True,"bulk_dump_url":"https://oai.hathitrust.org/?verb=ListRecords&metadataPrefix=marc21","license":"CC0 metadata caveat","rights_url":"https://www.hathitrust.org/member-libraries/resources-for-librarians/metadata-in-the-digital-library/metadata-sharing-and-use-policy/","last_verified":"2026-09-23"},
      {"dataset_id":"google_books_v1","provider_id":"google_books","name":"Google Books API v1","domain":"Metadata/access discovery","description":"Bounded search.","docs_url":"https://developers.google.com/books/docs/v1/using","endpoint":"https://www.googleapis.com/books/v1/volumes","auth_type":"quota-governed","credential_required":"KEY_RECOMMENDED","query_examples":["q=...&langRestrict=ar"],"pagination":"startIndex/maxResults<=40","rate_limit":"observed 429","response_format":"JSON","languages":["Multilingual"],"record_count_if_known":None,"bulk_dump":False,"bulk_dump_url":None,"license":"API terms","rights_url":"https://developers.google.com/books/terms","last_verified":"2026-09-23"},
      {"dataset_id":"worldcat_v2","provider_id":"worldcat_oclc","name":"WorldCat Search API","domain":"Bibliography/holdings","description":"Credentialed API.","docs_url":"https://www.oclc.org/developer/api/oclc-apis/worldcat-search-api.en.html","endpoint":"https://developer.api.oclc.org/wcv2","auth_type":"subscription+WSKey","credential_required":True,"query_examples":["after entitlement"],"pagination":"UNVERIFIED","rate_limit":None,"response_format":"UNVERIFIED","languages":["Multilingual"],"record_count_if_known":3991039,"bulk_dump":"NOT_CLEARED","bulk_dump_url":None,"license":"OCLC terms","rights_url":"https://www.oclc.org/en/worldcat/cooperative-quality/policy.html","last_verified":"2026-09-23"},
      {"dataset_id":"qdl_iiif","provider_id":"qatar_digital_library","name":"QDL IIIF manifests","domain":"Manuscripts","description":"Item-level IIIF + rights.","docs_url":"https://www.qdl.qa/","endpoint":"item-specific manifest","auth_type":"Public","credential_required":False,"query_examples":[qdl[0]["iiif_manifest"]],"pagination":"item","rate_limit":"UNVERIFIED","response_format":"IIIF","languages":["Arabic","English"],"record_count_if_known":None,"bulk_dump":False,"bulk_dump_url":None,"license":"item-level","rights_url":"item page","last_verified":"2026-09-23"}
    ]
    quran=next((w["work_id"] for w in works if "القران" in norm_ar(w.get("canonical_title_ar"))),None)
    audio=[
      {"audio_id":"lead_quran_foundation_audio","work_id":quran,"title":"Quran Foundation audio API provider lead","speaker_or_reader":None,"provider":"Quran Foundation","landing_url":"https://api-docs.quran.foundation","stream_url":None,"playlist_url":None,"download_url":None,"duration":None,"chapter_mapping":"not harvested","language":"Arabic","audio_format":None,"bitrate_if_known":None,"rights_url":None,"streaming_allowed":"UNVERIFIED","download_allowed":"UNVERIFIED","offline_allowed":"UNVERIFIED","redistribution_allowed":"UNVERIFIED","commercial_use_allowed":"UNVERIFIED","attribution":"UNVERIFIED","rights_status":"NEEDS_CREDENTIAL","record_status":"DISCOVERY_LEAD_ONLY"},
      {"audio_id":"lead_everyayah_maqra","work_id":quran,"title":"EveryAyah / Maqra recitation lead","speaker_or_reader":None,"provider":"EveryAyah / Maqra","landing_url":"https://huggingface.co/maqra-project","stream_url":None,"playlist_url":None,"download_url":None,"duration":None,"chapter_mapping":"UNVERIFIED","language":"Arabic","audio_format":None,"bitrate_if_known":None,"rights_url":None,"streaming_allowed":"UNVERIFIED","download_allowed":"UNVERIFIED","offline_allowed":"UNVERIFIED","redistribution_allowed":"UNVERIFIED","commercial_use_allowed":"UNVERIFIED","attribution":"UNVERIFIED","rights_status":"NEEDS_LICENSE_REVIEW","record_status":"DISCOVERY_LEAD_ONLY"}
    ]

    by=defaultdict(list)
    for v in dvs:
        if v.get("work_id"): by[v["work_id"]].append(v["digital_version_id"])
    dups=[{"duplicate_group_id":"dup_"+safe(k),"work_id":k,"version_count":len(v),"digital_version_ids":v,"duplicate_basis":"Same OpenITI work URI; retain versions separately."} for k,v in by.items() if len(v)>1]
    full=[v for v in dvs if v["provider"]=="OpenITI / KITAB Project" or v["format"] in {"OCR_TEXT","HTML_OCR"}]
    pdf=[v for v in dvs if "PDF" in v["format"]]; epub=[v for v in dvs if "EPUB" in v["format"]]
    text=[v for v in dvs if any(x in v["format"] for x in ["TXT","TEXT","HTML","TEI","XML","MARKDOWN"])]
    queue=[{"resource_type":"DIGITAL_VERSION","resource_id":v["digital_version_id"],"provider":v["provider"],"work_id":v.get("work_id"),"priority":v["ingestion_priority"],"rights_status":v["rights_status"],"storage":v["local_storage_recommendation"],"reason":v.get("storage_condition") or v.get("reading_capability_reason")} for v in dvs]
    queue += [{"resource_type":"MANUSCRIPT","resource_id":x["manuscript_id"],"provider":x["institution"],"work_id":None,"priority":x["ingestion_priority"],"rights_status":x["rights_status"],"storage":"REMOTE_READ" if x["record_type"]=="IIIF_IMAGE_MANUSCRIPT" else "HOST_ON_PROJECT_STORAGE","reason":"IIIF remote first" if x["record_type"]=="IIIF_IMAGE_MANUSCRIPT" else "transcription rights only; image rights separate"} for x in mss]

    PH=["provider_id","provider_name","provider_type","tier","country","institutional_owner","homepage","catalog_url","search_url","api_docs_url","api_base_url","bulk_data_url","metadata_download_url","terms_url","rights_url","credential_required","api_key_required","pagination_method","rate_limit_if_known","bulk_access_available","commercial_reuse_notes","redistribution_notes","preferred_ingestion_method","verification_status"]
    WH=["work_id","canonical_title_ar","canonical_title_en","alternate_titles","normalized_title_ar","author_id","author_name_ar","author_name_en","author_death_hijri","category_primary","category_secondary","subjects","era","language_original","description_short","work_status","bibliographic_source","bibliographic_source_url","openiti_book_uri","version_count","has_uncorrected_ocr","seed_work_ids"]
    EH=["edition_id","work_id","edition_title","publisher","publication_city","publication_country","publication_year","edition_number","volume_count","editor","reviewer","translator","isbn","series","print_notes","bibliographic_record_url"]
    VH=["digital_version_id","work_id","edition_id_if_known","provider","provider_record_id","canonical_landing_url","read_online_url","direct_file_url","api_url","repository_url","openiti_uri","archive_identifier","doi","handle","urn","iiif_manifest","format","file_size_if_known","page_count_if_known","volume_number","ocr_available","ocr_quality","searchable_text","table_of_contents_available","chapter_structure_available","checksum_if_provider_gives_it","reading_capability","reading_capability_reason","viewer_strategy","download_capability","rights_status","rights_notes","local_storage_recommendation","storage_condition","ingestion_priority"]
    SH=["digital_version_id","work_id","provider","provider_record_id","format","canonical_landing_url","direct_file_url","reading_capability","viewer_strategy","download_capability","rights_status","local_storage_recommendation","ingestion_priority","ocr_quality"]
    AH=["audio_id","work_id","title","speaker_or_reader","provider","landing_url","stream_url","playlist_url","download_url","duration","chapter_mapping","language","audio_format","bitrate_if_known","rights_url","streaming_allowed","download_allowed","offline_allowed","redistribution_allowed","commercial_use_allowed","attribution","rights_status","record_status"]
    MH=["manuscript_id","work_id","record_type","institution","collection","shelfmark","catalog_title","catalog_url","digitized_url","iiif_manifest","folio_count","date","place","scribe","material","script","language","description","rights_statement","rights_url","download_allowed","local_hosting_allowed","attribution","image_resolution","ocr_available","rights_status","ingestion_priority","transcription_url"]
    RH=["rights_id","provider","resource_id","rights_page_url","license_name","license_spdx_if_known","public_domain","open_access","commercial_use_allowed","redistribution_allowed","local_hosting_allowed","offline_storage_allowed","derivatives_allowed","attribution_required","share_alike_required","territorial_limitations","rights_notes","rights_status","rights_checked_on"]
    PeH=["person_id","canonical_name_ar","canonical_name_en","kunya","nisba","known_as","birth_year_hijri","death_year_hijri","birth_year_ce","death_year_ce","era","region","roles","schools","teachers","students","works_count","authority_ids","wikidata_id","viaf_id","isni_id","openiti_person_id","biography_sources"]
    DH=["dataset_id","provider_id","name","domain","description","docs_url","endpoint","auth_type","credential_required","query_examples","pagination","rate_limit","response_format","languages","record_count_if_known","bulk_dump","bulk_dump_url","license","rights_url","last_verified"]

    write_csv(ROOT/"01-provider-registry.csv",providers,PH); write_json(ROOT/"02-provider-registry.json",providers)
    write_csv(ROOT/"03-islamic-works-master.csv",allworks,WH); write_json(ROOT/"04-islamic-works-master.json",allworks)
    write_csv(ROOT/"05-editions-master.csv",list(editions.values()),EH); write_csv(ROOT/"06-digital-versions-master.csv",dvs,VH)
    write_csv(ROOT/"07-fulltext-candidates.csv",full,SH); write_csv(ROOT/"08-pdf-candidates.csv",pdf,SH); write_csv(ROOT/"09-epub-candidates.csv",epub,SH); write_csv(ROOT/"10-tei-html-text-candidates.csv",text,SH)
    write_csv(ROOT/"11-audio-master.csv",audio,AH); write_csv(ROOT/"12-manuscripts-master.csv",mss,MH); write_csv(ROOT/"13-rights-ledger.csv",rights,RH)
    write_csv(ROOT/"14-scholar-person-registry.csv",list(people.values()),PeH)
    write_csv(ROOT/"15-social-discovery-leads.csv",[],["platform","post/channel/video title","URL","claimed book","claimed author","claimed file","canonical work match","canonical legal source found","rights outcome","action"])
    write_csv(ROOT/"16-duplicate-groups.csv",dups,["duplicate_group_id","work_id","version_count","digital_version_ids","duplicate_basis"])
    write_csv(ROOT/"17-api-dataset-registry.csv",datasets,DH)
    write_csv(ROOT/"18-ingestion-priority.csv",queue,["resource_type","resource_id","provider","work_id","priority","rights_status","storage","reason"])

    (ROOT/"19-rights-blockers.md").write_text("# Rights blockers\n\n- OpenITI: CC BY-NC-SA 4.0; commercial/incompatible use needs separate permission.\n- Internet Archive: item-level review required.\n- HathiTrust: metadata rights differ from volume content.\n- Google Books: access is not redistribution permission.\n- WorldCat/OCLC: entitlement/policy required for API or bulk use.\n- QDL IIIF examples: Public Domain item statement verified; remote IIIF first pending derivative-rehosting policy review.\n- OCR stays OCR_NEEDS_REVIEW.\n- Modern translations, tafsir, children content and audio require separate rights.\n",encoding="utf-8")
    (ROOT/"20-credentials-required.md").write_text("# Credentials required\n\n| Provider | Requirement |\n|---|---|\n| Sunnah.com | approved API key/access |\n| Quran Foundation | client credentials |\n| WorldCat/OCLC | eligible subscription + WSKey |\n| HathiTrust research datasets | provider approval/agreement |\n| Google Books | configured project/API key recommended |\n",encoding="utf-8")
    cats=Counter(w["category_primary"] for w in allworks)
    (ROOT/"21-source-by-category-counts.md").write_text("# Source by category counts\n\nVerified OpenITI works: **9106**\n\nSeed-only pending verification: **%d**\n\n| Category | Works |\n|---|---:|\n%s\n\nUNCLASSIFIED_OPENITI is retained rather than forcing a false shelf assignment.\n"%(len(pending),"\n".join(f"| {k} | {v} |" for k,v in cats.most_common())),encoding="utf-8")
    (ROOT/"22-recommended-ingestion-plan.md").write_text("# Recommended ingestion plan\n\nP0: provider/rights/work/person registries.\n\nP1: non-OCR OpenITI only under CC BY-NC-SA-compatible deployment; QDL Public Domain IIIF remote reading; OpenITI MSS transcriptions separate from images.\n\nP2: OCR remains flagged; HathiTrust content stays remote until HTID/digitizer rights clear.\n\nP3/P4: Google Books/WorldCat are enrichment; Internet Archive requires exact identity + item rights.\n\nHard gates: no fake readers, no fake downloads, no version-as-work inflation, no filename-derived editions, no rewriting source religious text.\n",encoding="utf-8")

    manifest={"generated_at":"2026-09-23T22:00:00+04:00","baseline_main_sha":BASE,"research_branch":BRANCH,"schema_version":"1.0","source_release":{"openiti_version":"2025.1.9","zenodo_record":"https://zenodo.org/records/17767721","metadata_md5":MD5,"total_text_records":14107,"book_text_versions":13674,"unique_books":9106,"openiti_author_identifiers":3618,"person_registry_rows":len(people),"manuscript_transcriptions":433},"license_warning":"OpenITI is CC BY-NC-SA 4.0; no commercial-use grant by default.","providers":providers,"people":list(people.values()),"works":allworks,"editions":list(editions.values()),"digital_versions":dvs,"audio":audio,"manuscripts":mss,"rights":rights,"datasets":datasets,"duplicates":dups,"ingestion_queue":queue,"continuation_checkpoint":{"verified_openiti_works":9106,"versions_discovered":len(dvs),"audio_records":len(audio),"audio_verified_item_versions":0,"manuscripts_discovered":len(mss),"providers_pending":["Princeton Islamic Manuscripts","Gallica/BnF","LOC systematic pass","Arabic Wikisource","Wikimedia Commons","Zenodo Islamic datasets","authority reconciliation"],"next_provider":"Princeton Islamic Manuscripts / Gallica-BnF"}}
    write_json(ROOT/"23-machine-readable-import-manifest.json",manifest)

    report=f"""# Final research report

Date: 2026-09-23
Baseline main: {BASE}
Research branch: {BRANCH}
Application code/UI changes: NONE

## Verified OpenITI 2025.1.9
- Total text records: 14,107
- Arabic versions: 13,320
- Persian versions: 354
- Manuscript transcriptions: 433
- Unique books: 9,106
- OpenITI author identifiers: 3,618\n- Human/person registry rows after excluding non-person author-like identifiers: {len(people):,}
- Book digital versions: 13,674
- Edition-evidence records: {len(editions):,}
- Uncorrected OCR book rows: {sum(1 for r in br if str(r.get("uncorrected_OCR","")).lower()=="true"):,}

## Seed reconciliation
- Supplied seed works: {len(seed)}
- Exact normalized Arabic-title matches: {matched}
- Pending source-level match: {len(pending)}

## External evidence
- Internet Archive representative files: 5, all P4 / rights-review blocked.
- OpenITI manuscript transcriptions: 433.
- QDL/British Library Public Domain IIIF items: 3.
- Audio provider leads: 2; verified item-level audio versions promoted: 0.

## Validation
Generator verifies official OpenITI MD5 and asserts 14,107 / 9,106 / 3,618 / 433 before writing the 24 deliverables.
"""
    (ROOT/"24-final-research-report.md").write_text(report,encoding="utf-8")

    required=[f"{i:02d}" for i in range(1,25)]
    names=[p.name for p in ROOT.iterdir() if p.is_file()]
    assert all(any(nm.startswith(x+"-") for nm in names) for x in required)
    json.loads((ROOT/"23-machine-readable-import-manifest.json").read_text(encoding="utf-8"))
    print(json.dumps({"openiti_rows":14107,"verified_works":9106,"authors":3618,"book_versions":13674,"mss_transcriptions":433,"editions":len(editions),"works_total":len(allworks),"seed_matched":matched,"seed_pending":len(pending),"digital_versions_total":len(dvs),"manuscripts_total":len(mss),"audio_records":2,"audio_verified_item_versions":0,"deliverables":24},ensure_ascii=False))

if __name__=="__main__":
    main()
