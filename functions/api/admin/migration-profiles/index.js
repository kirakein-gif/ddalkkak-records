function json(data,status=200){
  return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}});
}
function normalized(body){
  const profile=body?.profile&&typeof body.profile==='object'?body.profile:null;
  if(!profile)throw new Error('표준 작업방식 데이터가 없습니다.');
  const name=String(body.name||profile.name||'').trim();if(!name)throw new Error('작업방식 이름이 필요합니다.');
  const targetType=String(body.target_type||profile.targetType||'').trim();if(!['school','direct','archive'].includes(targetType))throw new Error('표준대장 유형이 올바르지 않습니다.');
  const signature=String(body.signature||profile.signature||'').trim();if(!signature)throw new Error('형식 ID가 없습니다.');
  const pin=String(body.pin||'').trim();if(!/^\d{4}$/.test(pin))throw new Error('4자리 숫자 PIN을 입력해주세요.');
  const status=body.status==='published'?'published':'draft';
  return {
    name,region:String(body.region||'').trim(),audience:String(body.audience||'').trim(),
    description:String(body.description||'').trim(),version:String(body.version||'v1.0').trim()||'v1.0',
    targetType,signature,status,profile,pin
  };
}
async function ensurePinColumn(env){
  const info=await env.DB.prepare("PRAGMA table_info(migration_profiles)").all();
  if(!(info.results||[]).some(x=>x.name==='pin_hash')){
    await env.DB.prepare("ALTER TABLE migration_profiles ADD COLUMN pin_hash TEXT NOT NULL DEFAULT ''").run();
  }
}
function bytesToHex(bytes){return [...new Uint8Array(bytes)].map(b=>b.toString(16).padStart(2,'0')).join('')}
async function pinHash(env,id,pin){
  if(!env.ADMIN_SESSION_SECRET)throw new Error('ADMIN_SESSION_SECRET 설정이 필요합니다.');
  const raw=env.ADMIN_SESSION_SECRET+'|'+id+'|'+pin;
  return bytesToHex(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(raw)));
}
export async function onRequestGet({env}){
  if(!env.DB)return json({ok:false,error:'D1_NOT_CONFIGURED'},503);
  try{
    const {results=[]}=await env.DB.prepare(
      "SELECT id,name,region,audience,description,version,target_type,signature,status,profile_json,created_at,updated_at FROM migration_profiles ORDER BY updated_at DESC"
    ).all();
    return json({ok:true,profiles:results.map(r=>({...r,profile:JSON.parse(r.profile_json||'{}'),profile_json:undefined}))});
  }catch(err){return json({ok:false,error:'PROFILE_LIST_FAILED',message:String(err?.message||err)},500)}
}
export async function onRequestPost({request,env}){
  if(!env.DB)return json({ok:false,error:'D1_NOT_CONFIGURED'},503);
  try{
    await ensurePinColumn(env);
    const v=normalized(await request.json()),id=crypto.randomUUID(),now=new Date().toISOString(),hash=await pinHash(env,id,v.pin);
    await env.DB.prepare(
      "INSERT INTO migration_profiles (id,name,region,audience,description,version,target_type,signature,status,profile_json,pin_hash,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)"
    ).bind(id,v.name,v.region,v.audience,v.description,v.version,v.targetType,v.signature,v.status,JSON.stringify(v.profile),hash,now,now).run();
    return json({ok:true,id},201);
  }catch(err){return json({ok:false,error:'PROFILE_CREATE_FAILED',message:String(err?.message||err)},400)}
}
