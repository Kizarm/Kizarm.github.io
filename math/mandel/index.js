const g_Outs = document.getElementById('output');
const g_Canvas  = document.getElementById('canvas');
const d_Descr   = document.getElementById('description');
const g_Context = g_Canvas.getContext('2d');
var g_WebWorker = new Worker('WebWorker.js');
g_Canvas.onwheel = (evt) => {
  evt.preventDefault ();
  const rect = evt.target.getBoundingClientRect();
  const x = evt.clientX - rect.left; //x position within the element.
  const y = evt.clientY - rect.top;  //y position within the element.
  g_WebWorker.postMessage ({ MessagePurpose: 'Wheel', val: evt.deltaY, posx: x, posy: y });
}
g_WebWorker.onerror = (evt) => {
  console.error('Error from Web Worker: ' + evt.message.toString());
}         
g_WebWorker.onmessage = (evt) => {
  const mdata = evt.data;
  if (!mdata.Purpose) return;
  if ( mdata.Purpose === 'Text') {
    g_Outs.value += mdata.text;
  } else if (mdata.Purpose === 'Desc') {
    d_Descr.innerHTML = 'Z=' + mdata.view[0].toString() + '<br>X=' + mdata.view[1].toString() + '<br>Y=' + mdata.view[2].toString();
  } else if (mdata.Purpose === 'View') {
    const bData = new ImageData (mdata.view, g_Canvas.width, g_Canvas.height);
    g_Context.putImageData (bData, 0, 0);
  } else {
    console.log('unhandled Purpose :' + evt.data.Purpose);
  }
}
function InitModule () {
  g_Canvas.width  = g_Canvas.clientWidth;   // měřítko !!!
  g_Canvas.height = g_Canvas.clientHeight;
  g_Outs.value    = 'Compiling ...\n';      // presets
  g_WebWorker.postMessage({ MessagePurpose: 'CompileModule', x: g_Canvas.width, y: g_Canvas.height });
}
InitModule ();
function KeyToInt (key) {
  var val = -1;
  switch (key) {
    case '0' : val = 0; break;
    case '1' : val = 1; break;
    case '2' : val = 2; break;
    case '3' : val = 3; break;
    case '4' : val = 4; break;
    case '5' : val = 5; break;
    case '6' : val = 6; break;
    case '7' : val = 7; break;
    case '8' : val = 8; break;
    case '9' : val = 9; break;
    case 'Home'  : val = 10; break;
    case 'Enter' : val = 11; break;
    default  : break;
  }
  return val;
}
window.addEventListener('keydown', event => {
  const res = KeyToInt (event.key);
  g_WebWorker.postMessage({ MessagePurpose: 'KeyPressed', value: res });
});
