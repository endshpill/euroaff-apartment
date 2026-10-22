'use client';
import {useEffect,useId,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {Recycle,TriangleAlert} from 'lucide-react';
import {wasteCalendar,wasteTypes,type WasteType} from './waste-calendar';
function WasteIcon({type}:{type:WasteType}){
 const color=wasteTypes[type].color;
 if(type==='recycling')return <Recycle className="waste-icon" style={{color}} aria-hidden="true"/>;
 if(type==='hazardous')return <TriangleAlert className="waste-icon" style={{color}} aria-hidden="true"/>;
 return <svg className="waste-icon" viewBox="0 0 20 24" style={{color}} aria-hidden="true">{type==='valorlux'?<><path d="M7 2h6l-1 4c4 4 5 8 5 12 0 3-14 3-14 0 0-4 1-8 5-12Z" fill="currentColor"/><path d="M7 6h6M8 11l-2 4h3m3-4 2 4h-3m-3 3h4" fill="none" stroke="white" strokeWidth="1.1" strokeLinecap="round"/></>:<><rect x="3" y="3" width="14" height="2.5" rx=".8" fill="currentColor"/><path d="M5 7h10l-1 13H6Z" fill="currentColor"/><path d="M7 2h6M15 7h2v3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="7" cy="21" r="1.4" fill="currentColor"/><circle cx="13" cy="21" r="1.4" fill="currentColor"/><path d="m8 9 .5 8" stroke="white" strokeOpacity=".45" strokeWidth="1.2"/>{type==='cleaning'&&<path d="m11 10 .7 2 1.8.6-1.8.7-.7 2-.7-2-1.8-.7 1.8-.6Z" fill="white"/>}</>}</svg>;
}
export default function WasteCollection({date}:{date:string}){
 const events=wasteCalendar[date];
 const button=useRef<HTMLButtonElement>(null),card=useRef<HTMLDivElement>(null),id=useId();
 const [open,setOpen]=useState(false),[pinned,setPinned]=useState(false),[position,setPosition]=useState({left:0,top:0});
 function show(){const rect=button.current?.getBoundingClientRect();if(!rect)return;const width=Math.min(280,window.innerWidth-24),height=events?.length===2?225:160;setPosition({left:Math.max(12,Math.min(rect.right-width,window.innerWidth-width-12)),top:rect.bottom+height>window.innerHeight?Math.max(12,rect.top-height-8):rect.bottom+8});setOpen(true)}
 function hide(){setOpen(false);setPinned(false)}
 useEffect(()=>{if(!open)return;function outside(e:PointerEvent){if(!button.current?.contains(e.target as Node)&&!card.current?.contains(e.target as Node))hide()}function key(e:KeyboardEvent){if(e.key==='Escape')hide()}document.addEventListener('pointerdown',outside);document.addEventListener('keydown',key);window.addEventListener('scroll',hide,true);window.addEventListener('resize',hide);return()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',key);window.removeEventListener('scroll',hide,true);window.removeEventListener('resize',hide)}},[open]);
 if(!events)return null;
 const label=new Date(date+'T12:00:00').toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'});
 return <><button ref={button} type="button" className={`waste-button ${pinned?'selected':''}`} aria-label={`Waste schedule for ${label}: ${events.map(type=>wasteTypes[type].label).join(', ')}`} aria-expanded={open} aria-describedby={open?id:undefined} onMouseEnter={show} onMouseLeave={()=>{if(!pinned)setOpen(false)}} onFocus={show} onBlur={()=>{if(!pinned)setOpen(false)}} onClick={()=>{if(pinned)hide();else{show();setPinned(true)}}}>{events.map(type=><WasteIcon key={type} type={type}/>)}</button>{open&&createPortal(<div ref={card} id={id} role="tooltip" className="waste-popover" style={position}><p className="eyebrow">WASTE SCHEDULE</p><strong className="waste-date">{label}</strong><ul>{events.map(type=><li key={type}><WasteIcon type={type}/><div><strong>{wasteTypes[type].label}</strong><p>{wasteTypes[type].description}</p></div></li>)}</ul><small>Mertert–Wasserbillig · Municipal calendar 2026</small></div>,document.body)}</>;
}
