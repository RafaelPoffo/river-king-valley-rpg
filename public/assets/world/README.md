# World Creature Sprites

Walking sheets were downloaded unchanged from the [PMD SpriteCollab repository](https://github.com/PMDCollab/SpriteCollab/tree/master/sprite). They depict common Pokemon from generations 1 and 2 in the Mystery Dungeon style.

Each `NNNN-walk.png` comes from `sprite/NNNN/Walk-Anim.png`. Its matching `NNNN-credits.txt` is the original contributor history from that folder. Contributor names and contact details are listed in the upstream [credit_names.txt](https://github.com/PMDCollab/SpriteCollab/blob/master/credit_names.txt).

The [SpriteCollab submission and use policy](https://github.com/PMDCollab/SpriteCollab#submission-and-use-policy) requires appropriate attribution and non-commercial use of community submissions under CC BY-NC 4.0. Official game artwork retains its original ownership; the community policy does not grant additional rights to official artwork. Verify the relevant asset rights before commercial distribution.

Frame sizes and frame counts were read from each species' `AnimData.xml` and recorded in `src/game/data/worldCreatures.js`. Direction rows are down, down-left, left, up-left, up, up-right, right, and down-right.