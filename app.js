// PWA with forced reload of all model assets
let model, maxPredictions;
let stream, video, anim;
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const statusEl = document.getElementById('status');
const diagEl = document.getElementById('diag');
const resultsEl = document.getElementById('results');
const btnStart = document.getElementById('btn-start');
const btnStop = document.getElementById('btn-stop');
const btnShot = document.getElementById('btn-shot');
const autoChk = document.getElementById('auto');
const fileInput = document.getElementById('file');
const btnFile = document.getElementById('btn-file');

const MODEL_URL = 'https://momo385-max.github.io/tm-pwa/model/'; // absolute URL for GitHub Pages subpath

async function forceReloadModelAssets() {
  // Always fetch model.json & metadata.json fresh from network
  const urlsToFetch = [MODEL_URL + 'model.json', MODEL_URL + 'metadata.json'];
  try {
    const modelResp = await fetch(MODEL_URL + 'model.json', { cache: 'reload' });
    if (!modelResp.ok) throw new Error('model.json network error ' + modelResp.status);
    const modelJson = await modelResp.clone().json();

    // Try to find weight shard paths in TFJS manifest
    if (modelJson && modelJson.weightsManifest) {
      for (const group of modelJson.weightsManifest) {
        for (const path of group.paths) {
          urlsToFetch.push(MODEL_URL + path);
        }
      }
    }
  } catch (e) {
    diagEl.innerHTML = '<span class="error">Konnte model.json nicht frisch laden: ' + (e && e.message ? e.message : e) + '</span>';
    throw e;
  }

  // Fetch all URLs with cache: 'reload' to bypass any stale cache
  for (const u of urlsToFetch) {
    try {
      const r = await fetch(u, { cache: 'reload' });
      if (!r.ok) throw new Error('HTTP ' + r.status + ' for ' + u);
    } catch (e) {
      diagEl.innerHTML = '<span class="error">Fehler beim Forced-Reload: ' + u + '</span>';
      throw e;
    }
  }
}

async function loadLibs() {
  try { await ensureLibs(); }
  catch (e) {
    diagEl.innerHTML = '<span class="error">Fehler: TFJS/TM Libraries nicht geladen.</span>'; 
    throw e;
  }
}

async function loadModel() {
  if (model) return;
  await loadLibs();

  // Force fresh network fetch for model assets before load
  statusEl.textContent = 'Prüfe & lade Modelldateien (netzwerk-frisch)...';
  await forceReloadModelAssets();

  statusEl.textContent = 'Lade Modell...';
  async function loadModel() {
  if (model) return;
  await loadLibs();

  // 1) Erst alle Assets frisch laden (du hast das schon drin)
  statusEl.textContent = 'Prüfe & lade Modelldateien (netzwerk-frisch)...';
  await forceReloadModelAssets();

  // 2) Cache-Buster an die URLs hängen, damit tmImage.load nicht aus altem Cache liest
  const v = Date.now(); // oder eine feste Build-Nummer
  statusEl.textContent = 'Lade Modell...';
  const modelURL = MODEL_URL + 'model.json?v=' + v;
  const metadataURL = MODEL_URL + 'metadata.json?v=' + v;

  try {
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();
    statusEl.innerHTML = '<span class="ok">Modell geladen.</span>';
  } catch (e) {
    console.error(e);
    diagEl.innerHTML = '<span class="error">Fehler beim initialen Laden des Modells: ' + (e && e.message ? e.message : '') + '</span>';
    throw e;
  }
}


// Start camera (iOS-friendly)
async function startCamera() {
  await stopAll(); // reset state
  try { await loadModel(); } catch { return; }
  const constraints = { video: { facingMode: { ideal: 'environment' } }, audio: false };
  try {
    stream = await navigator.mediaDevices.getUserMedia(constraints);
    video = document.createElement('video');
    video.autoplay = true;
    video.playsInline = true;
    video.muted = true;
    video.srcObject = stream;
    await video.play();

    const vw = video.videoWidth || 640;
    const vh = video.videoHeight || 480;
    const scale = Math.min(640 / vw, 480 / vh, 1);
    canvas.width = Math.round(vw * scale);
    canvas.height = Math.round(vh * scale);

    function draw() {
      const w = canvas.width, h = canvas.height;
      ctx.drawImage(video, 0, 0, w, h);
      if (autoChk.checked) predict();
      anim = requestAnimationFrame(draw);
    }
    draw();
    btnStop.disabled = false;
    btnShot.disabled = false;
    statusEl.textContent = 'Kamera aktiv. Live-Prediction läuft.';
    diagEl.textContent = '';
  } catch (e) {
    console.error(e);
    statusEl.textContent = 'Kamera konnte nicht gestartet werden.';
    diagEl.innerHTML = '<span class="error">iOS benötigt HTTPS & Kamerafreigabe. Prüfe: Safari → aA → Website-Einstellungen → Kamera: Erlauben.</span>';
  }
}

async function predict() {
  if (!model) return;
  try {
    const prediction = await model.predict(canvas);
    prediction.sort((a,b)=>b.probability - a.probability);
    resultsEl.innerHTML = prediction.map(p => `${p.className}: <strong>${(p.probability*100).toFixed(1)}%</strong>`).join('<br>');
  } catch (e) {
    console.error(e);
    diagEl.innerHTML = '<span class="error">Prediction fehlgeschlagen.</span>';
  }
}

async function stopAll() {
  cancelAnimationFrame(anim);
  if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null; }
  btnStop.disabled = true;
  btnShot.disabled = true;
}

btnStart.addEventListener('click', startCamera);
btnStop.addEventListener('click', stopAll);
btnShot.addEventListener('click', predict);

// Upload flow
btnFile.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try { await loadModel(); } catch { return; }
  await stopAll();
  const img = new Image();
  img.onload = async () => {
    const maxW = 640, maxH = 480;
    let w = img.naturalWidth, h = img.naturalHeight;
    const scale = Math.min(maxW / w, maxH / h, 1);
    w = Math.round(w * scale); h = Math.round(h * scale);
    canvas.width = w; canvas.height = h;
    ctx.clearRect(0,0,w,h);
    ctx.drawImage(img, 0, 0, w, h);
    statusEl.textContent = 'Bild geladen. Starte Prediction...';
    await predict();
    statusEl.textContent = 'Prediction abgeschlossen.';
    diagEl.textContent = '';
  };
  img.onerror = () => statusEl.textContent = 'Konnte das Bild nicht laden.';
  img.src = URL.createObjectURL(file);
});
