# Terra

The third game in the trilogy with Sea of Thought (sea) and The Void (space). You shape a chunky pixel world and launch it into a shared solar system with everyone else.

Play it at [https://landrcy.github.io/terra/](https://landrcy.github.io/terra/).

## Shared store (for going live)

Same pattern as Sea of Thought: one JSON blob on [textdb.dev](https://textdb.dev).

- **Production (default):** `https://textdb.dev/api/data/terra-site-9d2b6e17c4a8`
- **Preview / tests:** `https://textdb.dev/api/data/terra-preview-test-c8e41f2a`  
  Open the page with `?store=test` or `?preview=1` so tries do not pollute the shared solar system. `?local=1` forces localStorage only.

Merge-on-write, numbering from #1, localStorage fallback if the network is down.

Buildings on your own planets, and gifts/flags/signs/footprints left on others, are stored on the same planet records. Gifts are capped (3 per visitor per planet, 48 per planet).

## Music

Real audio, not generated: "Sunset Walk" by KiluaBoy (CC0), via OpenGameArt. Played with a normal `<audio>` element. See `assets/music/CREDITS.txt`. Sound effects are Kenney CC0 files; see `assets/sfx/CREDITS.txt`.
