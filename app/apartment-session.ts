import {env} from 'cloudflare:workers';
import {headers} from 'next/headers';
export type ApartmentIdentity={id:string;name:string;expires:number};
export const ACCESS_COOKIE='euroaff_access';
export const IDENTITY_COOKIE='euroaff_identity';
function config(){const e=env as unknown as Record<string,string>;return {password:e.APARTMENT_ACCESS_PASSWORD,secret:e.APARTMENT_SESSION_SECRET}}
export function configuredPassword(){return config().password||''}
const encode=(value:Uint8Array)=>btoa(String.fromCharCode(...value)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
function decode(s:string){return Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0))}
async function key(kind:'access'|'identity') {const {password,secret}=config();if(!secret||!password)throw Error('Apartment access is not configured.');return crypto.subtle.importKey('raw',new TextEncoder().encode(kind==='access'?`${secret}:${password}`:secret),{name:'HMAC',hash:'SHA-256'},false,['sign','verify'])}
export async function signIdentity(data:ApartmentIdentity,kind:'access'|'identity') {const payload=encode(new TextEncoder().encode(JSON.stringify(data)));const signature=await crypto.subtle.sign('HMAC',await key(kind),new TextEncoder().encode(payload));return payload+'.'+encode(new Uint8Array(signature))}
export async function verifyIdentity(token:string|undefined,kind:'access'|'identity'):Promise<ApartmentIdentity|null>{try{if(!token||token.length>2048)return null;const parts=token.split('.');if(parts.length!==2)return null;const [payload,sig]=parts;const valid=await crypto.subtle.verify('HMAC',await key(kind),decode(sig),new TextEncoder().encode(payload));if(!valid)return null;const data=JSON.parse(new TextDecoder().decode(decode(payload)));if(typeof data.id!=='string'||typeof data.name!=='string'||data.name.length>80||!data.name||typeof data.expires!=='number'||data.expires<Date.now())return null;return data}catch{return null}}
export function cookieValue(raw:string|null,key:string){return raw?.split(';').map(s=>s.trim()).find(s=>s.startsWith(key+'='))?.slice(key.length+1)}
export async function getApartmentSession(){const h=await headers();const auth=h.get('authorization');return verifyIdentity(auth?.startsWith('Bearer ')?auth.slice(7):cookieValue(h.get('cookie'),ACCESS_COOKIE),'access')}
export async function matchesPassword(value:string){const expected=configuredPassword();if(!expected)return false;const a=new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)));const b=new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(expected)));let diff=0;for(let i=0;i<a.length;i++)diff|=a[i]^b[i];return diff===0}

// A shared-password workspace identifies colleagues by their normalised login name.
export function normalizeName(name:string){return name.normalize('NFKC').trim().replace(/\s+/g,' ').toLowerCase()}
export async function personId(name:string){const signature=await crypto.subtle.sign('HMAC',await key('identity'),new TextEncoder().encode('apartment-person:'+normalizeName(name)));return 'person_'+Array.from(new Uint8Array(signature)).map(b=>b.toString(16).padStart(2,'0')).join('')}
