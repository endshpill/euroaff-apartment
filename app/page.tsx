import AccessForm from './access-form';
import {env} from 'cloudflare:workers';
import type {Network} from './wifi';
import Stay from './stay';
import {getChatGPTUser} from './chatgpt-auth';
export const dynamic='force-dynamic';
export default async function Home(){const user=await getChatGPTUser();if(!user)return <AccessForm/>; let networks:Network[]=[];if(user){try{networks=JSON.parse((env as unknown as Record<string,string>).APARTMENT_WIFI||'[]')}catch{networks=[]}} return <Stay networks={networks} user={user?{id:user.userId,name:user.displayName}:null}/>}
