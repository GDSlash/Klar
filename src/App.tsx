import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, RotateCw, ShieldCheck, Plus, Search, Star, MoreHorizontal, PanelLeft, Globe2 } from "lucide-react";

type PageState = { url:string; title:string; canGoBack:boolean; canGoForward:boolean; loading:boolean };
declare global {
  interface Window { klar?: {
    navigate:(url:string)=>Promise<void>; back:()=>Promise<void>; forward:()=>Promise<void>; reload:()=>Promise<void>;
    setContentBounds:(bounds:{x:number;y:number;width:number;height:number})=>void;
    onPageState:(callback:(state:PageState)=>void)=>()=>void;
  } }
}
function normalizeAddress(value:string) {
  const v=value.trim();
  if (!v) return "";
  if (/^https?:\\/\\//i.test(v)) return v;
  if (/^(localhost|127\\.0\\.0\\.1)(:\\d+)?([/].*)?$/i.test(v)) return "http://"+v;
  if (/^[^\\s]+\\.[^\\s]+$/.test(v)) return "https://"+v;
  return "https://www.google.com/search?q="+encodeURIComponent(v);
}
export default function App() {
  const [address,setAddress]=useState("");
  const [title,setTitle]=useState("New Tab");
  const [pageUrl,setPageUrl]=useState("");
  const [back,setBack]=useState(false);
  const [forward,setForward]=useState(false);
  const [loading,setLoading]=useState(false);
  const [welcome,setWelcome]=useState(true);
  const [focused,setFocused]=useState(false);
  const viewport=useRef<HTMLElement>(null);
  const addressInput=useRef<HTMLInputElement>(null);

  useEffect(()=>window.klar?.onPageState(s=>{
    setAddress(s.url); setPageUrl(s.url); setTitle(s.title||"New Tab");
    setBack(s.canGoBack); setForward(s.canGoForward); setLoading(s.loading);
    if(s.url) setWelcome(false);
  }),[]);
  useEffect(()=>{
    const el=viewport.current;
    if(!el||!window.klar) return;
    const update=()=>{
      const r=el.getBoundingClientRect();
      window.klar?.setContentBounds({x:Math.round(r.left),y:Math.round(r.top),width:Math.max(0,Math.round(r.width)),height:Math.max(0,Math.round(r.height))});
    };
    const observer=new ResizeObserver(update); observer.observe(el);
    window.addEventListener("resize",update); update();
    return ()=>{observer.disconnect();window.removeEventListener("resize",update);};
  },[]);
  const go=async(v=address)=>{
    const url=normalizeAddress(v); if(!url)return;
    setAddress(url);setWelcome(false);await window.klar?.navigate(url);addressInput.current?.blur();
  };
  const newTab=()=>{setAddress("");setTitle("New Tab");setPageUrl("");setWelcome(true);};
  return <main className="app-shell">
    <header className="chrome">
      <div className="titlebar"><div className="brand"><div className="brand-mark">k</div><b>Klar</b><span className="slash">/</span><span className="page-title">{title}</span></div>
        <div className="window-actions"><button className="icon-button subtle" aria-label="Sidebar"><PanelLeft size={16}/></button><button className="icon-button subtle" aria-label="More"><MoreHorizontal size={18}/></button></div>
      </div>
      <div className="navigation-row">
        <div className="nav-controls">
          <button className="icon-button" aria-label="Back" disabled={!back} onClick={()=>void window.klar?.back()}><ArrowLeft size={17}/></button>
          <button className="icon-button" aria-label="Forward" disabled={!forward} onClick={()=>void window.klar?.forward()}><ArrowRight size={17}/></button>
          <button className={loading?"icon-button spinning":"icon-button"} aria-label="Reload" onClick={()=>void window.klar?.reload()}><RotateCw size={16}/></button>
        </div>
        <form className={focused?"address-wrap address-focused":"address-wrap"} onSubmit={e=>{e.preventDefault();void go();}}>
          <ShieldCheck size={15} className="address-security"/>
          <input ref={addressInput} value={address} onChange={e=>setAddress(e.target.value)} onFocus={e=>{setFocused(true);e.target.select();}} onBlur={()=>setFocused(false)} placeholder="Search or enter address" aria-label="Search or enter address" spellCheck={false}/>
          <button className="address-action" aria-label="Go"><Search size={15}/></button>
        </form>
        <button className="icon-button" aria-label="Bookmark"><Star size={16}/></button>
        <button className="new-tab-button" aria-label="New tab" onClick={newTab}><Plus size={17}/></button>
      </div>
      <div className="tab-strip"><div className="tab active-tab"><Globe2 size={14}/><span>{title}</span><button aria-label="Close tab" onClick={newTab}>×</button></div><button className="tab-add" aria-label="Add tab" onClick={newTab}><Plus size={14}/></button><div className="tab-spacer"/><span className="privacy-indicator"><i/> Private by design</span></div>
    </header>
    <section className="browser-viewport" ref={viewport}>
      {welcome&&<div className="welcome"><div className="welcome-content">
        <div className="welcome-symbol">k</div><p className="eyebrow">A clearer way to browse</p>
        <h1>Make room for<br/><span>what matters.</span></h1>
        <p className="welcome-copy">A fresh space for the things you want to discover.</p>
        <form className="welcome-search" onSubmit={e=>{e.preventDefault();void go();}}><Search size={18}/><input value={address} onChange={e=>setAddress(e.target.value)} placeholder="Search the web or enter a URL" aria-label="Search the web or enter a URL"/><button>Explore <span>↗</span></button></form>
        <div className="suggestion-grid"><div className="suggestion"><div className="suggestion-icon"><Search size={17}/></div><div><strong>Explore the web</strong><span>Search or enter a website address</span></div></div><div className="suggestion"><div className="suggestion-icon"><Globe2 size={17}/></div><div><strong>A fresh start</strong><span>Your browsing space, uncluttered</span></div></div></div>
        <div className="welcome-foot">Klar preview · 0.1.0</div>
      </div></div>}
    </section>
    <footer className="statusbar"><span>{pageUrl||"Ready when you are"}</span><span><i/> {loading?"Loading":"Klar is ready"}</span></footer>
  </main>;
}
