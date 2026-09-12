import json
from pathlib import Path
p=Path(__file__).resolve().parent/'data'/'processed'
r=lambda n:json.loads((p/n).read_text(encoding='utf-8'))
o=r('observations.json');m=r('menu_items.json');s=r('summary.json');e=r('ai_evidence.json')
assert len(o)==57 and len(m)==28
assert sum(x['offered_price_idr'] is not None for x in m)==22
assert sum(x['geometry'] is None for x in o)==40
assert sum(x['is_duplicate_candidate'] for x in o)==1
assert not any(x['eligible_for_spatial_statistics'] for x in o)
assert not any(x['eligible_for_area_price_statistics'] for x in m)
assert all(v is None for v in s['economic_metrics'].values())
ids={x['observation_id'] for x in o}
assert all(x['observation_id'] in ids for x in m+r('property_observations.json'))
assert len({x['evidence_id'] for x in e})==len(e)
assert any(x.get('observation_id')=='activity:page:24' for x in e)
assert not any('nama_pelapor' in x for x in e)
print('PASS: record terjaga, relasi valid, data tidak pasti tidak masuk metrik ekonomi/spasial.')
