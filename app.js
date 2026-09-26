
const $ = id => document.getElementById(id);
let SITE = null;

async function loadSite(){
  if(!API_URL || API_URL.includes('PASTE_YOUR')) throw new Error('Add your Apps Script /exec URL in config.js');
  const res = await fetch(API_URL + '?action=data', {cache:'no-store'});
  if(!res.ok) throw new Error('Could not load website data.');
  SITE = await res.json();
  if(!SITE.ok) throw new Error(SITE.error||'API error');
  render(SITE);
}

function getSetting(k){return (SITE.settings||[]).find(x=>String(x.Key)===k)?.Value||''}
function setText(id,v){const e=$(id);if(e)e.textContent=v||''}
function setAttr(id,a,v){const e=$(id);if(e&&v)e.setAttribute(a,v)}
function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}

function render(d){
  setText('brandName',getSetting('siteName'));setText('brandTagline',getSetting('siteTagline'));
  setText('footerName',getSetting('siteName'));setText('footerTagline',getSetting('siteTagline'));setText('footerText',getSetting('footerText'));
  const logo=getSetting('logoUrl');['logo','footerLogo'].forEach(id=>{const e=$(id);if(logo){e.src=logo;e.style.display='block'}else{e.style.display='none'}});
  const hero=getSetting('heroImage');if(hero){$('heroImage').src=hero}else{$('heroImage').style.display='none'}
  setText('heroEyebrow',getSetting('heroEyebrow'));setText('heroTitle',getSetting('heroTitle'));setText('heroText',getSetting('heroText'));
  setText('heroButton',getSetting('heroButton'));setAttr('heroButton','href',getSetting('heroButtonLink')||'#contact');
  setText('aboutTitle',getSetting('aboutTitle'));setText('aboutText',getSetting('aboutText'));setText('aboutButton',getSetting('aboutButton'));setAttr('aboutButton','href',getSetting('aboutButtonLink')||'#about');
  setText('servicesTitle',getSetting('servicesTitle'));setText('servicesText',getSetting('servicesText'));
  setText('plansTitle',getSetting('plansTitle'));setText('plansText',getSetting('plansText'));
  setText('galleryTitle',getSetting('galleryTitle'));setText('galleryText',getSetting('galleryText'));
  setText('contactTitle',getSetting('contactTitle'));setText('contactText',getSetting('contactText'));
  const phone=getSetting('phone'),wa=getSetting('whatsapp'),email=getSetting('email');
  setText('phoneLink',phone);setAttr('phoneLink','href','tel:'+phone.replace(/\s/g,''));
  setText('whatsappLink',wa);setAttr('whatsappLink','href','https://wa.me/'+wa.replace(/\D/g,''));
  setText('emailLink',email);setAttr('emailLink','href','mailto:'+email);
  setText('addressText',getSetting('address'));
  [['instagram','instagram'],['facebook','facebook'],['youtube','youtube'],['linkedin','linkedin']].forEach(([id,k])=>setAttr(id,'href',getSetting(k)||'#'));

  const quick=(d.services||[]).slice(0,8);
  $('quickGrid').innerHTML=quick.map(x=>`<div class="quick-card"><div class="quick-icon">${esc(x.Icon||'✦')}</div><strong>${esc(x.Title)}</strong><small>${esc(x.Short)}</small></div>`).join('');
  $('servicesGrid').innerHTML=(d.services||[]).map(x=>`<article class="service-card"><div class="service-icon">${esc(x.Icon||'✦')}</div><h3>${esc(x.Title)}</h3><p>${esc(x.Description||x.Short)}</p><span class="mini">${esc(x.Short||'Explore service')} →</span></article>`).join('');
  $('plansGrid').innerHTML=(d.plans||[]).map((x,i)=>`<article class="plan-card ${String(x.Badge||'').toLowerCase().includes('popular')?'featured':''}">${x.Badge?`<span class="badge">${esc(x.Badge)}</span>`:''}<h3>${esc(x.Name)}</h3><div class="price">${esc(x.Price)}</div><div class="billing">${esc(x.Billing)}</div><ul class="features">${String(x.Features||'').split('|').filter(Boolean).map(f=>`<li>${esc(f.trim())}</li>`).join('')}</ul><a class="btn ${i===1?'btn-gold':'btn-dark'}" href="#contact">${esc(x.CTA||'Get Started')} <span>→</span></a></article>`).join('');
  $('galleryGrid').innerHTML=(d.gallery||[]).map(x=>`<a class="gallery-card" ${x.Link?`href="${esc(x.Link)}" target="_blank"`:''}><img src="${esc(x.ImageURL)}" alt="${esc(x.Title)}" loading="lazy"><div class="gallery-meta"><strong>${esc(x.Title)}</strong><span>${esc(x.Category)}</span></div></a>`).join('');
  $('testimonialsGrid').innerHTML=(d.testimonials||[]).map(x=>`<article class="testimonial"><div class="stars">${'★'.repeat(Math.max(0,Math.min(5,Number(x.Rating||5))))}</div><p>“${esc(x.Quote)}”</p><strong>${esc(x.Name)}</strong><small>${esc(x.Role)}</small></article>`).join('');

  $('leadForm').action=API_URL;
  document.title=(getSetting('siteName')||'Vigyapan')+' — '+(getSetting('siteTagline')||'Where Brands Get Noticed');
  setTimeout(()=>{$('loader').classList.add('hide')},200);
}

function isAdminMode(){
  const hash=(location.hash||'').toLowerCase();
  const params=new URLSearchParams(location.search);
  return hash==='#admin' || hash==='#admin/' || params.get('admin')==='1';
}

function showAdminShell(){
  document.title='Vigyapan — Admin';
  document.body.innerHTML=`<div id="adminShell"><div class="admin-loading"><div class="admin-v">V</div><div>Opening secure admin panel…</div></div><iframe id="adminFrame" title="Vigyapan Admin" allow="clipboard-read; clipboard-write"></iframe></div>`;
  const frame=document.getElementById('adminFrame');
  frame.src=API_URL;
}

function showPublicSite(){
  location.reload();
}

document.addEventListener('DOMContentLoaded',()=>{
  if(isAdminMode()){ showAdminShell(); return; }
  $('menuBtn').addEventListener('click',()=>$('nav').classList.toggle('open'));
  document.querySelectorAll('#nav a').forEach(a=>a.addEventListener('click',()=>$('nav').classList.remove('open')));
  $('leadForm').addEventListener('submit',()=>{ $('formMsg').textContent='Thank you. Your enquiry has been submitted.'; setTimeout(()=>{$('leadForm').reset()},400)});
  loadSite().catch(err=>{console.error(err);$('loader').innerHTML='<div class="loader-mark">V</div><div style="max-width:300px;line-height:1.5">Website setup is almost ready.<br>'+esc(err.message)+'</div>'});
});
