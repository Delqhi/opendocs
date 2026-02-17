#!/usr/bin/env node

import sharp from 'sharp';
import { encode } from 'blurhash';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ASSETS_DIR = path.join(__dirname, '../src/assets');
const PUBLIC_DIR = path.join(__dirname, '../public');
const OUTPUT_DIR = path.join(__dirname, '../src/assets/optimized');

const SIZES = [320, 480, 640, 800, 1024, 1200, 1600];
const QUALITY = 80;

async function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function generateBlurHash(imageBuffer) {
  try {
    const { data, info } = await sharp(imageBuffer)
      .resize(32, 32, { fit: 'inside' })
      .raw()
      .toBuffer({ resolveWithObject: true });

    return encode(new Uint8ClampedArray(data), info.width, info.height, 4, 3);
  } catch (error) {
    console.error('Error generating blurhash:', error.message);
    return null;
  }
}

async function processImage(inputPath, outputDir) {
  const filename = path.basename(inputPath, path.extname(inputPath));
  const results = {
    original: inputPath,
    webp: [],
    avif: [],
    blurhash: null,
  };

  await ensureDir(outputDir);

  const imageBuffer = fs.readFileSync(inputPath);
  
  results.blurhash = await generateBlurHash(imageBuffer);

  for (const size of SIZES) {
    const webpPath = path.join(outputDir, `${filename}-${size}.webp`);
    const avifPath = path.join(outputDir, `${filename}-${size}.avif`);
    const jpgPath = path.join(outputDir, `${filename}-${size}.jpg`);

    await sharp(inputPath)
      .resize(size, null, {
        withoutEnlargement: true,
        fit: 'inside',
      })
      .webp({ quality: QUALITY })
      .toFile(webpPath);
    results.webp.push({ size, path: webpPath });

    await sharp(inputPath)
      .resize(size, null, {
        withoutEnlargement: true,
        fit: 'inside',
      })
      .avif({ quality: QUALITY })
      .toFile(avifPath);
    results.avif.push({ size, path: avifPath });

    await sharp(inputPath)
      .resize(size, null, {
        withoutEnlargement: true,
        fit: 'inside',
      })
      .jpeg({ quality: QUALITY })
      .toFile(jpgPath);
  }

  return results;
}

async function findImages(dir, extensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif']) {
  const images = [];
  
  function walk(directory) {
    const files = fs.readdirSync(directory);
    
    for (const file of files) {
      const fullPath = path.join(directory, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !file.startsWith('.')) {
        walk(fullPath);
      } else if (stat.isFile()) {
        const ext = path.extname(file).toLowerCase();
        if (extensions.includes(ext)) {
          images.push(fullPath);
        }
      }
    }
  }
  
  if (fs.existsSync(dir)) {
    walk(dir);
  }
  
  return images;
}

async function generateManifest(images, outputDir) {
  const manifest = {};
  
  for (const imagePath of images) {
    const relativePath = path.relative(ASSETS_DIR, imagePath);
    const filename = path.basename(imagePath, path.extname(imagePath));
    
    manifest[relativePath] = {
      original: imagePath,
      variants: {
        webp: SIZES.map(size => `/assets/optimized/${filename}-${size}.webp`),
        avif: SIZES.map(size => `/assets/optimized/${filename}-${size}.avif`),
        jpg: SIZES.map(size => `/assets/optimized/${filename}-${size}.jpg`),
      },
    };
  }
  
  const manifestPath = path.join(outputDir, 'image-manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  
  return manifest;
}

async function main() {
  console.log('🖼️  Image Optimization Pipeline Starting...\n');
  
  ensureDir(OUTPUT_DIR);
  
  const srcImages = await findImages(ASSETS_DIR);
  const publicImages = await findImages(PUBLIC_DIR);
  const allImages = [...srcImages, ...publicImages];
  
  console.log(`Found ${allImages.length} images to optimize\n`);
  
  const results = [];
  
  for (const imagePath of allImages) {
    const relativePath = path.relative(process.cwd(), imagePath);
    console.log(`Processing: ${relativePath}`);
    
    try {
      const result = await processImage(imagePath, OUTPUT_DIR);
      results.push(result);
      console.log(`  ✓ Generated ${SIZES.length} variants + blurhash\n`);
    } catch (error) {
      console.error(`  ✗ Error processing ${relativePath}: ${error.message}\n`);
    }
  }
  
  const manifest = await generateManifest(allImages, OUTPUT_DIR);
  
  console.log('\n✅ Image Optimization Complete!');
  console.log(`   - Processed: ${results.length} images`);
  console.log(`   - Output directory: ${OUTPUT_DIR}`);
  console.log(`   - Manifest: ${path.join(OUTPUT_DIR, 'image-manifest.json')}`);
}

main().catch(console.error);
