(function(g){
  function norm(v){
    return String(v??'')
      .replace(/[\r\n]+/g,' ')
      .replace(/[()\[\]{}·ㆍ,._/\\-]+/g,' ')
      .replace(/\s+/g,'')
      .trim()
      .toLowerCase();
  }
  function statusRank(v){
    const s=String(v??'').replace(/\s+/g,'');
    if(/현존|운영|재학|active/i.test(s))return 0;
    if(/폐지|폐교|폐쇄|closed/i.test(s))return 2;
    return 1;
  }
  function score(input,row){
    const ni=norm(input),nf=norm(row.fullName),nl=norm(row.leafName);
    if(!ni)return 0;
    if(ni===nf)return 1000;
    if(ni===nl)return 900;
    if(nf.endsWith(ni)&&ni.length>=4)return 860;
    if(ni.endsWith(nl)&&nl.length>=4)return 830;
    if(nf.includes(ni)&&ni.length>=4)return 720;
    if(ni.includes(nl)&&nl.length>=4)return 690;
    return 0;
  }
  function resolve(input,rows){
    const candidates=(rows||[]).map(row=>({row,score:score(input,row),statusRank:statusRank(row.status)})).filter(x=>x.score>0);
    if(!candidates.length)return {match:null,ambiguous:false,candidates:[],input:String(input??''),reason:'no-match'};
    candidates.sort((a,b)=>b.score-a.score||a.statusRank-b.statusRank||String(a.row.fullName).localeCompare(String(b.row.fullName),'ko'));
    const first=candidates[0];
    const tied=candidates.filter(x=>x.score===first.score&&x.statusRank===first.statusRank);
    if(tied.length>1)return {match:null,ambiguous:true,candidates:tied.map(x=>x.row),input:String(input??''),reason:'ambiguous'};
    return {match:first.row,ambiguous:false,candidates:candidates.map(x=>x.row),input:String(input??''),reason:first.statusRank===2?'closed-match':'matched'};
  }
  g.DdalkkakOrgResolver={norm,statusRank,score,resolve};
})(window);
