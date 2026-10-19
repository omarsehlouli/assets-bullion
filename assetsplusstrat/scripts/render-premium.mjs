// Renders the premium Bullion Trading films and masters their audio for social.
//   node scripts/render-premium.mjs [film-id ...]      (default: every film in the premium group)
//   node scripts/render-premium.mjs --group=premium-2  (every film in that group)
// Output: out/marketing/<group>/<film-id>.mp4 (1080×1920, 60 fps, H.264, AAC −14 LUFS).
import {bundle} from '@remotion/bundler';
import {openBrowser, renderMedia, selectComposition} from '@remotion/renderer';
import {execFileSync} from 'node:child_process';
import {mkdirSync, rmSync, writeFileSync} from 'node:fs';
import {resolve} from 'node:path';

const FILMS = {
  'first-piece': {id: 'Bullion-YourFirstPiece', group: 'premium'},
  'new-york': {id: 'Bullion-NewYorkConnection', group: 'premium'},
  'meaningful-gift': {id: 'Bullion-AGiftWithMeaning', group: 'premium'},
  'icons-of-gold': {id: 'Bullion-IconsOfGold', group: 'premium'},
  'makers-edge': {id: 'Bullion-TheMakersEdge', group: 'premium'},
  traditions: {id: 'Bullion-Traditions', group: 'premium-2'},
  'sell-to-us': {id: 'Bullion-SellToUs', group: 'premium-2'},
  'real-or-fake': {id: 'Bullion-RealOrFake', group: 'premium-2'},
  'spot-to-store': {id: 'Bullion-SpotToStore', group: 'premium-2'},
  'bullion-tax': {id: 'Bullion-TaxByState', group: 'premium-2'},
  'faq-real-gold': {id: 'Bullion-FAQ-RealGold', group: 'premium-3'},
  'faq-sell-in-person': {id: 'Bullion-FAQ-SellInPerson', group: 'premium-3'},
  'faq-bar-or-eagle': {id: 'Bullion-FAQ-BarOrEagle', group: 'premium-3'},
  'faq-premium': {id: 'Bullion-FAQ-Premium', group: 'premium-3'},
  'faq-pickup': {id: 'Bullion-FAQ-Pickup', group: 'premium-3'},
  'whats-inside': {id: 'Bullion-WhatsInside', group: 'story'},
};

const root = resolve(import.meta.dirname, '..');
const args = process.argv.slice(2);
const groupArg = args.find((a) => a.startsWith('--group='))?.slice(8);
const named = args.filter((a) => !a.startsWith('--'));
const selected = named.length ? named : Object.keys(FILMS).filter((f) => FILMS[f].group === (groupArg ?? 'premium'));
const outDir = (film) => resolve(root, 'out/marketing', FILMS[film].group);

// Two-pass EBU R128 normalisation to −14 LUFS / −1 dBTP; the video stream is copied untouched.
const measure = (file, filter) => {
  const log = execFileSync('bash', ['-c', `ffmpeg -hide_banner -nostdin -i "${file}" -af ${filter}:print_format=json -f null - 2>&1 | tail -14`], {encoding: 'utf8'});
  return JSON.parse(log.slice(log.indexOf('{'), log.lastIndexOf('}') + 1));
};

const master = (raw, final) => {
  const m = measure(raw, 'loudnorm=I=-14:TP=-1:LRA=11');
  const filter =
    `loudnorm=I=-14:TP=-1:LRA=11:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:` +
    `measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true`;
  execFileSync('ffmpeg', ['-hide_banner', '-nostdin', '-y', '-v', 'error', '-i', raw, '-c:v', 'copy', '-af', filter, '-ar', '48000', '-c:a', 'aac', '-b:a', '320k', '-movflags', '+faststart', final]);
  const after = measure(final, 'loudnorm=I=-14:TP=-1:LRA=11');
  return {before: Number(m.input_i), after: Number(after.input_i), truePeak: Number(after.input_tp)};
};

const bundleDir = resolve(root, 'out/marketing', `.bundle-render-${process.pid}`);
const serveUrl = await bundle({entryPoint: resolve(root, 'src/index.ts'), outDir: bundleDir, enableCaching: true});
const browser = await openBrowser('chrome');
const report = [];
try {
  for (const film of selected) {
    if (!FILMS[film]) {
      throw new Error(`Unknown film ${film}`);
    }
    const {id} = FILMS[film];
    const out = outDir(film);
    mkdirSync(out, {recursive: true});
    const composition = await selectComposition({serveUrl, id, puppeteerInstance: browser});
    const raw = resolve(out, `${film}.raw.mp4`);
    const final = resolve(out, `${film}.mp4`);
    const started = Date.now();
    let last = -1;
    await renderMedia({
      serveUrl,
      composition,
      codec: 'h264',
      crf: 16,
      x264Preset: 'slow',
      pixelFormat: 'yuv420p',
      audioCodec: 'aac',
      audioBitrate: '320k',
      imageFormat: 'jpeg',
      jpegQuality: 95,
      outputLocation: raw,
      puppeteerInstance: browser,
      concurrency: 8,
      onProgress: ({progress}) => {
        const step = Math.floor(progress * 10);
        if (step !== last) {
          last = step;
          console.log(`${film}: ${step * 10}%`);
        }
      },
    });
    const levels = master(raw, final);
    rmSync(raw, {force: true});
    report.push({
      film,
      composition: id,
      file: final,
      seconds: composition.durationInFrames / composition.fps,
      fps: composition.fps,
      renderSeconds: Math.round((Date.now() - started) / 1000),
      loudness: levels,
    });
    console.log(`DONE ${final}`);
  }
} finally {
  await browser.close({silent: true});
  rmSync(bundleDir, {recursive: true, force: true});
}
const reportDir = outDir(selected[0]);
writeFileSync(resolve(reportDir, `render-report${selected.length === 1 ? `-${selected[0]}` : ''}.json`), JSON.stringify(report, null, 2));
