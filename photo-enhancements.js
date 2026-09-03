(function(){
  const MAX_PHOTOS=10;
  const MAX_SIZE=10*1024*1024;
  const BUCKET='submission-photos';

  function getClient(){
    try{ if(typeof db!=='undefined' && db) return db; }catch(e){}
    const cfg=window.BLANCK_CONFIG||{};
    if(!window.supabase||!cfg.supabaseUrl||!cfg.supabaseAnonKey) return null;
    return window.supabase.createClient(cfg.supabaseUrl,cfg.supabaseAnonKey);
  }
  function esc(s=''){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
  function textOf(box){return [...box.querySelectorAll('.cell')].map(x=>x.value).join('').trim()}
  function field(name){const b=document.querySelector('[data-field="'+name+'"]');return b?textOf(b):''}
  function collectStudentData(){
    const answers={};
    document.querySelectorAll('[data-answer]').forEach(r=>answers[r.dataset.answer]=textOf(r.querySelector('.cells')));
    const replacements=[...document.querySelectorAll('[data-replace]')].map(r=>({
      number:textOf(r.querySelector('[data-part="number"]')),
      answer:textOf(r.querySelector('[data-part="answer"]'))
    })).filter(x=>x.number||x.answer);
    const cells=[...document.querySelectorAll('.cell')].map(x=>x.value);
    return {
      student_surname:field('surname'), student_name:field('name'), student_patronymic:field('patronymic'),
      student_class:field('class'), region_code:field('region'), school_code:field('school'), room_number:field('room'),
      exam_date:[field('day'),field('month'),field('year')].filter(Boolean).join('-'),
      answers, replacements, form_state:{cells}
    };
  }
  function extFor(file){
    const fromName=(file.name.split('.').pop()||'').toLowerCase().replace(/[^a-z0-9]/g,'');
    if(fromName) return fromName==='jpeg'?'jpg':fromName;
    const map={'image/jpeg':'jpg','image/png':'png','image/webp':'webp','image/heic':'heic','image/heif':'heif'};
    return map[file.type]||'jpg';
  }

  function setupStudent(){
    const sendBtn=document.getElementById('sendBtn');
    const sendbox=document.querySelector('.sendbox');
    if(!sendBtn||!sendbox) return;
    const client=getClient();
    let selected=[];

    const style=document.createElement('style');
    style.textContent=`
      .photo-card{margin:18px auto 0;width:min(793px,calc(100% - 24px));background:#fff;padding:16px;border-radius:10px;box-shadow:0 2px 12px #0001;font-family:Arial,sans-serif}
      .photo-card h3{margin:0 0 6px}.photo-help{font-size:13px;color:#666;margin-bottom:10px}
      .photo-picker{display:flex;gap:10px;align-items:center;flex-wrap:wrap}.photo-picker input{max-width:100%}
      .photo-count{font-size:13px;font-weight:700}.photo-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:10px;margin-top:12px}
      .photo-item{position:relative;border:1px solid #ddd;border-radius:9px;padding:6px;background:#fafafa}.photo-item img{width:100%;height:90px;object-fit:cover;border-radius:6px;display:block}
      .photo-name{font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:5px}.photo-remove{position:absolute;right:4px;top:4px;width:24px;height:24px;border:0;border-radius:50%;background:#a9362a;color:#fff;cursor:pointer;font-weight:700}
      @media print{.photo-card{display:none!important}}
    `;
    document.head.appendChild(style);

    const card=document.createElement('div');
    card.className='photo-card';
    card.innerHTML=`<h3>Фотографии решения</h3><div class="photo-help">Можно прикрепить до 10 фотографий. Поддерживаются JPG, PNG, WEBP, HEIC/HEIF. Размер одной фотографии — не более 10 МБ.</div><div class="photo-picker"><input id="photoInput" type="file" accept="image/*" multiple><span id="photoCount" class="photo-count">0 / 10</span></div><div id="photoGrid" class="photo-grid"></div>`;
    sendbox.parentNode.insertBefore(card,sendbox);
    const input=card.querySelector('#photoInput'), grid=card.querySelector('#photoGrid'), count=card.querySelector('#photoCount');

    function render(){
      count.textContent=selected.length+' / '+MAX_PHOTOS;
      grid.innerHTML='';
      selected.forEach((f,i)=>{
        const item=document.createElement('div');item.className='photo-item';
        const url=URL.createObjectURL(f);
        item.innerHTML=`<button type="button" class="photo-remove" title="Удалить">×</button><img alt="Фото ${i+1}"><div class="photo-name">${esc(f.name)}</div>`;
        item.querySelector('img').src=url;
        item.querySelector('img').onload=()=>URL.revokeObjectURL(url);
        item.querySelector('.photo-remove').onclick=()=>{selected.splice(i,1);render()};
        grid.appendChild(item);
      });
    }
    input.addEventListener('change',()=>{
      const incoming=[...input.files];
      for(const f of incoming){
        if(!f.type.startsWith('image/')){alert('Файл «'+f.name+'» не является изображением.');continue}
        if(f.size>MAX_SIZE){alert('Файл «'+f.name+'» больше 10 МБ.');continue}
        if(selected.length>=MAX_PHOTOS){alert('Можно прикрепить не более 10 фотографий.');break}
        selected.push(f);
      }
      input.value='';render();
    });

    sendBtn.onclick=async()=>{
      const data=collectStudentData();
      const msg=document.getElementById('msg');
      if(!data.student_surname||!data.student_name||!data.student_class){msg.textContent='Заполните фамилию, имя и класс';return}
      if(!client){msg.textContent='База ещё не подключена учителем';return}
      const workId=crypto.randomUUID();
      const paths=[];
      sendBtn.disabled=true;sendBtn.textContent='Отправка…';
      try{
        for(let i=0;i<selected.length;i++){
          sendBtn.textContent='Фото '+(i+1)+'/'+selected.length+'…';
          const f=selected[i];
          const path=workId+'/'+String(i+1).padStart(2,'0')+'-'+crypto.randomUUID()+'.'+extFor(f);
          const up=await client.storage.from(BUCKET).upload(path,f,{cacheControl:'3600',upsert:false,contentType:f.type||undefined});
          if(up.error) throw up.error;
          paths.push(path);
        }
        data.id=workId;
        data.photo_paths=paths;
        sendBtn.textContent='Сохранение…';
        const ins=await client.from('submissions').insert(data);
        if(ins.error) throw ins.error;
        localStorage.removeItem('oge_blank_draft');
        selected=[];render();
        msg.textContent='Работа отправлена. № '+workId.slice(0,8);
        alert('Работа успешно отправлена учителю. Номер: '+workId.slice(0,8));
      }catch(err){
        console.error(err);msg.textContent='Ошибка отправки: '+(err.message||String(err));
      }finally{sendBtn.disabled=false;sendBtn.textContent='Отправить учителю'}
    };
  }

  function setupTeacher(){
    if(!document.getElementById('tbody')||!document.getElementById('modalContent')) return;
    const client=getClient();
    if(!client) return;
    const originalOpen=window.openWork;
    if(typeof originalOpen==='function'){
      window.openWork=async function(id){
        originalOpen(id);
        const host=document.getElementById('modalContent');
        if(!host) return;
        const holder=document.createElement('div');holder.id='photoGalleryTeacher';holder.style.marginTop='14px';holder.innerHTML='<h3>Фотографии решения</h3><div class="muted">Загрузка…</div>';
        host.appendChild(holder);
        const q=await client.from('submissions').select('photo_paths').eq('id',id).single();
        if(q.error){holder.innerHTML='<h3>Фотографии решения</h3><div class="muted">'+esc(q.error.message)+'</div>';return}
        const paths=Array.isArray(q.data?.photo_paths)?q.data.photo_paths:[];
        if(!paths.length){holder.innerHTML='<h3>Фотографии решения</h3><div class="muted">Фотографии не прикреплены.</div>';return}
        const signed=await client.storage.from(BUCKET).createSignedUrls(paths,3600);
        if(signed.error){holder.innerHTML='<h3>Фотографии решения</h3><div class="muted">'+esc(signed.error.message)+'</div>';return}
        holder.innerHTML='<h3>Фотографии решения ('+paths.length+')</h3>';
        const grid=document.createElement('div');grid.style.cssText='display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px';
        signed.data.forEach((x,i)=>{const a=document.createElement('a');a.href=x.signedUrl;a.target='_blank';a.rel='noopener';a.style.cssText='display:block;border:1px solid #ddd;border-radius:9px;padding:6px;background:#fafafa';a.innerHTML='<img src="'+esc(x.signedUrl)+'" alt="Фото '+(i+1)+'" style="width:100%;height:180px;object-fit:cover;border-radius:6px;display:block"><div style="font-size:12px;margin-top:5px">Фото '+(i+1)+'</div>';grid.appendChild(a)});
        holder.appendChild(grid);
      };
    }
  }

  setupStudent();
  setupTeacher();
})();