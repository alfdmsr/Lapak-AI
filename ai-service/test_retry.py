import io,json,os,unittest,urllib.error
from unittest.mock import patch
import jawab
class RetryTests(unittest.TestCase):
 def test_retry_and_display(self):
  calls=[];sleeps=[]
  def transport(req,timeout):
   calls.append(1)
   if len(calls)==1:raise urllib.error.HTTPError(req.full_url,503,'unavailable',{},io.BytesIO(b'{"error":{"status":"UNAVAILABLE"}}'))
   return io.StringIO(json.dumps({'candidates':[{'finishReason':'STOP','content':{'parts':[{'text':json.dumps({'answer':'Trotoar terhalang [activity:page:7].','evidence_ids':['activity:page:7'],'limitations':['Bukti laporan.']})}]}}]}))
  with patch.dict(os.environ,{'GEMINI_API_KEY':'fake'}):r=jawab.answer('trotoar','live',transport,sleeps.append)
  self.assertEqual(len(calls),2);self.assertEqual(len(sleeps),1);self.assertIn('[1]',r['answer'])
  self.assertEqual(r['display']['sources'][0]['source_pdf_page'],8)
  self.assertNotIn('area_average',jawab.readable(r))
 def test_no_retry_403(self):
  def transport(req,timeout):raise urllib.error.HTTPError(req.full_url,403,'forbidden',{},io.BytesIO(b'{}'))
  with patch.dict(os.environ,{'GEMINI_API_KEY':'fake'}):
   with self.assertRaises(RuntimeError):jawab.answer('trotoar','live',transport,lambda _:self.fail('retry forbidden'))
 def test_max_retry(self):
  calls=[]
  def transport(req,timeout):calls.append(1);raise TimeoutError()
  with patch.dict(os.environ,{'GEMINI_API_KEY':'fake'}):
   with self.assertRaises(RuntimeError):jawab.answer('trotoar','live',transport,lambda _:None)
  self.assertEqual(len(calls),4)
if __name__=='__main__':unittest.main()
