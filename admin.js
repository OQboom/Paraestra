/* ===== PARAESTRA 갤러리 관리자 로직 ===== */
(function(){
  var cfg = window.PARAESTRA_CONFIG || {};
  var lockView = document.getElementById('lockView');
  var formView = document.getElementById('formView');

  if(!cfg.SUPABASE_URL || cfg.SUPABASE_URL.indexOf('여기에')===0){
    lockView.innerHTML = '<div class="lock-box"><div class="lock-title">설정 필요</div><p class="lock-desc">config.js에 Supabase 값을 먼저 입력하세요. (GALLERY_SETUP.md 참고)</p></div>';
    return;
  }

  var sb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);

  /* ===== 비밀번호 확인 ===== */
  var pwInput = document.getElementById('pwInput'),
      pwBtn = document.getElementById('pwBtn'),
      pwErr = document.getElementById('pwErr');

  function tryUnlock(){
    if(pwInput.value === cfg.UPLOAD_PASSWORD){
      lockView.style.display='none';
      formView.style.display='block';
      loadAdminList();
    } else {
      pwErr.textContent = '비밀번호가 올바르지 않습니다.';
      pwInput.value='';
    }
  }
  pwBtn.addEventListener('click', tryUnlock);
  pwInput.addEventListener('keydown', function(e){ if(e.key==='Enter') tryUnlock(); });

  /* ===== 사진 미리보기 ===== */
  var postFiles = document.getElementById('postFiles'),
      preview = document.getElementById('preview');
  var selectedFiles = [];

  postFiles.addEventListener('change', function(){
    selectedFiles = Array.prototype.slice.call(postFiles.files);
    preview.innerHTML = '';
    selectedFiles.forEach(function(file){
      var url = URL.createObjectURL(file);
      var d = document.createElement('div');
      d.className = 'pv-item';
      d.innerHTML = '<img src="'+url+'" alt="">';
      preview.appendChild(d);
    });
  });

  /* ===== 게시물 올리기 ===== */
  var submitBtn = document.getElementById('submitBtn'),
      submitMsg = document.getElementById('submitMsg'),
      postTitle = document.getElementById('postTitle'),
      postBody = document.getElementById('postBody');

  submitBtn.addEventListener('click', function(){
    var title = postTitle.value.trim();
    if(!title){ submitMsg.textContent='제목을 입력하세요.'; return; }
    if(selectedFiles.length===0){ submitMsg.textContent='사진을 1장 이상 선택하세요.'; return; }

    submitBtn.disabled = true;
    submitMsg.textContent = '업로드 중... (0/'+selectedFiles.length+')';

    uploadAll(title);
  });

  function uploadAll(title){
    var urls = [];
    var done = 0;
    var failed = false;

    function next(i){
      if(i>=selectedFiles.length){ finish(); return; }
      var file = selectedFiles[i];
      var ext = (file.name.split('.').pop()||'jpg').toLowerCase();
      var path = Date.now()+'_'+i+'_'+Math.random().toString(36).slice(2,7)+'.'+ext;

      sb.storage.from(cfg.BUCKET).upload(path, file, {cacheControl:'3600', upsert:false})
        .then(function(res){
          if(res.error){ failed=true; submitMsg.textContent='사진 업로드 실패: '+res.error.message; submitBtn.disabled=false; return; }
          var pub = sb.storage.from(cfg.BUCKET).getPublicUrl(path);
          urls.push(pub.data.publicUrl);
          done++;
          submitMsg.textContent = '업로드 중... ('+done+'/'+selectedFiles.length+')';
          next(i+1);
        });
    }

    function finish(){
      if(failed) return;
      sb.from('gallery_posts').insert([{
        title: title,
        body: postBody.value.trim(),
        images: urls,
        password: cfg.UPLOAD_PASSWORD
      }]).then(function(res){
        submitBtn.disabled = false;
        if(res.error){ submitMsg.textContent='저장 실패: '+res.error.message; return; }
        submitMsg.textContent = '게시물이 등록되었습니다.';
        postTitle.value=''; postBody.value=''; postFiles.value=''; selectedFiles=[]; preview.innerHTML='';
        loadAdminList();
      });
    }

    next(0);
  }

  /* ===== 등록된 게시물 목록 + 삭제 ===== */
  var adminList = document.getElementById('adminList'),
      listCount = document.getElementById('listCount');

  function loadAdminList(){
    sb.from('gallery_posts').select('*').order('created_at',{ascending:false})
      .then(function(res){
        if(res.error){ adminList.textContent='목록 불러오기 실패'; return; }
        var posts = res.data||[];
        listCount.textContent = '('+posts.length+')';
        adminList.innerHTML = '';
        posts.forEach(function(post){
          var imgs = post.images||[];
          var row = document.createElement('div');
          row.className = 'adm-row';
          row.innerHTML =
            '<div class="ar-thumb">'+(imgs[0]?'<img src="'+imgs[0]+'">':'')+'</div>'+
            '<div class="ar-info"><div class="ar-title">'+escapeHtml(post.title||'무제')+'</div>'+
            '<div class="ar-meta">사진 '+imgs.length+'장 · '+formatDate(post.created_at)+'</div></div>'+
            '<button class="ar-del" data-id="'+post.id+'">삭제</button>';
          row.querySelector('.ar-del').addEventListener('click', function(){
            if(confirm('이 게시물을 삭제할까요?')) deletePost(post.id);
          });
          adminList.appendChild(row);
        });
      });
  }

  function deletePost(id){
    sb.from('gallery_posts').delete().eq('id', id).eq('password', cfg.UPLOAD_PASSWORD)
      .then(function(res){
        if(res.error){ alert('삭제 실패: '+res.error.message); return; }
        loadAdminList();
      });
  }

  function escapeHtml(s){
    return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});
  }
  function formatDate(iso){ if(!iso) return ''; var d=new Date(iso); return d.getFullYear()+'. '+(d.getMonth()+1)+'. '+d.getDate(); }
})();
