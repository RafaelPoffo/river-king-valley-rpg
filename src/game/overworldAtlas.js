export const FRAME_SIZE = 16;
export const FRAME_STRIDE = 17;
export const ATLAS_URL = "/assets/sprites.png";

const character = (row) => ({
  y: row * FRAME_STRIDE,
  directions: { down: [0, 1, 2], up: [3, 4, 5], left: [6, 7], right: [8, 9] },
});
const pokemon = (row, column) => ({
  y: 1300 + row * FRAME_STRIDE,
  directions: { down: [column, column + 1] },
});
// 32x32 still frames on atlas row 14, two strides wide each.
const largePokemon = (column) => ({
  y: 1300 + 14 * FRAME_STRIDE,
  size: 32,
  directions: { down: [column] },
});

export const CHARACTER_SPRITES = {
  player: character(0),
  veteran: character(20),
  carpenter: character(24),
  anna: character(38),
  old_joe: character(32),
  bird_guide: character(16),
  bug_guide: character(3),
  garden_guide: character(29),
  fishing_guide: character(28),
  river_fisher: character(8),
  card_seller: character(40),
  traveler_f: character(29),
  traveler_m: character(35),
  visitor_f: character(28),
  visitor_m: character(22),
  ...Object.fromEntries(["agua", "fogo", "planta", "eletrico", "psiquico", "lutador", "inseto", "fantasma", "dragao", "voador", "pedra", "normal", "lendas_gelo", "lendas_fogo", "lendas_raio", "lendas_mistico"].map((id, index) => [`card_${id}`, character([28, 46, 29, 1, 22, 35, 5, 43, 38, 16, 24, 40, 29, 46, 1, 43][index])])),
  joe_bug: character(20),
  rival_0: character(29),
  rival_1: character(3),
  rival_2: character(24),
  rival_3: character(8),
  rival_4: character(16),
  rival_5: character(28),
  rival_6: character(22),
};

export const POKEMON_SPRITES = {
  "0001": pokemon(7, 0),
  "0004": pokemon(7, 2),
  "0007": pokemon(7, 4),
  "0010": pokemon(7, 6),
  "0011": pokemon(7, 6),
  "0013": pokemon(7, 8),
  "0014": pokemon(7, 8),
  "0012": pokemon(8, 2),
  "0015": pokemon(8, 4),
  "0046": pokemon(8, 4),
  "0047": pokemon(8, 4),
  "0048": pokemon(8, 2),
  "0049": pokemon(8, 2),
  "0123": pokemon(13, 4),
  "0127": pokemon(13, 4),
  "0165": pokemon(8, 4),
  "0166": pokemon(8, 4),
  "0167": pokemon(8, 4),
  "0168": pokemon(8, 4),
  "0193": pokemon(8, 2),
  "0204": pokemon(7, 8),
  "0205": pokemon(7, 8),
  "0213": pokemon(7, 6),
  "0214": pokemon(13, 4),
  "0016": pokemon(0, 0),
  "0017": pokemon(0, 0),
  "0018": pokemon(0, 0),
  "0021": pokemon(0, 0),
  "0022": pokemon(0, 0),
  "0083": pokemon(3, 6),
  "0084": pokemon(3, 6),
  "0085": pokemon(3, 6),
  "0144": pokemon(0, 0),
  "0145": pokemon(0, 0),
  "0146": pokemon(0, 0),
  "0163": pokemon(0, 0),
  "0164": pokemon(0, 0),
  "0198": pokemon(0, 0),
  "0225": pokemon(3, 6),
  "0227": pokemon(0, 0),
  "0249": pokemon(0, 0),
  "0019": pokemon(8, 6),
  "0023": pokemon(8, 0),
  "0025": pokemon(8, 8),
  "0035": pokemon(9, 2),
  "0039": pokemon(9, 0),
  "0041": pokemon(9, 6),
  "0044": pokemon(9, 4),
  "0050": pokemon(9, 8),
  "0079": pokemon(10, 0),
  "0120": pokemon(10, 2),
  "0129": pokemon(10, 4),
  "0072": pokemon(11, 0),
  "0066": pokemon(11, 2),
  "0092": pokemon(11, 6),
  "0100": pokemon(11, 8),
  "0140": pokemon(12, 0),
  "0058": pokemon(12, 2),
  "0075": pokemon(12, 4),
  "0147": pokemon(12, 8),
  "0216": pokemon(13, 2),
  "0212": pokemon(13, 4),
  "0201": pokemon(13, 8),
  "0131": largePokemon(0),
  "0095": largePokemon(2),
  "0143": largePokemon(4),
};

