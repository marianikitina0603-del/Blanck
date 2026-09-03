(function(){
  function addHint(){
    const series=document.querySelector('[data-field="doc_series"]');
    const number=document.querySelector('[data-field="doc_number"]');
    if(!series||!number)return;
    const row=series.closest('.doc-row');
    if(!row||row.querySelector('.doc-random-hint'))return;

    const style=document.createElement('style');
    style.textContent='.doc-random-hint{grid-column:2/-1;margin-top:2px;font:11px Arial,sans-serif;color:#8a5b16}.doc-random-hint strong{font-weight:700}@media print{.doc-random-hint{display:none!important}}';
    document.head.appendChild(style);

    const hint=document.createElement('div');
    hint.className='doc-random-hint';
    hint.innerHTML='<strong>Вводите случайные числа.</strong> Не используйте реальные данные документа.';
    row.appendChild(hint);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',addHint);
  else addHint();
})();
