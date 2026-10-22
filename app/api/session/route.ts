import {env} from 'cloudflare:workers';
import {getChatGPTUser} from '../../chatgpt-auth';
import {apiReply,apiPreflight} from '../../api-cors';
export const dynamic='force-dynamic';
export async function GET(){const user=await getChatGPTUser();if(!user)return apiReply({error:'Enter the apartment password to continue.'},401);let networks=[];try{networks=JSON.parse((env as unknown as Record<string,string>).APARTMENT_WIFI||'[]')}catch{}return apiReply({user:{id:user.userId,name:user.displayName},networks})}
export const OPTIONS=apiPreflight;
