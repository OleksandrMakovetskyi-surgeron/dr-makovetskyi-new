const db=supabase.createClient(window.SUPABASE_URL,window.SUPABASE_PUBLISHABLE_KEY);const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));let settings={};async function auth(){const {data:{session}}=await db.auth.getSession();if(!session)return;const {data}=await db.from('admin_users').select('*').eq('user_id',session.user.id).eq('is_active',true).maybeSingle();if(!data)return;loginPage.style.display='none';adminApp.style.display='grid';loadAll()}loginForm.onsubmit=async e=>{e.preventDefault();const r=await db.auth.signInWithPassword({email:email.value,password:password.value});if(r.error){loginMsg.textContent=r.error.message;return}auth()};logoutBtn.onclick=()=>db.auth.signOut().then(()=>location.reload());document.querySelectorAll('[data-panel]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-panel]').forEach(x=>x.classList.remove('active'));b.classList.add('active');document.querySelectorAll('.panel').forEach(x=>x.classList.remove('active'));document.getElementById('panel-'+b.dataset.panel).classList.add('active')});
async function loadStats(){const [a,r,p,s]=await Promise.all([db.from('appointments').select('*',{count:'exact',head:true}),db.from('reviews').select('*',{count:'exact',head:true}),db.from('blog_posts').select('*',{count:'exact',head:true}),db.from('services').select('*',{count:'exact',head:true})]);stats.innerHTML=[['Заявки',a.count||0],['Відгуки',r.count||0],['Статті',p.count||0],['Послуги',s.count||0]].map(x=>`<div class="card"><span class="muted">${x[0]}</span><h2>${x[1]}</h2></div>`).join('')}
async function loadSettings(){const {data}=await db.from('site_settings').select('*').order('key');settings=Object.fromEntries((data||[]).map(x=>[x.key,x.value]));settingsForm.innerHTML=(data||[]).filter(x=>!x.key.startsWith('design_')).map(x=>`<label>${esc(x.key)}<input data-setting="${esc(x.key)}" value="${esc(x.value||'')}"></label>`).join('');for(const k of ['design_bg','design_paper','design_ink','design_accent','design_radius','design_container','design_section_space']){const e=document.getElementById(k);if(e)e.value=settings[k]||e.value}if(document.getElementById('showQuickContactToggle'))document.getElementById('showQuickContactToggle').checked=settings.show_quick_contact!=='false';
if(document.getElementById('patientSectionTitleAdmin'))patientSectionTitleAdmin.value=settings.patient_section_title||'Важливо для пацієнта';
if(document.getElementById('patientSectionIntroAdmin'))patientSectionIntroAdmin.value=settings.patient_section_intro||'Інтерактивні матеріали, памʼятки та файли для підготовки.';
if(document.getElementById('treatmentInfoEyebrowAdmin'))treatmentInfoEyebrowAdmin.value=settings.treatment_info_eyebrow||'Детальніше про лікування';
if(document.getElementById('treatmentInfoTitleAdmin'))treatmentInfoTitleAdmin.value=settings.treatment_info_title||'Інформація за напрямками';
if(document.getElementById('treatmentInfoIntroAdmin'))treatmentInfoIntroAdmin.value=settings.treatment_info_intro||'Окремі сторінки з інформацією для пацієнтів.'}saveSettings.onclick=async()=>{for(const e of document.querySelectorAll('[data-setting]'))await db.from('site_settings').upsert({key:e.dataset.setting,value:e.value},{onConflict:'key'});if(document.getElementById('showQuickContactToggle'))await db.from('site_settings').upsert({key:'show_quick_contact',value:String(document.getElementById('showQuickContactToggle').checked)},{onConflict:'key'});alert('Збережено')};saveDesign.onclick=async()=>{for(const k of ['design_bg','design_paper','design_ink','design_accent','design_radius','design_container','design_section_space'])await db.from('site_settings').upsert({key:k,value:document.getElementById(k).value},{onConflict:'key'});alert('Дизайн збережено')};
async function list(t,el,fn){const {data}=await db.from(t).select('*').order('sort_order',{ascending:true});el.innerHTML=(data||[]).map(fn).join('')}
async function loadDirections(){await list('directions',directionsList,x=>`<div class="list-row"><div><b>${esc(x.title)}</b><div class="muted">${esc(x.description||'')}</div></div><button class="btn light" onclick="editDirection('${x.id}')">Редагувати</button></div>`)}async function editDirection(id){let x={};if(id)x=(await db.from('directions').select('*').eq('id',id).single()).data||{};const title=prompt('Назва:',x.title||'');if(title===null)return;const description=prompt('Опис:',x.description||'');const icon=prompt('Іконка:',x.icon||'');const row={title,description,icon,published:true,sort_order:x.sort_order||0};id?await db.from('directions').update(row).eq('id',id):await db.from('directions').insert(row);loadDirections()}
async function loadServices(){await list('services',servicesList,x=>`<div class="list-row"><div><b>${esc(x.title)}</b><div class="muted">${esc(x.price||'')}</div></div><button class="btn light" onclick="editService('${x.id}')">Редагувати</button></div>`)}
async function editService(id){
  let x={};
  if(id)x=(await db.from('services').select('*').eq('id',id).single()).data||{};
  let modal=document.getElementById('serviceEditorModal');
  if(!modal){
    modal=document.createElement('div');
    modal.id='serviceEditorModal';
    modal.className='editor-overlay';
    modal.innerHTML=`<div class="editor-dialog">
      <div class="section-head"><h2>Редагування послуги</h2><button type="button" class="btn light" id="serviceEditorClose">Закрити</button></div>
      <label>Назва<input id="serviceTitle"></label>
      <label>Опис<textarea id="serviceDescription" rows="10" placeholder="Можна писати з нового рядка.\n\nНаприклад:\n1. Консультація хірурга\n2. Огляд та діагностика\n3. План лікування\n\nАбо:\n• Підготовка\n• Операція\n• Післяопераційний супровід"></textarea></label>
      <p class="muted">Enter — новий рядок. Можна використовувати 1., 2., 3., •, —, ✓ та інші знаки.</p>
      <label>Ціна / примітка<input id="servicePrice"></label>
      <label>URL фото<input id="serviceImage"></label>
      <label class="check-row"><input id="servicePublished" type="checkbox"> Показувати на сайті</label>
      <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:18px"><button type="button" class="btn" id="serviceEditorSave">Зберегти</button></div>
    </div>`;
    document.body.appendChild(modal);
    document.getElementById('serviceEditorClose').onclick=()=>modal.classList.remove('active');
  }
  serviceTitle.value=x.title||'';
  serviceDescription.value=x.description||'';
  servicePrice.value=x.price||'';
  serviceImage.value=x.image_url||'';
  servicePublished.checked=x.published!==false;
  modal.classList.add('active');
  serviceEditorSave.onclick=async()=>{
    const title=serviceTitle.value.trim();
    if(!title)return alert('Вкажіть назву послуги');
    const row={title,description:serviceDescription.value,price:servicePrice.value,image_url:serviceImage.value,published:servicePublished.checked,sort_order:x.sort_order||0};
    const r=id?await db.from('services').update(row).eq('id',id):await db.from('services').insert(row);
    if(r.error)return alert(r.error.message);
    modal.classList.remove('active');
    loadServices();
  };
}
async function loadEducation(){await list('education',educationList,x=>`<div class="list-row"><div><b>${esc(x.period||'')}</b> — ${esc(x.title)}</div><button class="btn light" onclick="editEducation('${x.id}')">Редагувати</button></div>`)}async function editEducation(id){let x={};if(id)x=(await db.from('education').select('*').eq('id',id).single()).data||{};const period=prompt('Період:',x.period||'');if(period===null)return;const title=prompt('Заклад / етап:',x.title||'');const description=prompt('Опис:',x.description||'');const row={period,title,description,sort_order:x.sort_order||0};id?await db.from('education').update(row).eq('id',id):await db.from('education').insert(row);loadEducation()}
async function loadBlog(){
  const {data}=await db.from('blog_posts').select('*').order('created_at',{ascending:false});
  blogList.innerHTML=(data||[]).map(x=>`<div class="list-row">
    <div>
      <b>${esc(x.title)}</b>
      <div class="muted">${x.published?'Опубліковано':'Чернетка'}</div>
    </div>
    <button class="btn light" onclick="editPost('${x.id}')">Редагувати</button>
  </div>`).join('');
}

