var bgImage  = new Image();
Module.addOnPostRun(() => {
  var sheet = document.createElement('style');
  sheet.innerHTML = Module.getStyle();
  document.body.appendChild (sheet);
  document.getElementById ('WasmDomElements').innerHTML = Module.Init ();
  eval (Module.WasmInitAll ());
  window.addEventListener('resize', resizeCanvas, false);
  resizeCanvas();
});
// Název UniversalDriver je podstatný, DOM to používá.
function UniversalDriver (index) {
  const id = Module.WasmElementId (index);
  if (id) {
    const val = document.getElementById (id).value.toString();
    const act = Module.BackAction (index, val);
    if (act.length) {     // pokud je v akci kod,
      eval (act.code);    // spust ho
    }
  };
};
function resizeCanvas() {
  var canvas    = document.getElementById('canvas');
  const width   = canvas.clientWidth;
  const height  = canvas.clientHeight;
  canvas.width  = width;
  canvas.height = height;
  drawStuff ();
};
function drawBackground (m_Data) {
  var canvas   = document.getElementById('canvas');
  const width  = canvas.width;
  const height = canvas.height;
  var bgCanvas = document.createElement('canvas');
  bgCanvas.width  = width;
  bgCanvas.height = height;
  const bgContext = bgCanvas.getContext('2d');
  const bData = new ImageData (new Uint8ClampedArray (m_Data), width, height);
  bgContext.putImageData (bData, 0, 0);
  return bgCanvas;
};
function drawStuff() {    // Initialize by resize event
  var canvas   = document.getElementById('canvas');
  var context  = canvas.getContext('2d');
  const width  = canvas.width;
  const height = canvas.height;
  Module.resize (width, height);
  context.clearRect(0, 0, width, height); // clear canvas
  delete bgImage;
  bgImage = drawBackground (Module.bg_data());
  context.drawImage (bgImage, 0, 0);
};
function wChangeBackground () {
  var canvas  = document.getElementById('canvas');
  var context = canvas.getContext('2d');
  const data = Module.wChanged();
  if (data === undefined) {
    eval (Module.WasmInitAll());
    return;
  }
  delete bgImage;
  bgImage  = drawBackground  (data);
  context.clearRect(0, 0, canvas.widht, canvas.height); // clear canvas
  context.drawImage (bgImage, 0, 0);
  const percent = Module.progress()
  const progressBar = document.getElementById('progressBar');
  progressBar.style.width = percent;
  progressBar.innerHTML   = percent;
  window.setTimeout (wChangeBackground, 20);
};
