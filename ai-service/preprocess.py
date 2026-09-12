"""Preprocessing lokal, Python 3.10+, tanpa paket tambahan atau API key."""
import collections, hashlib, json, re
from pathlib import Path
ROOT=Path(__file__).resolve().parent
OUT=ROOT/'data'/'processed'

def read(p):return json.loads(p.read_text(encoding='utf-8-sig'))
def write(p,d):p.write_text(json.dumps(d,ensure_ascii=False,indent=2,allow_nan=False),encoding='utf-8')
def clean(v):return re.sub(r'\s+',' ',v).strip() if isinstance(v,str) else v
def redact(v):
    # Redaksi nomor telepon pada teks untuk konteks AI; sumber input tetap utuh.
    return re.sub(r'(?<!\d)(?:\+62|62|0)\d[\d\s().-]{6,}\d', '[kontak disembunyikan]',v)
def main():
    OUT.mkdir(parents=True,exist_ok=True)
    source=ROOT/'data'/'input'/'study_data.json';d=read(source)
    records=[];evidence=[];seen={};menu=[];props=[]
    for obs in d['observations']:
        p={k:clean(v) for k,v in obs['properties'].items()}
        oid=obs['observation_id'];title=p.get('judul') or '';desc=p.get('deskripsi') or ''
        group=None
        if title or desc:
            fingerprint=json.dumps([title.casefold(),desc.casefold(),p.get('tanggal')],ensure_ascii=False)
            group=seen.setdefault(fingerprint,oid)
        status=obs.get('study_membership','unknown_missing_coordinates')
        row={'observation_id':oid,'title':title or None,'description':desc or None,
             'category':p.get('jenis_laporan') or 'lainnya','issue_category':p.get('kategori_masalah'),
             'observed_date':p.get('tanggal'),'geometry':obs.get('geometry'),
             'location_status':status,'location_verified':False,'eligible_for_spatial_statistics':False,
             'text_evidence_available':bool(title or desc),'duplicate_group':group,
             'is_duplicate_candidate':group is not None and group!=oid,
             'source_page_index':p.get('nomor_halaman'),'source_pdf_page':p['nomor_halaman']+1 if isinstance(p.get('nomor_halaman'),int) else None,
             'quality_flags':list(obs.get('quality_flags',[])),'sources':obs.get('sources',[])}
        if row['is_duplicate_candidate']:row['quality_flags'].append('duplicate_text_candidate')
        records.append(row)
        if row['text_evidence_available'] and not row['is_duplicate_candidate']:
            evidence.append({'evidence_id':oid,'kind':'survey_report_unverified','title':redact(title),
                 'text':redact(desc),'date':p.get('tanggal'),'location_status':status,
                 'location_verified':False,'source_pdf_page':row['source_pdf_page'],
                 'note':'Laporan sumber, bukan verifikasi kondisi terkini atau bukti lokasi presisi.'})
    ids={r['observation_id'] for r in records}
    for m in d['menu_items']:
        assert m['observation_id'] in ids
        price=m.get('offered_price_idr')
        assert price is None or (isinstance(price,(int,float)) and not isinstance(price,bool) and price>=0)
        item={**m,'name':clean(m.get('name')),'price_kind':'offered_price',
              'eligible_for_area_price_statistics':False,'location_verified':False,'verified':False}
        menu.append(item)
        evidence.append({'evidence_id':m['menu_id'],'kind':'offered_price_extraction_unverified',
             'title':item['name'],'text':'Harga penawaran hasil ekstraksi; bukan transaksi.',
             'offered_price_idr':price,'observation_id':m['observation_id'],
             'location_status':m.get('study_membership'),'location_verified':False})
    for p in d['property_observations']:
        assert p['observation_id'] in ids
        props.append({**p,'availability_verified':False,'eligible_for_location_recommendation':False})
    # Geometri referensi dipisahkan berdasarkan sumber, tidak dijumlahkan sebagai usaha unik.
    layers={role:[] for role in ['osm_reference','rbi_reference','survey_unverified']}
    for f in d['spatial_features']:
        role=f['properties'].get('dataset_role')
        if role not in layers:raise ValueError(f'Unknown role: {role}')
        layers[role].append(f)
    for role,fs in layers.items():
        if role=='survey_unverified':
            # Layer tampilan tanpa identitas pelapor/deskripsi kontak.
            fs=[{'type':'Feature','id':f['id'],'geometry':f['geometry'],
                 'properties':{'observation_id':f['id'],'title':redact(f['properties'].get('judul') or ''),
                               'location_verified':False,'dataset_role':role}} for f in fs]
        write(ROOT/'data'/'map'/(role+'.geojson'),{'type':'FeatureCollection','features':fs})
    summary={'study':d['study'],'counts':{'observations':len(records),'text_evidence_groups':sum(r['text_evidence_available'] and not r['is_duplicate_candidate'] for r in records),
        'duplicate_text_candidates':sum(r['is_duplicate_candidate'] for r in records),
        'observations_without_coordinates':sum(r['geometry'] is None for r in records),
        'observations_with_unverified_coordinates':sum(r['geometry'] is not None for r in records),
        'menu_items':len(menu),'priced_items':sum(m['offered_price_idr'] is not None for m in menu),
        'property_observations':len(props),'reference_features':{k:len(v) for k,v in layers.items() if k!='survey_unverified'}},
        'economic_metrics':{'purchasing_power':None,'average_transaction':None,'area_average_menu_price':None,'predicted_sales':None},
        'capabilities':{'summarize_source_reports':True,'retrieve_menu_price_evidence':True,
                        'precise_site_ranking':False,'predict_purchasing_power':False,'trained_model':False},
        'limitations':['Pusat studi masih koordinat geocoding sementara.',
            'Lokasi seluruh survei belum tervalidasi. Data tanpa koordinat tidak dimasukkan statistik area.',
            '22 item dengan harga belum diketahui lokasi pastinya; belum bisa menjadi rata-rata harga kawasan.',
            'Tidak ada transaksi. Jumlah observasi properti bukan jumlah properti unik.',
            'OSM/RBI adalah referensi yang mungkin tidak lengkap dan bisa mewakili objek yang sama.',
            'Teks survei dan OCR belum diverifikasi ulang seluruhnya; tanggal laporan bukan jaminan kondisi terkini.']}
    write(OUT/'observations.json',records);write(OUT/'menu_items.json',menu);write(OUT/'property_observations.json',props)
    write(OUT/'ai_evidence.json',evidence);write(OUT/'summary.json',summary)
    write(OUT/'preprocessing_report.json',{'source_sha256':hashlib.sha256(source.read_bytes()).hexdigest(),
        'observations_preserved':len(records)==len(d['observations']),'counts':summary['counts'],
        'rules':['Whitespace normalized','No coordinate/price imputation','Duplicate text grouped, raw records retained',
                 'Missing titles with menu items retained','No unverified spatial/economic statistics'],
        'duplicate_candidates':[r['observation_id'] for r in records if r['is_duplicate_candidate']]})
    print(json.dumps(summary['counts'],indent=2,ensure_ascii=False))
if __name__=='__main__':main()
