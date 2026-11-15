const { app, BrowserWindow, WebContentsView, ipcMain, shell } = require("electron");
const path = require("node:path");
let win, pageView;
function safeUrl(value) {
  try { const u=new URL(value); return ["http:","https:"].includes(u.protocol)?u.toString():null; } catch { return null; }
}
function sendPageState() {
  if(!win||!pageView||win.isDestroyed())return;
  const c=pageView.webContents;
  win.webContents.send("klar:page-state",{url:c.getURL(),title:c.getTitle()||"New Tab",canGoBack:c.navigationHistory.canGoBack(),canGoForward:c.navigationHistory.canGoForward(),loading:c.isLoading()});
}
function createWindow() {
  win=new BrowserWindow({width:1280,height:820,minWidth:760,minHeight:560,backgroundColor:"#101116",title:"Klar",webPreferences:{preload:path.join(__dirname,"preload.cjs"),contextIsolation:true,nodeIntegration:false,sandbox:true}});
  pageView=new WebContentsView({webPreferences:{contextIsolation:true,nodeIntegration:false,sandbox:true}});
  win.contentView.addChildView(pageView);
  pageView.setBounds({x:0,y:130,width:0,height:0});
  const c=pageView.webContents;
  ["did-start-loading","did-stop-loading","did-navigate","did-navigate-in-page","page-title-updated"].forEach(e=>c.on(e,sendPageState));
  c.setWindowOpenHandler(({url})=>{const safe=safeUrl(url);if(safe)shell.openExternal(safe);return {action:"deny"};});
  c.on("will-navigate",(event,url)=>{if(!safeUrl(url))event.preventDefault();});
  if(app.isPackaged)win.loadFile(path.join(__dirname,"../dist/index.html"));else win.loadURL("http://127.0.0.1:5173");
  win.on("closed",()=>{pageView=null;win=null;});
}
ipcMain.handle("klar:navigate",(_e,value)=>{const u=safeUrl(value);if(!u||!pageView)return false;return pageView.webContents.loadURL(u).then(()=>true).catch(()=>false);});
ipcMain.handle("klar:back",()=>{if(pageView?.webContents.navigationHistory.canGoBack())pageView.webContents.navigationHistory.goBack();});
ipcMain.handle("klar:forward",()=>{if(pageView?.webContents.navigationHistory.canGoForward())pageView.webContents.navigationHistory.goForward();});
ipcMain.handle("klar:reload",()=>pageView?.webContents.reload());
ipcMain.on("klar:set-content-bounds",(event,b)=>{
  if(!win||event.sender!==win.webContents||!pageView||!b||![b.x,b.y,b.width,b.height].every(Number.isFinite))return;
  pageView.setBounds({x:Math.max(0,Math.round(b.x)),y:Math.max(0,Math.round(b.y)),width:Math.max(0,Math.round(b.width)),height:Math.max(0,Math.round(b.height))});
});
app.whenReady().then(()=>{createWindow();app.on("activate",()=>{if(BrowserWindow.getAllWindows().length===0)createWindow();});});
app.on("window-all-closed",()=>{if(process.platform!=="darwin")app.quit();});
