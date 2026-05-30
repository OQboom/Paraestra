/* ===== PARAESTRA 갤러리 표시 로직 ===== */
(function(){
  var cfg = window.PARAESTRA_CONFIG || {};
  var statusEl = document.getElementById('galStatus');
  var gridEl = document.getElementById('galGrid');

  // 설정이 안 된 경우 안내
  if(!cfg.SUPABASE_URL || cfg.SUPABASE_URL.indexOf('여기에')===0){
    statusEl.innerHTML = 'Supabase 설정이 필요합니다. <br>config.js 파일과 GALLERY_SETUP.md 안내를 확인하세요.';
    return;
  }

  var sb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
  var posts = [];      // 전체 글
  var lbIndex = 0;     // 라이트박스 현재 글
  var lbPhoto = 0;     // 현재 글 안에서 보는 사진 번호

  loadPosts();

  function loadPosts(){
    sb.from('gallery_posts')
      .select('*')
      .order('created_at', {ascending:false})
      .then(function(res){
        if(res.error){
          statusEl.textContent = '불러오기에 실패했습니다: ' + res.error.message;
          return;
        }
        posts = res.data || [];
        render();
      });
  }

  function render(){
    if(posts.length===0){
      statusEl.textContent = '아직 등록된 게시물이 없습니다.';
      gridEl.innerHTML = '';
      return;
    }
    statusEl.style.display = 'none';
    gridEl.innerHTML = '';
    posts.forEach(function(post, i){
      var imgs = post.images || [];
      var cover = imgs[0] || '';
      var card = document.createElement('article');
      card.className = 'feed-card';
      card.innerHTML =
        '<div class="fc-photo">' +
          (cover ? '<img loading="lazy" src="'+cover+'" alt="">' : '<span class="fc-ph">PHOTO</span>') +
          (imgs.length>1 ? '<span class="fc-badge">+'+(imgs.length-1)+'</span>' : '') +
        '</div>' +
        '<div class="fc-body">' +
          '<h3 class="fc-title">'+escapeHtml(post.title||'무제')+'</h3>' +
          (post.body ? '<p class="fc-text">'+escapeHtml(post.body)+'</p>' : '') +
          '<div class="fc-date">'+formatDate(post.created_at)+'</div>' +
        '</div>';
      card.querySelector('.fc-photo').addEventListener('click', function(){
        openLightbox(i, 0);
      });
      gridEl.appendChild(card);
    });
  }

  /* ===== 라이트박스 ===== */
  var lb = document.getElementById('lightbox'),
      lbImg = document.getElementById('lbImg'),
      lbTitle = document.getElementById('lbTitle'),
      lbCount = document.getElementById('lbCount');

  function openLightbox(postIdx, photoIdx){
    lbIndex = postIdx; lbPhoto = photoIdx;
    showPhoto();
    lb.classList.add('open');
    document.body.style.overflow='hidden';
  }
  function showPhoto(){
    var post = posts[lbIndex];
    var imgs = post.images || [];
    if(imgs.length===0) return;
    if(lbPhoto<0) lbPhoto = imgs.length-1;
    if(lbPhoto>=imgs.length) lbPhoto = 0;
    lbImg.src = imgs[lbPhoto];
    lbTitle.textContent = post.title || '무제';
    lbCount.textContent = imgs.length>1 ? (lbPhoto+1)+' / '+imgs.length : '';
  }
  function closeLightbox(){
    lb.classList.remove('open');
    document.body.style.overflow='';
  }
  document.getElementById('lbClose').addEventListener('click', closeLightbox);
  document.getElementById('lbPrev').addEventListener('click', function(){lbPhoto--;showPhoto();});
  document.getElementById('lbNext').addEventListener('click', function(){lbPhoto++;showPhoto();});
  lb.addEventListener('click', function(e){ if(e.target===lb) closeLightbox(); });
  document.addEventListener('keydown', function(e){
    if(!lb.classList.contains('open')) return;
    if(e.key==='Escape') closeLightbox();
    if(e.key==='ArrowLeft'){lbPhoto--;showPhoto();}
    if(e.key==='ArrowRight'){lbPhoto++;showPhoto();}
  });

  /* ===== 유틸 ===== */
  function escapeHtml(s){
    return String(s).replace(/[&<>"']/g, function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }
  function formatDate(iso){
    if(!iso) return '';
    var d = new Date(iso);
    return d.getFullYear()+'. '+(d.getMonth()+1)+'. '+d.getDate();
  }
})();
