const Outs = document.getElementById('output');
const Btnt = document.getElementById('buttonTest');
// async/await z příkladu na webu
(async () => {
  Outs.value = 'Compiling ...\n';        // presets
  Btnt.disabled = true;
  // Build WebAssembly instance - WebAssembly.instantiateStreaming problem
  const memory = new WebAssembly.Memory({ initial: 4 });
  const importObject = {
    env: { memory },      // nutné pro práci a pamětí
    imports: {            // importované funkce do wasm
      printout : (ptr, len) => {
        // pohled do paměti - ptr je vlastně číslo
        const view = new Uint8Array (memory.buffer, ptr, len);
        const utf8decoder = new TextDecoder();
        Outs.value += utf8decoder.decode(view); // to String
      },
      memoryGrow :  (len) => {
        console.log ('Growing the memory by ' + len.toString() + '. 64K blocks');
        memory.grow (len); // patrně to jde volat přímo z C/C++ kódu, ale tohle funguje
      },
    },
  };
  const response = await fetch('./sound.wasm');
  const bytes    = await response.arrayBuffer();
  const module   = await WebAssembly.instantiate(bytes, importObject);
  module.memory  = memory;  // přidat memory, tady sice není potřeba, ale hodí se
  Outs.value = 'Module compiled, press Test\n';
  module.instance.exports.init(memory.buffer.byteLength);
  // console.log (module);
  Btnt.onclick  = () => {
    createPlayer(module);
    Btnt.disabled = true;
  };
  Btnt.disabled = false;
})();
function createPlayer (module) {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  module.instance.exports.initGenerator(audioCtx.sampleRate)
  const myArrayBuffer = audioCtx.createBuffer(
    2, audioCtx.sampleRate * 60, audioCtx.sampleRate
  );
  const blen = myArrayBuffer.length;
  const cPtr = module.instance.exports.getChunk (blen);   // get mono data
  if  (!cPtr) return;
  const view = new Float32Array (module.memory.buffer, cPtr, blen);
  for (let channel = 0; channel < myArrayBuffer.numberOfChannels; channel++) {
    const nowBuffering = myArrayBuffer.getChannelData(channel);
    nowBuffering.set(view);
  }
  const source = audioCtx.createBufferSource();
  // source.loop  = true; // smycka nikdy nekonci
  source.buffer = myArrayBuffer;
  source.connect(audioCtx.destination);
  source.onended = (event) => {
    event.target.context.close();
    // createPlayer(); // lze to volat rekurzivne, ale lupne to
    Btnt.disabled = false;
  }
  // console.log (source);
  source.start();
}
