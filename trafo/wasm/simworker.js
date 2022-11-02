self.importScripts('spice.js');
Module.addOnPostRun(() => {
  console.log ('Initialized');
  Module.SpiceInit();
});
self.onmessage = function (evt) {
  const msg = evt.data;
  if (msg.id == 0) {
    Module.startSimulation (msg.text);
  } else if (msg.id == 1) {
    Module.setCanvasSize (msg.w, msg.h);
  } else {
    console.log (msg);
  }
}
