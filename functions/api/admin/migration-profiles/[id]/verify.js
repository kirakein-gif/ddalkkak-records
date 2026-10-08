function json(data,status=200){
  return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}});
}
async function ensurePinColumn(env){
  const info=await env.DB.prepare("PRAGMA table_info(migration_profiles)").all();
  if(!(info.results||[]).some(x=>x.name==='pin_hash')){
    await env.DB.prepare("ALTER TABLE migration_profiles ADD COLUMN pin_hash TEXT NOT NULL DEFAULT ''").run();
  }
}
function bytesToHex(bytes){return [...new Uint8Array(bytes)].map(b=>b.toString(16).padStart(2,'0')).join('')}
async function hash(env,id,pin){
  return bytesToHex(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(env.ADMIN_SESSION_SECRET+'|'+id+'|'+pin)));
}
function safeEqual(a,b){a=String(a||'');b=String(b||'');if(a.length!==b.length)return false;let out=0;for(let i=0;i<a.length;i++)out|=a.charCodeAt(i)^b.charCodeAt(i);return out===0}
export async function onRequestPost({request,env,params}){
  if(!env.DB)return json({ok:false,error:'D1_NOT_CONFIGURED'},503);
  if(!env.ADMIN_SESSION_SECRET)return json({ok:false,error:'ADMIN_SECRET_NOT_CONFIGURED'},503);
  try{
    await ensurePinColumn(env);
    let body={};try{body=await request.json()}catch{}
    const pin=String(body.pin||''),id=String(params.id);
    if(!/^\d{4}$/.test(pin))return json({ok:false,error:'INVALID_PIN_FORMAT',message:'4자리 숫자 PIN을 입력해주세요.'},400);
    const row=await env.DB.prepare("SELECT pin_hash FROM migration_profiles WHERE id=?").bind(id).first();
    if(!row)return json({ok:false,error:'NOT_FOUND'},404);
    if(!row.pin_hash)return json({ok:true,legacy:true});
    const expected=await hash(env,id,pin);
    if(!safeEqual(row.pin_hash,expected))return json({ok:false,error:'INVALID_PIN',message:'PIN이 올바르지 않습니다.'},403);
    return json({ok:true});
  }catch(err){return json({ok:false,error:'PIN_VERIFY_FAILED',message:String(err?.message||err)},500)}
}
