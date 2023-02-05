var g_objInstance = null;
function SendText (mtext) {
  self.postMessage({ Purpose : 'Text', text : mtext });
}
function SendView (memview) {
  self.postMessage({ Purpose : 'View', view : memview });
}
function SendDesc (memview) {
  self.postMessage({ Purpose : 'Desc', view : memview });
}
var g_importObject = {
  env : {
    memoryBase: 0,       
    tableBase : 0,       
    memory : new WebAssembly.Memory({ initial: 4 }),       
  },
  imports : {
    PrintOut : (ptr, len) => {
      const memview     = new Uint8Array (g_importObject.env.memory.buffer, ptr, len);
      const utf8decoder = new TextDecoder();
      SendText (utf8decoder.decode(memview));
    },
    memoryGrow :  (len) => {
      console.log ('Growing the memory by ' + len.toString() + '. 64K blocks');
      g_importObject.env.memory.grow (len);
    },
    PlotCanvas : (ptr, len) => {
      const memview = new Uint8ClampedArray (g_importObject.env.memory.buffer, ptr, len);
      SendView (memview);
    },
    Description : (ptr, len) => {
      const memview = new Float64Array (g_importObject.env.memory.buffer, ptr, len);
      SendDesc (memview);
    },
  },
};
self.onmessage = async function (evt) {
  const objData = evt.data;     
  const sMessagePurpose = objData.MessagePurpose;     
  if (sMessagePurpose === 'CompileModule') {
    /* Wasm modul je asi lépe stáhnout, zkompilovat a instancovat zde */
    const response   = await fetch ('module.wasm');
    const bytes      = await response.arrayBuffer ();
    const module     = await WebAssembly.instantiate(bytes, g_importObject);
    g_objInstance    = module.instance; // musí se počkat až se předchozí dokončí
    g_objInstance.exports.init (g_importObject.env.memory.buffer.byteLength);
    g_objInstance.exports.InitCanvas (objData.x, objData.y);
  } else if (sMessagePurpose === 'Wheel') {
    g_objInstance.exports.WheelEvt(objData.val, objData.posx, objData.posy);
  } else if (sMessagePurpose === 'KeyPressed') {
    g_objInstance.exports.KeyAction (objData.value);
  } else {
    console.log ("unhandled MessagePurpose : " + sMessagePurpose);
  }
}

