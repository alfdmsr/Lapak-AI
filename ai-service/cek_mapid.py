"""Tes basemap saja. Tidak mengambil dataset Mission."""
import os,json,urllib.request,urllib.parse,urllib.error
from config import load_env
load_env()
key=os.getenv('MAPID_BASEMAP_KEY')
if not key:raise SystemExit('Isi MAPID_BASEMAP_KEY pada .env. Ini opsional untuk AI.')
url='https://basemap.mapid.io/styles/light/style.json?'+urllib.parse.urlencode({'key':key})
try:
 with urllib.request.urlopen(url,timeout=20) as r:d=json.load(r)
 print(json.dumps({'style_valid':all(k in d for k in ['version','sources','layers']),
                   'note':'Hanya style basemap; bukan akses Menu Go/Struk Go/Properti Go.'}))
except urllib.error.HTTPError as e:print(f'MAPID HTTP {e.code}; periksa hak akses basemap. URL/key tidak dicetak.')
except Exception:print('Gagal terhubung atau respons bukan JSON. URL/key tidak dicetak.')