async function editPost(id){
  let x={};
  if(id)x=(await db.from('blog_posts').select('*').eq('id',id).single()).data||{};

  let modal=document.getElementById('blogEditorModal');
  if(!modal){
    modal=document.createElement('div');
    modal.id='blogEditorModal';
    modal.className='editor-overlay';
    modal.innerHTML=`<div class="editor-dialog">
      <div class="section-head">
        <h2>Редагування статті</h2>
        <button type="button" class="btn light" id="blogEditorClose">Закрити</button>
      </div>

      <label>Заголовок
        <input id="blogTitle">
      </label>

      <label>Підзаголовок
        <textarea id="blogSubtitle" rows="3" placeholder="Можна писати з нового рядка"></textarea>
      </label>

      <label>Текст статті
        <textarea id="blogContent" rows="16" placeholder="Пишіть текст вільно.

Enter — новий рядок.

Можна використовувати:
1. Перший пункт
2. Другий пункт

• Маркований пункт
• Ще один пункт

✓ Перевага
— Примітка"></textarea>
      </label>

      <p class="muted">Enter створює новий рядок. Можна використовувати 1., 2., 3., •, —, ✓ та інші звичайні символи.</p>

      <label>URL фото / обкладинки
        <input id="blogImage" placeholder="https://...">
      </label>

      <label>URL відео
        <input id="blogVideo" placeholder="https://...">
      </label>

      <label class="check-row">
        <input id="blogPublished" type="checkbox">
        Опублікувати статтю
      </label>

      <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:18px">
        <button type="button" class="btn" id="blogEditorSave">Зберегти</button>
      </div>
    </div>`;
    document.body.appendChild(modal);
    blogEditorClose.onclick=()=>modal.classList.remove('active');
  }

  blogTitle.value=x.title||'';
  blogSubtitle.value=x.subtitle||'';
  blogContent.value=x.content||'';
  blogImage.value=x.image_url||'';
  blogVideo.value=x.video_url||'';
  blogPublished.checked=!!x.published;
  modal.classList.add('active');

  blogEditorSave.onclick=async()=>{
    const title=blogTitle.value.trim();
    if(!title)return alert('Вкажіть заголовок');

    const slug=x.slug || title
      .toLowerCase()
      .replace(/[^a-zа-яіїє0-9]+/gi,'-')
      .replace(/^-|-$/g,'');

    const row={
      slug,
      title,
      subtitle:blogSubtitle.value,
      content:blogContent.value,
      image_url:blogImage.value,
      video_url:blogVideo.value,
      published:blogPublished.checked,
      status:blogPublished.checked?'published':'draft'
    };

    const r=id
      ? await db.from('blog_posts').update(row).eq('id',id)
      : await db.from('blog_posts').insert(row);

    if(r.error)return alert(r.error.message);

    modal.classList.remove('active');
    loadBlog();
  };
}
mediaForm.onsubmit=async e=>{e.preventDefault();const f=mediaFile.files[0];const path=`${mediaKind.value}/${Date.now()}-${f.name.replace(/[^a-zA-Z0-9._-]/g,'_')}`;const up=await db.storage.from('site-media').upload(path,f);if(up.error)return alert(up.error.message);const url=db.storage.from('site-media').getPublicUrl(path).data.publicUrl;await db.from('media').insert({file_name:f.name,storage_path:path,public_url:url,alt_text:mediaAlt.value,kind:mediaKind.value});mediaForm.reset();loadMedia()};async function loadMedia(){const {data}=await db.from('media').select('*').order('created_at',{ascending:false});mediaList.innerHTML=(data||[]).map(x=>`<article class="card media"><img src="${esc(x.public_url||'')}" alt=""><div class="body"><span class="badge">${esc(x.kind||'')}</span><p>${esc(x.file_name||'')}</p></div></article>`).join('')}
async function loadReviews(){const {data}=await db.from('reviews').select('*').order('created_at',{ascending:false});reviewsList.innerHTML=(data||[]).map(x=>`<div class="list-row"><div><b>${esc(x.name)}</b><div>${esc(x.text)}</div></div><button class="btn light" onclick="toggleReview('${x.id}',${!!x.published})">${x.published?'Приховати':'Опублікувати'}</button></div>`).join('')}async function toggleReview(id,p){await db.from('reviews').update({published:!p}).eq('id',id);loadReviews()}
async function loadAppointments(){const {data}=await db.from('appointments').select('*').order('created_at',{ascending:false});appointmentsList.innerHTML=(data||[]).map(x=>`<div class="list-row"><div><b>${esc(x.name)} · ${esc(x.phone)}</b><div>${esc(x.direction||'')} · ${esc(x.callback_time||'')}</div><div class="muted">${esc(x.message||'')}</div></div><select onchange="updateAppointment('${x.id}',this.value)"><option ${x.status==='new'?'selected':''}>new</option><option ${x.status==='contacted'?'selected':''}>contacted</option><option ${x.status==='done'?'selected':''}>done</option></select></div>`).join('')}async function updateAppointment(id,status){await db.from('appointments').update({status}).eq('id',id)}
async function loadPatientDocs(){
  const {data}=await db.from('patient_resources').select('*').order('sort_order');
  patientDocsList.innerHTML=(data||[]).map(x=>`<div class="list-row"><div><b>${esc(x.title)}</b><div class="muted">${esc(x.description||'')}</div><span class="badge">${esc(x.type||'page')}</span></div><button class="btn light" onclick="editPatientDoc('${x.id}')">Редагувати</button></div>`).join('');
}
async function editPatientDoc(id){
  let x={};
  if(id)x=(await db.from('patient_resources').select('*').eq('id',id).single()).data||{};
  let modal=document.getElementById('patientEditorModal');
  if(!modal){
    modal=document.createElement('div');
    modal.id='patientEditorModal';
    modal.className='editor-overlay';
    modal.innerHTML=`<div class="editor-dialog">
      <div class="section-head"><h2>Інформаційна панель для пацієнтів</h2><button type="button" class="btn light" id="patientEditorClose">Закрити</button></div>
      <label>Назва<input id="patientTitle"></label>
      <label>Опис<textarea id="patientDescription" rows="6"></textarea></label>
      <label>Тип
        <select id="patientType">
          <option value="quiz">Самоперевірка симптомів</option>
          <option value="checklist">Чек-лист</option>
          <option value="page">Окрема сторінка</option>
          <option value="file">Файл / PDF</option>
        </select>
      </label>
      <label>Посилання / шлях<input id="patientUrl" placeholder="aftercare.html або URL файлу"></label>
      <label>Текст кнопки<input id="patientButtonLabel" placeholder="Відкрити"></label>
      <label>Іконка / знак<input id="patientIcon" placeholder="✓  ☑  •  +"></label>
      <label>Порядок<input id="patientSort" type="number" value="0"></label>
      <label class="check-row"><input id="patientPublished" type="checkbox"> Показувати на сайті</label>
      <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:18px"><button type="button" class="btn" id="patientEditorSave">Зберегти</button></div>
    </div>`;
    document.body.appendChild(modal);
    patientEditorClose.onclick=()=>modal.classList.remove('active');
  }
  patientTitle.value=x.title||'';
  patientDescription.value=x.description||'';
  patientType.value=x.type||'page';
  patientUrl.value=x.url||'';
  patientButtonLabel.value=x.button_label||'Відкрити';
  patientIcon.value=x.icon||'•';
  patientSort.value=x.sort_order||0;
  patientPublished.checked=x.published!==false;
  modal.classList.add('active');
  patientEditorSave.onclick=async()=>{
    const title=patientTitle.value.trim();
    if(!title)return alert('Вкажіть назву');
    const row={
      title,
      description:patientDescription.value,
      type:patientType.value,
      url:patientUrl.value,
      button_label:patientButtonLabel.value,
      icon:patientIcon.value,
      published:patientPublished.checked,
      sort_order:Number(patientSort.value)||0
    };
    const r=id?await db.from('patient_resources').update(row).eq('id',id):await db.from('patient_resources').insert(row);
    if(r.error)return alert(r.error.message);
    modal.classList.remove('active');
    loadPatientDocs();
  };
}

