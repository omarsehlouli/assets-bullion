import {getCompositions,renderStill,openBrowser} from '@remotion/renderer';
import {resolve} from 'node:path';
const serveUrl=resolve('out/marketing/bundle');
const browser=await openBrowser('chrome');
try {
 const comps=await getCompositions(serveUrl,{puppeteerInstance:browser});
 const c=comps.find(c=>c.id==='MetalsBrief');
 for (const [i,frame] of [180,510,960,1380,1650].entries()){
  await renderStill({serveUrl,composition:c,frame,output:resolve(`out/marketing/reference-review/metals-${i}.jpg`),scale:.4,imageFormat:'jpeg',puppeteerInstance:browser});
 }
}finally{await browser.close({silent:true});}
