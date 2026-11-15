const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("klar",{
 navigate:url=>ipcRenderer.invoke("klar:navigate",url),back:()=>ipcRenderer.invoke("klar:back"),forward:()=>ipcRenderer.invoke("klar:forward"),reload:()=>ipcRenderer.invoke("klar:reload"),
 createTab:url=>ipcRenderer.invoke("klar:create-tab",url),closeTab:id=>ipcRenderer.invoke("klar:close-tab",id),switchTab:id=>ipcRenderer.invoke("klar:switch-tab",id),
 setContentBounds:bounds=>ipcRenderer.send("klar:set-content-bounds",bounds),
 onPageState:callback=>{const listener=(_event,state)=>callback(state);ipcRenderer.on("klar:page-state",listener);return()=>ipcRenderer.removeListener("klar:page-state",listener);},
 onTabsState:callback=>{const listener=(_event,tabs)=>callback(tabs);ipcRenderer.on("klar:tabs-state",listener);return()=>ipcRenderer.removeListener("klar:tabs-state",listener);}
});