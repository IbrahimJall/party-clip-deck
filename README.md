# party-clip-deck
## Security notes

- The page is a static file: no server, no logins, no data collected. Clip lists are saved only in each viewer's own browser.
- A Content-Security-Policy (in `index.html`) allows scripts only from this page and YouTube, frames only from YouTube, and fonts only from Google Fonts.
- **After editing any inline `<script>` in `index.html`, run `python3 scripts/update_csp.py`**, or the browser will block the edited script.

## Features

- **Edit clips:** name each clip, drag the grip (or use arrow keys on it) to reorder, and keep private notes per clip. Notes are never shown on the party screen.
- **Video-matched colours:** the background fades to the dominant colours of the playing video, taken from YouTube's published frames (thumbnail and frames ~1/4, 1/2, 3/4 through), adjusted so text stays readable. Turn off with "Match video colours".
- **BPM:** "Measure BPM" (desktop Chrome/Edge) listens to this tab's audio after you share it, and measures each clip's tempo over ~10 s near its start and its end. "Tap BPM" (or the T key) works on any device. BPMs can also be typed in the editor; ½ and ×2 fix half/double-speed readings. Automatic readings never overwrite numbers you typed or tapped.
- Tempo detector: 4-band onset envelope (`bpm-worklet.js`) + autocorrelation with a 2-beat comb and a tempo prior centred at 115 BPM (σ = 0.6 octave). On synthetic test loops it was exact (±1.5 BPM) for typical 70–130 BPM music; fast tracks (>150) can read at half speed.
