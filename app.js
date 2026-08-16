import { initializeApp }
  from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";


// ================= FIREBASE CONFIG =================

const firebaseConfig = {
  apiKey: "AIzaSyAPP-Z3985x6e6Is2noMxQZ0JAWVILAceU",
  authDomain: "onushondhan-v.firebaseapp.com",
  projectId: "onushondhan-v",
  storageBucket: "onushondhan-v.firebasestorage.app",
  messagingSenderId: "669433176030",
  appId: "1:669433176030:web:bc736dad4c3926b287074f"
};


// ================= FIREBASE START =================

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);


// ================= LOGIN =================

window.login = async function () {

  const emailBox = document.getElementById("user");
  const passwordBox = document.getElementById("pass");
  const message = document.getElementById("loginMsg");

  const email = emailBox.value.trim();
  const password = passwordBox.value;

  if (!email || !password) {
    message.textContent = "Email ও Password দিন।";
    message.style.color = "red";
    return;
  }

  message.textContent = "Login হচ্ছে...";
  message.style.color = "black";

  try {

    await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    message.textContent = "Login সফল হয়েছে!";
    message.style.color = "green";

    const loginBox =
      document.getElementById("loginBox");

    const dashboard =
      document.getElementById("dash");

    if (loginBox) {
      loginBox.style.display = "none";
    }

    if (dashboard) {
      dashboard.style.display = "block";
    }

    loadNews();

  } catch (error) {

    console.error("LOGIN ERROR:", error);

    message.textContent =
      "Login হয়নি: " + error.message;

    message.style.color = "red";
  }
};


// ================= LOGOUT =================

window.logout = async function () {

  try {

    await signOut(auth);

    location.reload();

  } catch (error) {

    console.error("LOGOUT ERROR:", error);
  }
};


// ================= PUBLISH NEWS =================

window.publish = async function () {

  if (!auth.currentUser) {
    alert("আগে Admin Login করুন।");
    return;
  }

  const title =
    document.getElementById("title").value.trim();

  const category =
    document.getElementById("category").value.trim();

  const image =
    document.getElementById("image").value.trim();

  const body =
    document.getElementById("body").value.trim();

  const message =
    document.getElementById("pubMsg");

  if (!title || !body) {

    message.textContent =
      "শিরোনাম ও নিউজের লেখা দিন।";

    message.style.color = "red";

    return;
  }

  try {

    await addDoc(
      collection(db, "news"),
      {
        title: title,
        category: category || "সাধারণ",
        image: image || "",
        body: body,
        author: auth.currentUser.email,
        createdAt: serverTimestamp()
      }
    );

    message.textContent =
      "নিউজ সফলভাবে প্রকাশ হয়েছে!";

    message.style.color = "green";

    document.getElementById("title").value = "";
    document.getElementById("category").value = "";
    document.getElementById("image").value = "";
    document.getElementById("body").value = "";

    loadNews();

  } catch (error) {

    console.error("PUBLISH ERROR:", error);

    message.textContent =
      "নিউজ প্রকাশ হয়নি: " + error.message;

    message.style.color = "red";
  }
};


// ================= LOAD NEWS =================

async function loadNews() {

  const list =
    document.getElementById("adminList");

  if (!list) return;

  try {

    const newsQuery = query(
      collection(db, "news"),
      orderBy("createdAt", "desc")
    );

    const snapshot =
      await getDocs(newsQuery);

    list.innerHTML = "";

    snapshot.forEach(function (doc) {

      const data = doc.data();

      const item =
        document.createElement("div");

      item.style.padding = "10px";
      item.style.marginBottom = "10px";
      item.style.border = "1px solid #ddd";

      item.innerHTML =
        "<strong>" +
        (data.title || "") +
        "</strong><br>" +
        "<small>" +
        (data.category || "") +
        "</small>";

      list.appendChild(item);
    });

  } catch (error) {

    console.error("NEWS ERROR:", error);

    list.textContent =
      "নিউজ লোড হয়নি: " + error.message;
  }
}


// ================= LOGIN STATUS =================

onAuthStateChanged(auth, function (user) {

  const loginBox =
    document.getElementById("loginBox");

  const dashboard =
    document.getElementById("dash");

  if (!loginBox || !dashboard) return;

  if (user) {

    loginBox.style.display = "none";
    dashboard.style.display = "block";

    loadNews();

  } else {

    loginBox.style.display = "block";
    dashboard.style.display = "none";
  }
});


// ================= READY =================

console.log("Firebase successfully initialized");
document.getElementById("publishBtn").addEventListener("click", function () {
  window.publish();
});
