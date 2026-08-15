const KEY='onushondhan_tv_news_v1';
function getNews(){return JSON.parse(localStorage.getItem(KEY)||'[]')}
function saveNews(x){localStorage.setItem(KEY,JSON.stringify(x))}
function esc(s=''){return s.replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
function renderHome(){
 const box=document.getElementById('newsList'); if(!box)return;
 const n=getNews(); box.innerHTML=n.length?n.map(x=>`<article class="card"><span class="tag">${esc(x.category)}</span><h2><a href="news.html?id=${x.id}">${esc(x.title)}</a></h2><p>${esc(x.body.slice(0,180))}...</p><div class="meta">${esc(x.date)}</div></article>`).join(''):'<div class="panel"><h2>এখনো কোনো নিউজ প্রকাশিত হয়নি</h2><p>Admin Panel থেকে প্রথম নিউজটি প্রকাশ করুন।</p></div>';
}
function renderArticle(){
 const box=document.getElementById('article'); if(!box)return;
 const id=new URLSearchParams(location.search).get('id'); const x=getNews().find(a=>a.id===id);
 if(!x){box.innerHTML='<div class="panel"><h2>নিউজ পাওয়া যায়নি</h2></div>';return}
 const img=x.image?`<img src="${esc(x.image)}" alt="">`:'';
 box.innerHTML=`<article class="article"><span class="tag">${esc(x.category)}</span><h1>${esc(x.title)}</h1><div class="meta">প্রকাশ: ${esc(x.date)}</div>${img}<div>${x.body.split(/\n+/).map(p=>`<p>${esc(p)}</p>`).join('')}</div><div class="url">এই নিউজের লিংক: ${location.href}</div><p><a href="index.html">← সব নিউজ</a></p></article>`;
}
function login(){
 const u=document.getElementById('user').value,p=document.getElementById('pass').value;
 if(u==='admin'&&p==='12345'){sessionStorage.setItem('admin','1');showDash()}else document.getElementById('loginMsg').textContent='Username বা Password ভুল।';
}
function showDash(){
 const a=document.getElementById('dash');if(!a)return;
 if(sessionStorage.getItem('admin')==='1'){document.getElementById('loginBox').classList.add('hidden');a.classList.remove('hidden');renderAdmin()}
}
function publish(){
 const title=document.getElementById('title').value.trim(),category=document.getElementById('category').value.trim()||'সাধারণ',body=document.getElementById('body').value.trim(),image=document.getElementById('image').value.trim();
 if(!title||!body){document.getElementById('pubMsg').textContent='শিরোনাম ও বিস্তারিত লিখুন।';return}
 const id=Date.now().toString(36);const n=getNews();n.unshift({id,title,category,body,image,date:new Date().toLocaleString('bn-BD')});saveNews(n);
 document.getElementById('pubMsg').innerHTML=`প্রকাশ হয়েছে: <a href="news.html?id=${id}">নিউজ খুলুন</a>`;['title','category','body','image'].forEach(i=>document.getElementById(i).value='');renderAdmin();
}
function renderAdmin(){
 const b=document.getElementById('adminList');if(!b)return;
 b.innerHTML=getNews().map(x=>`<div class="card"><b>${esc(x.title)}</b><p class="url">news.html?id=${x.id}</p><button class="danger" onclick="delNews('${x.id}')">Delete</button></div>`).join('')||'<p>কোনো নিউজ নেই।</p>';
}
function delNews(id){saveNews(getNews().filter(x=>x.id!==id));renderAdmin()}
renderHome();renderArticle();showDash();