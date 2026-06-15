import { mkdir, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const inputDir = path.join('src', 'assets', 'pins');
const outputDir = path.join(inputDir, 'optimized');
const maxSize = 640;
const webpQuality = 82;

function formatKb(bytes) {
  return `${Math.round((bytes / 1024) * 10) / 10} KB`;
}

await mkdir(outputDir, { recursive: true });

const sourceFiles = (await readdir(inputDir, { withFileTypes: true }))
  .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.png'))
  .map((entry) => entry.name);

let totalInputBytes = 0;
let totalOutputBytes = 0;

await Promise.all(sourceFiles.map(async (fileName) => {
  const sourcePath = path.join(inputDir, fileName);
  const outputName = `${path.basename(fileName, '.png')}.webp`;
  const outputPath = path.join(outputDir, outputName);

  await sharp(sourcePath)
    .resize({
      width: maxSize,
      height: maxSize,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: webpQuality, effort: 6 })
    .toFile(outputPath);

  const inputSize = (await stat(sourcePath)).size;
  const outputSize = (await stat(outputPath)).size;

  totalInputBytes += inputSize;
  totalOutputBytes += outputSize;

  console.log(`${fileName} -> optimized/${outputName}: ${formatKb(inputSize)} -> ${formatKb(outputSize)}`);
}));

const savedBytes = totalInputBytes - totalOutputBytes;
const savedPercent = Math.round((savedBytes / totalInputBytes) * 1000) / 10;

console.log(`Total: ${formatKb(totalInputBytes)} -> ${formatKb(totalOutputBytes)} (${savedPercent}% smaller)`);