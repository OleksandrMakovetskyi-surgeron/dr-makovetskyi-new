const db=supabase.createClient(window.SUPABASE_URL,window.SUPABASE_PUBLISHABLE_KEY);const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));async function q(t){const r=await db.from(t).select('*');return r.error?[]:(r.data||[])}
async function loadSettings(){const rows=await q('site_settings');const s=Object.fromEntries(rows.map(x=>[x.key,x.value]));if(s.hero_title)heroTitle.textContent=s.hero_title;if(s.hero_subtitle)heroSubtitle.textContent=s.hero_subtitle;if(s.doctor_photo_url)doctorPhoto.src=s.doctor_photo_url;if(s.helsi_url)helsiLink.href=s.helsi_url;
if(s.patient_section_title&&document.getElementById('patientSectionTitle'))patientSectionTitle.textContent=s.patient_section_title;
if(s.patient_section_intro&&document.getElementById('patientSectionIntro'))patientSectionIntro.textContent=s.patient_section_intro;
if(s.treatment_info_eyebrow&&document.getElementById('treatmentInfoEyebrow'))treatmentInfoEyebrow.textContent=s.treatment_info_eyebrow;
if(s.treatment_info_title&&document.getElementById('treatmentInfoTitle'))treatmentInfoTitle.textContent=s.treatment_info_title;
if(s.treatment_info_intro&&document.getElementById('treatmentInfoIntro'))treatmentInfoIntro.textContent=s.treatment_info_intro;if(document.getElementById('heroQuickContact'))document.getElementById('heroQuickContact').style.display=(s.show_quick_contact==='false')?'none':'block';const root=document.documentElement;[['design_bg','--bg'],['design_paper','--paper'],['design_ink','--ink'],['design_accent','--accent'],['design_radius','--radius'],['design_container','--container'],['design_section_space','--section-space']].forEach(([k,v])=>{if(s[k])root.style.setProperty(v,s[k])})}
async function loadDoctor(){const {data}=await db.from('doctor_profile').select('*').limit(1).maybeSingle();if(data)doctorBio.textContent=data.description||''}
async function loadDirections(){const d=(await q('directions')).filter(x=>x.published!==false).sort((a,b)=>(a.sort_order||0)-(b.sort_order||0));directionsGrid.innerHTML=(d.length?d:[{title:'Лапароскопічна хірургія',icon:'01'},{title:'Хірургія гриж живота',icon:'02'},{title:'Проктологія',icon:'03'},{title:'Пластична хірургія',icon:'04'}]).map(x=>`<article class="card priority-card"><div class="icon">${esc(x.icon||'✦')}</div><div><h3>${esc(x.title)}</h3><p class="muted service-description">${esc(x.description||'')}</p></div></article>`).join('')}
async function loadServices(){const d=(await q('services')).filter(x=>x.published!==false).sort((a,b)=>(a.sort_order||0)-(b.sort_order||0));servicesGrid.innerHTML=d.map(x=>`<article class="card media">${x.image_url?`<img src="${esc(x.image_url)}">`:''}<div class="body"><h3>${esc(x.title)}</h3><p class="muted service-description">${esc(x.description||'')}</p>${x.price?`<b>${esc(x.price)}</b>`:''}</div></article>`).join('')}
async function loadEducation(){const d=(await q('education')).sort((a,b)=>(a.sort_order||0)-(b.sort_order||0));educationTimeline.innerHTML=(d.length?d:[{period:'2013–2017',title:'Білоцерківський медичний фаховий коледж'},{period:'2017–2022',title:'Полтавський державний медичний університет'},{period:'2022–2025',title:'Інтернатура з хірургії — НМУ ім. О.О. Богомольця'}]).map(x=>`<div class="timeline-row"><b>${esc(x.period||'')}</b><div><h3>${esc(x.title)}</h3><p class="muted service-description">${esc(x.description||'')}</p></div></div>`).join('')}
function blogImgStyle(x,small=false){
  const fit=['contain','cover'].includes(x.image_fit)?x.image_fit:'contain';
  const pos=['center','top','bottom'].includes(x.image_position)?x.image_position:'center';
  const h=Number(x.image_height);
  const height=Number.isFinite(h)&&h>=180&&h<=900?h:420;
  return `width:100%;height:${height}px;object-fit:${fit};object-position:${pos};background:#f2f2ed;display:block;`;
}
async function loadBlog(){
  const d=(await q('blog_posts'))
    .filter(x=>x.published===true)
    .sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));

  if(!d.length){
    blogArea.innerHTML='<p>Статті скоро зʼявляться.</p>';
    return;
  }

  const [f,...r]=d;
  const fUrl=`post.html?slug=${encodeURIComponent(f.slug||'')}`;

  blogArea.innerHTML=`
    <article class="blog-feature">
      ${f.image_url?`<a href="${fUrl}"><img src="${esc(f.image_url)}" alt="${esc(f.title)}" style="${blogImgStyle(f)}"></a>`:''}
      <div class="body">
        <h3><a href="${fUrl}" class="plain-link">${esc(f.title)}</a></h3>
        <p class="blog-subtitle">${esc(f.subtitle||f.excerpt||'')}</p>
        <a class="btn ghost" href="${fUrl}">Читати статтю</a>
      </div>
    </article>
    <div class="blog-list">
      ${r.slice(0,4).map(x=>{
        const url=`post.html?slug=${encodeURIComponent(x.slug||'')}`;
        return `<article class="blog-small">
          ${x.image_url?`<a href="${url}"><img src="${esc(x.image_url)}" alt="${esc(x.title)}" style="${blogImgStyle(x,true)}"></a>`:''}
          <div>
            <h3><a href="${url}" class="plain-link">${esc(x.title)}</a></h3>
            <p class="muted blog-subtitle">${esc(x.subtitle||x.excerpt||'')}</p>
          </div>
        </article>`;
      }).join('')}
    </div>`;
}

