const ACCESS_KEY='euroaff_apartment_access';
const IDENTITY_KEY='euroaff_apartment_identity';
function apiBase(){return typeof document==='undefined'?'':document.querySelector<HTMLMetaElement>('meta[name="apartment-api"]')?.content||''}
export function isPagesClient(){return !!apiBase()}
function stored(key:string){try{return localStorage.getItem(key)||''}catch{return ''}}
export function assetPath(path:string){return typeof document==='undefined'?'/'+path:new URL(path,document.baseURI).pathname}
export function restartApp(){window.location.replace(new URL('.',document.baseURI).pathname)}
export async function apiFetch(path:string,init:RequestInit={}){const h=new Headers(init.headers);const base=apiBase();if(base){const token=stored(ACCESS_KEY);if(token)h.set('Authorization','Bearer '+token)}return fetch(base+path,{...init,headers:h,credentials:base?'omit':'same-origin'})}
export async function unlockApartment(name:string,password:string){const r=await apiFetch('/api/access',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,password,...(isPagesClient()?{identityToken:stored(IDENTITY_KEY)}:{})})});const d:any=await r.json();if(!r.ok)throw Error(d.error||'Could not open the calendar.');if(isPagesClient()){if(!d.accessToken||!d.identityToken)throw Error('The booking service needs an update. Please contact the apartment coordinator.');localStorage.setItem(ACCESS_KEY,d.accessToken);localStorage.setItem(IDENTITY_KEY,d.identityToken)}restartApp()}
export async function lockApartment(){if(isPagesClient()){localStorage.removeItem(ACCESS_KEY);restartApp()}else{const r=await apiFetch('/api/access',{method:'DELETE'});if(r.ok)restartApp()}}
