var wStart  = false;
var Module  = null;
var bgImage = null;
var fgImage = null;
const importObject = {
  env: { memory:  new WebAssembly.Memory({ initial: 4 }), },
  imports: {            // importované funkce do wasm
    PrintOut : (ptr, len) => {
      // pohled do paměti - ptr je vlastně číslo
      const view = new Uint8Array (importObject.env.memory.buffer, ptr, len);
      const utf8decoder = new TextDecoder();
      console.log (utf8decoder.decode(view)); // to String
    },
    memoryGrow :  (len) => {
      console.log ('Growing the memory by ' + len.toString() + '. 64K blocks');
      importObject.env.memory.grow (len);
    },
  },
};
window.onload = async (event) => {
  const response = await fetch('./module.wasm');
  const bytes    = await response.arrayBuffer();
  const module   = await WebAssembly.instantiate(bytes, importObject);
  module.instance.exports.init(importObject.env.memory.buffer.byteLength);
  Module = module.instance.exports;
  
  window.addEventListener('resize', resizeCanvas, false);
  resizeCanvas();
  var range = document.getElementById('wRange');
  range.disabled = false;
  range.value = 270;
  var speed = document.getElementById('wSpeed');
  speed.disabled = false;
  speed.value = 10;
}
function resizeCanvas() {
  var canvas    = document.getElementById('canvas');
  const width   = canvas.clientWidth;
  const height  = canvas.clientHeight;
  canvas.width  = width;
  canvas.height = height;
  drawStuff ();
  wChangeVal   ();
  wChangeSpeed ();
  DescriptionString();
}
function backup (m_Data) {
  const buffer = importObject.env.memory.buffer;
  const memarr = new Uint32Array (buffer, m_Data, 2);
  var canvas   = document.getElementById('canvas');
  const width  = canvas.width;
  const height = canvas.height;
  var backupCanvas  = document.createElement('canvas');
  backupCanvas.width  = width;
  backupCanvas.height = height;
  const backupContext = backupCanvas.getContext('2d');
  const bData = new ImageData (new Uint8ClampedArray (buffer, memarr[0], memarr[1]), width, height);
  backupContext.putImageData (bData, 0, 0);
  return backupCanvas;
}
function drawStuff() {
  var canvas   = document.getElementById('canvas');
  var context  = canvas.getContext('2d');
  const width  = canvas.width;
  const height = canvas.height;
  Module.graph (width, height);
  context.clearRect(0, 0, width, height); // clear canvas
  bgImage = backup (Module.bg_data());
  fgImage = backup (Module.fg_data());
  context.drawImage (bgImage, 0, 0);
  context.drawImage (fgImage, 0, 0);
}
function DescriptionString () {
  const buffer = importObject.env.memory.buffer;
  const memarr = new Uint32Array (buffer, Module.getdesc(), 2);
  const descr  = new TextDecoder().decode(new Uint8ClampedArray(buffer, memarr[0], memarr[1]));
  document.getElementById('graphdesc').innerHTML = descr;
};
function wChangeVal () {
  var nval = parseInt (document.getElementById('wRange').value, 10);
  Module.wChanged(nval);
  var par = document.getElementById('paramw');
  par.innerHTML = 'par = ' + (0.1 * nval).toFixed(1);
}
function ReplotPass () {
  var canvas  = document.getElementById('canvas');
  var context = canvas.getContext('2d');
  fgImage  = backup  (Module.gStep());
  context.clearRect(0, 0, canvas.widht, canvas.height); // clear canvas
  context.drawImage (bgImage, 0, 0);
  context.drawImage (fgImage, 0, 0);
  if (wStart) window.requestAnimationFrame (ReplotPass);
}
function StartStop() {
  var but = document.getElementById('StartButton');
  if (wStart) {
    wStart = false;
    but.innerHTML = 'START';
  } else {
    wStart = true;
    but.innerHTML = 'STOP';
    window.requestAnimationFrame (ReplotPass);
  }
}
function ResetImag() {
    Module.gReset();
    ReplotPass ();
}
function wChangeSpeed() {
  var nval = parseInt (document.getElementById('wSpeed').value, 10);
  Module.wChangedSpeed(nval);
  var par = document.getElementById('params');
  par.innerHTML = 'speed = ' + nval;
}