if(document.getElementById('savePatientSectionText'))savePatientSectionText.onclick=async()=>{
  await db.from('site_settings').upsert({key:'patient_section_title',value:patientSectionTitleAdmin.value},{onConflict:'key'});
  await db.from('site_settings').upsert({key:'patient_section_intro',value:patientSectionIntroAdmin.value},{onConflict:'key'});
  alert('Збережено');
};
if(document.getElementById('saveTreatmentInfoText'))saveTreatmentInfoText.onclick=async()=>{
  await db.from('site_settings').upsert({key:'treatment_info_eyebrow',value:treatmentInfoEyebrowAdmin.value},{onConflict:'key'});
  await db.from('site_settings').upsert({key:'treatment_info_title',value:treatmentInfoTitleAdmin.value},{onConflict:'key'});
  await db.from('site_settings').upsert({key:'treatment_info_intro',value:treatmentInfoIntroAdmin.value},{onConflict:'key'});
  alert('Збережено');
};

async function loadTreatmentInfoAdmin(){
  const {data}=await db.from('treatment_info_cards').select('*').order('sort_order');
  treatmentInfoList.innerHTML=(data||[]).map(x=>`<div class="list-row">
    <div><b>${esc(x.title)}</b><div class="muted">${esc(x.description||'')}</div><span class="badge">${x.published?'Показується':'Приховано'}</span></div>
    <button class="btn light" onclick="editTreatmentInfo('${x.id}')">Редагувати</button>
  </div>`).join('');
}
async function editTreatmentInfo(id){
  let x={};
  if(id)x=(await db.from('treatment_info_cards').select('*').eq('id',id).single()).data||{};
  let modal=document.getElementById('treatmentInfoEditorModal');
  if(!modal){
    modal=document.createElement('div');
    modal.id='treatmentInfoEditorModal';
    modal.className='editor-overlay';
    modal.innerHTML=`<div class="editor-dialog">
      <div class="section-head"><h2>Картка «Інформація за напрямками»</h2><button type="button" class="btn light" id="treatmentInfoClose">Закрити</button></div>
      <label>Назва<input id="treatmentInfoCardTitle"></label>
      <label>Опис<textarea id="treatmentInfoCardDescription" rows="5"></textarea></label>
      <label>Посилання<input id="treatmentInfoCardUrl" placeholder="pupkova-gryzha.html"></label>
      <label>Порядок<input id="treatmentInfoCardSort" type="number" value="0"></label>
      <label class="check-row"><input id="treatmentInfoCardPublished" type="checkbox"> Показувати на сайті</label>
      <div style="display:flex;justify-content:flex-end;margin-top:18px"><button class="btn" id="treatmentInfoSave">Зберегти</button></div>
    </div>`;
    document.body.appendChild(modal);
    treatmentInfoClose.onclick=()=>modal.classList.remove('active');
  }
  treatmentInfoCardTitle.value=x.title||'';
  treatmentInfoCardDescription.value=x.description||'';
  treatmentInfoCardUrl.value=x.url||'';
  treatmentInfoCardSort.value=x.sort_order||0;
  treatmentInfoCardPublished.checked=x.published!==false;
  modal.classList.add('active');
  treatmentInfoSave.onclick=async()=>{
    const row={
      title:treatmentInfoCardTitle.value.trim(),
      description:treatmentInfoCardDescription.value,
      url:treatmentInfoCardUrl.value,
      sort_order:Number(treatmentInfoCardSort.value)||0,
      published:treatmentInfoCardPublished.checked
    };
    if(!row.title)return alert('Вкажіть назву');
    const r=id?await db.from('treatment_info_cards').update(row).eq('id',id):await db.from('treatment_info_cards').insert(row);
    if(r.error)return alert(r.error.message);
    modal.classList.remove('active');
    loadTreatmentInfoAdmin();
  };
}

