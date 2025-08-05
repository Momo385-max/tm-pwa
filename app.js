let model,maxPredictions;
const canvas=document.getElementById('canvas');
const ctx=canvas.getContext('2d');
const statusEl=document.getElementById('status');
const diagEl=document.getElementById('diag');
const resultsEl=document.getElementById('results');
const btnStart=document.getElementById('btn-start');
const fileInput=document.getElementById('file');
const btnFile=document.getElementById('btn-file');

const MODEL_URL='https://momo385-max.github.io/tm-pwa/model/';

async function loadLibs(){await ensureLibs();}

async function loadModel(){
  if(model) return;
  await loadLibs();
  const v=Date.now();
  const modelURL=MODEL_URL+'model.json?v='+v;
  const metadataURL=MODEL_URL+'metadata.json?v='+v;
  try{
    model=await tmImage.load(modelURL,metadataURL);
    maxPredictions=model.getTotalClasses();
    statusEl.textContent='Modell geladen.';
  }catch(e){
    diagEl.textContent='Fehler beim Laden des Modells: '+(e&&e.message?e.message:e);
    throw e;
  }
}

btnStart.addEventListener('click',async()=>{
  await loadModel();
  statusEl.textContent='Kamera könnte hier gestartet werden (Demo)';
});

btnFile.addEventListener('click',()=>fileInput.click());
