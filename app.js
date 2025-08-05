let model,maxPredictions;
let stream,video,anim;
const canvas=document.getElementById('canvas');
const ctx=canvas.getContext('2d');
const statusEl=document.getElementById('status');
const diagEl=document.getElementById('diag');
const resultsEl=document.getElementById('results');
const btnStart=document.getElementById('btn-start');
const fileInput=document.getElementById('file');
const btnFile=document.getElementById('btn-file');
const MODEL_URL='https://momo385-max.github.io/tm-pwa/model/';

async function forceReloadModelAssets(){
  const urlsToFetch=[MODEL_URL+'model.json',MODEL_URL+'metadata.json'];
  try{
    const modelResp=await fetch(MODEL_URL+'model.json',{cache:'reload'});
    if(!modelResp.ok)throw new Error('model.json network error '+modelResp.status);
    const modelJson=await modelResp.clone().json();
    if(modelJson && modelJson.weightsManifest){
      for(const group of modelJson.weightsManifest){
        for(const path of group.paths){
          urlsToFetch.push(MODEL_URL+path);
        }
      }
    }
  }catch(e){
    diagEl.innerHTML='<span style="color:red">Konnte model.json nicht frisch laden: '+(e&&e.message?e.message:e)+'</span>';
    throw e;
  }
  for(const u of urlsToFetch){
    try{const r=await fetch(u,{cache:'reload'});if(!r.ok)throw new Error('HTTP '+r.status+' for '+u);}
    catch(e){diagEl.innerHTML='<span style="color:red">Fehler beim Forced-Reload: '+u+'</span>';throw e;}
  }
}

async function loadLibs(){try{await ensureLibs();}catch(e){diagEl.textContent='Fehler: libs nicht geladen';throw e;}}

async function loadModel(){
  if(model)return;
  await loadLibs();
  statusEl.textContent='Prüfe & lade Modelldateien (netzwerk-frisch)...';
  await forceReloadModelAssets();
  const v=Date.now();
  statusEl.textContent='Lade Modell...';
  const modelURL=MODEL_URL+'model.json?v='+v;
  const metadataURL=MODEL_URL+'metadata.json?v='+v;
  try{
    model=await tmImage.load(modelURL,metadataURL);
    maxPredictions=model.getTotalClasses();
    statusEl.textContent='Modell geladen.';
  }catch(e){
    diagEl.textContent='Fehler beim initialen Laden des Modells: '+(e&&e.message?e.message:e);
    throw e;
  }
}

btnStart.addEventListener('click',async()=>{
  await loadModel();
  statusEl.textContent='Kamera kann gestartet werden (Demo: Modell geladen).';
});
btnFile.addEventListener('click',()=>fileInput.click());
