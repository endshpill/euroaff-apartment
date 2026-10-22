import {apiReply,apiPreflight,allowedOrigin,PAGES_ORIGIN} from '../../api-cors';
import {env} from 'cloudflare:workers';
import {ACCESS_COOKIE,IDENTITY_COOKIE,cookieValue,configuredPassword,matchesPassword,signIdentity,verifyIdentity} from '../../apartment-session';
export const dynamic='force-dynamic';
const reply=apiReply;
const sameOrigin=allowedOrigin;
function cookie(name:string,value:string,age:number,request:Request){return `${name}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${age}${new URL(request.url).protocol==='https:'?'; Secure':''}`}
export async function POST(request:Request){
 if(!sameOrigin(request))return reply({error:'Invalid request origin.'},403);
 if(!configuredPassword())return reply({error:'Apartment access is not configured yet.'},503);
 let data:any;try{data=await request.json()}catch{return reply({error:'Invalid request.'},400)}
 const name=typeof data?.name==='string'?data.name.trim():'';const password=typeof data?.password==='string'?data.password:'';
 if(!name||name.length>80||password.length>256)return reply({error:'Enter your name and the apartment password.'},400);
 const now=Date.now();const window=Math.floor(now/900000);
 const ip=request.headers.get('cf-connecting-ip')||'unknown';const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(ip));const hash=Array.from(new Uint8Array(bytes)).map(b=>b.toString(16).padStart(2,'0')).join('');
 const attemptKey=hash+':'+window;
 const attempt=await env.DB!.prepare('INSERT INTO access_attempts (key,attempts,expires) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET attempts=access_attempts.attempts+1 RETURNING attempts').bind(attemptKey,now+900000).first<{attempts:number}>();
 if(!attempt||attempt.attempts>10)return reply({error:'Too many attempts. Please try again in 15 minutes.'},429);
 if(!(await matchesPassword(password)))return reply({error:'The password is incorrect. Please try again.'},401);
 await env.DB!.batch([env.DB!.prepare('DELETE FROM access_attempts WHERE key=?').bind(attemptKey),env.DB!.prepare('DELETE FROM access_attempts WHERE expires<?').bind(now)]);
 const crossOrigin=request.headers.get('origin')===PAGES_ORIGIN;
 const old=await verifyIdentity(crossOrigin?(typeof data.identityToken==='string'?data.identityToken:undefined):cookieValue(request.headers.get('cookie'),IDENTITY_COOKIE),'identity');
 const id=old?.id||'guest_'+crypto.randomUUID();
 const accessToken=await signIdentity({id,name,expires:now+30*86400000},'access');const identityToken=await signIdentity({id,name,expires:now+365*86400000},'identity');
 if(crossOrigin)return reply({ok:true,accessToken,identityToken},200);
 const h=new Headers();h.append('Set-Cookie',cookie(ACCESS_COOKIE,accessToken,30*86400,request));h.append('Set-Cookie',cookie(IDENTITY_COOKIE,identityToken,365*86400,request));
 return reply({ok:true},200,h);
}
export async function DELETE(request:Request){if(!sameOrigin(request))return reply({error:'Invalid request origin.'},403);const h=new Headers();h.append('Set-Cookie',cookie(ACCESS_COOKIE,'',0,request));return reply({ok:true},200,h)}

export const OPTIONS=apiPreflight;
