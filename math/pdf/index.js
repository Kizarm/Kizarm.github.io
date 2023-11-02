var gWASM = null; // WASM -> global object
(async () => {
  const Outs   = document.getElementById("context");
  const memory = new WebAssembly.Memory({ initial: 32 });
  if  (!memory) {
    console.log ('!!! WebAssembly not supported');  return;
  }
  Outs.innerHTML = '<p>Compile module ...</p>';
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
    },
  };
  const response = await fetch('./module.wasm');
  const bytes    = await response.arrayBuffer();
  const module   = await WebAssembly.instantiate(bytes, importObject);
  gWASM = {
    asm : module.instance.exports,
    mem : memory,
  };
  gWASM.asm.init();
})();

function passwd (str) {
  if (!str.length) return;
  console.log(str);
  const utf8EncodeText = new TextEncoder();
  const bytes = utf8EncodeText.encode(str);
  // alokovat pamet v modulu je nutne, aby bylo kam kopirovat
  const cArrayPointer = gWASM.asm.cAlloc(bytes.length);
  if (!cArrayPointer) return;
  const cArray = new Uint8Array(gWASM.mem.buffer, cArrayPointer, bytes.length);
  cArray.set(bytes);              // naplnit dekodovanym stringem
  gWASM.asm.passString(cArrayPointer, cArray.length);
};
