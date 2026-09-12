import io,json,os,unittest,threading,urllib.request
from unittest.mock import patch
import jawab
from server import Handler,ThreadingHTTPServer
class Tests(unittest.TestCase):
 def test_preview(self):self.assertEqual(jawab.answer('trotoar')['mode'],'preview_not_llm')
 def test_mock_live(self):
  def transport(req,timeout):
   self.assertIn('generateContent',req.full_url);self.assertNotIn('test-key',req.full_url)
   self.assertIn('systemInstruction',json.loads(req.data))
   return io.StringIO(json.dumps({'candidates':[{'finishReason':'STOP','content':{'parts':[{'text':json.dumps({'answer':'Data belum tersedia.','evidence_ids':['summary'],'limitations':[]})}]}}]}))
  with patch.dict(os.environ,{'GEMINI_API_KEY':'test-key'}):self.assertEqual(jawab.answer('daya beli','live',transport)['mode'],'live_llm')
 def test_bad_source(self):
  with self.assertRaises(ValueError):jawab.validate('{"answer":"x","evidence_ids":["fake"],"limitations":[]}',jawab.context('trotoar'))
 def test_http(self):
  srv=ThreadingHTTPServer(('127.0.0.1',0),Handler);t=threading.Thread(target=srv.serve_forever,daemon=True);t.start()
  try:
   base=f'http://127.0.0.1:{srv.server_port}'
   self.assertEqual(json.load(urllib.request.urlopen(base+'/health'))['status'],'ok')
   req=urllib.request.Request(base+'/chat',data=b'{"question":"trotoar","mode":"preview"}',headers={'Content-Type':'application/json'})
   self.assertEqual(json.load(urllib.request.urlopen(req))['mode'],'preview_not_llm')
   self.assertEqual(json.load(urllib.request.urlopen(base+'/layers/study_boundary'))['type'],'FeatureCollection')
  finally:srv.shutdown();srv.server_close();t.join()
if __name__=='__main__':unittest.main()
