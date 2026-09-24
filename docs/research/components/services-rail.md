# Services rail (fifth section) — design note

**Reference looked at:** the video section of the project reference (2026-09-19): two large cards, one black and one white, floating on an ambient video; a small uppercase label top-left, a large centred phrase, an underlined "Watch" link at the bottom centre.

**What was taken:** only the mood — solid panels floating over slow ambient footage, restrained uppercase micro-type, one accent link per card, no imagery inside the cards.

**What is deliberately different (the user asked for many cards, a different layout, and no copy):**

| | Reference | Ours |
|---|---|---|
| Count / layout | Two static cards side by side | Eight cards on a horizontal rail that travels with the scroll while the stage is pinned |
| Proportions | Wide (~480x600), aligned | Tall portrait (320x440), every second card dropped 32px so the row has a rhythm |
| Materials | Black and white only | Black, glass (blurred video showing through) and white, cycling |
| Composition | Label top-left, phrase centred, link bottom centre | Index number and category on the top row, title left-aligned in the display face, description, a dashed rule, then a gold link with an arrow |
| Link | Underlined brown "Watch" | Gold "Learn more" with an arrow that slides on hover, no underline |
| Header / chrome | None | Eyebrow + word-by-word revealed heading, a gold progress line and a "01 / 08" counter |
| Motion | None | Once the section is fully on screen the video plays alone for three seconds (easing from 1.08x to 1x); then the header reveals and the cards are dealt the way the site deals cards elsewhere: from beyond the right edge, edge-on under a 1200px perspective, swinging round to face front as each lands, 140ms apart; then the rail follows the scroll after a short hold |

Colours are the site's own tokens (gold accent, ink on white). Type is the site's display and Inter faces.
