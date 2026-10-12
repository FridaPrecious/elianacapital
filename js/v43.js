(function(){
var MAX=150;
function clip(t){t=t.trim();if(t.length<=MAX)return t;var c=t.slice(0,MAX-1);var k=c.lastIndexOf(' ');return (k>100?c.slice(0,k):c).replace(/[,.;:\s]+$/,'')+'…';}
var cards=[].slice.call(document.querySelectorAll('.advisor-orb[data-full]'));
if(!cards.length)return;
var dlg=document.createElement('div');dlg.className='adv-dlg';dlg.setAttribute('role','dialog');dlg.setAttribute('aria-modal','true');dlg.setAttribute('aria-label','Advisor profile');
dlg.innerHTML='<div class="adv-card"><button class="adv-x" aria-label="Close">×</button><div class="adv-top"><div class="adv-pic"></div><div><h3></h3><p class="r"></p></div></div><p class="b"></p></div>';
document.body.appendChild(dlg);
var last=null;
function close(){dlg.classList.remove('on');document.documentElement.style.overflow='';if(last)last.focus();}
function open(c){
 last=c;
 var pic=c.querySelector('.orb-portrait');
 dlg.querySelector('.adv-pic').innerHTML=pic?pic.innerHTML:'';
 dlg.querySelector('h3').textContent=c.querySelector('.orb-name').textContent;
 dlg.querySelector('.r').textContent=c.querySelector('.orb-role').textContent;
 dlg.querySelector('.b').textContent=c.dataset.full;
 dlg.classList.add('on');document.documentElement.style.overflow='hidden';
 dlg.querySelector('.adv-x').focus();
}
cards.forEach(function(c){
 var b=c.querySelector('.orb-bio');
 b.textContent=clip(c.dataset.full);
 var m=document.createElement('button');m.type='button';m.tabIndex=-1;m.className='orb-more';m.textContent='Read bio';
 b.parentNode.appendChild(m);
 c.addEventListener('click',function(){open(c)});
 c.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();open(c)}});
});
dlg.addEventListener('click',function(e){if(e.target===dlg||e.target.classList.contains('adv-x'))close()});
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&dlg.classList.contains('on'))close()});
})();
