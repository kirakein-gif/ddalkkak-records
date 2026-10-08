const COOKIE='ddalkkak_records_admin';
const MAX_AGE=8*60*60;

function json(data,status=200,headers={}){
  return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store',...headers}});
}
function bytesToHex(bytes){return [...new Uint8Array(bytes)].map(b=>b.toString(16).padStart(2,'0')).join('')}
async function hmac(value,secret){
  const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);
  return bytesToHex(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(value)));
}
function safeEqual(a,b){
  const aa=new TextEncoder().encode(String(a||'')),bb=new TextEncoder().encode(String(b||''));
  if(aa.length!==bb.length)return false;
  let out=0;for(let i=0;i<aa.length;i++)out|=aa[i]^bb[i];return out===0;
}
export async function onRequestPost({request,env}){
  if(!env.MASTER_PASSWORD||!env.ADMIN_SESSION_SECRET)return json({ok:false,error:'ADMIN_SECRET_NOT_CONFIGURED'},503);
  let body={};try{body=await request.json()}catch{}
  if(!safeEqual(body.password,env.MASTER_PASSWORD))return json({ok:false,error:'INVALID_PASSWORD'},401);
  const expires=Date.now()+MAX_AGE*1000;
  const sig=await hmac(String(expires),env.ADMIN_SESSION_SECRET);
  const cookie=`${COOKIE}=${encodeURIComponent(expires+'.'+sig)}; Path=/; Max-Age=${MAX_AGE}; HttpOnly; Secure; SameSite=Strict`;
  return json({ok:true,expiresAt:new Date(expires).toISOString()},200,{'set-cookie':cookie});
}
