"""Cek MAPID lokal; tidak mencetak key atau menyimpan respons mentah."""
import json,os,re,urllib.request,urllib.error,urllib.parse,argparse,getpass
from pathlib import Path
ROOT=Path(__file__).resolve().parent
from config import load_env
load_env()
class NoRedirect(urllib.request.HTTPRedirectHandler):
 def redirect_request(self,*args,**kwargs):return None

def read_json(url):
 try:
  with urllib.request.build_opener(NoRedirect()).open(url,timeout=25) as r:
   body=r.read(5_000_001)
   if len(body)>5_000_000:return {'status':'response_too_large'},None
   try:return {'status':'received','http':r.status},json.loads(body)
   except ValueError:return {'status':'not_json','http':r.status},None
 except urllib.error.HTTPError as e:return {'status':'http_error','http':e.code},None
 except Exception:return {'status':'connection_failed'},None

def host(url):
 try:return urllib.parse.urlsplit(url).hostname
 except ValueError:return None

def safe_url(url):
 p=urllib.parse.urlsplit(url)
 if p.scheme!='https' or p.hostname!='geoserver.mapid.io' or p.port not in (None,443) or p.username or p.password or p.fragment or p.path!='/layers_new/get_layer_list':
  raise ValueError('Gunakan URL HTTPS Open API get_layer_list dari proyek MAPID, bukan endpoint lain.')
 return url

def main():
 ap=argparse.ArgumentParser();ap.add_argument('--project',action='store_true');ap.add_argument('--basemap',action='store_true');a=ap.parse_args()
 report={}
 if a.basemap:
  # Read frontend config separately; never copy key into logs.
  envfile=ROOT.parent/'frontend/.env.local';key=''
  if envfile.exists():
   for line in envfile.read_text(encoding='utf-8-sig').splitlines():
    if line.strip().startswith('NEXT_PUBLIC_MAPID_API_KEY='):key=line.split('=',1)[1].strip().strip('\"\'')
  key=os.getenv('NEXT_PUBLIC_MAPID_API_KEY',key)
  if not key:report['basemap']={'status':'key_missing'}
  else:
   styles={}
   for style in ['light','satellite','basic']:
    u='https://basemap.mapid.io/styles/'+style+'/style.json?'+urllib.parse.urlencode({'key':key})
    state,data=read_json(u);state['requested_style_host']='basemap.mapid.io'
    if isinstance(data,dict):
     sources=data.get('sources',{});hosts=set()
     if isinstance(sources,dict):
      for source in sources.values():
       if not isinstance(source,dict):continue
       for link in [source.get('url'),*source.get('tiles',[])]:
        if isinstance(link,str) and host(link):hosts.add(host(link))
     state['source_hosts']=sorted(hosts);state['is_gl_style']=data.get('version')==8 and isinstance(data.get('layers'),list)
     state['note']='Host style dapat berbeda dari host data tile. Atribusi tidak dihapus. TileJSON lanjutan tidak diambil.'
    styles[style]=state
   report['basemap']=styles
 if a.project:
  url=os.getenv('MAPID_PROJECT_API_URL') or getpass.getpass('Tempel URL Open API proyek (input disembunyikan): ')
  try:url=safe_url(url)
  except ValueError as e:report['project']={'status':'invalid_url','message':str(e)}
  else:
   state,data=read_json(url)
   # Only report response shape and name matches. Do not claim feature-data access.
   strings=[]
   def walk(x):
    if isinstance(x,list):
     for v in x:walk(v)
    elif isinstance(x,dict):
     for k,v in x.items():
      if k in ('name','title','layer_name','geo_layer_name') and isinstance(v,str):strings.append(v.lower())
      elif isinstance(v,(dict,list)):walk(v)
   walk(data)
   state['response_type']=type(data).__name__
   if isinstance(data,list):state['top_level_count']=len(data)
   state['name_hints']={term:any(term in s for s in strings) for term in ['menu','struk','properti','property']}
   state['note']='Petunjuk nama bukan bukti akses isi dataset. Daftar kosong hanya berlaku pada respons proyek ini; bukan bukti semua data MAPID tidak tersedia.'
   report['project']=state
 if not report:ap.error('Pilih --basemap dan/atau --project')
 out=ROOT/'diagnostics';out.mkdir(exist_ok=True);path=out/'mapid_report.json'
 path.write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
 print(json.dumps(report,ensure_ascii=False,indent=2));print('Laporan:',path)
if __name__=='__main__':main()
