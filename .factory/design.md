# Kitchen Table — visual thesis

## Direction: the last light at the kitchen table

Kitchen Table uses **cinematic environmental art** to make a browser room feel
like the familiar pause before a family game begins: a worn oak table at blue
hour, an amber pendant lamp, rain-soft windows, and simple wooden pieces waiting
for hands just outside frame. The interface is not an app-store arcade. It is a
quiet household place. Decoration appears mainly at the threshold; once play
starts, the board and turn state become the scene.

The treatment is deliberately single-mode and dark, as an evening table gives
the game pieces stronger figure/ground separation and avoids pretending that the
cinematic world is a generic theme switch.

## Tokens

- **Night (`#101715`)** — page background, taken from a rain-dark window.
- **Pine (`#18231f`)** and **felt (`#21332b`)** — raised and playable surfaces.
- **Parchment (`#f5ecd8`)** — primary text and pale game-board marks.
- **Steam (`#b9c8bd`)** — secondary text (minimum 4.5:1 on surfaces).
- **Honey (`#f2b84b`)** — the pendant-lamp glow and primary action; dark ink
  (`#172019`) is its contrast color.
- **Cranberry (`#e06b62`)**, **blue crockery (`#62a8c4`)**, and **sage
  (`#83b878`)** — player pieces. Every player is also identified by name,
  pattern/shape, or ordinal; color never carries state alone.
- **Success (`#78c99a`)**, **warning (`#f2b84b`)**, **danger (`#ef847c`)**.

Spacing follows an 8 px base rhythm with 4 px optical adjustments. Content is
limited to 1120 px; reading copy to 64 characters. Phone layouts prioritize the
active board, current turn, and one primary move. Rules and room details fold
below play rather than compressing the board.

## Type

- **Fraunces**, self-hosted variable serif, is used only for the wordmark,
  screen title, and game names. Its soft, irregular forms feel printed on an
  old game box without borrowing any protected trade dress.
- **Atkinson Hyperlegible**, self-hosted regular and bold, is used for controls,
  rules, scores, and status. Its distinct letterforms suit children, tired
  adults, and small phone screens. Body text never drops below 16 px.
- Tabular numerals are enabled for codes, dice, scores, and turn counts.

## Interaction grammar

Buttons press into the table by 1 px. Selectable pieces and edges receive a
honey rim and a plain-language label. A turn change warms the status lamp; a
completed box or score row settles in place. The room code is treated like a
physical card: large, selectable, and paired with “Copy room link.” Feedback is
immediate and announced through a polite live region.

Motion runs 160–240 ms using transform and opacity only. Dice may make one short
settling movement after a roll; screens cross-fade rather than slide. Under
`prefers-reduced-motion: reduce`, movement is removed and state changes are
instant. Nothing loops, flashes, or autoplays.

## Original asset plan and provenance

Hero asset: a wide, painterly cinematic kitchen at dusk with an oak table,
three abstract public-domain-game arrangements, wooden tokens, paper score pad,
and phones resting face-up. It establishes “link, not app; family, not
strangers” without showing a fake UI or identifiable people. The crop leaves a
dark left-side field for copy. The final is exported as responsive AVIF/WebP,
with an explicit PNG source retained under `assets/src/`.

Prompt sheet:

> Use case: stylized-concept. Asset type: responsive landing-page hero.
> Scene: a warmly lived-in family kitchen at blue hour, rain-soft window in the
> distance, one amber pendant lamp over a worn oak table. Subject: handmade
> wooden race pawns, a small dots-and-boxes paper grid, five ivory dice and two
> ordinary unbranded phones lying face-up around the table; no people, only the
> suggestion they have just stepped away. Style: cinematic environmental
> painting with natural materials, subtle film grain, believable household
> details, restrained storybook realism. Composition: 3:2 landscape, table and
> pieces in the lower-right two-thirds, calm dark negative space at upper-left
> for web copy, 35 mm lens, eye-level seated view. Light: honey amber practical
> light against deep pine and rain-blue shadows. Palette: night green, pine,
> parchment, honey, cranberry, blue crockery, sage. No visible game branding,
> no proprietary boards, no readable text, no logos, no watermark, no neon,
> no casino cues, no UI screenshot, no distorted dice, no extra fingers or
> people.

Generated with the factory image deployment (Azure OpenAI image generation) on
2026-08-27. Original for this product; no third-party or copyrighted source
material was supplied. Generated imagery is disclosed in the site footer.
