function json(data,status=200){
  return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}});
}
export async function onRequestGet({env}){
  if(!env.DB)return json({ok:false,error:'D1_NOT_CONFIGURED'},503);
  try{
    const {results=[]}=await env.DB.prepare(
      "SELECT id,name,region,audience,description,version,target_type,signature,profile_json,updated_at FROM migration_profiles WHERE status='published' ORDER BY region,name"
    ).all();
    return json({ok:true,profiles:results.map(r=>({...r,profile:JSON.parse(r.profile_json||'{}'),profile_json:undefined}))});
  }catch(err){
    return json({ok:false,error:'PROFILE_LIST_FAILED',message:String(err?.message||err)},500);
  }
}
