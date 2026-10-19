// Renders review stills for a premium composition from a single bundle.
//   node scripts/premium-stills.mjs <compositionId> <seconds...> [--scale=0.5] [--out=dir]
import {bundle} from '@remotion/bundler';
import {openBrowser, renderStill, selectComposition} from '@remotion/renderer';
import {mkdirSync, rmSync} from 'node:fs';
import {resolve} from 'node:path';

const root = resolve(import.meta.dirname, '..');
const args = process.argv.slice(2);
const flags = Object.fromEntries(args.filter((a) => a.startsWith('--')).map((a) => a.slice(2).split('=')));
const [id, ...times] = args.filter((a) => !a.startsWith('--'));
const scale = Number(flags.scale ?? 0.5);
const out = resolve(flags.out ?? resolve(root, 'out/marketing/premium/stills', id));
mkdirSync(out, {recursive: true});

const serveUrl = await bundle({entryPoint: resolve(root, 'src/index.ts'), outDir: resolve(root, `out/marketing/premium/.bundle-${process.pid}`), enableCaching: true});
const browser = await openBrowser('chrome');
try {
  const composition = await selectComposition({serveUrl, id, puppeteerInstance: browser});
  await Promise.all(
    times.map(async (t, i) => {
      const frame = Math.min(composition.durationInFrames - 1, Math.round(Number(t) * composition.fps));
      const name = `${String(i).padStart(2, '0')}-${Number(t).toFixed(2)}s.jpg`;
      await renderStill({serveUrl, composition, frame, output: resolve(out, name), scale, imageFormat: 'jpeg', jpegQuality: 88, puppeteerInstance: browser});
    }),
  );
  console.log(`${times.length} stills → ${out}`);
} finally {
  await browser.close({silent: true});
  rmSync(resolve(root, `out/marketing/premium/.bundle-${process.pid}`), {recursive: true, force: true});
}
