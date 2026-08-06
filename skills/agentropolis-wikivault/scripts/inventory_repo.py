#!/usr/bin/env python3
import argparse, hashlib, json, os
from pathlib import Path

SKIP_DIRS={'.git','node_modules','vendor','dist','build','.next','coverage','__pycache__','.venv','venv'}
SECRET_NAMES={'.env','id_rsa','id_ed25519','credentials.json','service-account.json'}

def sha256(path):
    h=hashlib.sha256()
    with path.open('rb') as f:
        for chunk in iter(lambda:f.read(1024*1024),b''): h.update(chunk)
    return h.hexdigest()

def main():
    p=argparse.ArgumentParser(); p.add_argument('source'); p.add_argument('--output',required=True); p.add_argument('--max-bytes',type=int,default=10_000_000); a=p.parse_args()
    root=Path(a.source).resolve(); out=Path(a.output); out.mkdir(parents=True,exist_ok=True)
    records=[]
    for base,dirs,files in os.walk(root):
        dirs[:]=[d for d in dirs if d not in SKIP_DIRS]
        for name in files:
            path=Path(base)/name; rel=path.relative_to(root).as_posix()
            try: size=path.stat().st_size
            except OSError: continue
            quarantine=name in SECRET_NAMES or name.endswith(('.pem','.key','.p12','.pfx')) or size>a.max_bytes
            rec={'path':rel,'size':size,'quarantined':quarantine,'reason':'secret_or_sensitive_name' if name in SECRET_NAMES or name.endswith(('.pem','.key','.p12','.pfx')) else ('oversized' if size>a.max_bytes else None)}
            if not quarantine:
                try: rec['sha256']=sha256(path)
                except OSError: rec['error']='unreadable'
            records.append(rec)
    records.sort(key=lambda x:x['path'])
    (out/'inventory.json').write_text(json.dumps({'root':str(root),'count':len(records),'files':records},indent=2),encoding='utf-8')
    print(json.dumps({'count':len(records),'quarantined':sum(1 for r in records if r['quarantined']),'output':str(out/'inventory.json')}))
if __name__=='__main__': main()
