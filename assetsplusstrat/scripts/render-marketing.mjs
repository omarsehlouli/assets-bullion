import {bundle} from '@remotion/bundler';
import {getCompositions, renderMedia, renderStill, openBrowser} from '@remotion/renderer';
import {readFileSync, mkdirSync, writeFileSync} from 'node:fs';
import {resolve} from 'node:path';

const root=resolve(import.meta.dirname,'..');
const campaign=JSON.parse(readFileSync(resolve(root,'public/marketing/campaign.json'),'utf8'));
const timing=JSON.parse(readFileSync(resolve(root,'public/marketing/timing.json'),'utf8'));
const mode=process.argv[2] || 'stills';
const selected=process.argv[3];
const out=resolve(root,'out/marketing');
mkdirSync(resolve(out,'stills'),{recursive:true});
const serveUrl=await bundle({entryPoint:resolve(root,'src/index.ts'),rspack:true,outDir:resolve(out,selected?`bundle-${selected}`:'bundle'),enableCaching:true});
const browser=await openBrowser('chrome');
try {
 const comps=await getCompositions(serveUrl,{puppeteerInstance:browser});
 const report=[];
 for(const video of campaign.videos.filter(v=>!selected||v.id===selected)){
  const comp=comps.find(c=>c.id===video.composition);
  if(!comp)throw new Error(`Missing composition ${video.composition}`);
  if(mode==='stills'){
   for(const [i,scene] of timing[video.id].scenes.entries()){
    const sec=Math.min(scene.start+1,scene.end-.15);
    const frame=Math.round(sec*comp.fps);
    const output=resolve(out,'stills',`${video.id}-${i+1}-${scene.id}.jpg`);
    await renderStill({serveUrl,composition:comp,output,frame,scale:.5,imageFormat:'jpeg',jpegQuality:85,puppeteerInstance:browser});
    console.log(`STILL ${video.id}/${scene.id} @ ${sec.toFixed(2)}s`);
   }
  }else{
   const output=resolve(out,`${video.id}.mp4`);
   let last=-1;
   await renderMedia({serveUrl,composition:comp,codec:'h264',audioCodec:'aac',crf:18,pixelFormat:'yuv420p',outputLocation:output,puppeteerInstance:browser,concurrency:4,jpegQuality:92,
    onProgress:({progress})=>{const step=Math.floor(progress*10);if(step!==last){last=step;console.log(`${video.id}: ${step*10}%`);}}
   });
   report.push({id:video.id,title:video.title,composition:comp.id,duration:comp.durationInFrames/comp.fps,width:comp.width,height:comp.height,fps:comp.fps,file:output});
   console.log(`VIDEO ${output}`);
  }
 }
 if(mode!=='stills')writeFileSync(resolve(out,selected?`render-${selected}.json`:'render-report.json'),JSON.stringify(report,null,2));
}finally{await browser.close({silent:true});}
