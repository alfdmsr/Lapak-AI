import os
from pathlib import Path
def load_env():
 p=Path(__file__).resolve().parent/'.env'
 if p.exists():
  for line in p.read_text(encoding='utf-8-sig').splitlines():
   line=line.strip()
   if not line or line.startswith('#'):continue
   k,sep,v=line.partition('=')
   if sep:os.environ.setdefault(k.strip(),v.strip().strip('"').strip("'"))