async function loadTemplates(){const {data}=await db.from('reply_templates').select('*').order('created_at');templatesList.innerHTML=(data||[]).map(x=>`<div class="list-row"><div><b>${esc(x.title)}</b><div class="muted">${esc(x.text)}</div></div><button class="btn light" onclick="navigator.clipboard.writeText(${JSON.stringify(x.text)})">Копіювати</button></div>`).join('')}async function editTemplate(){const title=prompt('Назва:');if(!title)return;const text=prompt('Текст:');if(!text)return;await db.from('reply_templates').insert({title,text});loadTemplates()}
async function loadMenu(){const {data}=await db.from('menu_items').select('*').order('sort_order');menuList.innerHTML=(data||[]).map(x=>`<div class="list-row"><div>${esc(x.label)} → ${esc(x.href)}</div><button class="btn light" onclick="editMenu('${x.id}')">Редагувати</button></div>`).join('')}addMenu.onclick=()=>editMenu();async function editMenu(id){let x={};if(id)x=(await db.from('menu_items').select('*').eq('id',id).single()).data||{};const label=prompt('Назва:',x.label||'');if(label===null)return;const href=prompt('Посилання:',x.href||'#');const row={label,href,visible:true,sort_order:x.sort_order||0};id?await db.from('menu_items').update(row).eq('id',id):await db.from('menu_items').insert(row);loadMenu()}
async function loadAll(){await loadSettings();await Promise.all([loadStats(),loadMenu(),loadDirections(),loadServices(),loadEducation(),loadBlog(),loadMedia(),loadReviews(),loadAppointments(),loadPatientDocs(),loadTreatmentInfoAdmin(),loadTemplates()])}auth()