const GENERIC_INSECT_SPRITES = [
  POKEMON_SPRITES["0013"],
  pokemon(8, 0),
  POKEMON_SPRITES["0012"],
  POKEMON_SPRITES["0015"],
];

export function insectSpriteFor(seed, dexId, overworld = false) {
  if (!overworld && dexId && POKEMON_SPRITES[dexId]) return POKEMON_SPRITES[dexId];
  let hash = 2166136261;
  for (const character of String(seed ?? "")) {
    hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  }
  return GENERIC_INSECT_SPRITES[(hash >>> 0) % GENERIC_INSECT_SPRITES.length];
}

export function worldSizeFor(dexId) {
  return POKEMON_SPRITES[dexId]?.size === 32 ? 2 : 1;
}

export function atlasFrame(sprite, direction = "down", moving = false, step = 0) {
  const frames = sprite.directions[direction] || sprite.directions.down;
  const idle = frames.length === 3 ? 1 : 0;
  const sequence = frames.length === 3 ? [1, 0, 1, 2] : frames.map((_, index) => index);
  const index = moving ? sequence[step % sequence.length] : idle;
  const size = sprite.size || FRAME_SIZE;
  return { x: frames[index] * FRAME_STRIDE, y: sprite.y, width: size, height: size };
}

export function clearFrameBackground(pixels, size = FRAME_SIZE) {
  const result = new Uint8ClampedArray(pixels);
  const visited = new Set();
  const corners = [0, size - 1, size * (size - 1), size * size - 1];
  for (const corner of corners) {
    const color = Array.from(pixels.slice(corner * 4, corner * 4 + 3));
    const queue = [corner];
    while (queue.length) {
      const position = queue.pop();
      if (visited.has(position)) continue;
      const offset = position * 4;
      if (!color.every((value, channel) => pixels[offset + channel] === value)) continue;
      visited.add(position);
      result[offset + 3] = 0;
      const column = position % size;
      const row = Math.floor(position / size);
      if (column > 0) queue.push(position - 1);
      if (column < size - 1) queue.push(position + 1);
      if (row > 0) queue.push(position - size);
      if (row < size - 1) queue.push(position + size);
    }
  }
  return result;
}

let atlasPromise;
export function loadOverworldAtlas() {
  if (!atlasPromise) {
    atlasPromise = (async () => {
      const image = new Image();
      image.src = ATLAS_URL;
      await image.decode();
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext("2d");
      context.drawImage(image, 0, 0);
      const cells = new Set();
      for (const sprite of [...Object.values(CHARACTER_SPRITES), ...Object.values(POKEMON_SPRITES), ...GENERIC_INSECT_SPRITES]) {
        for (const column of new Set(Object.values(sprite.directions).flat())) {
          const x = column * FRAME_STRIDE;
          const key = `${x}:${sprite.y}`;
          if (cells.has(key)) continue;
          cells.add(key);
          const size = sprite.size || FRAME_SIZE;
          const frame = context.getImageData(x, sprite.y, size, size);
          frame.data.set(clearFrameBackground(frame.data, size));
          context.putImageData(frame, x, sprite.y);
        }
      }
      return canvas.toDataURL();
    })().catch((error) => {
      atlasPromise = undefined;
      throw error;
    });
  }
  return atlasPromise;
}