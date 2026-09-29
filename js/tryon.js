// Ivoire Vision — essai virtuel : caméra + suivi visage + image réelle de la monture

const camPlaceholder = document.getElementById('camPlaceholder');
const camMirror = document.getElementById('camMirror');
const camStatus = document.getElementById('camStatus');
const camStatusText = document.getElementById('camStatusText');
const camStartBtn = document.getElementById('camStartBtn');
const camStopBtn = document.getElementById('camStopBtn');
const video = document.getElementById('video');
const overlay = document.getElementById('overlay');
const octx = overlay.getContext('2d');

let stream = null, faceMesh = null, mpCamera = null, rafId = null;
const frameImg = new Image();
frameImg.src = activeFrame.img;
// recharger l'image quand on change de modèle
const _origRender = renderPicker;
// (renderPicker est dans main.js ; on surveille le changement via un setter simple)
let _activeId = activeFrame.id;
setInterval(() => { if (activeFrame.id !== _activeId) { _activeId = activeFrame.id; frameImg.src = activeFrame.img; } }, 150);

function setStatus(mode, text){
  camStatus.style.display = 'flex';
  camStatus.className = 'cam-status ' + mode;
  camStatusText.textContent = text;
}

function resizeCanvas(){
  const rect = camMirror.getBoundingClientRect();
  overlay.width = rect.width;
  overlay.height = rect.height;
}

async function startCamera(){
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
  } catch(e){
    setStatus('searching','Caméra refusée ou indisponible');
    return;
  }
  video.srcObject = stream;
  camPlaceholder.style.display = 'none';
  camMirror.style.display = 'block';
  camStopBtn.style.display = 'inline-block';
  camStartBtn.style.display = 'none';
  setStatus('searching','Chargement du suivi de visage…');

  await video.play();
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  if (typeof FaceMesh === 'undefined'){
    setStatus('searching','Suivi indisponible — vérifiez votre connexion');
    return;
  }

  faceMesh = new FaceMesh({ locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${f}` });
  faceMesh.setOptions({ maxNumFaces: 1, refineLandmarks: true, minDetectionConfidence: 0.6, minTrackingConfidence: 0.6 });
  faceMesh.onResults(onResults);

  if (typeof Camera !== 'undefined'){
    mpCamera = new Camera(video, {
      onFrame: async () => { await faceMesh.send({ image: video }); },
      width: 640, height: 480
    });
    mpCamera.start();
  } else {
    const loop = async () => {
      if (video.readyState >= 2) await faceMesh.send({ image: video });
      rafId = requestAnimationFrame(loop);
    };
    loop();
  }
}

function onResults(results){
  resizeCanvas();
  octx.clearRect(0, 0, overlay.width, overlay.height);
  if (!results.multiFaceLandmarks || !results.multiFaceLandmarks.length){
    setStatus('searching','Aucun visage détecté');
    return;
  }
  setStatus('live','Suivi en direct');
  if (!frameImg.complete || frameImg.naturalWidth === 0) return;

  const lm = results.multiFaceLandmarks[0];
  const w = overlay.width, h = overlay.height;

  // coins externes des yeux (33 = œil droit, 263 = œil gauche)
  const p33 = lm[33], p263 = lm[263];
  const x1 = p33.x * w, y1 = p33.y * h;
  const x2 = p263.x * w, y2 = p263.y * h;

  const cx = (x1 + x2) / 2;
  const cy = (y1 + y2) / 2;
  const eyeDist = Math.hypot(x2 - x1, y2 - y1);
  const angle = Math.atan2(y2 - y1, x2 - x1);

  // largeur cible de la monture ~ 1.35x la distance inter-yeux
  const targetW = eyeDist * 1.35;
  const targetH = targetW / activeFrame.ar;

  octx.save();
  octx.translate(cx, cy + eyeDist * 0.02);
  octx.rotate(angle);
  octx.drawImage(frameImg, -targetW/2, -targetH/2, targetW, targetH);
  octx.restore();
}

function stopCamera(){
  if (mpCamera){ mpCamera.stop(); mpCamera = null; }
  if (rafId){ cancelAnimationFrame(rafId); rafId = null; }
  if (stream){ stream.getTracks().forEach(t => t.stop()); stream = null; }
  video.srcObject = null;
  camPlaceholder.style.display = 'flex';
  camMirror.style.display = 'none';
  camStatus.style.display = 'none';
  camStopBtn.style.display = 'none';
  camStartBtn.style.display = 'inline-block';
  octx.clearRect(0, 0, overlay.width, overlay.height);
}

camStartBtn.addEventListener('click', startCamera);
camStopBtn.addEventListener('click', stopCamera);
