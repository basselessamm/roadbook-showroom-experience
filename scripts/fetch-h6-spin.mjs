import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const sourcePage = "https://gwmcaribbean.com/car-models/haval-h6-hev/";
const outputDirectory = "/home/ubuntu/webdev-static-assets/h6-hev-spin";

const pageResponse = await fetch(sourcePage);
if (!pageResponse.ok) throw new Error(`Unable to fetch source page: ${pageResponse.status}`);

const page = await pageResponse.text();
const match = page.match(/id="carModel-843-1"[\s\S]*?data-model-images="([\s\S]*?)"[\s\S]*?width="1024"/);
if (!match) throw new Error("Unable to find the H6 official rotation image list.");

const encodedList = match[1].replaceAll("&quot;", '"').replaceAll("&amp;", "&");
const imageUrls = JSON.parse(encodedList);
if (!Array.isArray(imageUrls) || imageUrls.length !== 6) {
  throw new Error(`Expected 6 official H6 frames, found ${Array.isArray(imageUrls) ? imageUrls.length : "no list"}.`);
}

await mkdir(outputDirectory, { recursive: true });
const manifest = [];
for (const [index, imageUrl] of imageUrls.entries()) {
  const imageResponse = await fetch(imageUrl);
  if (!imageResponse.ok) throw new Error(`Unable to fetch official H6 frame ${index + 1}: ${imageResponse.status}`);
  const filename = `haval-h6-hev-spin-${String(index + 1).padStart(2, "0")}.png`;
  await writeFile(join(outputDirectory, filename), Buffer.from(await imageResponse.arrayBuffer()));
  manifest.push({ index: index + 1, filename, source: imageUrl });
}

await writeFile(join(outputDirectory, "source-manifest.json"), JSON.stringify({ sourcePage, frames: manifest }, null, 2));
console.log(JSON.stringify({ outputDirectory, frames: manifest.length }, null, 2));
