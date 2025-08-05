TM – iPhone-optimierte PWA
============================
- iOS-taugliche Kamera (User-Geste, playsInline, muted Autoplay, facingMode: environment).
- Bild-Upload (accept='image/*' capture='environment').
- PWA-Setup (Manifest, Service Worker, iOS-Icons).
- Offline nach erstem Online-Start (Caching).

Verwendung:
1) TM-Modell als TensorFlow.js exportieren.
2) Dateien in `./model` legen: `model.json`, `metadata.json`, alle `*.bin`.
3) Zum Test am PC: `python -m http.server 8000` → `http://localhost:8000/`.
4) Für iPhone-Kamera & PWA: Projekt auf **HTTPS** hosten (z. B. Netlify, GitHub Pages).
5) In Safari öffnen → **Teilen → Zum Home-Bildschirm**. Beim ersten Start online öffnen.
