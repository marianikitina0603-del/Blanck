(function(){
  if(typeof window.openWork!=='function') return;
  function h(s=''){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
  function makeCells(count){return '<div class="cells">'+Array.from({length:count},()=>'<div class="cell"></div>').join('')+'</div>'}
  function egeBlank(r){
    const rowsL=Array.from({length:20},(_,i)=>'<div class="answer-row"><div class="num">'+(i+1)+'</div>'+makeCells(17)+'</div>').join('');
    const rowsR=Array.from({length:20},(_,i)=>'<div class="answer-row"><div class="num">'+(i+21)+'</div>'+makeCells(17)+'</div>').join('');
    const reps=Array.from({length:8},()=>'<div class="replace-row">'+makeCells(2)+'<div>—</div>'+makeCells(15)+'</div>').join('');
    return '<div class="blankwrap"><div class="blank ege-teacher"><div class="topline"><div class="qrbox">QR / служебная зона</div><div class="black-square"></div><div class="titlebox"><div class="line1">ЕДИНЫЙ ГОСУДАРСТВЕННЫЙ ЭКЗАМЕН</div><div class="line2">БЛАНК ОТВЕТОВ № 1</div></div><div class="black-square"></div><div class="barcode"></div></div>'+
      '<div class="meta"><div><div>Код региона</div>'+makeCells(2)+'</div><div><div>Код предмета</div>'+makeCells(2)+'</div><div><div>Название предмета</div>'+makeCells(13)+'</div><div><div>Резерв</div>'+makeCells(3)+'</div></div>'+
      '<div class="alphabet"><strong>ВНИМАНИЕ!</strong> Образцы написания символов: А Б В Г Д Е Ё Ж З И Й К Л М Н О П Р С Т У Ф Х Ц Ч Ш Щ Ъ Ы Ь Э Ю Я 0 1 2 3 4 5 6 7 8 9</div>'+
      '<div class="section-title">СВЕДЕНИЯ ОБ УЧАСТНИКЕ</div><section class="personal"><div class="p-row"><div class="p-label">Фамилия</div>'+makeCells(27)+'</div><div class="p-row"><div class="p-label">Имя</div>'+makeCells(27)+'</div><div class="p-row"><div class="p-label">Отчество</div>'+makeCells(27)+'</div><div class="p-row"><div class="p-label">Документ</div><div style="display:flex;gap:8px;align-items:center"><span>Серия</span>'+makeCells(4)+'<span>Номер</span>'+makeCells(6)+'</div></div></section>'+
      '<div class="answers-title">Результаты выполнения заданий с КРАТКИМ ОТВЕТОМ</div><section class="answer-grid"><div>'+rowsL+'</div><div>'+rowsR+'</div></section><section class="replace"><div class="section-title">Замена ошибочных ответов на задания с КРАТКИМ ОТВЕТОМ</div><div class="replace-grid">'+reps+'</div></section><section class="footer">Учебный макет для тренировки заполнения.</section></div></div>';
  }
  const previousOpen=window.openWork;
  window.openWork=async function(id){
    let r=null;try{r=rows.find(x=>x.id===id)}catch(e){}
    if(!r||r.exam_type!=='ege') return previousOpen(id);
    const modal=document.getElementById('modal'),host=document.getElementById('modalContent');
    document.getElementById('modalTitle').textContent='ЕГЭ · '+(r.student_surname||'')+' '+(r.student_name||'');
    document.getElementById('modalSub').textContent='Работа № '+r.id.slice(0,8)+' · '+new Date(r.created_at).toLocaleString('ru-RU');
    host.innerHTML=egeBlank(r);modal.classList.remove('hidden');
    const vals=r.form_state&&Array.isArray(r.form_state.cells)?r.form_state.cells:[];
    const target=[...host.querySelectorAll('.blank .cell')];if(vals.length===target.length)target.forEach((c,i)=>c.textContent=vals[i]||'');
    else {
      const ans=r.answers||{};const answerRows=host.querySelectorAll('.answer-row');answerRows.forEach((row,i)=>{const chars=String(ans[i+1]||'').split(''),cc=row.querySelectorAll('.cell');cc.forEach((c,j)=>c.textContent=chars[j]||'')});
    }
    const holder=document.createElement('div');holder.id='photoGalleryTeacher';holder.style.marginTop='14px';holder.innerHTML='<h3>Фотографии решения</h3><div class="muted">Загрузка…</div>';host.appendChild(holder);
    const paths=Array.isArray(r.photo_paths)?r.photo_paths:[],labels=Array.isArray(r.photo_labels)?r.photo_labels:[];
    if(!paths.length){holder.innerHTML='<h3>Фотографии решения</h3><div class="muted">Фотографии не прикреплены.</div>';return}
    const signed=await db.storage.from('submission-photos').createSignedUrls(paths,3600);if(signed.error){holder.innerHTML='<h3>Фотографии решения</h3><div class="muted">'+h(signed.error.message)+'</div>';return}
    holder.innerHTML='<h3>Фотографии решения ('+paths.length+')</h3>';const grid=document.createElement('div');grid.style.cssText='display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px';
    signed.data.forEach((x,i)=>{const a=document.createElement('a');a.href=x.signedUrl;a.target='_blank';a.style.cssText='display:block;border:1px solid #ddd;border-radius:9px;padding:6px;background:#fafafa;color:inherit;text-decoration:none';const t=labels[i]||'Фото '+(i+1);a.innerHTML='<img src="'+h(x.signedUrl)+'" alt="'+h(t)+'" style="width:100%;height:180px;object-fit:cover;border-radius:6px;display:block"><div style="font-size:13px;font-weight:700;margin-top:7px">'+h(t)+'</div>';grid.appendChild(a)});holder.appendChild(grid);
  };
  try{
    render=function(){const q=el('search').value.trim().toLowerCase(),cl=el('classFilter').value.trim().toLowerCase(),dt=el('dateFilter').value;const filtered=rows.filter(r=>{const nm=`${r.student_surname} ${r.student_name} ${r.student_patronymic}`.toLowerCase();const localDate=new Date(r.created_at).toLocaleDateString('sv-SE');return(!q||nm.includes(q))&&(!cl||(r.student_class||'').toLowerCase().includes(cl))&&(!dt||localDate===dt)});el('count').textContent=`Работ: ${filtered.length}`;el('tbody').innerHTML=filtered.map(r=>{const max=r.exam_type==='ege'?40:19,filled=Object.values(r.answers||{}).filter(Boolean).length,badge=r.exam_type==='ege'?'ЕГЭ':'ОГЭ';return`<tr><td>${new Date(r.created_at).toLocaleString('ru-RU')}</td><td><b>${h(r.student_surname)} ${h(r.student_name)}</b> <span class="pill">${badge}</span></td><td>${h(r.student_class)}</td><td>${filled}/${max}</td><td>${r.id.slice(0,8)}</td><td><div class="actions"><button onclick="openWork('${r.id}')">Открыть бланк</button><button class="danger" onclick="deleteWork('${r.id}')">Удалить</button></div></td></tr>`}).join('')||'<tr><td colspan="6">Работ не найдено</td></tr>'};
    if(typeof rows!=='undefined'&&rows.length)render();
  }catch(e){}
})();