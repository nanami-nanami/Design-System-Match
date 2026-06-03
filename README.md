# Figma Component Name Match

A one-minute memory game for the UX team design system. Match mini component previews with their exact Figma component names from `Design System Memory Game.fig`.

## How to play

1. Open `index.html` in a browser, or run a local server:
   ```bash
   python3 -m http.server 8765
   ```
   Then visit [http://localhost:8765](http://localhost:8765).
2. Enter your name and start the round.
3. Flip two cards each turn. Match the preview card with the Figma name card.
4. When the minute ends (or all pairs are matched), see your score and the ranking.

## Scoring

- **Matched pairs** — how many of the 10 pairs you cleared.
- **Moves** — how many two-card turns you took.
- **Ranking** — stored in your browser (`localStorage`), sorted by most pairs matched, then completion, time left, and fewest moves.

## Files

| File | Purpose |
|------|---------|
| `index.html` | Screens: start, game, results |
| `app.js` | Game logic and component data |
| `styles.css` | Layout and mini previews |
| `Design System Memory Game.fig` | Source design system file |

Language: British English (`en-GB`).
