# party-clip-deck
## Security notes

- The page is a static file: no server, no logins, no data collected. Clip lists are saved only in each viewer's own browser.
- A Content-Security-Policy (in `index.html`) allows scripts only from this page and YouTube, frames only from YouTube, and fonts only from Google Fonts.
- **After editing any inline `<script>` in `index.html`, run `python3 scripts/update_csp.py`**, or the browser will block the edited script.
