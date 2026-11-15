#!/usr/bin/env python3
import json,csv,sys,urllib.parse
from pathlib import Path
ROOT=Path(__file__).parent
REQ=["id","provider","video_id","official_url","title_original","language","channel_name","channel_url","publisher_status","category","content_type","rights_status","license_type","embedding_status","editorial_status","publication_status"]
errors=[]
for stem in ["kids-media-catalog","seerah-media-catalog"]:
 data=json.load(open(ROOT/(stem+".json"),encoding="utf-8")); rows=data["records"]
 ids=[r.get("video_id") for r in rows]
 if len(ids)!=len(set(ids)): errors.append(stem+": duplicate video_id")
 with open(ROOT/(stem+".csv"),encoding="utf-8-sig") as f:
  csvrows=list(csv.DictReader(f))
 if len(rows)!=len(csvrows): errors.append(stem+": JSON/CSV count mismatch")
 for r in rows:
  for k in REQ:
   if k not in r: errors.append(stem+": missing "+k)
  if r.get("provider")!="youtube": errors.append(stem+": invalid provider")
  if not (isinstance(r.get("official_url"),str) and r["official_url"].startswith("https://www.youtube.com/watch?v=")): errors.append(stem+": invalid individual URL "+str(r.get("official_url")))
  if r.get("publication_status")=="APPROVED" and r.get("editorial_status")!="REVIEWED": errors.append(stem+": unsupported APPROVED")
print("VALID" if not errors else "INVALID")
for e in errors: print(e)
sys.exit(1 if errors else 0)
