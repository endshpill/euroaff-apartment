'use client';
import {useEffect,useId,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {Trash2} from 'lucide-react';
import {wasteCalendar,wasteTypes} from './waste-calendar';
export default function WasteCollection({date}:{date:string}){
 const events=wasteCalendar[date];
 const button=useRef<HTMLButtonElement>(null),card=useRef<HTMLDivElement>(null),id=useId();
 const [open,setOpen]=useState(false),[pinned,setPinned]=useState(false),[position,setPosition]=useState({left:0,top:0});
 function show(){const rect=button.current?.getBoundingClientRect();if(!rect)return;const width=Math.min(280,window.innerWidth-24),height=events?.length===2?225:160;setPosition({left:Math.max(12,Math.min(rect.right-width,window.innerWidth-width-12)),top:rect.bottom+height>window.innerHeight?Math.max(12,rect.top-height-8):rect.bottom+8});setOpen(true)}
 function hide(){setOpen(false);setPinned(false)}
 useEffect(()=>{if(!open)return;function outside(e:PointerEvent){if(!button.current?.contains(e.target as Node)&&!card.current?.contains(e.target as Node))hide()}function key(e:KeyboardEvent){if(e.key==='Escape')hide()}document.addEventListener('pointerdown',outside);document.addEventListener('keydown',key);window.addEventListener('scroll',hide,true);window.addEventListener('resize',hide);return()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',key);window.removeEventListener('scroll',hide,true);window.removeEventListener('resize',hide)}},[open]);
 if(!events)return null;
 const label=new Date(date+'T12:00:00').toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'});
 return <><button ref={button} type="button" className={`waste-button ${pinned?'selected':''}`} aria-label={`Waste schedule for ${label}: ${events.map(type=>wasteTypes[type].label).join(', ')}`} aria-expanded={open} aria-describedby={open?id:undefined} onMouseEnter={show} onMouseLeave={()=>{if(!pinned)setOpen(false)}} onFocus={show} onBlur={()=>{if(!pinned)setOpen(false)}} onClick={()=>{if(pinned)hide();else{show();setPinned(true)}}}><Trash2 size={13}/><span>{events.length}</span></button>{open&&createPortal(<div ref={card} id={id} role="tooltip" className="waste-popover" style={position}><p className="eyebrow">WASTE SCHEDULE</p><strong className="waste-date">{label}</strong><ul>{events.map(type=><li key={type}><Trash2 size={14}/><div><strong>{wasteTypes[type].label}</strong><p>{wasteTypes[type].description}</p></div></li>)}</ul><small>Mertert–Wasserbillig · Municipal calendar 2026</small></div>,document.body)}</>;
}
