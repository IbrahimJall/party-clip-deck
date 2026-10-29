#!/usr/bin/env python3
"""Recompute the Content-Security-Policy script hashes in index.html.
Run after editing any inline <script> block:  python3 scripts/update_csp.py"""
import base64, hashlib, pathlib, re
p = pathlib.Path(__file__).resolve().parent.parent / "index.html"
h = p.read_text()
hashes = " ".join("'sha256-%s'" % base64.b64encode(hashlib.sha256(s.encode()).digest()).decode()
                  for s in re.findall(r"<script(?: type=\"module\")?>(.*?)</script>", h, re.S))
csp = ("default-src 'none'; "
       f"script-src {hashes} https://www.youtube.com https://s.ytimg.com https://www.gstatic.com https://apis.google.com; "
       "style-src 'unsafe-inline' https://fonts.googleapis.com; "
       "font-src https://fonts.gstatic.com; "
       "img-src data: https://i.ytimg.com; "
       "frame-src https://www.youtube.com https://www.youtube-nocookie.com https://*.firebaseapp.com https://accounts.google.com; "
       "connect-src https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firestore.googleapis.com https://apis.google.com; media-src 'none'; object-src 'none'; worker-src 'none'; "
       "base-uri 'none'; form-action 'none'")
tag = f'<meta http-equiv="Content-Security-Policy" content="{csp}">'
h, n = re.subn(r'<meta http-equiv="Content-Security-Policy" content="[^"]*">', tag, h)
if not n:
    h = h.replace('<meta charset="utf-8">', '<meta charset="utf-8">\n' + tag, 1)
p.write_text(h)
print("CSP updated with", hashes.count("sha256"), "script hashes")
