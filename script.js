document.addEventListener('DOMContentLoaded',()=>{
 const toggle=document.querySelector('.nav-toggle'),nav=document.querySelector('.nav-links');
 document.querySelector('#year').textContent=new Date().getFullYear();
 toggle.addEventListener('click',()=>{const open=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));document.body.style.overflow=open?'hidden':''});
 nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');toggle.setAttribute('aria-expanded','false');document.body.style.overflow=''}));
 const items=document.querySelectorAll('.reveal');if(matchMedia('(prefers-reduced-motion: reduce)').matches){items.forEach(x=>x.classList.add('visible'));return}
 const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target)}}),{threshold:.12});items.forEach(x=>observer.observe(x));
});
