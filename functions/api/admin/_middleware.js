const COOKIE='ddalkkak_records_admin';
const MAX_AGE_MS=8*60*60*1000;

function json(data,status=200){
  return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}});
}
function cookieValue(header,name){
  const part=String(header||'').split(';').map(x=>x.trim()).find(x=>x.startsWith(name+'='));
  return part?decodeURIComponent(part.slice(name.length+1)):'';
}
function bytesToHex(bytes){return [...new Uint8Array(bytes)].map(b=>b.toString(16).padStart(2,'0')).join('')}
async function hmac(value,secret){
  const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);
  return bytesToHex(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(value)));
}
function safeEqual(a,b){
  if(a.length!==b.length)return false;
  let out=0;for(let i=0;i<a.length;i++)out|=a.charCodeAt(i)^b.charCodeAt(i);return out===0;
}
async function validSession(request,env){
  if(!env.ADMIN_SESSION_SECRET)return false;
  const token=cookieValue(request.headers.get('cookie'),COOKIE);
  const m=token.match(/^(\d+)\.([0-9a-f]{64})$/);if(!m)return false;
  const expires=Number(m[1]);if(!Number.isFinite(expires)||Date.now()>expires||expires-Date.now()>MAX_AGE_MS+60000)return false;
  const expected=await hmac(String(expires),env.ADMIN_SESSION_SECRET);
  return safeEqual(m[2],expected);
}
export async function onRequest(context){
  const path=new URL(context.request.url).pathname;
  if(path.endsWith('/api/admin/login'))return context.next();
  if(await validSession(context.request,context.env))return context.next();
  return json({ok:false,error:'UNAUTHORIZED'},401);
}
