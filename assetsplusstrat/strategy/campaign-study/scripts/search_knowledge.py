from pathlib import Path
import argparse,sqlite3
p=argparse.ArgumentParser(description='Search the archived bullion knowledge and local transcripts.');p.add_argument('query');p.add_argument('--limit',type=int,default=10);a=p.parse_args()
db=sqlite3.connect(Path(__file__).resolve().parents[1]/'bullion_knowledge/knowledge.sqlite3')
query=' '.join('"'+word.replace('"','""')+'"' for word in a.query.split())
for url,title,snippet in db.execute("SELECT url,title,snippet(pages,3,'[',']','…',35) FROM pages WHERE pages MATCH ? ORDER BY rank LIMIT ?",(query,a.limit)):
 print(title+'\n'+url+'\n'+snippet+'\n')
