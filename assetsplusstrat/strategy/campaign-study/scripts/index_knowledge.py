"""Build a searchable local corpus and a catalog inventory from saved public pages."""
from pathlib import Path
from urllib.parse import urlsplit
import csv,json,sqlite3
ROOT=Path(__file__).resolve().parents[1]
BASE=ROOT/'bullion_knowledge'

def nodes(value):
 if isinstance(value,list):
  for x in value:yield from nodes(x)
 elif isinstance(value,dict):
  yield value
  if '@graph' in value:yield from nodes(value['@graph'])

def main():
 index=json.loads((BASE/'source_index.json').read_text())
 db=sqlite3.connect(BASE/'knowledge.sqlite3')
 db.execute('CREATE VIRTUAL TABLE IF NOT EXISTS pages USING fts5(source_id UNINDEXED, url UNINDEXED, title, text)')
 db.execute('DELETE FROM pages')
 catalog=[]
 for r in index:
  if r['status']!='fetched':continue
  d=json.loads((BASE/r['file']).read_text())
  db.execute('INSERT INTO pages VALUES (?,?,?,?)',(r['id'],r['url'],r['title'],d['text']))
  if '/product/' not in r['url']:continue
  products=[n for n in nodes(d['structured_data']) if 'Product' in ([n.get('@type')] if isinstance(n.get('@type'),str) else n.get('@type',[]))]
  p=products[0] if products else {}
  brand=p.get('brand',{});brand=brand.get('name','') if isinstance(brand,dict) else str(brand)
  offers=p.get('offers',{});offers=offers[0] if isinstance(offers,list) and offers else offers
  offers=offers if isinstance(offers,dict) else {}
  catalog.append([r['id'],r['url'],p.get('name',r['title']),p.get('sku',''),brand,offers.get('availability',''),r['retrieved_at'],r['file']])
 for p in (BASE/'transcripts').glob('*.txt'):
  db.execute('INSERT INTO pages VALUES (?,?,?,?)',('transcript:'+p.stem,str(p.relative_to(ROOT)),p.stem,p.read_text()))
 db.commit();db.close()
 with (BASE/'source_index.csv').open('w',newline='') as f:
  w=csv.writer(f);w.writerow(['id','url','title','status','retrieved_at','text_characters','file'])
  w.writerows([[r.get(k,'') for k in ['id','url','title','status','retrieved_at','text_characters','file']] for r in index])
 with (BASE/'product_catalog.csv').open('w',newline='') as f:
  w=csv.writer(f);w.writerow(['source_id','product_page','name','sku','brand','availability_at_capture_not_current','retrieved_at','source_file']);w.writerows(catalog)
 summary={'public_pages':len(index),'product_pages':len(catalog),'transcripts':len(list((BASE/'transcripts').glob('*.txt'))),
          'archive_only':'Product availability and prices in source snapshots are time-bound observations, not offers.'}
 (BASE/'inventory_summary.json').write_text(json.dumps(summary,indent=2));print(json.dumps(summary))

if __name__=='__main__':main()