async function loadGallery(){const d=(await q('media')).filter(x=>x.kind==='gallery');galleryGrid.innerHTML=d.map(x=>x.public_url?`<img src="${esc(x.public_url)}" alt="${esc(x.alt_text||'')}">`:'').join('')}
async function loadReviews(){const d=(await q('reviews')).filter(x=>x.published===true).sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));reviewsGrid.innerHTML=d.map(x=>`<article class="review"><div class="stars">${'★'.repeat(x.rating||5)}</div><p>«${esc(x.text)}»</p><b>${esc(x.name)}</b></article>`).join('')||'<p>Відгуки ще не опубліковані.</p>'}
async function loadVideoReviews(){const d=(await q('video_reviews')).filter(x=>x.published!==false);videoReviewsGrid.innerHTML=d.map(x=>`<div class="video-circle">${x.video_url?`<video controls preload="metadata" src="${esc(x.video_url)}"></video>`:`<img src="${esc(x.poster_url||'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80')}">`}<p>${esc(x.name||'Пацієнт')}</p></div>`).join('')||'<p>Відео-відгуки будуть додані після отримання згоди пацієнтів.</p>'}

async function loadPatientResources(){
  const data=(await q('patient_resources')).filter(x=>x.published!==false).sort((a,b)=>(a.sort_order||0)-(b.sort_order||0));
  const box=document.getElementById('patientToolsGrid');
  if(!box)return;
  const fallback=[
    {title:'Самоперевірка симптомів',description:'Короткий опитник «Схоже на грижу?»',type:'quiz',button_label:'Пройти опитник',icon:'✓'},
    {title:'Чек-лист підготовки',description:'Інтерактивний список із можливістю друку.',type:'checklist',button_label:'Відкрити чек-лист',icon:'☑'},
    {title:'Памʼятка після операції',description:'Окрема сторінка для QR-коду.',type:'page',url:'aftercare.html',button_label:'Відкрити памʼятку',icon:'＋'},
    {title:'Що взяти в лікарню',description:'Документи, речі та рекомендації.',type:'page',url:'hospital-bag.html',button_label:'Переглянути список',icon:'▣'}
  ];
  const rows=data.length?data:fallback;
  box.innerHTML=rows.map(x=>{
    let action='';
    if(x.type==='quiz') action=`<button class="btn" onclick="openQuiz()">${esc(x.button_label||'Відкрити')}</button>`;
    else if(x.type==='checklist') action=`<button class="btn" onclick="openChecklist()">${esc(x.button_label||'Відкрити')}</button>`;
    else action=`<a class="btn" href="${esc(x.url||'#')}">${esc(x.button_label||'Відкрити')}</a>`;
    return `<div class="tool-card"><div class="patient-tool-icon">${esc(x.icon||'•')}</div><h3>${esc(x.title)}</h3><p class="muted">${esc(x.description||'')}</p><div class="patient-tool-actions">${action}</div></div>`;
  }).join('');
}

