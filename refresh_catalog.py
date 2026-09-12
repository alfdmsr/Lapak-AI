"""Perbarui katalog pencarian setelah preprocessing: python refresh_catalog.py."""
import json
from pathlib import Path
root=Path(__file__).resolve().parent
p=root/'ai-service/data'
evidence=json.loads((p/'processed/ai_evidence.json').read_text(encoding='utf-8'))
features=json.loads((p/'map/survey_unverified.geojson').read_text(encoding='utf-8'))['features']
coordinates={str(f['id']):f['geometry']['coordinates'] for f in features if f.get('geometry',{}).get('type')=='Point'}
for e in evidence:
 e.pop('coordinates',None)
 if e['evidence_id'] in coordinates:e['coordinates']=coordinates[e['evidence_id']]
(root/'frontend/public/catalog.json').write_text(json.dumps(evidence,ensure_ascii=False),encoding='utf-8')
print(f'Katalog diperbarui: {len(evidence)} sumber, hanya koordinat dengan ID cocok ditautkan.')
