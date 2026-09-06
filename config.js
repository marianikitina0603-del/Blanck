// Настройки Supabase. Добавьте только публичный Publishable key проекта.
window.BLANCK_CONFIG = {
  supabaseUrl: "https://cuafunuvqubtbvycefht.supabase.co",
  supabaseAnonKey: "sb_publishable_mkYiQxXYlXr3DMT-kttF3Q_ZGUH7pKT"
};

window.addEventListener('DOMContentLoaded', function(){
  var page=(location.pathname.split('/').pop()||'index.html').toLowerCase();
  if(page==='oge.html' || page==='teacher.html'){
    var script = document.createElement('script');
    script.src = 'photo-enhancements.js?v=3';
    script.onload = function(){
      if(page==='teacher.html'){
        var viewer = document.createElement('script');
        viewer.src = 'photo-viewer.js?v=3';
        viewer.onload=function(){
          var ege=document.createElement('script');
          ege.src='teacher-ege.js?v=1';
          document.body.appendChild(ege);
        };
        document.body.appendChild(viewer);
      }
    };
    document.body.appendChild(script);
  }
  if(page==='oge.html'){
    var docHint = document.createElement('script');
    docHint.src = 'document-hint.js?v=3';
    document.body.appendChild(docHint);
  }
});
