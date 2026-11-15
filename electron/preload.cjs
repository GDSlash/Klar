const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("klar", {
 navigate: (url) => ipcRenderer.invoke("klar:navigate", url),
 back: () => ipcRenderer.invoke("klar:back"),
 forward: () => ipcRenderer.invoke("klar:forward"),
 reload: () => ipcRenderer.invoke("klar:reload"),
 setContentBounds: (bounds) => ipcRenderer.send("klar:set-content-bounds", bounds),
 onPageState: (callback) => { const listener = (_event, state) => callback(state); ipcRenderer.on("klar:page-state", listener); return () => ipcRenderer.removeListener("klar:page-state", listener); }
});
