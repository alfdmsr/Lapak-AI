"""Backend pengembangan lokal; bukan server produksi publik."""
import json,os
from http.server import ThreadingHTTPServer,BaseHTTPRequestHandler
from pathlib import Path
from jawab import answer,ROOT
LAYERS={n:ROOT/'data'/'map'/(n+'.geojson') for n in ['study_boundary','osm_reference','rbi_reference','survey_unverified']}
class Handler(BaseHTTPRequestHandler):
 def log_message(self,*args):pass
 def send(self,status,data):
  body=json.dumps(data,ensure_ascii=False).encode();self.send_response(status)
  origin=self.headers.get('Origin');allowed=os.getenv('WEBGIS_ORIGIN','http://localhost:3000')
  if origin==allowed:self.send_header('Access-Control-Allow-Origin',allowed);self.send_header('Vary','Origin')
  self.send_header('Content-Type','application/json; charset=utf-8');self.send_header('Content-Length',str(len(body)))
  self.send_header('Access-Control-Allow-Headers','Content-Type');self.send_header('Access-Control-Allow-Methods','GET,POST,OPTIONS')
  self.end_headers();self.wfile.write(body)
 def do_OPTIONS(self):self.send(200,{'ok':True})
 def do_GET(self):
  if self.path=='/health':return self.send(200,{'status':'ok','provider':'gemini','key_configured':bool(os.getenv('GEMINI_API_KEY'))})
  if self.path=='/summary':p=ROOT/'data'/'processed'/'summary.json'
  elif self.path.startswith('/layers/') and self.path[8:] in LAYERS:p=LAYERS[self.path[8:]]
  else:return self.send(404,{'error':'Endpoint tidak ditemukan'})
  self.send(200,json.loads(p.read_text(encoding='utf-8')))
 def do_POST(self):
  if self.path!='/chat':return self.send(404,{'error':'Endpoint tidak ditemukan'})
  if self.headers.get('Origin') and self.headers['Origin']!=os.getenv('WEBGIS_ORIGIN','http://localhost:3000'):return self.send(403,{'error':'Origin tidak diizinkan'})
  try:
   size=int(self.headers.get('Content-Length','0'))
   if not 0<size<=12000:raise ValueError('Ukuran request tidak valid')
   data=json.loads(self.rfile.read(size))
   if not isinstance(data,dict) or set(data)-{'question','mode','evidence_ids'}:raise ValueError('Gunakan question, mode, evidence_ids; filter polygon belum didukung')
   if not isinstance(data.get('question'),str):raise ValueError('question harus string')
   self.send(200,answer(data['question'],data.get('mode','preview'),evidence_ids=data.get('evidence_ids')))
  except (ValueError,TypeError):self.send(400,{'error':'Input atau format jawaban tidak valid. Periksa question, mode dan output model.'})
  except RuntimeError as e:self.send(502,{'error':str(e)})
  except Exception:self.send(500,{'error':'Kesalahan internal; periksa data lokal.'})
if __name__=='__main__':
 try:srv=ThreadingHTTPServer(('127.0.0.1',8000),Handler)
 except OSError:raise SystemExit('Port 8000 tidak bisa dibuka. Periksa server yang sudah berjalan di http://127.0.0.1:8000/health; jangan menyalakan server kedua.')
 print('Backend lokal aktif: http://127.0.0.1:8000/health (Ctrl+C untuk berhenti)')
 try:srv.serve_forever()
 except KeyboardInterrupt:pass
 finally:srv.server_close()
