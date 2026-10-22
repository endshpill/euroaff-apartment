import React,{useEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';
import Stay from '../app/stay';
import AccessForm from '../app/access-form';
import {apiFetch,assetPath} from '../app/client-api';
import type {Network} from '../app/wifi';
import '../app/globals.css';
function App(){const [data,setData]=useState<{user:{id:string;name:string};networks:Network[]}|null>(null),[busy,setBusy]=useState(true),[error,setError]=useState('');async function load(){setBusy(true);setError('');try{const r=await apiFetch('/api/session');if(r.status===401){setData(null);return}if(!r.ok)throw Error('The booking service is temporarily unavailable. Please try again.');setData(await r.json() as any)}catch{setError('Could not connect to the booking service. Please check your connection and try again.')}finally{setBusy(false)}}useEffect(()=>{load()},[]);if(busy)return <main className="access-page"><img src={assetPath('euroaff-logo.svg')} alt="EuroAFF" width="165"/><p className="helper">Opening your apartment calendar…</p></main>;if(error)return <main className="access-page"><section className="access-card"><img src={assetPath('euroaff-logo.svg')} alt="EuroAFF" width="165"/><p role="alert" className="formerror">{error}</p><button className="black" onClick={load}>Try again</button></section></main>;return data?<Stay user={data.user} networks={data.networks}/>:<AccessForm/>}
createRoot(document.getElementById('root')!).render(<App/>);
