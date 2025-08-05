TM – iPhone PWA (Lazy Loading)
===================================
- Lädt TFJS & TM **erst bei Bedarf** (verhindert White-Screen, wenn Modell fehlt).
- Modell wird erst beim Klick auf „Kamera starten“ oder „Bild auswählen“ geladen.
- Robuste Diagnosehinweise bei Ladefehlern.
- PWA/Offline via Service Worker (Cache v3).

Verwendung:
1) TM-Export (TensorFlow.js) in `./model/` legen.
2) Auf GitHub Pages/Netlify deployen (HTTPS).
3) iPhone Safari → öffnen → Kamera erlauben → „Zum Home-Bildschirm“.
