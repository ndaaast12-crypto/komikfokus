
const API = "https://api.shngm.io";

const HTML = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#101114">
<title>KomikFokus</title>
<style>
*{box-sizing:border-box}
body{margin:0;background:#101114;color:#f4f4f5;font:15px system-ui,sans-serif}
header{position:sticky;top:0;background:#101114f5;border-bottom:1px solid #30313a;padding:14px;z-index:5}
nav,main{max-width:1000px;margin:auto}
nav{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
.logo{font-weight:900;font-size:22px;color:#c7d2fe}
.search{display:flex;flex:1;min-width:230px;gap:6px}
input{min-width:0;width:100%;background:#202127;border:1px solid #373943;color:white;padding:12px;border-radius:10px;font:inherit}
button{background:#c7d2fe;color:#171824;border:0;border-radius:9px;padding:11px 14px;font-weight:700;font:inherit;cursor:pointer}
button.secondary{background:#262832;color:white;border:1px solid #393b46}
main{padding:16px}
.hero{padding:22px;border:1px solid #343642;border-radius:15px;background:linear-gradient(130deg,#272943,#17181f);margin:8px 0 20px}
h1{font-size:28px;margin:0 0 8px}h2{font-size:19px;margin:22px 0 12px}
p,.muted{color:#a7a9b5;font-size:13px}
.row{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0}
.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
.card{min-width:0;cursor:pointer}
.cover{aspect-ratio:3/4;background:linear-gradient(145deg,#39395a,#22232a);border-radius:9px;overflow:hidden;display:grid;place-items:center;color:#d3d4ff;font-size:30px;font-weight:800}
.cover img{width:100%;height:100%;object-fit:cover}
.card b{display:block;font-size:13px;margin-top:7px;overflow-wrap:anywhere}
.card small{color:#a7a9b5}
#reader{display:none}
.page{display:block;width:100%;height:auto}
#message{white-space:pre-wrap;overflow-wrap:anywhere;color:#c7d2fe;font-size:13px}
.chapter{display:block;width:100%;text-align:left;margin:5px 0;background:#22242d;color:white}
@media(min-width:650px){.grid{grid-template-columns:repeat(5,minmax(0,1fr))}main{padding:24px}}
</style>
</head>
<body>
<header><nav>
<div class="logo">KomikFokus</div>
<form class="search" id="form">
<input id="q" placeholder="Cari manga, manhwa, manhua..." autocomplete="off">
<button>Cari</button>
</form>
</nav></header>
<main>
<section class="hero">
<h1>Baca komik, fokus ke cerita.</h1>
<p>Cari judul favoritmu dan buka chapter langsung dari reader.</p>
<div class="row">
<button id="latest">Terbaru</button>
<button id="popular" class="secondary">Populer</button>
</div>
</section>
<div id="message">Menghubungkan ke katalog komik...</div>
<section id="catalog"><h2>Komik</h2><div id="items" class="grid"></div></section>
<section id="detail" style="display:none">
<button class="secondary" id="back">← Kembali</button>
<h2 id="title"></h2>
<div id="chapters"></div>
</section>
<section id="reader">
<button class="secondary" id="backDetail">← Daftar chapter</button>
<h2 id="chapterTitle"></h2>
<div id="pages"></div>
</section>
</main>
<script>
const $=s=>document.querySelector(s);
function msg(t){$('#message').textContent=t}
async function api(path){
 const r=await fetch('/api'+path);
 const text=await r.text();
 let d;try{d=JSON.parse(text)}catch{throw Error('Respons API bukan JSON')}
 if(!r.ok)throw Error((d.error||'API error')+' (HTTP '+r.status+')');
 return d;
}
function arr(d){
 if(Array.isArray(d))return d;
 if(d&&Array.isArray(d.data))return d.data;
 if(d&&Array.isArray(d.results))return d.results;
 if(d&&Array.isArray(d.items))return d.items;
 if(d&&d.data&&Array.isArray(d.data.items))return d.data.items;
 return [];
}
function getId(x){return x.manga_id||x.id||x.slug||x.url||x.href||''}
function getTitle(x){return x.title||x.name||x.mangaName||'Tanpa judul'}
function getCover(x){return x.cover_image_url||x.cover_portrait_url||x.cover||x.thumbnail||x.image||x.img||''}
function card(x){
 const el=document.createElement('div');el.className='card';
 const cover=document.createElement('div');cover.className='cover';
 const src=getCover(x);
 if(src){const im=document.createElement('img');im.loading='lazy';im.src=src;im.alt=getTitle(x);cover.append(im)}
 else cover.textContent=getTitle(x).slice(0,2).toUpperCase();
 const t=document.createElement('b');t.textContent=getTitle(x);
 const m=document.createElement('small');m.textContent=x.latest_chapter_title||x.latestChapter||x.chapter||x.type||'';
 el.append(cover,t,m);el.onclick=()=>openManga(x);return el;
}
function render(list){
 $('#items').replaceChildren();
 if(!list.length){msg('Tidak ada hasil atau format respons API berubah.');return}
 list.forEach(x=>$('#items').append(card(x)));
 msg(list.length+' komik berhasil dimuat.');
}
async function loadList(path){
 msg('Memuat katalog...');
 try{render(arr(await api(path)))}catch(e){msg('Gagal mengambil katalog: '+e.message+'\\nCek /api/status dan endpoint API.')}
}
$('#form').onsubmit=e=>{
 e.preventDefault();const q=$('#q').value.trim();if(!q)return;
 $('#catalog').style.display='block';$('#detail').style.display='none';$('#reader').style.display='none';
 loadList('/v1/manga/list?page=1&page_size=30&q='+encodeURIComponent(q));
};
$('#latest').onclick=()=>loadList('/v1/manga/list?page=1&page_size=30&sort=latest');
$('#popular').onclick=()=>loadList('/v1/manga/list?page=1&page_size=30&sort=popularity');
let selected=null;
async function openManga(m){
 selected=m;$('#catalog').style.display='none';$('#reader').style.display='none';$('#detail').style.display='block';
 $('#title').textContent=getTitle(m);$('#chapters').textContent='Memuat chapter...';
 try{
  const d=await api('/v1/chapter/'+encodeURIComponent(getId(m))+'/list?page_size=300');
  const list=arr(d);$('#chapters').replaceChildren();
  if(!list.length){$('#chapters').textContent='Daftar chapter kosong atau format API berubah.';return}
  list.forEach((c,i)=>{
   const b=document.createElement('button');b.className='chapter';
   const name=c.chapter_title||c.title||c.name||('Chapter '+(c.chapter_number??i+1));
   b.textContent=name;
   b.onclick=()=>openChapter(c,name);
   $('#chapters').append(b);
  });
 }catch(e){$('#chapters').textContent='Gagal memuat chapter: '+e.message}
}
async function openChapter(c,name){
 $('#detail').style.display='none';$('#reader').style.display='block';
 $('#chapterTitle').textContent=name;$('#pages').textContent='Memuat halaman...';
 try{
  const id=c.chapter_id||c.id||c.slug||c.url||c.href||'';
  const d=await api('/v1/chapter/detail/'+encodeURIComponent(id));
  let obj=d.data||d;
  let chapter=obj.chapter||obj;
  let images=[];
  if(Array.isArray(chapter.data)&&chapter.path&&obj.base_url){
   images=chapter.data.map(f=>obj.base_url+chapter.path+f);
  }else{
   function scan(x){
    if(!x)return;
    if(Array.isArray(x)){x.forEach(scan);return}
    if(typeof x==='object'){
     for(const [k,v] of Object.entries(x)){
      if(typeof v==='string'&&/^https?:\\/\\//i.test(v)&&/(image|img|page|original|src)/i.test(k))images.push(v);
      else if(typeof v==='object')scan(v);
     }
    }
   }
   scan(obj);
  }
  images=[...new Set(images)];
  $('#pages').replaceChildren();
  if(!images.length){$('#pages').textContent='URL halaman tidak ditemukan dalam respons API.';return}
  images.forEach((src,i)=>{
   const im=document.createElement('img');im.className='page';im.loading=i<2?'eager':'lazy';im.decoding='async';im.alt='Halaman '+(i+1);im.src=src;$('#pages').append(im);
  });
 }catch(e){$('#pages').textContent='Gagal membuka chapter: '+e.message}
}
$('#back').onclick=()=>{$('#detail').style.display='none';$('#catalog').style.display='block'};
$('#backDetail').onclick=()=>{if(selected)openManga(selected)};
loadList('/v1/manga/list?page=1&page_size=30&sort=latest');
</script>
</body>
</html>`;

const cache = new Map();
const TTL = 30_000;

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/api/status") {
      try {
        const r = await fetch(API + "/v1/manga/list?page=1&page_size=1", {
          headers: { "Accept": "application/json" },
          signal: AbortSignal.timeout(8000)
        });
        return Response.json({
          worker: "running",
          upstreamStatus: r.status,
          apiReachable: r.ok
        });
      } catch (e) {
        return Response.json({
          worker: "running",
          apiReachable: false,
          error: e.message
        }, { status: 502 });
      }
    }

    if (url.pathname.startsWith("/api/")) {
      const suffix = url.pathname.slice(4) + url.search;
      let target;
      try {
        target = new URL(suffix, API);
        if (target.origin !== API) {
          return Response.json({ error: "Invalid API path" }, { status: 400 });
        }
      } catch {
        return Response.json({ error: "Invalid API path" }, { status: 400 });
      }

      const key = target.toString();
      const cached = cache.get(key);
      if (cached && cached.expires > Date.now()) {
        return new Response(cached.body, {
          headers: {
            "content-type": cached.type,
            "cache-control": "public, max-age=30",
            "x-komikfokus-cache": "HIT"
          }
        });
      }

      try {
        const upstream = await fetch(key, {
          headers: {
            "Accept": "application/json",
            "Referer": "https://11.shinigami.asia/",
            "Origin": "https://11.shinigami.asia"
          },
          signal: AbortSignal.timeout(12000)
        });
        const body = await upstream.text();
        const type = upstream.headers.get("content-type") || "application/json";
        if (upstream.ok && body.length < 1500000) {
          cache.set(key, {
            body,
            type,
            expires: Date.now() + TTL
          });
        }
        return new Response(body, {
          status: upstream.status,
          headers: {
            "content-type": type,
            "cache-control": "no-store"
          }
        });
      } catch (e) {
        return Response.json({
          error: "Shinigami API tidak bisa dijangkau",
          detail: e.message
        }, { status: 502 });
      }
    }

    return new Response(HTML, {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-cache"
      }
    });
  }
};
