const db=supabase.createClient(window.SUPABASE_URL,window.SUPABASE_PUBLISHABLE_KEY);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

async function loadPost(){
  const slug=new URLSearchParams(location.search).get('slug');
  if(!slug){
    postTitle.textContent='Статтю не знайдено';
    return;
  }

  const {data,error}=await db
    .from('blog_posts')
    .select('*')
    .eq('slug',slug)
    .eq('published',true)
    .maybeSingle();

  if(error||!data){
    postTitle.textContent='Статтю не знайдено';
    return;
  }

  document.title=`${data.title} — dr.makovetskyi.com.ua`;
  postTitle.textContent=data.title||'';
  postSubtitle.textContent=data.subtitle||'';
  postContent.textContent=data.content||'';

  if(data.image_url){
    postImage.src=data.image_url;
    postImage.alt=data.title||'Стаття';
    const fit=['contain','cover'].includes(data.image_fit)?data.image_fit:'contain';
    const pos=['center','top','bottom'].includes(data.image_position)?data.image_position:'center';
    const h=Number(data.image_height);
    postImage.style.objectFit=fit;
    postImage.style.objectPosition=pos;
    postImage.style.height=(Number.isFinite(h)&&h>=180&&h<=900?h:520)+'px';
    postImage.style.background='#f2f2ed';
    postImageWrap.style.display='block';
  }

  if(data.video_url){
    postVideo.src=data.video_url;
    postVideoWrap.style.display='block';
  }
}

loadPost();
