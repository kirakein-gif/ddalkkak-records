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
async function pinHash(env,id,pin){
  if(!env.ADMIN_SESSION_SECRET)throw new Error('ADMIN_SESSION_SECRET 설정이 필요합니다.');
  return bytesToHex(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(env.ADMIN_SESSION_SECRET+'|'+id+'|'+pin)));
}
function safeEqual(a,b){
  a=String(a||'');b=String(b||'');if(a.length!==b.length)return false;
  let out=0;for(let i=0;i<a.length;i++)out|=a.charCodeAt(i)^b.charCodeAt(i);return out===0;
}
async function assertPin(env,id,pin){
  if(!/^\d{4}$/.test(String(pin||'')))throw Object.assign(new Error('4자리 숫자 PIN을 입력해주세요.'),{status:401});
  await ensurePinColumn(env);
  const row=await env.DB.prepare("SELECT pin_hash FROM migration_profiles WHERE id=?").bind(id).first();
  if(!row)throw Object.assign(new Error('작업방식을 찾지 못했습니다.'),{status:404});
  if(!row.pin_hash){
    const hash=await pinHash(env,id,String(pin));
    await env.DB.prepare("UPDATE migration_profiles SET pin_hash=? WHERE id=?").bind(hash,id).run();
    return;
  }
  const expected=await pinHash(env,id,String(pin));
  if(!safeEqual(row.pin_hash,expected))throw Object.assign(new Error('PIN이 올바르지 않습니다.'),{status:403});
}
function normalized(body){
  const profile=body?.profile&&typeof body.profile==='object'?body.profile:null;
  if(!profile)throw new Error('표준 작업방식 데이터가 없습니다.');
  const name=String(body.name||profile.name||'').trim();if(!name)throw new Error('작업방식 이름이 필요합니다.');
  const targetType=String(body.target_type||profile.targetType||'').trim();if(!['school','direct','archive'].includes(targetType))throw new Error('표준대장 유형이 올바르지 않습니다.');
  const signature=String(body.signature||profile.signature||'').trim();if(!signature)throw new Error('형식 ID가 없습니다.');
  return {
    name,region:String(body.region||'').trim(),audience:String(body.audience||'').trim(),
    description:String(body.description||'').trim(),version:String(body.version||'v1.0').trim()||'v1.0',
    targetType,signature,status:body.status==='published'?'published':'draft',profile
  };
}
export async function onRequestPut({request,env,params}){
  if(!env.DB)return json({ok:false,error:'D1_NOT_CONFIGURED'},503);
  try{
    const body=await request.json(),id=String(params.id);
    await assertPin(env,id,body.pin);
    const v=normalized(body),now=new Date().toISOString();
    const result=await env.DB.prepare(
      "UPDATE migration_profiles SET name=?,region=?,audience=?,description=?,version=?,target_type=?,signature=?,status=?,profile_json=?,updated_at=? WHERE id=?"
    ).bind(v.name,v.region,v.audience,v.description,v.version,v.targetType,v.signature,v.status,JSON.stringify(v.profile),now,id).run();
    if(!result.meta?.changes)return json({ok:false,error:'NOT_FOUND'},404);
    return json({ok:true,id});
  }catch(err){return json({ok:false,error:'PROFILE_UPDATE_FAILED',message:String(err?.message||err)},err.status||400)}
}
export async function onRequestDelete({request,env,params}){
  if(!env.DB)return json({ok:false,error:'D1_NOT_CONFIGURED'},503);
  try{
    let body={};try{body=await request.json()}catch{}
    const id=String(params.id);await assertPin(env,id,body.pin);
    const result=await env.DB.prepare("DELETE FROM migration_profiles WHERE id=?").bind(id).run();
    if(!result.meta?.changes)return json({ok:false,error:'NOT_FOUND'},404);
    return json({ok:true});
  }catch(err){return json({ok:false,error:'PROFILE_DELETE_FAILED',message:String(err?.message||err)},err.status||500)}
}
