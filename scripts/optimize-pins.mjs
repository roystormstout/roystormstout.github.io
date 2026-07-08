import { mkdir, readdir, rm, stat } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const inputDir = path.join('src', 'assets', 'pins');
const outputDir = path.join(inputDir, 'optimized');
const outputSizes = [320, 480, 640];
const webpQuality = 82;
const avifQuality = 52;

function formatKb(bytes) {
  return `${Math.round((bytes / 1024) * 10) / 10} KB`;
}

await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });

const sourceFiles = (await readdir(inputDir, { withFileTypes: true }))
  .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.png'))
  .map((entry) => entry.name)
  .sort();

let totalInputBytes = 0;
let totalOutputBytes = 0;

await Promise.all(sourceFiles.map(async (fileName) => {
  const sourcePath = path.join(inputDir, fileName);
  const baseName = path.basename(fileName, '.png');
  const inputSize = (await stat(sourcePath)).size;
  let outputBytes = 0;

  totalInputBytes += inputSize;

  for (const size of outputSizes) {
    const resized = sharp(sourcePath).resize({
      width: size,
      height: size,
      fit: 'inside',
      withoutEnlargement: true,
    });
    const webpOutputPath = path.join(outputDir, `${baseName}-${size}.webp`);
    const avifOutputPath = path.join(outputDir, `${baseName}-${size}.avif`);

    await resized.clone().webp({ quality: webpQuality, effort: 6 }).toFile(webpOutputPath);
    await resized.clone().avif({ quality: avifQuality, effort: 6 }).toFile(avifOutputPath);

    outputBytes += (await stat(webpOutputPath)).size;
    outputBytes += (await stat(avifOutputPath)).size;
  }

  totalOutputBytes += outputBytes;

  console.log(`${fileName}: ${formatKb(inputSize)} -> ${formatKb(outputBytes)} across ${outputSizes.length * 2} variants`);
}));

const savedBytes = totalInputBytes - totalOutputBytes;
const savedPercent = Math.round((savedBytes / totalInputBytes) * 1000) / 10;

console.log(`Total: ${formatKb(totalInputBytes)} -> ${formatKb(totalOutputBytes)} (${savedPercent}% smaller)`);