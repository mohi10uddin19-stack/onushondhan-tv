const firebaseConfig = {
  apiKey: "AIzaSyAPP-Z3985x6eISznoMxQZQJAWVILAceU",
  authDomain: "onushondhan-v.firebaseapp.com",
  projectId: "onushondhan-v",
  storageBucket: "onushondhan-v.firebasestorage.app",
  messagingSenderId: "669433176030",
  appId: "1:669433176030:web:bc736dad4c3926b287074f"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

const NEWS = "news";

function esc(s = "") {
  return String(s).replace(/[&<>"']/g, m => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;"
  }[m]));
}

function newsDate(data) {
  if (data.date) return data.date;
  if (data.createdAt && data.createdAt.toDate) {
    return data.createdAt.toDate().toLocaleString("bn-BD");
  }
  return "";
}

async function getNews() {
  const snap = await db.collection(NEWS).orderBy("createdAt", "desc").get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

async function renderHome() {
  const box = document.getElementById("newsList");
  if (!box) return;
  try {
    const n = await getNews();
    box.innerHTML = n.length ? n.map(x => `
      <article class="card">
        <span class="tag">${esc(x.category || "সাধারণ")}</span>
        <h2><a href="news.html?id=${encodeURIComponent(x.id)}">${esc(x.title)}</a></h2>
        <p>${esc((x.body || "").slice(0,180))}${(x.body || "").length > 180 ? "..." : ""}</p>
        <div class="meta">${esc(newsDate(x))}</div>
      </article>
    `).join("") : '<div class="panel"><h2>এখনো কোনো নিউজ প্রকাশিত হয়নি</h2><p>Admin Panel থেকে প্রথম নিউজটি প্রকাশ করুন।</p></div>';
  } catch (e) {
    console.error(e);
    box.innerHTML = '<div class="panel"><h2>নিউজ লোড করা যাচ্ছে না</h2><p>কিছুক্ষণ পর আবার চেষ্টা করুন।</p></div>';
  }
}

async function renderArticle() {
  const box = document.getElementById("article");
  if (!box) return;

  const id = new URLSearchParams(location.search).get("id");
  if (!id) {
    box.innerHTML = '<div class="panel"><h2>নিউজ পাওয়া যায়নি</h2></div>';
    return;
  }

  try {
    const doc = await db.collection(NEWS).doc(id).get();
    if (!doc.exists) {
      box.innerHTML = '<div class="panel"><h2>নিউজ পাওয়া যায়নি</h2></div>';
      return;
    }

    const x = { id: doc.id, ...doc.data() };
    const img = x.image ? `<img src="${esc(x.image)}" alt="" loading="lazy">` : "";
    const paragraphs = String(x.body || "").split(/\n+/)
      .filter(Boolean)
      .map(p => `<p>${esc(p)}</p>`).join("");

    box.innerHTML = `
      <article class="article">
        <span class="tag">${esc(x.category || "সাধারণ")}</span>
        <h1>${esc(x.title)}</h1>
        <div class="meta">প্রকাশ: ${esc(newsDate(x))}</div>
        ${img}
        <div>${paragraphs}</div>
        <div class="url">এই নিউজের লিংক: ${esc(location.href)}</div>
        <p><a href="index.html">← সব নিউজ</a></p>
      </article>`;
  } catch (e) {
    console.error(e);
    box.innerHTML = '<div class="panel"><h2>নিউজ লোড করা যাচ্ছে না</h2><p>কিছুক্ষণ পর আবার চেষ্টা করুন।</p></div>';
  }
}

async function login() {
  const email = document.getElementById("user").value.trim();
  const password = document.getElementById("pass").value;
  const msg = document.getElementById("loginMsg");

  try {
    await auth.signInWithEmailAndPassword(email, password);
    msg.textContent = "Login সফল হয়েছে।";
    showDash();
  } catch (e) {
    console.error(e);
    msg.textContent = "Email অথবা Password ভুল।";
  }
}
window.login = login;

function showDash() {
  const a = document.getElementById("dash");
  const loginBox = document.getElementById("loginBox");
  if (!a || !loginBox) return;

  auth.onAuthStateChanged(user => {
    if (user) {
      loginBox.classList.add("hidden");
      a.classList.remove("hidden");
      renderAdmin();
    } else {
      loginBox.classList.remove("hidden");
      a.classList.add("hidden");
    }
  });
}

async function publish() {
  const title = document.getElementById("title").value.trim();
  const category = document.getElementById("category").value.trim() || "সাধারণ";
  const body = document.getElementById("body").value.trim();
  const image = document.getElementById("image").value.trim();
  const msg = document.getElementById("pubMsg");

  if (!title || !body) {
    msg.textContent = "শিরোনাম ও বিস্তারিত লিখুন।";
    return;
  }

  const user = auth.currentUser;
  if (!user) {
    msg.textContent = "আগে Admin Login করুন।";
    return;
  }

  try {
    const ref = await db.collection(NEWS).add({
      title,
      category,
      body,
      image,
      date: new Date().toLocaleString("bn-BD"),
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      authorUid: user.uid
    });

    const url = `news.html?id=${encodeURIComponent(ref.id)}`;
    msg.innerHTML = `প্রকাশ হয়েছে: <a href="${url}">নিউজ খুলুন</a>`;
    ["title","category","body","image"].forEach(i => {
      const el = document.getElementById(i);
      if (el) el.value = "";
    });
    renderAdmin();
  } catch (e) {
    console.error(e);
    msg.textContent = "নিউজ প্রকাশ করা যায়নি। Firebase Rules ও Login পরীক্ষা করুন।";
  }
}
window.publish = publish;

async function renderAdmin() {
  const b = document.getElementById("adminList");
  if (!b) return;

  try {
    const n = await getNews();
    b.innerHTML = n.map(x => `
      <div class="card">
        <b>${esc(x.title)}</b>
        <p class="url">news.html?id=${encodeURIComponent(x.id)}</p>
        <button class="danger" onclick="delNews('${esc(x.id)}')">Delete</button>
      </div>
    `).join("") || "<p>কোনো নিউজ নেই।</p>";
  } catch (e) {
    console.error(e);
    b.innerHTML = "<p>নিউজ লোড করা যাচ্ছে না।</p>";
  }
}

async function delNews(id) {
  if (!confirm("এই নিউজটি মুছে ফেলবেন?")) return;
  try {
    await db.collection(NEWS).doc(id).delete();
    renderAdmin();
  } catch (e) {
    console.error(e);
    alert("নিউজ মুছে ফেলা যায়নি।");
  }
}
window.delNews = delNews;

async function logout() {
  await auth.signOut();
}
window.logout = logout;

renderHome();
renderArticle();
showDash();
