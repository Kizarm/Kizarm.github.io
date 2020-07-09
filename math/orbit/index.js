var bgImage  = new Image();
var fgImage  = new Image();
var planet   = new Image();
var fgCanvas = document.createElement('canvas');
var TimeOut  = -1;
var ClearFg  = true;
var planetX  = 0, planetY = 0, planetYes = 0;
Module.addOnPostRun(() => {
  var sheet = document.createElement('style');
  sheet.innerHTML = Module.getStyle();
  document.body.appendChild (sheet);
  planet.src = 'planet.png';
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
      // console.log (act.code); 
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
  fgCanvas.width  = width;
  fgCanvas.height = height;
  const fgContext = fgCanvas.getContext('2d');
  fgContext.clearRect(0, 0, width, height);
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
function clearForeground () {
  const fgContext = fgCanvas.getContext('2d');
  fgContext.clearRect(0, 0, fgCanvas.width, fgCanvas.height);
  var canvas  = document.getElementById('canvas');
  var context = canvas.getContext('2d');
  delete fgImage;
  fgImage = fgCanvas;
  context.clearRect(0, 0, canvas.widht, canvas.height); // clear canvas
  context.drawImage (bgImage, 0, 0);
  context.drawImage (fgImage, 0, 0);
}
function drawForeground (m_Data) {
  planetYes = m_Data.planet;
  const fgContext = fgCanvas.getContext('2d');
  // pokud se fgContext nesmaže, překresluje se obrázek
  if (ClearFg) fgContext.clearRect(0, 0, fgCanvas.width, fgCanvas.height);
  for (var n=0; n<m_Data.lenght; n++) {
    const pline = m_Data.data.get (n);
    if (pline.lenght < 2) break;
    fgContext.strokeStyle = pline.style;
    fgContext.lineWidth   = pline.width;
    fgContext.beginPath();
    const p0 = pline.points.get(0);
    fgContext.moveTo (p0.x, p0.y);
    for (var m=1; m<pline.lenght; m++) {
      const pt = pline.points.get(m);
      fgContext.lineTo (pt.x, pt.y);
      if (planetYes) planetX = pt.x; planetY = pt.y;
    };
    fgContext.stroke();
  };
  return fgCanvas;
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
  delete fgImage;
  fgImage = drawForeground (Module.fg_data());
  context.drawImage (bgImage, 0, 0);
  context.drawImage (fgImage, 0, 0);
};
function wChangeForeground () {
  var canvas  = document.getElementById('canvas');
  var context = canvas.getContext('2d');
  delete fgImage;
  fgImage  = drawForeground  (Module.wChanged());
  context.clearRect(0, 0, canvas.widht, canvas.height); // clear canvas
  context.drawImage (bgImage, 0, 0);
  context.drawImage (fgImage, 0, 0);
  if (planetYes) context.drawImage (planet, planetX - 3.5, planetY - 3.5);
  if (TimeOut > 0) window.setTimeout (wChangeForeground, TimeOut);
};
