import {apiReply,apiPreflight} from '../../api-cors';
import { env } from 'cloudflare:workers';
import { getChatGPTUser } from '../../chatgpt-auth';
export const dynamic='force-dynamic';
const reply=apiReply;
export async function GET(){
 const user=await getChatGPTUser();if(!user)return reply({error:'Sign in to see apartment bookings.'},401);
 const {results}=await env.DB!.prepare('SELECT id, user_id AS userId, name, arrival, departure, note FROM bookings ORDER BY arrival').all();
 return reply({bookings:results});
}
export async function POST(request:Request){
 const user=await getChatGPTUser();if(!user)return reply({error:'Please sign in to book a stay.'},401);
 let data:any;try{data=await request.json()}catch{return reply({error:'Invalid request.'},400)}
 if(!data||typeof data!=='object')return reply({error:'Invalid request.'},400);
 const {arrival,departure}=data;const name=typeof data.name==='string'?data.name.trim():'';const note=typeof data.note==='string'?data.note.trim():'';
 const valid=(s:unknown)=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&!isNaN(Date.parse(s))&&new Date(s).toISOString().slice(0,10)===s;
 const today=new Date().toLocaleDateString('en-CA',{timeZone:'Europe/Luxembourg'});
 if(!valid(arrival)||!valid(departure)||arrival>=departure||arrival<today||!name||name.length>80||note.length>500)return reply({error:'Enter your name and valid future dates. Check-out must follow check-in.'},400);
 const count=(Date.parse(departure)-Date.parse(arrival))/86400000;
 if(count>90)return reply({error:'Please book a maximum of 90 nights at a time.'},400);
 const id=crypto.randomUUID();const db=env.DB!;
 const statements=[db.prepare('INSERT INTO bookings (id,user_id,name,arrival,departure,note,created_at) VALUES (?,?,?,?,?,?,?)').bind(id,user.userId,name,arrival,departure,note,new Date().toISOString())];
 for(let n=0;n<count;n++){const date=new Date(Date.parse(arrival)+n*86400000).toISOString().slice(0,10);statements.push(db.prepare('INSERT INTO nights (date,booking_id) VALUES (?,?)').bind(date,id));}
 try{await db.batch(statements)}catch(e){if(String(e).includes('UNIQUE'))return reply({error:'These dates were just booked. Please choose another stay.'},409);throw e;}
 return reply({id},201);
}
export async function DELETE(request:Request){
 const user=await getChatGPTUser();if(!user)return reply({error:'Please sign in.'},401);
 const id=new URL(request.url).searchParams.get('id');const db=env.DB!;
 const booking=await db.prepare('SELECT user_id FROM bookings WHERE id=?').bind(id).first<{user_id:string}>();
 if(!booking||booking.user_id!==user.userId)return reply({error:'You can only cancel your own bookings.'},403);
 await db.batch([db.prepare('DELETE FROM nights WHERE booking_id=?').bind(id),db.prepare('DELETE FROM bookings WHERE id=? AND user_id=?').bind(id,user.userId)]);
 return reply({ok:true});
}

export const OPTIONS=apiPreflight;
