(() => {
  const app = document.getElementById('app');
  const beers = window.BEER_DB || [];

  const state = {
    screen: 'landing', birth: {date:'', time:'', unknownTime:false, city:'서울', lat:37.5665, lon:126.9780, utcOffset:9},
    qIndex:0, answers:{}, natal:null, tasteScores:[], natalScores:[]
  };

  const cities = [
    ['서울',37.5665,126.9780],['부산',35.1796,129.0756],['대구',35.8714,128.6014],['인천',37.4563,126.7052],
    ['광주',35.1595,126.8526],['대전',36.3504,127.3845],['울산',35.5384,129.3114],['세종',36.4800,127.2890],
    ['수원',37.2636,127.0286],['성남',37.4200,127.1265],['고양',37.6584,126.8320],['용인',37.2411,127.1776],
    ['제주',33.4996,126.5312],['춘천',37.8813,127.7298],['강릉',37.7519,128.8761],['청주',36.6424,127.4890],
    ['전주',35.8242,127.1480],['포항',36.0190,129.3435]
  ];

  const questions = [
    {id:'q1', title:'평소 어떤 맛의 맥주가 가장 끌리나요?', options:[
      ['A','🍯 부드럽고 살짝 달콤한 맛'],['B','🌿 깔끔하면서 살짝 쌉쌀한 맛'],['C','🍋 상큼하고 새콤한 맛'],['D','🌲 홉의 쌉쌀함이 확실한 맛']]},
    {id:'q2', title:'맥주 향은 어느 정도였으면 좋겠나요?', options:[
      ['A','깔끔해서 향은 거의 없어도 좋아요'],['B','은은하게 느껴지는 정도가 좋아요'],['C','과일이나 꽃 향이 확실하게 느껴졌으면 해요'],['D','향부터 “와, 이거 뭐지?” 싶을 정도로 강한 게 좋아요']]},
    {id:'q3', title:'입안에서 느껴지는 맥주의 무게감은 어느 쪽이 좋나요?', options:[
      ['A','🫧 아주 가볍고 시원하게'],['B','🍺 가볍지만 맥주다운 느낌'],['C','🥨 적당히 묵직하고 풍성하게'],['D','🍫 진하고 꽉 차게']]},
    {id:'q4', title:'탄산감은 어느 정도가 가장 좋나요?', options:[
      ['A','부드럽고 약하게'],['B','적당하게'],['C','톡톡 터지는 청량감'],['D','아주 강하고 시원하게']]},
    {id:'q5', title:'새로운 맥주를 만났을 때 나는?', options:[
      ['A','🛡 익숙하고 실패 없는 맛이 좋아요'],['B','🙂 조금 다른 정도는 괜찮아요'],['C','👀 안 마셔본 스타일도 즐겨요'],['D','🚀 독특할수록 더 궁금해요']]},
    {id:'q6', title:'오늘 맥주는 누구와 마시나요?', options:[
      ['A','🏠 혼자 편하게'],['B','💕 연인이나 친한 한 사람과'],['C','👯 친구들과 가볍게'],['D','🎉 여럿이 시끌벅적하게']]},
    {id:'q7', title:'오늘 맥주와 함께할 음식은?', options:[
      ['A','🍗 치킨·튀김·피자'],['B','🥩 고기·바비큐·소시지'],['C','🥗 샐러드·해산물'],['D','🧀 치즈·과일·디저트 또는 안주 없이']]},
    {id:'q8', title:'지금 기분에 가장 가까운 것은?', options:[
      ['A','😌 편하게 쉬고 싶어요'],['B','😆 기분을 확 올리고 싶어요'],['C','🌙 조용히 분위기를 즐기고 싶어요'],['D','✨ 오늘은 조금 특별한 걸 마시고 싶어요']]},
    {id:'q9', title:'오늘은 어떻게 마시고 싶나요?', options:[
      ['A','🧊 시원하고 가볍게 한두 잔'],['B','🍽 음식과 천천히'],['C','🍻 여러 잔 오래 마시기'],['D','🥃 한 잔이어도 강렬하게']]}
  ];

  const tasteMap = {
    q1:{A:{bitterness:1,sweetness:4,acidity:1},B:{bitterness:3,sweetness:1,acidity:1},C:{bitterness:1,sweetness:3,acidity:5,adventure:3},D:{bitterness:5,sweetness:1,acidity:1,adventure:4}},
    q2:{A:{aroma:1,adventure:1},B:{aroma:2,adventure:2},C:{aroma:4,adventure:3},D:{aroma:5,adventure:5}},
    q3:{A:{body:1},B:{body:2},C:{body:4},D:{body:5}},
    q4:{A:{carbonation:1},B:{carbonation:3},C:{carbonation:4},D:{carbonation:5}},
    q5:{A:{adventure:1,beginner:5},B:{adventure:2,beginner:4},C:{adventure:4,beginner:3},D:{adventure:5,beginner:1}}
  };

  const situationMap = {
    q6:{A:{styles:['스타우트·포터','벨기에 에일','앰버·다크 라거'], occasions:['혼술','조용한 밤'], strength:1},B:{styles:['위트비어','사워·과일 맥주','벨기에 에일'],occasions:['데이트','특별한 식사'],strength:1},C:{styles:['바이젠','페일 에일','세션·라이트 IPA','IPA'],occasions:['친구 모임','캐주얼 모임'],strength:1},D:{styles:['청량 라거','필스너','위트비어'],occasions:['파티','회식'],strength:1}},
    q7:{A:{styles:['필스너','페일 에일','IPA'],foods:['치킨','튀김','피자'],strength:1.2},B:{styles:['앰버·다크 라거','스타우트·포터','벨기에 에일'],foods:['바비큐','소시지','스테이크'],strength:1.2},C:{styles:['청량 라거','헬레스·몰티 라거','위트비어'],foods:['샐러드','해산물','회'],strength:1.2},D:{styles:['사워·과일 맥주','스타우트·포터','벨기에 에일'],foods:['치즈','과일','디저트'],strength:1.1}},
    q8:{A:{styles:['헬레스·몰티 라거','바이젠','청량 라거'],occasions:['편안한 저녁'],strength:1},B:{styles:['IPA','필스너','위트비어'],occasions:['파티'],strength:1},C:{styles:['스타우트·포터','앰버·다크 라거','벨기에 에일'],occasions:['조용한 밤','특별한 저녁'],strength:1},D:{styles:['사워·과일 맥주','벨기에 에일','IPA'],occasions:['특별한 식사','취향 탐험'],strength:1.2}},
    q9:{A:{styles:['청량 라거','필스너','위트비어'],maxAbv:6,strength:1.2},B:{occasions:['식사 반주'],strength:1.1},C:{styles:['세션·라이트 IPA','청량 라거','페일 에일'],maxAbv:5.5,strength:1.4},D:{styles:['벨기에 에일','스타우트·포터','IPA'],minAbv:7,strength:1.3}}
  };

  const signBase = {
    Aries:[2,5,3,4,5,'대담함·속도·시작','불','활동궁'], Taurus:[5,2,5,2,1,'안정·감각·풍요','흙','고정궁'], Gemini:[2,3,4,5,5,'호기심·재치·다양성','바람','변통궁'],
    Cancer:[5,2,4,2,2,'보호·정서·편안함','물','활동궁'], Leo:[3,5,4,5,4,'자신감·화려함·표현','불','고정궁'], Virgo:[5,2,3,2,2,'정돈·섬세함·절제','흙','변통궁'],
    Libra:[3,3,5,5,3,'세련됨·균형·사교','바람','활동궁'], Scorpio:[3,5,5,1,4,'강렬함·신비·깊이','물','고정궁'], Sagittarius:[1,5,3,5,5,'자유·탐험·낙천','불','변통궁'],
    Capricorn:[5,3,3,2,2,'전통·성취·절제','흙','활동궁'], Aquarius:[2,3,4,4,5,'독창성·지적·실험','바람','고정궁'], Pisces:[3,2,5,3,4,'낭만·공감·몽환','물','변통궁']
  };
  const signKo = ['양자리','황소자리','쌍둥이자리','게자리','사자자리','처녀자리','천칭자리','전갈자리','사수자리','염소자리','물병자리','물고기자리'];
  const signEn = Object.keys(signBase);
  const planetMod = { Venus:[0,0,.8,0,.2], Sun:[0,0,0,0,0], Moon:[.7,-.2,.4,-.3,-.2], Asc:[-.1,.3,.1,.8,.2], Mars:[-.5,1,0,.2,1] };
  const modalityMod = {'활동궁':[-.2,.3,0,.2,.4],'고정궁':[.5,.2,.3,-.1,-.2],'변통궁':[-.2,.1,.2,.2,.5]};
  const elementMap = {'불':[2,5,3,5,5],'흙':[5,2,4,2,1],'바람':[2,3,4,5,5],'물':[4,2,5,2,3]};

  function clamp(v,a=1,b=5){ return Math.max(a,Math.min(b,v)); }
  function norm360(x){ return ((x%360)+360)%360; }
  function rad(x){ return x*Math.PI/180; }
  function deg(x){ return x*180/Math.PI; }
  function signFromLon(lon){ return signEn[Math.floor(norm360(lon)/30)]; }
  function zodiacLabel(sign){ return signKo[signEn.indexOf(sign)]; }

  // Low-precision browser-side astronomy, sufficient for entertainment-style zodiac placement.
  function julianDay(dateUTC){ return dateUTC.getTime()/86400000 + 2440587.5; }
  function dayNumber(dateUTC){ return julianDay(dateUTC) - 2451543.5; }
  function solveE(Mdeg,e){ const M=rad(norm360(Mdeg)); let E=M+e*Math.sin(M)*(1+e*Math.cos(M)); for(let i=0;i<5;i++) E=E-(E-e*Math.sin(E)-M)/(1-e*Math.cos(E)); return E; }
  function sunLon(d){ const w=282.9404+4.70935e-5*d,e=.016709-1.151e-9*d,M=356.0470+.9856002585*d,E=solveE(M,e); const x=Math.cos(E)-e,y=Math.sqrt(1-e*e)*Math.sin(E); return norm360(deg(Math.atan2(y,x))+w); }
  function helio(body,d){
    let N,i,w,a,e,M;
    if(body==='Venus'){N=76.6799+2.46590e-5*d;i=3.3946+2.75e-8*d;w=54.8910+1.38374e-5*d;a=.723330;e=.006773-1.302e-9*d;M=48.0052+1.6021302244*d;}
    else {N=49.5574+2.11081e-5*d;i=1.8497-1.78e-8*d;w=286.5016+2.92961e-5*d;a=1.523688;e=.093405+2.516e-9*d;M=18.6021+.5240207766*d;}
    const E=solveE(M,e),xv=a*(Math.cos(E)-e),yv=a*Math.sqrt(1-e*e)*Math.sin(E),v=Math.atan2(yv,xv),r0=Math.sqrt(xv*xv+yv*yv);
    const Nr=rad(N),ir=rad(i),vw=v+rad(w);
    return {x:r0*(Math.cos(Nr)*Math.cos(vw)-Math.sin(Nr)*Math.sin(vw)*Math.cos(ir)),y:r0*(Math.sin(Nr)*Math.cos(vw)+Math.cos(Nr)*Math.sin(vw)*Math.cos(ir)),z:r0*Math.sin(vw)*Math.sin(ir)};
  }
  function planetLon(body,d){ const p=helio(body,d), sl=sunLon(d), ws=282.9404+4.70935e-5*d, es=.016709-1.151e-9*d, Ms=356.0470+.9856002585*d, E=solveE(Ms,es), xs=Math.cos(E)-es, ys=Math.sqrt(1-es*es)*Math.sin(E), rs=Math.sqrt(xs*xs+ys*ys), sunx=rs*Math.cos(rad(sl)), suny=rs*Math.sin(rad(sl)); return norm360(deg(Math.atan2(p.y+suny,p.x+sunx))); }
  function moonLon(d){
    const N=125.1228-.0529538083*d,i=5.1454,w=318.0634+.1643573223*d,a=60.2666,e=.0549,M=115.3654+13.0649929509*d,E=solveE(M,e);
    const xv=a*(Math.cos(E)-e),yv=a*Math.sqrt(1-e*e)*Math.sin(E),v=Math.atan2(yv,xv),r0=Math.sqrt(xv*xv+yv*yv),Nr=rad(N),ir=rad(i),vw=v+rad(w);
    let xh=r0*(Math.cos(Nr)*Math.cos(vw)-Math.sin(Nr)*Math.sin(vw)*Math.cos(ir)), yh=r0*(Math.sin(Nr)*Math.cos(vw)+Math.cos(Nr)*Math.sin(vw)*Math.cos(ir));
    let lon=norm360(deg(Math.atan2(yh,xh))); const Lm=norm360(N+w+M), Ls=sunLon(d), D=norm360(Lm-Ls), F=norm360(Lm-N), Ms=norm360(356.0470+.9856002585*d);
    const s=x=>Math.sin(rad(x));
    lon += -1.274*s(M-2*D)+.658*s(2*D)-.186*s(Ms)-.059*s(2*M-2*D)-.057*s(M-2*D+Ms)+.053*s(M+2*D)+.046*s(2*D-Ms)+.041*s(M-Ms)-.035*s(D)-.031*s(M+Ms)-.015*s(2*F-2*D)+.011*s(M-4*D);
    return norm360(lon);
  }
  function ascLon(dateUTC,lat,lon){ const jd=julianDay(dateUTC),T=(jd-2451545)/36525,gmst=norm360(280.46061837+360.98564736629*(jd-2451545)+.000387933*T*T-T*T*T/38710000),theta=rad(norm360(gmst+lon)),phi=rad(lat),eps=rad(23.439291-.0130042*T); return norm360(deg(Math.atan2(Math.cos(theta),-(Math.sin(theta)*Math.cos(eps)+Math.tan(phi)*Math.sin(eps))))); }

  function buildNatal(){
    const b=state.birth; const [y,m,d]=b.date.split('-').map(Number); let hh=12,mm=0; if(!b.unknownTime && b.time){[hh,mm]=b.time.split(':').map(Number);} const utcMs=Date.UTC(y,m-1,d,hh-b.utcOffset,mm,0); const dt=new Date(utcMs), dn=dayNumber(dt);
    const placements={Sun:signFromLon(sunLon(dn)),Moon:signFromLon(moonLon(dn)),Venus:signFromLon(planetLon('Venus',dn)),Mars:signFromLon(planetLon('Mars',dn))};
    if(!b.unknownTime) placements.Asc=signFromLon(ascLon(dt,b.lat,b.lon));
    const weights={Venus:.25,Sun:.20,Moon:.20,Asc:.15,Element:.10,Mars:.10}; if(!placements.Asc){delete weights.Asc; const s=Object.values(weights).reduce((a,b)=>a+b,0); Object.keys(weights).forEach(k=>weights[k]/=s);}
    const vec=[0,0,0,0,0], tones=[]; let planetWeight=0;
    Object.entries(placements).forEach(([p,sign])=>{ const base=signBase[sign], mod=planetMod[p], modal=modalityMod[base[7]], arr=base.slice(0,5).map((v,i)=>clamp(v+(mod?.[i]||0)+(modal?.[i]||0))); const w=weights[p]||0; arr.forEach((v,i)=>vec[i]+=v*w); planetWeight+=w; tones.push({tone:base[5],weight:w,sign,p}); });
    const counts={불:0,흙:0,바람:0,물:0}; Object.values(placements).forEach(s=>counts[signBase[s][6]]++); const n=Object.values(counts).reduce((a,b)=>a+b,0); const elem=[0,0,0,0,0]; Object.entries(counts).forEach(([e,c])=>elementMap[e].forEach((v,i)=>elem[i]+=v*(c/n))); elem.forEach((v,i)=>vec[i]+=v*(weights.Element||0));
    return {placements,vector:vec.map(v=>+v.toFixed(2)),tones:tones.sort((a,b)=>b.weight-a.weight),elementCounts:counts};
  }

  function buildTasteProfile(){
    const sums={}, counts={}; ['q1','q2','q3','q4','q5'].forEach(q=>{ const m=tasteMap[q]?.[state.answers[q]]||{}; Object.entries(m).forEach(([k,v])=>{sums[k]=(sums[k]||0)+v;counts[k]=(counts[k]||0)+1;}); });
    const profile={}; Object.keys(sums).forEach(k=>profile[k]=sums[k]/counts[k]); return profile;
  }
  function similarity(a,b){ return Math.max(0,100-(Math.abs(a-b)/4)*100); }
  function includesAny(text,arr=[]){ const t=(text||'').toLowerCase(); return arr.some(x=>t.includes(String(x).toLowerCase())); }
  function scoreTasteBeer(beer,profile){
    const dimensions=[['bitterness',.10],['sweetness',.10],['acidity',.10],['aroma',.15],['body',.15],['carbonation',.10],['adventure',.10],['beginner',.05]];
    let weighted=0,wTotal=0; dimensions.forEach(([k,w])=>{if(profile[k]!=null && beer[k]!=null){weighted+=similarity(profile[k],beer[k])*w;wTotal+=w;}}); let sensory=wTotal?weighted/wTotal:50;
    let bonus=0, maxBonus=0;
    ['q6','q7','q8','q9'].forEach(q=>{const cfg=situationMap[q]?.[state.answers[q]]; if(!cfg)return; const str=cfg.strength||1; maxBonus+=5*str; if(cfg.styles?.includes(beer.styleMajor)) bonus+=2.2*str; if(cfg.foods && includesAny(beer.foodTags,cfg.foods)) bonus+=2.2*str; if(cfg.occasions && includesAny(beer.occasionTags,cfg.occasions)) bonus+=1.5*str; if(cfg.maxAbv!=null) bonus+=(beer.abv<=cfg.maxAbv?2:-2)*str; if(cfg.minAbv!=null) bonus+=(beer.abv>=cfg.minAbv?2:-2)*str; });
    const situationScore=50+50*(bonus/Math.max(1,maxBonus)); return clamp(sensory*.80+situationScore*.20,0,100);
  }
  function toneCategories(text){ const rules={
    활기:['활기','활동','에너지','속도','쾌활','낙천','밝음'], 대담:['대담','강렬','도전','반항','자신감','표현'], 자유:['자유','탐험','모험','독립'],
    사교:['사교','친근','친화','유쾌','캐주얼'], 안정:['안정','편안','온화','전통','절제','정돈','균형','포근'], 감각:['감각','화려','세련','풍요','우아','예술'],
    깊이:['깊이','성찰','신비','집중','성숙'], 지적:['지적','호기심','재치','탐구','독창','실험','창의'], 낭만:['낭만','로맨틱','감성','정서','공감','몽환','화사']
    }; return Object.entries(rules).filter(([,ks])=>ks.some(k=>(text||'').includes(k))).map(([c])=>c); }
  function scoreNatalBeer(beer,natal){ const bv=[beer.natalStability,beer.natalStimulation,beer.natalSensory,beer.natalSocial,beer.natalAdventure]; const vector= bv.reduce((s,v,i)=>s+similarity(v,natal.vector[i]),0)/5; const userCats=new Set(natal.tones.slice(0,3).flatMap(x=>toneCategories(x.tone))); const beerCats=new Set(toneCategories((beer.natalTone||'')+' '+(beer.natalTags||''))); const overlap=[...userCats].filter(x=>beerCats.has(x)).length; const tone=userCats.size?Math.min(100,(overlap/userCats.size)*150):50; return vector*.90+tone*.10; }

  function calculateResults(){ state.natal=buildNatal(); const profile=buildTasteProfile(); state.tasteScores=beers.map(b=>({...b,tasteScore:scoreTasteBeer(b,profile)})).sort((a,b)=>b.tasteScore-a.tasteScore); state.natalScores=state.tasteScores.filter(b=>b.tasteScore>=60).map(b=>({...b,natalScore:scoreNatalBeer(b,state.natal)})).map(b=>({...b,starScore:b.tasteScore*.45+b.natalScore*.55})).sort((a,b)=>b.starScore-a.starScore); }

  function nav(screen){state.screen=screen;render();window.scrollTo({top:0,behavior:'smooth'});} 
  function render(){ if(state.screen==='landing')return landing(); if(state.screen==='birth')return birth(); if(state.screen==='questions')return question(); if(state.screen==='loading')return loading(); if(state.screen==='result')return result(); }
  function landing(){ app.innerHTML=`<section class="card hero"><div class="brand"><span class="beer-dot"></span>별맥 · STAR & BEER</div><h1>오늘, 별자리는 당신에게<br>어떤 맥주를 추천해 줄까요?</h1><p class="lead">취향과 오늘의 상황, 그리고 태어난 순간의 별을 분석해<br>두 가지 맥주를 추천해 드려요.</p><div style="height:22px"></div><button class="primary" id="start">내 맥주 찾기</button><p class="privacy">입력한 생년월일과 출생 정보는 저장하지 않아요.</p></section>`; document.getElementById('start').onclick=()=>nav('birth'); }
  function birth(){ const opts=cities.map(([n])=>`<option ${n===state.birth.city?'selected':''}>${n}</option>`).join(''); app.innerHTML=`<section class="card"><div class="smallcaps">Birth chart</div><h2>태어난 순간의 별을 찾아볼게요.</h2><p class="lead">정확한 출생시간을 알면 상승궁까지 함께 분석해요.</p><div class="stack" style="margin-top:24px"><div class="field"><label>생년월일</label><input id="date" type="date" value="${state.birth.date}"></div><div class="field"><label>출생 시간</label><input id="time" type="time" value="${state.birth.time}" ${state.birth.unknownTime?'disabled':''}></div><label class="checkbox"><input id="unknown" type="checkbox" ${state.birth.unknownTime?'checked':''}> 태어난 시간을 몰라요</label><div class="field"><label>출생 지역</label><select id="city">${opts}</select><div class="hint">MVP에서는 국내 주요 도시를 지원합니다.</div></div><div class="field"><label>출생 당시 UTC 시차</label><select id="tz">${[9,8,7,6,5.5,5,4,3,2,1,0,-1,-2,-3,-4,-5,-6,-7,-8].map(v=>`<option value="${v}" ${v===state.birth.utcOffset?'selected':''}>UTC${v>=0?'+':''}${v}</option>`).join('')}</select></div><div id="err"></div><button class="primary" id="next">다음</button></div><p class="footer-note">출생 정보는 추천 계산을 위해 현재 브라우저 메모리에서만 사용되며 저장·전송하지 않습니다.</p></section>`;
    const unknown=document.getElementById('unknown'),time=document.getElementById('time'); unknown.onchange=()=>{time.disabled=unknown.checked}; document.getElementById('next').onclick=()=>{const date=document.getElementById('date').value, tm=time.value; if(!date){document.getElementById('err').innerHTML='<div class="error">생년월일을 입력해 주세요.</div>';return;} if(!unknown.checked&&!tm){document.getElementById('err').innerHTML='<div class="error">출생시간을 입력하거나 ‘태어난 시간을 몰라요’를 선택해 주세요.</div>';return;} const city=document.getElementById('city').value,c=cities.find(x=>x[0]===city); state.birth={date,time:tm,unknownTime:unknown.checked,city,lat:c[1],lon:c[2],utcOffset:Number(document.getElementById('tz').value)}; state.qIndex=0; nav('questions');}; }
  function question(){ const q=questions[state.qIndex], pct=((state.qIndex+1)/questions.length)*100; app.innerHTML=`<section class="card question-card"><div class="topbar"><span class="progress-label">질문 ${state.qIndex+1} / ${questions.length}</span><span class="progress-label">${Math.round(pct)}%</span></div><div class="progress"><span style="width:${pct}%"></span></div><div style="height:30px"></div><h2>${q.title}</h2><div class="options">${q.options.map(([id,txt])=>`<button class="option ${state.answers[q.id]===id?'selected':''}" data-id="${id}">${txt}</button>`).join('')}</div>${state.qIndex>0?'<button class="secondary" id="prev">이전</button>':''}</section>`; document.querySelectorAll('.option').forEach(btn=>btn.onclick=()=>{state.answers[q.id]=btn.dataset.id;if(state.qIndex<questions.length-1){state.qIndex++;render();}else{calculateResults();nav('loading');}}); const p=document.getElementById('prev'); if(p)p.onclick=()=>{state.qIndex--;render();}; }
  function loading(){ app.innerHTML=`<section class="card loading-wrap"><div class="orb"></div><h2>당신의 맥주를 찾는 중…</h2><p class="loading-line" id="line">취향과 오늘의 상황을 읽고 있어요.</p></section>`; const lines=['취향과 오늘의 상황을 읽고 있어요.','태어난 순간의 별을 이어 보고 있어요.','72개의 맥주 중 오늘의 두 잔을 고르고 있어요.']; let i=0; const int=setInterval(()=>{i++;if(i<lines.length)document.getElementById('line').textContent=lines[i];else{clearInterval(int);nav('result');}},700); }
  function tagsFor(b){ return [...new Set([...(b.aromaTags||'').split(',').slice(0,2),(b.styleMajor||'')])].filter(Boolean).slice(0,4); }
  function tasteReason(b){ return `${b.flavorSummary || '균형 잡힌 풍미'}이(가) 지금 선택한 맛과 질감에 잘 맞아요. ${state.answers.q7 ? '오늘의 음식과 자리까지 고려한 결과예요.' : ''}`; }
  function starReason(b){ const n=state.natal, top=n.tones.slice(0,2); const p1=top[0],p2=top[1]; const names={Venus:'금성',Sun:'태양',Moon:'달',Asc:'상승궁',Mars:'화성'}; return `${names[p1.p]} ${zodiacLabel(p1.sign)}의 ${p1.tone.split('·')[0]} 성향과 ${p2?names[p2.p]+' '+zodiacLabel(p2.sign)+'의 '+p2.tone.split('·')[0]+' 성향이 ':''}${b.natalTone || b.natalTags} 캐릭터를 가진 이 맥주와 잘 맞아요.`; }
  function relationText(t,s){ if(t.id===s.id)return '✨ 입맛과 별이 같은 맥주를 골랐어요. 오늘은 두 기준이 완벽하게 겹쳤네요.'; const td=t.natalAdventure||3,sd=s.natalAdventure||3; if(sd>td+.5)return '입맛은 조금 더 편안한 선택을, 별은 오늘 한 걸음 더 모험해 보라고 하네요.'; if(sd<td-.5)return '입맛은 강한 개성을 원하지만, 별은 오늘 조금 더 부드러운 균형을 권하고 있어요.'; return '입맛과 별의 선택은 다르지만, 둘 다 비슷한 강도의 경험을 바라보고 있어요.'; }
  function resultCard(type,b){ const isStar=type==='star'; const score=isStar?b.starScore:b.tasteScore; return `<article class="result-card ${isStar?'star':'taste'}"><div class="result-head"><div><div class="pick-label">${isStar?'✨ 별이 고른 PICK':'🍺 내 입맛 PICK'}</div><div class="beer-name">${b.nameKo}</div><div class="beer-en">${b.nameEn} · ${b.country}</div></div><div class="score">${isStar?'종합':'취향'} ${Math.round(score)}%</div></div><div class="tags">${tagsFor(b).map(t=>`<span class="tag">${t}</span>`).join('')}</div><p class="reason">${isStar?starReason(b):tasteReason(b)}</p>${isStar?`<div class="hint">취향·상황 ${Math.round(b.tasteScore)}% · 네이탈 ${Math.round(b.natalScore)}%</div>`:''}<div class="meta"><div><strong>${b.abv}%</strong><span>ABV</span></div><div><strong>${b.styleMajor}</strong><span>스타일</span></div><div><strong>${b.availability==='A'?'쉬움':b.availability==='B'?'보통':'한정'}</strong><span>국내 구매</span></div></div><p class="footer-note">잘 어울리는 안주 · ${b.foodTags || '가벼운 스낵'}</p></article>`; }
  function result(){ const t=state.tasteScores[0],s=state.natalScores[0]||state.tasteScores[0]; const placements=state.natal.placements; app.innerHTML=`<section class="results"><div><div class="smallcaps">Your beer result</div><h2 style="margin-top:8px">오늘의 두 잔을 골랐어요.</h2><p class="lead">하나는 입맛이, 하나는 별이 골랐습니다.</p></div>${resultCard('taste',t)}${resultCard('star',s)}<div class="relation">${relationText(t,s)}</div><section class="card"><div class="smallcaps">Natal snapshot</div><h2 style="font-size:21px;margin-top:8px">오늘 추천에 사용한 네이탈</h2><div class="tags">${Object.entries(placements).map(([p,sg])=>`<span class="tag">${({Sun:'☉ 태양',Moon:'☾ 달',Venus:'♀ 금성',Mars:'♂ 화성',Asc:'↑ 상승궁'})[p]} · ${zodiacLabel(sg)}</span>`).join('')}</div><p class="footer-note">점성술 기반 추천은 재미를 위한 상징적 개인화입니다. 실제 음주 취향은 ‘내 입맛 PICK’의 질문 응답을 중심으로 계산합니다.</p></section><div class="actions"><button class="secondary" id="again">다시 추천받기</button><button class="primary" id="restart">처음부터</button></div></section>`; document.getElementById('again').onclick=()=>{state.qIndex=0;state.answers={};nav('questions')};document.getElementById('restart').onclick=()=>{state.answers={};state.birth={date:'',time:'',unknownTime:false,city:'서울',lat:37.5665,lon:126.978,utcOffset:9};nav('landing')}; }

  render();
})();
