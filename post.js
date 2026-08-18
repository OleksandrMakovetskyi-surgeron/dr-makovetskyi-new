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
    postImageWrap.style.display='block';
  }

  if(data.video_url){
    postVideo.src=data.video_url;
    postVideoWrap.style.display='block';
  }
}

loadPost();
