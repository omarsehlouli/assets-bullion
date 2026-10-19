"""Archive public, robots-allowed sitemap pages; never submits forms or enters checkout."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from urllib.parse import urlsplit
from urllib.robotparser import RobotFileParser
import hashlib, json, subprocess, time, xml.etree.ElementTree as ET
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'bullion_knowledge'
NS = {'s': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
HOSTS = {'bulliontradingllc.com', 'learn.bulliontradingllc.com'}

def fetch(url):
    result = subprocess.run(['curl', '-fLsS', '--connect-timeout', '5', '--max-time', '25',
                             '--max-redirs', '3', url], capture_output=True)
    if result.returncode:
        raise RuntimeError(result.stderr.decode(errors='replace').strip()[:300])
    return result.stdout

def sitemap(url):
    data = fetch(url)
    (OUT / 'sitemaps' / (urlsplit(url).netloc + '-' + urlsplit(url).path.rsplit('/', 1)[-1])).write_bytes(data)
    tree = ET.fromstring(data)
    if tree.tag.endswith('sitemapindex'):
        urls = []
        for loc in tree.findall('s:sitemap/s:loc', NS):
            urls += sitemap(loc.text)
        return urls
    return [n.text for n in tree.findall('s:url/s:loc', NS)]

def archive(url):
    uid = hashlib.sha256(url.encode()).hexdigest()[:16]
    path = OUT / 'sources' / (uid + '.json')
    if path.exists():
        return json.loads(path.read_text())['metadata']
    time.sleep(0.25)
    stamp = datetime.now(timezone.utc).isoformat()
    try:
        data = fetch(url)
        soup = BeautifulSoup(data, 'html.parser')
        title = soup.title.get_text(' ', strip=True) if soup.title else url
        description = soup.find('meta', attrs={'name': 'description'})
        canonical = soup.find('link', rel='canonical')
        structured = []
        for node in soup.find_all('script', type='application/ld+json'):
            try: structured.append(json.loads(node.string or node.get_text()))
            except (ValueError, TypeError): pass
        links = sorted({a.get('href') for a in soup.find_all('a', href=True)
                        if a.get('href', '').startswith('https://')})
        images = [{'url': i.get('src'), 'alt': i.get('alt', '')}
                  for i in soup.find_all('img', src=True)]
        for node in soup.select('script, style, nav, header, footer, noscript, form, .woocommerce-notices-wrapper'):
            node.decompose()
        body = soup.find('main') or soup.find('article') or soup.body or soup
        lines = [s.strip() for s in body.get_text('\n', strip=True).splitlines() if s.strip()]
        text = '\n'.join(lines)
        meta = {'id': uid, 'url': url, 'title': title, 'retrieved_at': stamp,
                'status': 'fetched', 'bytes': len(data), 'text_characters': len(text),
                'sha256_html': hashlib.sha256(data).hexdigest(),
                'file': str(path.relative_to(OUT)), 'source_type': 'first_party_public_website'}
        record = {'metadata': meta,
                  'description': description.get('content', '') if description else '',
                  'canonical': canonical.get('href', '') if canonical else '',
                  'text': text, 'structured_data': structured, 'links': links, 'images': images}
        path.write_text(json.dumps(record, ensure_ascii=False, indent=2))
        return meta
    except Exception as exc:
        return {'id': uid, 'url': url, 'retrieved_at': stamp, 'status': 'failed', 'error': str(exc)}

def main():
    for folder in ['sources', 'sitemaps']: (OUT / folder).mkdir(parents=True, exist_ok=True)
    policies = {}
    for host in sorted(HOSTS):
        data = fetch('https://' + host + '/robots.txt').decode()
        (OUT / 'sitemaps' / (host + '-robots.txt')).write_text(data)
        robot = RobotFileParser(); robot.parse(data.splitlines()); policies[host] = robot
    urls = sorted(set(sitemap('https://bulliontradingllc.com/sitemap_index.xml') +
                      sitemap('https://learn.bulliontradingllc.com/sitemap-index.xml')))
    allowed = [u for u in urls if urlsplit(u).netloc in HOSTS and not urlsplit(u).query
               and policies[urlsplit(u).netloc].can_fetch('*', u)
               and not any(x in urlsplit(u).path for x in ['/cart/', '/checkout/', '/my-account/'])]
    (OUT / 'url_inventory.json').write_text(json.dumps({'discovered': urls, 'selected': allowed}, indent=2))
    print(f'Discovered {len(urls)} unique pages; collecting {len(allowed)} public allowed pages.', flush=True)
    results = []
    with ThreadPoolExecutor(max_workers=4) as pool:
        jobs = {pool.submit(archive, u): u for u in allowed}
        for job in as_completed(jobs):
            results.append(job.result())
            if len(results) % 50 == 0:
                print(f'{len(results)}/{len(allowed)} pages; {sum(r["status"] == "failed" for r in results)} failed', flush=True)
                (OUT / 'source_index.json').write_text(json.dumps(sorted(results, key=lambda r:r['url']), indent=2))
    results.sort(key=lambda r:r['url'])
    (OUT / 'source_index.json').write_text(json.dumps(results, ensure_ascii=False, indent=2))
    summary = {'retrieved_at': datetime.now(timezone.utc).isoformat(), 'discovered': len(urls),
               'selected': len(allowed), 'fetched': sum(r['status'] == 'fetched' for r in results),
               'failed': sum(r['status'] == 'failed' for r in results),
               'method': 'Public sitemap collection respecting robots.txt; page text, metadata, JSON-LD, image references. No account access.'}
    (OUT / 'collection_summary.json').write_text(json.dumps(summary, indent=2))
    print(json.dumps(summary), flush=True)

if __name__ == '__main__': main()
