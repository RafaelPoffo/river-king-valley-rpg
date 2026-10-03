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

export const CHARACTER_SPRITES = {
  player: character(0),
  veteran: character(20),
  carpenter: character(24),
  anna: character(29),
  old_joe: character(32),
};

export const POKEMON_SPRITES = {
  "0001": pokemon(7, 0),
  "0004": pokemon(7, 2),
  "0007": pokemon(7, 4),
  "0010": pokemon(7, 6),
  "0013": pokemon(7, 8),
  "0012": pokemon(8, 2),
  "0015": pokemon(8, 4),
  "0019": pokemon(8, 6),
  "0023": pokemon(8, 0),
  "0025": pokemon(9, 2),
  "0035": pokemon(8, 8),
  "0039": pokemon(9, 0),
  "0044": pokemon(9, 4),
  "0046": pokemon(9, 6),
  "0050": pokemon(9, 8),
  "0079": pokemon(10, 0),
  "0122": pokemon(10, 2),
  "0086": pokemon(10, 4),
  "0129": pokemon(10, 6),
  "0131": pokemon(10, 8),
  "0072": pokemon(11, 0),
  "0066": pokemon(11, 2),
  "0100": pokemon(11, 4),
  "0120": pokemon(11, 6),
  "0090": pokemon(11, 8),
  "0140": pokemon(12, 0),
  "0058": pokemon(12, 2),
  "0075": pokemon(12, 4),
  "0092": pokemon(12, 6),
  "0147": pokemon(12, 8),
  "0143": pokemon(13, 0),
  "0216": pokemon(13, 2),
  "0212": pokemon(13, 4),
  "0116": pokemon(13, 6),
  "0201": pokemon(13, 8),
};

export function atlasFrame(sprite, direction = "down", moving = false, step = 0) {
  const frames = sprite.directions[direction] || sprite.directions.down;
  const idle = frames.length === 3 ? 1 : 0;
  const sequence = frames.length === 3 ? [1, 0, 1, 2] : frames.map((_, index) => index);
  const index = moving ? sequence[step % sequence.length] : idle;
  return { x: frames[index] * FRAME_STRIDE, y: sprite.y, width: FRAME_SIZE, height: FRAME_SIZE };
}

export function clearFrameBackground(pixels) {
  const result = new Uint8ClampedArray(pixels);
  const visited = new Set();
  const corners = [0, 15, 240, 255];
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
      const column = position % FRAME_SIZE;
      const row = Math.floor(position / FRAME_SIZE);
      if (column > 0) queue.push(position - 1);
      if (column < FRAME_SIZE - 1) queue.push(position + 1);
      if (row > 0) queue.push(position - FRAME_SIZE);
      if (row < FRAME_SIZE - 1) queue.push(position + FRAME_SIZE);
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
      for (const sprite of [...Object.values(CHARACTER_SPRITES), ...Object.values(POKEMON_SPRITES)]) {
        for (const column of new Set(Object.values(sprite.directions).flat())) {
          const x = column * FRAME_STRIDE;
          const key = `${x}:${sprite.y}`;
          if (cells.has(key)) continue;
          cells.add(key);
          const frame = context.getImageData(x, sprite.y, FRAME_SIZE, FRAME_SIZE);
          frame.data.set(clearFrameBackground(frame.data));
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