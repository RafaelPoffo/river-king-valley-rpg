export { POKEMON_SPRITES as WORLD_SPRITES } from "../overworldAtlas.js";
import { worldSizeFor } from "../overworldAtlas.js";

const visitor = (id, name, dexId) => ({ id, name, dexId, worldSize: worldSizeFor(dexId) });

export const LAND_VISITORS = [
  visitor("bulbasaur", "Bulbasaur", "0001"),
  visitor("charmander", "Charmander", "0004"),
  visitor("caterpie", "Caterpie", "0010"),
  visitor("weedle", "Weedle", "0013"),
  visitor("butterfree", "Butterfree", "0012"),
  visitor("beedrill", "Beedrill", "0015"),
  visitor("rattata", "Rattata", "0019"),
  visitor("ekans", "Ekans", "0023"),
  visitor("pikachu", "Pikachu", "0025"),
  visitor("clefairy", "Clefairy", "0035"),
  visitor("jigglypuff", "Jigglypuff", "0039"),
  visitor("zubat", "Zubat", "0041"),
  visitor("gloom", "Gloom", "0044"),
  visitor("diglett", "Diglett", "0050"),
  visitor("growlithe", "Growlithe", "0058"),
  visitor("machop", "Machop", "0066"),
  visitor("graveler", "Graveler", "0075"),
  visitor("gastly", "Gastly", "0092"),
  visitor("onix", "Onix", "0095"),
  visitor("voltorb", "Voltorb", "0100"),
  visitor("snorlax", "Snorlax", "0143"),
  visitor("unown", "Unown", "0201"),
  visitor("scizor", "Scizor", "0212"),
  visitor("teddiursa", "Teddiursa", "0216"),
];
