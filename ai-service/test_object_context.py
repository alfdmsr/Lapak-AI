import unittest,json,io,os
from unittest.mock import patch
import jawab
class ObjectContext(unittest.TestCase):
 def test_selected_only(self):
  c=jawab.context('Apa laporan trotoar dan harga?', ['activity:page:7'])
  self.assertEqual([e['evidence_id'] for e in c['evidence']],['activity:page:7'])
  self.assertEqual(c['scope'],'object')
 def test_unknown_rejected_before_api(self):
  with patch('urllib.request.urlopen',side_effect=AssertionError('Tidak boleh panggil API')):
   with self.assertRaises(ValueError):jawab.answer('uji','live',evidence_ids=['fake'])
 def test_unselected_citation_rejected(self):
  c=jawab.context('trotoar',['activity:page:7'])
  with self.assertRaises(ValueError):jawab.validate(json.dumps({'answer':'uji','evidence_ids':['activity:page:0'],'limitations':[]}),c)
 def test_average_paraphrase_is_grounded(self):
  r=jawab.answer('rata-rata harga menu kawasan','live')
  self.assertEqual(r['mode'],'dataset_answer_not_llm')
  self.assertIn('bukan sampel representatif',r['answer'])
  self.assertIn('Rp12.500',r['answer'])
  self.assertIsNone(jawab.context('uji')['summary']['economic_metrics']['area_average_menu_price'])
 def test_object_payload_and_matrix(self):
  response={'candidates':[{'finishReason':'STOP','content':{'parts':[{'text':json.dumps({'answer':'Temuan: jalur terhalang [activity:page:7].','evidence_ids':['activity:page:7'],'limitations':[]})}]}}]}
  def transport(req,**kwargs):
   payload=json.loads(req.data);ctx=json.loads(payload['contents'][0]['parts'][0]['text'])
   self.assertEqual(ctx['selected_evidence_ids'],['activity:page:7'])
   return io.BytesIO(json.dumps(response).encode())
  with patch.dict(os.environ,{'GEMINI_API_KEY':'test'}):r=jawab.answer('Jelaskan','live',transport=transport,evidence_ids=['activity:page:7'])
  self.assertEqual(r['scope'],'object')
  self.assertEqual(r['display']['decision_matrix'][0]['evidence_id'],'activity:page:7')
if __name__=='__main__':unittest.main()