async function loadTreatmentInfo(){
  const data=(await q('treatment_info_cards')).filter(x=>x.published!==false).sort((a,b)=>(a.sort_order||0)-(b.sort_order||0));
  const box=document.getElementById('treatmentInfoGrid');
  if(!box)return;
  box.innerHTML=data.map(x=>`<a class="card" href="${esc(x.url||'#')}"><h3>${esc(x.title)}</h3><p class="muted">${esc(x.description||'')}</p></a>`).join('');
}
showPhone.onclick=()=>phoneReveal.style.display=phoneReveal.style.display==='none'?'block':'none';const contactClose=document.getElementById('contactClose');
if(contactClose){
  contactClose.onclick=(e)=>{
    e.stopPropagation();
    contactPopover.classList.remove('active');
  };
}

contactBtn.onclick=()=>contactPopover.classList.toggle('active');medicalConsent.onchange=()=>baContent.style.display=medicalConsent.checked?'block':'none';document.querySelectorAll('[data-ba]').forEach(el=>{const inp=el.querySelector('input'),after=el.querySelector('.after'),line=el.querySelector('.ba-line');inp.oninput=()=>{after.style.clipPath=`inset(0 ${100-inp.value}% 0 0)`;line.style.left=inp.value+'%'}})
reviewForm.onsubmit=async e=>{e.preventDefault();const r=await db.from('reviews').insert({name:rname.value.trim(),rating:+rating.value,text:rtext.value.trim(),published:false});alert(r.error?'Помилка':'Дякуємо! Відгук надіслано на модерацію.');if(!r.error)e.target.reset()}
appointmentForm.onsubmit=async e=>{e.preventDefault();const r=await db.from('appointments').insert({name:aname.value.trim(),phone:aphone.value.trim(),message:amessage.value.trim(),callback_time:callbackTime.value,direction:direction.value,source_page:location.pathname,status:'new'});formMsg.textContent=r.error?'Помилка надсилання':'Заявку надіслано!';if(!r.error)e.target.reset()}
const quizQs=['Чи є випинання в ділянці живота або паху?','Чи збільшується воно при кашлі або навантаженні?','Чи є біль або дискомфорт?','Чи зменшується випинання лежачи?'];let qi=0,yes=0;function openQuiz(){qi=0;yes=0;quizModal.classList.add('active');renderQuiz()}function closeQuiz(){quizModal.classList.remove('active')}function renderQuiz(){if(qi>=quizQs.length){quizBody.innerHTML=`<p>${yes>=2?'Є ознаки, які можуть відповідати грижі. Рекомендовано звернутися до хірурга для огляду.':'За відповідями явних ознак недостатньо, але при симптомах варто звернутися до лікаря.'}</p><a class="btn" href="#appointment" onclick="closeQuiz()">Залишити заявку</a>`;return}quizBody.innerHTML=`<p>${quizQs[qi]}</p><div style="display:flex;gap:10px"><button class="btn" onclick="answerQuiz(true)">Так</button><button class="btn ghost" onclick="answerQuiz(false)">Ні</button></div>`}function answerQuiz(v){if(v)yes++;qi++;renderQuiz()}function openChecklist(){
  checklistModal.classList.add('active');
  checklistModal.setAttribute('aria-hidden','false');
  const items=[
    'Паспорт / документ',
    'Медичні документи та результати обстежень',
    'Перелік ліків',
    'Виконати рекомендації щодо їжі та води',
    'Підготувати зручний одяг',
    'Уточнити час госпіталізації'
  ];
  checklistBody.innerHTML=items.map(x=>`
    <label class="checklist-row">
      <input type="checkbox">
      <span class="checklist-text">${x}</span>
    </label>
  `).join('');
}
function closeChecklist(){
  checklistModal.classList.remove('active');
  checklistModal.setAttribute('aria-hidden','true');
}Promise.allSettled([loadSettings(),loadDoctor(),loadDirections(),loadServices(),loadEducation(),loadBlog(),loadGallery(),loadReviews(),loadVideoReviews(),loadPatientResources(),loadTreatmentInfo()]);
document.addEventListener('click',(e)=>{
  if(contactPopover?.classList.contains('active') &&
     !contactPopover.contains(e.target) &&
     !contactBtn.contains(e.target)){
    contactPopover.classList.remove('active');
  }
});
