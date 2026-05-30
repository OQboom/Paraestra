/* ===== 모든 페이지 공통 ===== */
(function(){
  var header=document.getElementById('header');
  if(header){
    window.addEventListener('scroll',function(){
      if(window.scrollY>40)header.classList.add('scrolled');
      else header.classList.remove('scrolled');
    });
  }
  var nav=document.getElementById('nav'),toggle=document.getElementById('navToggle');
  if(toggle&&nav){
    toggle.addEventListener('click',function(){
      nav.classList.toggle('open');
      toggle.innerHTML=nav.classList.contains('open')?'&#10005;':'&#9776;';
    });
  }
  var obs=new IntersectionObserver(function(entries){
    entries.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');obs.unobserve(e.target);}});
  },{threshold:.14});
  document.querySelectorAll('.reveal').forEach(function(el){obs.observe(el);});
})();

/* ===== 홈 전용: 인트로 → ENTER → 영상 → 홈 ===== */
function initHome(){
  var intro=document.getElementById('intro'),
      gate=document.getElementById('gate'),
      film=document.getElementById('film'),
      video=document.getElementById('filmVideo'),
      filmTitle=document.getElementById('filmTitle'),
      enterBtn=document.getElementById('enterBtn'),
      skipBtn=document.getElementById('skipBtn'),
      replayBtn=document.getElementById('replayBtn');
  if(!intro||!gate||!film){return;}

  // 이미 이번 방문에서 인트로를 봤으면 전부 건너뛰고 바로 메인으로
  var SEEN_KEY='paraestra_intro_seen';
  var alreadySeen=false;
  try{ alreadySeen = sessionStorage.getItem(SEEN_KEY)==='1'; }catch(e){}

  if(alreadySeen){
    intro.style.display='none';
    gate.style.display='none';
    film.style.display='none';
    document.body.style.overflow='';
    return;
  }

  // 인트로 진입을 시작하면 "봤음"으로 표시 (이후 홈 재방문 시 건너뜀)
  try{ sessionStorage.setItem(SEEN_KEY,'1'); }catch(e){}

  document.body.style.overflow='hidden';

  setTimeout(function(){intro.classList.add('done');},2300);
  setTimeout(function(){gate.classList.add('ready');},2600);
  setTimeout(function(){intro.style.display='none';},3300);

  enterBtn.addEventListener('click',function(){
    film.classList.add('show');     // 타이틀 카드(검은 화면)부터 표시
    gate.classList.add('hidden');
    setTimeout(function(){gate.style.display='none';},800);

    // 타이틀 카드를 약 3.2초 보여준 뒤 페이드아웃하며 영상 시작
    setTimeout(function(){
      if(filmTitle){filmTitle.classList.add('gone');}
      video.muted=false;video.currentTime=0;
      var p=video.play();
      if(p&&p.catch){p.catch(function(){enterHome();});}
    },3200);
  });

  video.addEventListener('ended',enterHome);
  skipBtn.addEventListener('click',enterHome);
  replayBtn.addEventListener('click',function(){
    if(filmTitle){filmTitle.classList.add('gone');}
    video.currentTime=0;video.play();
  });

  function enterHome(){
    try{video.pause();}catch(e){}
    film.classList.add('closing');
    document.body.style.overflow='';
    setTimeout(function(){film.style.display='none';},800);
    window.scrollTo({top:0,behavior:'auto'});
  }
}
