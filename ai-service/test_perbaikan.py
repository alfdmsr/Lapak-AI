import unittest,json,io,os,tempfile
from pathlib import Path
from unittest.mock import patch
import jawab,evaluate
class Repairs(unittest.TestCase):
 def test_average_no_api(self):
  with patch('urllib.request.urlopen',side_effect=AssertionError('API tidak boleh dipanggil')):
   r=jawab.answer('Berapa rata-rata harga menu di kawasan ini?','live')
  self.assertEqual(r['mode'],'dataset_answer_not_llm');self.assertIn('summary',r['evidence_ids']);self.assertGreater(len(r['sources']),0)
 def test_reject_fake_source(self):
  with self.assertRaises(ValueError):jawab.validate(json.dumps({'answer':'klaim','evidence_ids':['fake'],'limitations':[]}),jawab.context('trotoar'))
 def test_empty_sources_fallback(self):
  obj={'candidates':[{'finishReason':'STOP','content':{'parts':[{'text':json.dumps({'answer':'klaim tidak sah','evidence_ids':[],'limitations':[]})}]}}]}
  with patch.dict(os.environ,{'GEMINI_API_KEY':'test'}):
   r=jawab.answer('trotoar','live',transport=lambda *a,**k:io.BytesIO(json.dumps(obj).encode()))
  self.assertEqual(r['mode'],'fallback_dataset_summary');self.assertNotIn('klaim tidak sah',r['answer'])
 def test_resume_skips_completed(self):
  with tempfile.TemporaryDirectory() as d:
   out=str(Path(d)/'report.json')
   args=['evaluate.py','--live','--ids','trotoar','--interval','0','--output',out]
   fake={'mode':'live_llm','answer':'uji'}
   with patch('sys.argv',args),patch.object(jawab,'answer',return_value=fake) as call:
    evaluate.main();evaluate.main();self.assertEqual(call.call_count,1)
 def test_interruption_checkpoint(self):
  with tempfile.TemporaryDirectory() as d:
   out=str(Path(d)/'report.json')
   with patch('sys.argv',['evaluate.py','--live','--ids','trotoar','pie','--interval','0','--output',out]),patch.object(jawab,'answer',side_effect=[{'mode':'live_llm'},KeyboardInterrupt()]):evaluate.main()
   r=json.loads(Path(out).read_text());self.assertTrue(r['interrupted']);self.assertEqual(len(r['results']),1)
if __name__=='__main__':unittest.main()
