TM – iPhone PWA (Forced Reload aller Modelldateien)
=====================================================
- Absoluter Modellpfad (GitHub Pages): https://momo385-max.github.io/tm-pwa/model/
- Forced Reload: model.json, metadata.json und alle *.bin werden vor dem Laden mit cache:'reload' vom Netz geholt.
- Service Worker:
  - Scope & URLs auf /tm-pwa/ festgenagelt
  - Network-first für /tm-pwa/model/ (verhindert stale Cache in iOS-PWA)
  - Stale-while-revalidate für restliche Assets
- Manifest: start_url & scope = /tm-pwa/

Verwendung:
1) Deine TM-Dateien in ./model/ legen (model.json, metadata.json, *.bin).
2) Alle Dateien ins Repo-Root von tm-pwa hochladen (ersetzt bestehende).
3) Seite neu laden; auf iPhone PWA neu installieren.
