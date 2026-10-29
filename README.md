# party-clip-deck
## Security notes

- The page is a static file: no server, no logins, no data collected. Clip lists are saved only in each viewer's own browser.
- A Content-Security-Policy (in `index.html`) allows scripts only from this page and YouTube, frames only from YouTube, and fonts only from Google Fonts.
- **After editing any inline `<script>` in `index.html`, run `python3 scripts/update_csp.py`**, or the browser will block the edited script.

## Features

- **Edit clips:** name each clip, drag the grip (or use arrow keys on it) to reorder, and keep private notes per clip. Notes are never shown on the party screen.
- **Video-matched colours:** the background fades to the dominant colours of the playing video, taken from YouTube's published frames (thumbnail and frames ~1/4, 1/2, 3/4 through), adjusted so text stays readable. Turn off with "Match video colours".
