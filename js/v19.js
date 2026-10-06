/* v19: italic accent words + gentle scroll reveal (inner pages) */
(function(){
  if(document.body.classList.contains('is-home'))return;
  document.querySelectorAll('.phero h1,.sec h2,.cta h2').forEach(function(h){
    if(h.children.length||h.querySelector('em'))return;
    var w=h.textContent.trim().split(/\s+/);
    if(w.length<3)return;
    var n=w.length>6?3:2;
    h.innerHTML=w.slice(0,-n).join(' ')+' <em class="ac">'+w.slice(-n).join(' ')+'</em>';
  });
  if(!('IntersectionObserver' in window)||matchMedia('(prefers-reduced-motion:reduce)').matches)return;
  var els=document.querySelectorAll('.sec .lead,.sec .stat,.sec .trust li,.sec .spec>div,.sec .step,.sec .person,.sec .photo,.sec .prose li,.contact-card,.form');
  document.documentElement.classList.add('r19on');
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.12,rootMargin:'0px 0px -6% 0px'});
  els.forEach(function(el,i){el.classList.add('r19');el.style.transitionDelay=(i%4)*70+'ms';io.observe(el)});
})();
