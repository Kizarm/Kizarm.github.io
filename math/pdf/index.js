var Module;
var Memory;
var Outs = document.getElementById("context");
var Butp = document.getElementById("sbut");
(async () => {
  const memory = new WebAssembly.Memory({ initial: 16 });
  if  (!memory) {
    console.log ('!!! WebAssembly not supported');  return;
  }
  const importObject = {
    env: { memory },
    imports: {            // importované funkce do wasm
      writeHtml : (ptr, len) => {
        const view = new Uint8Array (memory.buffer, ptr, len);
        const utf8decoder = new TextDecoder();
        Outs.innerHTML = utf8decoder.decode(view);
      },
      writePdf : (ptr, len) => {
        const view = new Uint8Array (memory.buffer, ptr, len);
        var blob = new Blob([view], {type: "application/pdf"});
        var link = window.URL.createObjectURL(blob);
        window.open(link,'_blank');
      },
      PrintOut : (ptr, len) => {
        const view = new Uint8Array (memory.buffer, ptr, len);
        const utf8decoder = new TextDecoder();
        console.log (utf8decoder.decode(view));
      },
      memoryGrow :  (len) => {
        console.log ('Growing the memory by ' + len.toString() + '. 64K blocks');
        importObject.env.memory.grow (len);
      },
      fileRead : () => {
        readFile ();
      },
    },
  };
  const response = await fetch('./module.wasm');
  const bytes    = await response.arrayBuffer();
  const module   = await WebAssembly.instantiate(bytes, importObject);
  module.memory  = memory;
  Memory = memory;
  Module = module.instance.exports;
  Module.init(memory.buffer.byteLength);
  Butp.disabled = false;
})();

function passwd (str) {
  if (!str.length) return;
  console.log(str);
  
  const utf8EncodeText = new TextEncoder();
  const bytes = utf8EncodeText.encode(str);
  // alokovat pamet v modulu je nutne, aby bylo kam kopirovat
  const cArrayPointer = Module.cAlloc(bytes.length);
  const cArray = new Uint8Array(  // js pole bytu, pohled do pameti
    Memory.buffer,
    cArrayPointer,
    bytes.length
  );
  cArray.set(bytes);              // naplnit dekodovanym stringem
  Module.passString(cArrayPointer, cArray.length);
};

async function readFile() {
  const response = await fetch ('./text.blob');
  if (!response.ok) return;
  const bytes    = await response.arrayBuffer();
  const array    = new Uint8Array(bytes);
  console.log(array.length);
  const cArrayPointer = Module.cAlloc(array.length);
  const cArray = new Uint8Array(Memory.buffer, cArrayPointer, array.length);
  cArray.set(array);
  Module.Decode(cArrayPointer, cArray.length);
};

