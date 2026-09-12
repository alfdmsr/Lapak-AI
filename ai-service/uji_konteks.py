"""Uji pencarian bukti lokal; BUKAN model AI atau jawaban generatif."""
import argparse,json,re
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('pertanyaan');a=p.parse_args()
root=Path(__file__).resolve().parent/'data'/'processed'
e=json.loads((root/'ai_evidence.json').read_text(encoding='utf-8'))
s=json.loads((root/'summary.json').read_text(encoding='utf-8'))
tokens=set(re.findall(r'\w+',a.pertanyaan.lower()))-{'apa','yang','di','dan','untuk','ada','ini','itu','berapa'}
rank=[]
for item in e:
 text=' '.join(str(item.get(k) or '') for k in ['title','text']).lower()
 score=sum(t in text for t in tokens)
 if score:rank.append((score,item))
rank.sort(key=lambda x:(-x[0],x[1]['evidence_id']))
print(json.dumps({'mode':'retrieval_only_not_llm','question':a.pertanyaan,'economic_metrics':s['economic_metrics'],
 'limitations':s['limitations'],'matched_evidence':[i for _,i in rank[:8]]},ensure_ascii=False,indent=2))
