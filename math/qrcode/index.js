async function StartQR (Outs, Btnt, QRCode, canvas, BtCp) {
  Btnt.disabled = true;
  Outs.value = 'Compiling ...\n';        // presets
  // Build WebAssembly instance - WebAssembly.instantiateStreaming problem
  const memory = new WebAssembly.Memory({ initial: 64 });
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
      ReplotPass : (ptr, len, w, h) => {
        canvas.width  = w;
        canvas.height = h;
        const context = canvas.getContext ('2d');
        const view    = new Uint8ClampedArray (memory.buffer, ptr, len);
        const fgImage = backup (view, w, h);
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(fgImage, 0, 0);        
      },
      exit : (code) => {
        console.log (code);
      },
    },
  };
  const response = await fetch('./module.wasm');
  const bytes    = await response.arrayBuffer();
  const module   = await WebAssembly.instantiate(bytes, importObject);
  module.memory  = memory;  // přidat memory, tady sice není potřeba, ale hodí se
  module.instance.exports.init(memory.buffer.byteLength); // musí se použít
  QRCode.value = 'Hello world';
  Btnt.onclick = () => {
    setQrCode (QRCode.value);
  };
  BtCp.onclick = () => {
    canvas.toBlob((blob) => {
      navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob })
      ]);
    }, "image/png");
  };
  Outs.value = 'Module compiled - fill input and press button Test\n';
  Btnt.disabled = false;
  console.log (module);
  module.instance.exports.zero();
  
  function setQrCode (txt) {
    const utf8EncodeText = new TextEncoder ();
    const bytes = utf8EncodeText.encode (txt);
    const cArrayPtr = module.instance.exports.cAlloc (bytes.length);
    const cArray = new Uint8Array(
      memory.buffer,
      cArrayPtr,
      bytes.length
    );
    cArray.set (bytes);
    module.instance.exports.test(cArrayPtr, cArray.length);
  }
  function backup (m_Data, w, h) {
    const backupCanvas  = new OffscreenCanvas (w, h);
    const backupContext = backupCanvas.getContext('2d');
    const bData = new ImageData (m_Data, backupCanvas.width, backupCanvas.height);
    backupContext.putImageData  (bData, 0, 0);
    return backupCanvas;
  }
};
