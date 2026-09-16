import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import toIco from "to-ico";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const sourcePath = join(root, "src/assets/brand/logo-source.png");
const publicIcons = join(root, "public/icons");
const appDir = join(root, "src/app");

const BACKGROUND = { r: 243, g: 241, b: 234, alpha: 1 };

/** Remove transparent / empty margins so the mark fills the canvas. */
async function loadTrimmedLogoBuffer() {
  return sharp(sourcePath)
    .trim({ threshold: 2 })
    .png()
    .toBuffer();
}

async function makeSquarePng(size, trimmedLogo) {
  /* Full-bleed art like a tight crop: scale to fit the full square (source should already be cropped). */
  const resizedLogo = await sharp(trimmedLogo)
    .resize(size, size, { fit: "inside" })
    .toBuffer();

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: BACKGROUND,
    },
  })
    .composite([{ input: resizedLogo, gravity: "center" }])
    .png()
    .toBuffer();
}

mkdirSync(publicIcons, { recursive: true });

const trimmedLogo = await loadTrimmedLogoBuffer();

/** Sizes needed in memory (favicon / apple) plus public PWA icons. */
const sizes = [16, 32, 48, 180, 192, 512];
/** Only these are written under public/icons/ (referenced by layout + webmanifest). */
const publicIconSizes = [192, 512];

/** @type {Record<number, Buffer>} */
const buffers = {};
for (const s of sizes) {
  buffers[s] = await makeSquarePng(s, trimmedLogo);
}
for (const s of publicIconSizes) {
  writeFileSync(join(publicIcons, `icon-${s}.png`), buffers[s]);
}

writeFileSync(join(publicIcons, "apple-touch-icon.png"), buffers[180]);

writeFileSync(join(appDir, "icon.png"), buffers[512]);
writeFileSync(join(appDir, "apple-icon.png"), buffers[180]);

const ico = await toIco([buffers[16], buffers[32], buffers[48]]);
writeFileSync(join(appDir, "favicon.ico"), ico);

console.log("Wrote PWA icons under public/icons/, app/icon.png, app/apple-icon.png, app/favicon.ico");
