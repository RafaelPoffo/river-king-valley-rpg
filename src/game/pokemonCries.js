const CRIES = {
  "0025": "pikachu pika",
  "0054": "slow slowpoke",
  "0079": "slow slowpoke",
  "0052": "meow meowth",
  "0016": "pidgey pidge",
  "0019": "ratarata",
  "0039": "jigglypuff puu",
  "0043": "oddish odd",
  "0060": "poli poli",
  "0069": "bellsprout",
  "0074": "geodude geo",
  "0081": "magnemite bzzt",
  "0092": "gastly gaa",
  "0096": "drowzee zzz",
  "0100": "voltorb tic",
  "0104": "cubone cub",
  "0113": "chansey chan",
  "0116": "horsea hoo",
  "0118": "goldeen gol",
  "0129": "magikarp splash",
  "0133": "eevee eevee",
  "0147": "dratini draa",
};

const GRUNTS = ["grrrh", "grooar", "hrrnn", "grawr"];

export function pokemonCry(name, dexId, rarity = 1) {
  const key = String(dexId || "").padStart(4, "0");
  if (CRIES[key]) return `${name}: ${CRIES[key]}!`;
  if (rarity >= 5 || Number(dexId) >= 140) {
    return `${name}: ${GRUNTS[Number(dexId || 0) % GRUNTS.length]}...`;
  }
  const short = String(name || "pokémon").split(" ")[0].toLowerCase();
  return `${name}: ${short} ${short.slice(0, 4)}!`;
}
