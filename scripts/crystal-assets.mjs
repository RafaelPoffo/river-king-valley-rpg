import { access, mkdir, writeFile } from "node:fs/promises";
import { PNG } from "pngjs";

const base = "https://raw.githubusercontent.com/pret/pokecrystal/master/";
const response = await fetch(`${base}constants/pokemon_constants.asm`);
if (!response.ok) throw new Error(`Pokemon constants: ${response.status}`);
const constants = await response.text();
const names = [...constants.matchAll(/^\s+const ([A-Z0-9_]+)\s*;/gm)].map((match) => match[1].toLowerCase()).slice(0, 251);
if (names.length !== 251) throw new Error(`Expected 251 species, got ${names.length}`);
await mkdir("public/assets/portraits", { recursive: true });
const queue = names.map((name, index) => ({ name, id: String(index + 1).padStart(4, "0") }));
const failures = [];
await Promise.all(Array.from({ length: 8 }, async () => {
  while (queue.length) {
    const { name, id } = queue.shift();
    try { await access(`public/assets/portraits/${id}.png`); continue; } catch {}
    const url = `${base}gfx/pokemon/${name === "unown" ? "unown_a" : name}/front.png`;
    let buffer;
    for (let attempt = 0; attempt < 3; attempt++) {
      const result = await fetch(url);
      buffer = Buffer.from(await result.arrayBuffer());
      if (result.ok && buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) break;
    }
    if (!buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
      const reference = buffer.toString().trim();
      if (!/^(\.\.\/)?[a-z_]+\/front\.png$/.test(reference)) { failures.push(`${id}:${name}: invalid PNG`); continue; }
      const referenced = await fetch(new URL(reference, url));
      if (!referenced.ok) { failures.push(`${id}:${name}:${referenced.status}`); continue; }
      buffer = Buffer.from(await referenced.arrayBuffer());
    }
    let end = 8;
    while (end + 12 <= buffer.length) {
      const length = buffer.readUInt32BE(end);
      const type = buffer.toString("ascii", end + 4, end + 8);
      end += length + 12;
      if (type === "IEND") break;
    }
    const image = await new Promise((resolve, reject) => new PNG().parse(buffer.subarray(0, end), (error, decoded) => error ? reject(error) : resolve(decoded)));
    const portrait = new PNG({ width: 56, height: 56 });
    const size = image.width;
    if (size > 56 || image.height < size) throw new Error(`Invalid frame for ${name}`);
    PNG.bitblt(image, portrait, 0, 0, size, size, Math.floor((56 - size) / 2), 56 - size);
    for (let offset = 0; offset < portrait.data.length; offset += 4) {
      if (portrait.data[offset] === 255 && portrait.data[offset + 1] === 255 && portrait.data[offset + 2] === 255) portrait.data[offset + 3] = 0;
    }
    await writeFile(`public/assets/portraits/${id}.png`, PNG.sync.write(portrait));
  }
}));
if (failures.length) throw new Error(failures.join("\n"));
const pokemonNames = Object.fromEntries(names.map((name,index) => [String(index + 1).padStart(4,"0"), name === "mr__mime" ? "Mr. Mime" : name === "farfetch_d" ? "Farfetch'd" : name === "ho_oh" ? "Ho-Oh" : name.split("_").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ")]));
await writeFile("src/game/data/pokemonNames.json", JSON.stringify(pokemonNames,null,2) + "\n");
console.log("251 front-facing Crystal portraits extracted.");