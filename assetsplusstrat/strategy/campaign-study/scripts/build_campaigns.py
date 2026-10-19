from pathlib import Path
import csv, json, os, shutil, hashlib
from urllib.parse import urlencode

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'campaigns'
BASE = 'https://bulliontradingllc.com'
COMMON_NEGATIVES = ['jobs', 'free gold', 'gold plated', 'gold paint', 'gold jewelry', 'gold mining stocks', 'ETF', 'futures', 'forex', 'scrap gold', 'sell gold', 'gold loan']

CAMPAIGNS = [
 dict(id='campaign1',name='Your First Piece',scope='U.S.',audience='Adults considering their first physical gold or silver purchase.',
      approach='Make the first purchase feel understandable. Show one silver coin and one small gold bar, invite comparison of weights and product details, and send high-intent traffic directly to the appropriate metal category. Lead with choice and clarity rather than financial urgency.',
      hypothesis='A tangible, approachable product pair may reduce first-purchase intimidation and earn qualified product exploration.',
      description='A calm introduction to physical gold and silver, built around recognizable products, simple comparison, and live product prices.',
      headline='Your first piece starts here.',
      primary='Start with a closer look. Compare gold bars, silver coins and rounds at Bullion Trading LLC, with live product prices and a New York team you can reach.',
      meta_headline='Find Your First Piece',meta_description='Explore gold and silver bullion.',cta='Shop Now',
      google_headlines=['Buy Gold & Silver Bullion','Find Your First Piece','Compare Bullion Weights','Shop Silver Coins & Rounds','Explore Small Gold Bars','Bullion Trading LLC'],
      google_descriptions=['Explore gold bars, silver coins and rounds. Compare weights and live product prices.',
                           'Start with a closer look. Shop physical bullion with a New York team you can reach.',
                           'Find the product that fits your budget. Review current pricing and payment options.'],
      keywords={'silver':['buy silver bullion','buy silver coins','silver rounds for sale','1 oz silver eagle'],
                'gold':['buy small gold bars','5 gram gold bar','buy gold bullion','gold bars for beginners']},
      destinations={'silver':BASE+'/silver/','gold':BASE+'/gold/bars/gram-gold-bars/'},
      supporting=[BASE+'/gold/', 'https://learn.bulliontradingllc.com/guides/understanding-gold-silver/'],
      transcript=['first-piece','faq-bar-or-eagle'],
      visual='Warm ivory tabletop with a silver American Eagle and an orange Valcambi 5 g gold assay card; soft window light and approachable scale. Generated illustrative product scene; exact year and serial details are not guaranteed.',
      image='exec-eb578a65-5f57-4b91-bb87-93e4bae2b2d9.png',
      refs=['coin-silver-eagle.png','card-valcambi.png'],
      caution='Keep gold and silver search ad groups on matching destinations. No minimum starting price, returns promise, or claim that every buyer can afford a particular item.'),
 dict(id='campaign2',name='Know the Price. Choose the Bar.',scope='U.S.',audience='Adults actively comparing one-ounce gold bars, brands, payment methods and premiums.',
      approach='Meet existing purchase intent with transparent comparison. A focused gold-bar creative leads straight to the one-ounce-bar category. The ad explains what to compare without claiming the lowest price. On Meta, pair the product image with a short spot-versus-premium explanation.',
      hypothesis='Specific product intent plus a clear comparison task may produce the strongest national purchase intent, even if gifting earns more casual attention.',
      description='A product-led campaign for shoppers ready to compare recognizable 1 oz gold bars and their current total prices.',
      headline='Know the price. Choose the bar.',
      primary='A gold bar is more than its spot price. Compare 1 oz bars by mint, current price and payment option, then choose with the details in front of you.',
      meta_headline='Compare 1 oz Gold Bars',meta_description='See current prices and product details.',cta='Shop Now',
      google_headlines=['Compare 1 oz Gold Bars','Live Gold Bar Prices','Shop PAMP & Valcambi','Know the Price. Choose Gold.','Explore Gold Bars Online','Bullion Trading LLC'],
      google_descriptions=['Compare 1 oz gold bars by mint and current price. Review payment options before buying.',
                           'Explore PAMP, Valcambi and other listed bars. See live product details and availability.',
                           'Spot is the starting point. Compare the full product price before choosing your bar.'],
      keywords={'gold':['buy 1 oz gold bar','1 oz gold bar price','PAMP gold bar for sale','Valcambi gold bar','gold bar premium','compare gold bar prices']},
      destinations={'gold':BASE+'/gold/bars/1-oz-gold-bars/'},
      supporting=[BASE+'/product/1-oz-pamp-suisse-gold-bar-lady-fortuna-in-assay/',
                  'https://learn.bulliontradingllc.com/guides/questions/03-what-is-spot-price-vs-premium/'],
      transcript=['spot-to-store','faq-premium','icons-of-gold','faq-bar-or-eagle'],
      visual='A single blue PAMP Lady Fortuna gold assay card on a charcoal surface, with a plain notebook and pen. Warm edge light emphasizes the real product; no chart, price or savings claim is pictured.',
      image='exec-1802f025-8080-4dc4-850f-53cd20a752f9.png',refs=['card-fortuna-gold.png'],
      caution='No lowest-premium or savings claim. Compare equivalent weight, brand, condition and payment method at the same time. Do not reuse archived prices.'),
 dict(id='campaign3',name='A Little Gold. A Lasting Gesture.',scope='U.S.',audience='Adults shopping for a milestone or anniversary gift and considering a physical gold keepsake.',
      approach='Use the emotional appeal of a tangible gift while keeping the product and purchase path specific. Show a small PAMP bar in a styled gifting scene and route the main ad to the matching 5 g product. Offer silver gifts through supporting links, without turning this into a sixth campaign.',
      hypothesis='The gifting scene may attract more attention and emotional interest, with purchase intent concentrated among people who already have an occasion in mind.',
      description='Gold as a memorable physical gift: a beautiful object to hold, give and keep, without promising future investment gains.',
      headline='A little gold. A lasting gesture.',
      primary='Some moments deserve something tangible. Explore a 5 g PAMP Lady Fortuna gold bar for a milestone worth remembering. See current price and availability.',
      meta_headline='Gold for a Meaningful Moment',meta_description='Explore a 5 g PAMP gold bar.',cta='Shop Now',
      google_headlines=['Gold for a Meaningful Gift','Shop 5 Gram PAMP Gold Bars','Mark a Golden Milestone','A Gift They Can Hold','Explore Gold & Silver Gifts','Bullion Trading LLC'],
      google_descriptions=['Explore a 5 g PAMP Lady Fortuna gold bar for a milestone. See current availability.',
                           'Make the moment memorable with physical gold. Review product details and live pricing.',
                           'Discover gold and silver gift ideas. Styling shown is illustrative; packaging varies.'],
      keywords={'gold_gift':['gold bar gift','5 gram PAMP gold bar','gold bullion gift','gold anniversary gift','small gold bar gift']},
      destinations={'gold_gift':BASE+'/product/5-gram-pamp-suisse-gold-bar-lady-fortunain-assay/'},
      supporting=[BASE+'/gifts/',BASE+'/traditions/'],
      transcript=['meaningful-gift','traditions'],
      visual='A sealed blue 5 g PAMP Lady Fortuna assay card inside an ivory gift box with cream tissue and burgundy ribbon, on warm walnut. The gift box and ribbon are props, not included product packaging.',
      image='exec-89e7fc1c-408b-4172-bd00-9200095a89ca.png',refs=['card-fortuna-5g.png'],
      caution='Box and ribbon are illustrative styling, not a promised inclusion. Use broad occasion-based creative; do not infer a viewer’s religion. Confirm stock and delivery timing before seasonal use.'),
 dict(id='campaign4',name='Gold Has a New York Address',scope='NYC local',audience='Adults in the New York metro area who prefer a reachable local dealer and an in-person purchase conversation.',
      approach='Make the physical business the reason to choose this dealer. Pair the catalog products with a conceptual counter conversation, the verified Diamond District address, and a direct gold-shopping link. Add location and phone links as secondary actions; keep purchasing as the primary outcome.',
      hypothesis='A verifiable Manhattan location and a human conversation may improve trust and purchase intent among local buyers with authenticity concerns.',
      description='A local trust campaign connecting online bullion shopping with Bullion Trading’s physical Diamond District presence.',
      headline='Gold has a New York address.',
      primary='Explore gold and silver with a real New York team. Shop online or contact Bullion Trading LLC at 20 West 47th Street, Lower Level #24, to plan your visit.',
      meta_headline='Your New York Bullion Dealer',meta_description='Shop gold. Plan a Diamond District visit.',cta='Shop Now',
      google_headlines=['Buy Gold in New York City','NYC Diamond District Bullion','20 West 47th Street','Gold & Silver. A Real Address.','Shop Bullion With a NYC Team','Bullion Trading LLC'],
      google_descriptions=['Shop gold and silver online, or plan a visit to our New York Diamond District counter.',
                           '20 West 47th Street, Lower Level #24. Contact our team before planning your visit.',
                           'Explore bars and coins with live prices. A real New York team is here to help.'],
      keywords={'gold_local':['buy gold NYC','gold bullion dealer Manhattan','buy gold bars New York','Diamond District gold dealer'],
                'silver_local':['buy silver NYC','silver bullion dealer NYC','buy silver coins Manhattan']},
      destinations={'gold_local':BASE+'/gold/','silver_local':BASE+'/silver/'},
      supporting=[BASE+'/location/',BASE+'/contact-us/'],
      transcript=['new-york','faq-real-gold','real-or-fake'],
      visual='Conceptual counter consultation: a dealer’s hand presents a blue PAMP gold assay card beside a silver coin in a capsule. Neutral office materials and natural light. These are generated hands and a fictional counter, not actual staff or premises.',
      image='exec-8904cff9-c868-45c2-8859-5905a35fb477.png',refs=['card-fortuna-gold.png','coin-silver-eagle.png'],
      caution='Do not present the generated counter or hands as actual staff/store photography. Do not imply any simple home test proves authenticity. Confirm business hours before a visit.'),
 dict(id='campaign5',name='Shop Online. Plan Your Pickup.',scope='NYC local',audience='Adults within practical travel distance of Manhattan who want to purchase bullion and arrange collection.',
      approach='Remove uncertainty between browsing and collecting. Lead with online product choice plus arranged Manhattan pickup, and show the payment eligibility condition in the ad copy. Product category remains the primary destination; contact and location pages support collection planning.',
      hypothesis='Convenience may move ready local buyers toward purchase, but payment and clearance requirements can reduce appeal; test that friction explicitly.',
      description='An online-to-local purchase journey with clear pickup expectations, grounded in the owner’s pickup FAQ and current website terms.',
      headline='Shop online. Plan your pickup.',
      primary='Choose your gold online, then contact our Manhattan team to arrange eligible pickup. Timing depends on payment clearance. Card and PayPal orders must ship.',
      meta_headline='Plan Your Manhattan Pickup',meta_description='Confirm payment and collection first.',cta='Shop Now',
      google_headlines=['Plan Your Manhattan Pickup','Shop Gold Bars Online','Buy Gold With Local Pickup','Confirm Pickup With Our Team','Bullion in Midtown Manhattan','Bullion Trading LLC'],
      google_descriptions=['Explore gold bars and arrange eligible Manhattan pickup. Confirm payment and timing.',
                           'Pickup depends on payment clearance. Credit card and PayPal orders must be shipped.',
                           'Contact our New York team before visiting. Shop current products and live prices.'],
      keywords={'pickup':['buy gold NYC pickup','gold bars local pickup Manhattan','buy bullion Manhattan pickup','gold dealer Midtown Manhattan']},
      destinations={'pickup':BASE+'/gold/bars/1-oz-gold-bars/'},
      supporting=[BASE+'/contact-us/',BASE+'/location/',BASE+'/terms-and-conditions/'],
      transcript=['faq-pickup','new-york'],
      visual='A blue PAMP Lady Fortuna assay card on a dark tray beside an unmarked kraft carrier bag, cardholder and face-down phone on a gray counter. A conceptual arranged-pickup scene; bag and tray are styling props.',
      image='exec-9e87aeef-a2a7-4af6-b380-4f6b97cf6c01.png',refs=['card-fortuna-gold.png'],
      caution='Do not promise same-day availability or pickup. Card/PayPal in-store pickup is disallowed in current terms. Contact the business for acceptable payment, clearance, inventory and collection arrangements.')
]

