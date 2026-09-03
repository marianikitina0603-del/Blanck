(function(){
  function addStyles(){
    if(document.getElementById('teacherPhotoViewerStyle')) return;
    const style=document.createElement('style');
    style.id='teacherPhotoViewerStyle';
    style.textContent=`
      .tpv-modal{position:fixed;inset:0;background:#000d;display:none;align-items:center;justify-content:center;z-index:9999;padding:18px}
      .tpv-modal.open{display:flex}
      .tpv-panel{width:min(1200px,96vw);height:min(92vh,900px);display:flex;flex-direction:column;gap:10px}
      .tpv-toolbar{display:flex;gap:8px;align-items:center;justify-content:center;flex-wrap:wrap}
      .tpv-toolbar button{border:0;border-radius:8px;padding:9px 12px;background:#fff;color:#222;font:600 14px Arial,sans-serif;cursor:pointer}
      .tpv-title{color:#fff;font:600 14px Arial,sans-serif;margin-right:auto}
      .tpv-stage{flex:1;min-height:0;overflow:auto;display:flex;align-items:center;justify-content:center;background:#111;border-radius:12px;padding:20px}
      .tpv-stage img{max-width:none;max-height:none;transform-origin:center center;transition:transform .15s ease;user-select:none;-webkit-user-drag:none}
      .teacher-photo-zoom{cursor:zoom-in}
    `;
    document.head.appendChild(style);
  }

  function ensureModal(){
    let modal=document.getElementById('teacherPhotoViewer');
    if(modal) return modal;
    modal=document.createElement('div');
    modal.id='teacherPhotoViewer';
    modal.className='tpv-modal';
    modal.innerHTML=`<div class="tpv-panel"><div class="tpv-toolbar"><div class="tpv-title" id="tpvTitle">Фото</div><button type="button" data-act="minus">−</button><button type="button" data-act="plus">+</button><button type="button" data-act="left">↶ 90°</button><button type="button" data-act="right">↷ 90°</button><button type="button" data-act="reset">Сбросить</button><button type="button" data-act="close">Закрыть</button></div><div class="tpv-stage"><img id="tpvImage" alt="Фото решения"></div></div>`;
    document.body.appendChild(modal);
    let scale=1,rotation=0;
    const img=modal.querySelector('#tpvImage');
    const title=modal.querySelector('#tpvTitle');
    const apply=()=>{img.style.transform=`scale(${scale}) rotate(${rotation}deg)`};
    modal.querySelector('[data-act="plus"]').onclick=()=>{scale=Math.min(4,+(scale+.25).toFixed(2));apply()};
    modal.querySelector('[data-act="minus"]').onclick=()=>{scale=Math.max(.25,+(scale-.25).toFixed(2));apply()};
    modal.querySelector('[data-act="left"]').onclick=()=>{rotation-=90;apply()};
    modal.querySelector('[data-act="right"]').onclick=()=>{rotation+=90;apply()};
    modal.querySelector('[data-act="reset"]').onclick=()=>{scale=1;rotation=0;apply()};
    const close=()=>modal.classList.remove('open');
    modal.querySelector('[data-act="close"]').onclick=close;
    modal.addEventListener('click',e=>{if(e.target===modal)close()});
    document.addEventListener('keydown',e=>{if(!modal.classList.contains('open'))return;if(e.key==='Escape')close();if(e.key==='+'){scale=Math.min(4,scale+.25);apply()}if(e.key==='-'){scale=Math.max(.25,scale-.25);apply()}});
    modal.openPhoto=(src,label)=>{scale=1;rotation=0;img.src=src;title.textContent=label||'Фото';apply();modal.classList.add('open')};
    return modal;
  }

  function enhanceGallery(){
    const gallery=document.getElementById('photoGalleryTeacher');
    if(!gallery) return;
    gallery.querySelectorAll('a[href] img').forEach(img=>{
      if(img.dataset.viewerReady) return;
      img.dataset.viewerReady='1';
      img.classList.add('teacher-photo-zoom');
      const link=img.closest('a');
      link.addEventListener('click',e=>{
        e.preventDefault();
        const label=link.querySelector('div')?.textContent||img.alt||'Фото';
        ensureModal().openPhoto(link.href,label);
      });
    });
  }

  addStyles();
  ensureModal();
  const observer=new MutationObserver(enhanceGallery);
  observer.observe(document.body,{childList:true,subtree:true});
  enhanceGallery();
})();