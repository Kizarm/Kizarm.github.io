var g_WebWorker = new Worker("simworker.js");
const canvas  = document.getElementById('canvas');
window.addEventListener('resize', resizeCanvas, false);

function resizeCanvas() {
  const width  = canvas.clientWidth;
  const height = canvas.clientHeight;
  canvas.width  = width;
  canvas.height = height;
  console.log ('resize', width, height);
  g_WebWorker.postMessage ({ id: 1, w: width, h: height});
}
g_WebWorker.onmessage = function (evt) {
  const msg = evt.data;
  if (msg.id == 0) {          // TYPE_CLEAR
    document.getElementById('output').value  = msg.text;
  } else if (msg.id == 1) {   // TYPE_SHOW
    document.getElementById('output').value += msg.text;
  } else if (msg.id == 2) {   // TYPE_PROGRESS
    var state = document.getElementById('status');
    state.innerHTML   = msg.text;
    state.style.width = msg.text;
  } else if (msg.id == 3) {   // TYPE_CIRCUIT
    document.getElementById('start').disabled   = false;
    document.getElementById('circuit').disabled = false;
    document.getElementById('input').value  = msg.text;
  } else if (msg.id == 4) {   // TYPE_DRAWINGS
    const context = canvas.getContext('2d');
    eval (msg.text);
  } else {
    console.log (msg);
  }
}
function ClickRun() {
  resizeCanvas();
  const inp = document.getElementById('input').value;
  g_WebWorker.postMessage ({id: 0, text: inp});
}
window.onload = (event) => {    // vycistit texty
  document.getElementById('output').value = "";
  document.getElementById( 'input').value = "";
  canvas.width  = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  const content = canvas.getContext('2d');
  content.font = '48px serif';
  content.fillStyle = '#00FF00';
  content.textAlign = 'center';
  content.fillText ('Spice Simulator', canvas.width / 2, canvas.height / 2);
};
/* Tato část přidává uživatelské soubory. */
function readFile(file) {
  const reader = new FileReader();
  reader.addEventListener('load', (event) => {
    const ctx = event.target.result;
    document.getElementById('input').value = ctx;
  });
  reader.readAsText(file);
}
function ClickUpl () {
  var hidden = document.createElement('input');
  hidden.setAttribute('type', 'file');
  hidden.setAttribute('accept', '.cir, .txt');
  hidden.style.display = 'none';
  hidden.addEventListener('change', (event) => {
    const fileList = event.target.files;
    for (n=0; n<fileList.length; n++) {
      const file = fileList[n];
      // console.log (file);
      readFile (file);
    }
  });
  document.body.appendChild(hidden);
  hidden.click();
  document.body.removeChild(hidden);
}
function loadFile(filePath) {
  var result  = null;
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open("GET", filePath, false);
  xmlhttp.send();
  if (xmlhttp.status==200) {
    result = xmlhttp.responseText;
    console.log (result);
  }
}
function getUrl (e, imgUrl) {
  fetch(e.href)
    .then((response) => {
      if (!response.ok) {
        throw new Error('HTTP error');
      }
      return response.text();
    })
    .then((text) => document.getElementById('input').value = text)
    .catch((err) => console.error('Fetch problem circuit'));
  if (imgUrl == null) return;
  circImg = new Image ();
  circImg.onload = function () {
    const content = canvas.getContext('2d');
    content.clearRect (0,0,canvas.width, canvas.height)
    const w = this.width, h = this.height;
    console.log (w, h, canvas.width, canvas.height);
    content.drawImage (this, 0, 0, w, h);
  }
  circImg.src = imgUrl;
}
