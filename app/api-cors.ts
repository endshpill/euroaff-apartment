import {headers} from 'next/headers';
// Only this repository owner's GitHub Pages origin may use the remote API.
export const PAGES_ORIGIN='https://endshpill.github.io';
export function allowedOrigin(request:Request){const origin=request.headers.get('origin');return !origin||origin===new URL(request.url).origin||origin===PAGES_ORIGIN}
export async function apiReply(value:unknown,status=200,extra?:Headers){const h=extra||new Headers();h.set('Cache-Control','no-store');h.set('Vary','Origin');const requestHeaders=await headers();if(requestHeaders.get('origin')===PAGES_ORIGIN)h.set('Access-Control-Allow-Origin',PAGES_ORIGIN);return Response.json(value,{status,headers:h})}
export function apiPreflight(request:Request){if(request.headers.get('origin')!==PAGES_ORIGIN)return new Response(null,{status:403});return new Response(null,{status:204,headers:{'Access-Control-Allow-Origin':PAGES_ORIGIN,'Access-Control-Allow-Methods':'GET, POST, PUT, DELETE, OPTIONS','Access-Control-Allow-Headers':'Authorization, Content-Type','Access-Control-Max-Age':'600','Vary':'Origin'}})}