def write_csv(path, headers, rows):
    with path.open('w', newline='') as f:
        w=csv.writer(f);w.writerow(headers);w.writerows(rows)

def main():
    OUT.mkdir(exist_ok=True)
    global_rows=[]
    for c in CAMPAIGNS:
        folder=OUT/c['id'];folder.mkdir(exist_ok=True)
        for h in c['google_headlines']: assert len(h)<=30,(c['id'],h,len(h))
        for d in c['google_descriptions']: assert len(d)<=90,(c['id'],d,len(d))
        c['status']='draft_for_review'
        c['objective']='Purchases of physical gold and silver bullion'
        c['google_targeting']='U.S. presence; separate gold/silver intent groups. Exclude NYC metro during the combined pilot to avoid overlap with local campaigns.' if c['scope']=='U.S.' else 'Presence in NYC metro / practical Manhattan travel area; validate actual coverage before launch.'
        c['meta_targeting']='Adults in the selected geography; broad creative-led prospecting. Retarget consenting site visitors separately if available. No customer list or private audience was used.'
        c['meta_note']='Meta uses audience and creative context, not Google-style search keywords. Keywords below are for Google Search and content planning.'
        c['negative_keywords']=COMMON_NEGATIVES
        c['assets']={'primary_image':'creative.png','image_type':'AI-generated reference-based campaign concept','visual_description':c['visual']}
        (folder/'campaign.json').write_text(json.dumps(c,ensure_ascii=False,indent=2))
        (folder/'approach.txt').write_text(f"{c['name']}\n\nAudience: {c['audience']}\nMarket: {c['scope']}\nObjective: {c['objective']}\n\nApproach\n{c['approach']}\n\nHypothesis (not a result)\n{c['hypothesis']}\n\nTranscript inspiration\n"+', '.join(c['transcript'])+f"\n\nExecution\nGoogle Search: separate ad groups by destination and intent. Meta: the same concept, primary text and product image. Purchases are the primary conversion; product views and carts are diagnostic. Validate purchase tracking before any live test.\n\nProduct and copy limits\n{c['caution']}\n")
        (folder/'description.txt').write_text(c['description']+'\n\nCreative description\n'+c['visual']+'\n\nHeadline\n'+c['headline']+'\n\nPrimary text\n'+c['primary']+'\n')
        rows=[]
        for group,words in c['keywords'].items():
            for word in words:
                for match in ['Exact','Phrase']:rows.append([group,word,match,'Suggested intent; no volume or CPC data retrieved'])
        write_csv(folder/'keywords.csv',['ad_group','keyword','match_type','evidence'],rows)
        write_csv(folder/'negative-keywords.csv',['negative_keyword','match_type'],[[k,'Phrase'] for k in COMMON_NEGATIVES])
        destinations=[]
        for group,url in c['destinations'].items():
            for channel in ['google','meta']:
                tracked=url+'?'+urlencode({'utm_source':channel,'utm_medium':'cpc' if channel=='google' else 'paid_social','utm_campaign':c['id'],'utm_content':group+'_v1'})
                destinations.append([group,channel,url,tracked,'Primary purchase path'])
        for i,url in enumerate(c['supporting'],1):destinations.append([f'support_{i}','sitelink',url,url,'Secondary information or product path'])
        write_csv(folder/'final-destinations.csv',['ad_group','channel','final_url','tracked_url','purpose'],destinations)
        copy={'google_search':{'headlines':[{'text':h,'characters':len(h)} for h in c['google_headlines']],
                               'descriptions':[{'text':d,'characters':len(d)} for d in c['google_descriptions']]},
              'meta':{'primary_text':c['primary'],'headline':c['meta_headline'],'description':c['meta_description'],'cta':c['cta']},
              'creative_overlay_suggestion':c['headline'],'note':'Copy and image are separate assets. No live ad was created.'}
        (folder/'ad-copy.json').write_text(json.dumps(copy,ensure_ascii=False,indent=2))
        # Generated creatives already live in each campaign folder; set CREATIVE_DIR to re-import new ones.
        source=Path(os.environ.get('CREATIVE_DIR', folder))/c['image']
        if source.exists():shutil.copy2(source,folder/'creative.png')
        (folder/'image-qa.txt').write_text('Generated with the built-in imagegen tool; visually reviewed.\nPhotorealistic illustrative concept grounded in the supplied catalog references.\nNo promotional prices, investment charts, return guarantees, or business logo were generated.\nProduct relief, serial numbers, lettering and proportions are AI approximations; this asset is for concept review, not a substitute for exact inventory photography.\n'+c['caution']+'\nReference files: '+', '.join(c['refs'])+'\n')
        global_rows.append([c['id'],c['name'],c['scope'],c['headline'],'; '.join(c['destinations'].values())])
    (OUT/'campaigns.json').write_text(json.dumps(CAMPAIGNS,ensure_ascii=False,indent=2))
    write_csv(OUT/'campaign-comparison.csv',['id','name','market','hook','primary_destinations'],global_rows)
    print('Prepared exactly five campaigns; all Google headline and description length checks pass.')

if __name__=='__main__':main()
