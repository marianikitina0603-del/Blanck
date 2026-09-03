// Настройки Supabase. Добавьте только публичный Publishable key проекта.
window.BLANCK_CONFIG = {
  supabaseUrl: "https://cuafunuvqubtbvycefht.supabase.co",
  supabaseAnonKey: "sb_publishable_mkYiQxXYlXr3DMT-kttF3Q_ZGUH7pKT"
};

window.addEventListener('DOMContentLoaded', function(){
  var script = document.createElement('script');
  script.src = 'photo-enhancements.js?v=1';
  document.body.appendChild(script);
});
