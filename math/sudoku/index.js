// async/await z příkladu na webu
(async () => {
  var Module;
  // Build WebAssembly instance - WebAssembly.instantiateStreaming problem
  const memory = new WebAssembly.Memory({ initial: 4 });
  const importObject = {
    env: { memory },      // nutné pro práci a pamětí
    imports: {            // importované funkce do wasm
      PrintOut : (ptr, len) => {
        // pohled do paměti - ptr je vlastně číslo
        const view = new Uint8Array (memory.buffer, ptr, len);
        const utf8decoder = new TextDecoder ();
        console.log (utf8decoder.decode(view)); // to String
      },
      memoryGrow :  (len) => {
        console.log ('Growing the memory by ' + len.toString() + '. 64K blocks');
        memory.grow (len); // patrně to jde volat přímo z C/C++ kódu, ale tohle funguje
      },
      GetTime : () => {
        return Date.now();
      },
      ReplotPass : (ptr, len) => {
        const canvas  = document.getElementById ('termImg');
        const context = canvas.getContext ('2d');
        const view    = new Uint8ClampedArray (memory.buffer, ptr, len);
        const fgImage = backup (view);
        context.clearRect(0, 0, canvas.widht, canvas.height);
        context.drawImage(fgImage, 0, 0);
      },
    },
  };
  const response = await fetch('./sudoku.wasm');
  const bytes    = await response.arrayBuffer();
  const module   = await WebAssembly.instantiate(bytes, importObject);
  Module = module.instance.exports;
  Module.init(memory.buffer.byteLength); // musí se použít
  // console.log (Module);
  Module.InitImage();
  Module.Escape();
  window.addEventListener("keydown", event => {
    const x = event.key;
    if (x == 'Enter') {
      Module.Enter ();
    } else if (x == 'End') {
      Module.End ();
    } else if (x == 'Delete') {
      Module.Delete ();
    } else if (x == 'Insert') {
      Module.Save ();
    } else if (x == 'Escape') {
      Module.Escape ();
    } else if (x == 'Backspace') {
      Module.Backspace ();
    } else if (x == 'ArrowLeft') {
      Module.Arrow (1);
    } else if (x == 'ArrowRight') {
      Module.Arrow (2);      
    } else if (x == 'ArrowUp') {
      Module.Arrow (3);
    } else if (x == 'ArrowDown') {
      Module.Arrow (4);      
    } else if (x == '1') {
      Module.Number (1);
    } else if (x == '2') {
      Module.Number (2);
    } else if (x == '3') {
      Module.Number (3);
    } else if (x == '4') {
      Module.Number (4);
    } else if (x == '5') {
      Module.Number (5);
    } else if (x == '6') {
      Module.Number (6);
    } else if (x == '7') {
      Module.Number (7);
    } else if (x == '8') {
      Module.Number (8);
    } else if (x == '9') {
      Module.Number (9);
    } else {
      console.log (x);
    }
    event.preventDefault();
  });
})();
function backup (m_Data) {
  const backupCanvas  = document.createElement('canvas');
  backupCanvas.width  = 800;
  backupCanvas.height = 600;
  const backupContext = backupCanvas.getContext('2d');
  const bData = new ImageData (m_Data, backupCanvas.width, backupCanvas.height);
  backupContext.putImageData  (bData, 0, 0);
  return backupCanvas;
}
