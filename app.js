// Firebase চালু করা
const firebaseConfig = {
  apiKey: "AIzaSyAPP-Z3985x6e6Is2noMxQZ0JAWVILAceU",
  authDomain: "onushondhan-v.firebaseapp.com",
  projectId: "onushondhan-v",
  storageBucket: "onushondhan-v.firebasestorage.app",
  messagingSenderId: "669433176030",
  appId: "1:669433176030:web:bc736dad4c3926b287074f"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();


// ==================== LOGIN ====================

async function login() {
  const email = document.getElementById("user").value.trim();
  const password = document.getElementById("pass").value;
  const message = document.getElementById("loginMsg");

  if (!email || !password) {
    message.textContent = "Email ও Password দিন।";
    message.style.color = "red";
    return;
  }

  try {
    await auth.signInWithEmailAndPassword(email, password);

    document.getElementById("loginBox").style.display = "none";
    document.getElementById("dash").style.display = "block";

    message.textContent = "Login সফল হয়েছে!";
    message.style.color = "green";

    loadAdminNews();

  } catch (error) {
    console.error(error);

    message.textContent = "Login হয়নি: " + error.message;
    message.style.color = "red";
  }
}


// ==================== LOGOUT ====================

async function logout() {
  try {
    await auth.signOut();

    document.getElementById("loginBox").style.display = "block";
    document.getElementById("dash").style.display = "none";

  } catch (error) {
    console.error(error);
  }
}


// ==================== NEWS PUBLISH ====================

async function publish() {

  if (!auth.currentUser) {
    document.getElementById("pubMsg").textContent =
      "আগে Admin Login করুন।";
    return;
  }

  const title = document.getElementById("title").value.trim();
  const category = document.getElementById("category").value.trim();
  const image = document.getElementById("image").value.trim();
  const body = document.getElementById("body").value.trim();

  if (!title || !body) {
    document.getElementById("pubMsg").textContent =
      "শিরোনাম ও নিউজের লেখা দিন।";
    return;
  }

  try {

    await db.collection("news").add({
      title: title,
      category: category || "সাধারণ",
      image: image || "",
      body: body,
      author: auth.currentUser.email,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    document.getElementById("pubMsg").textContent =
      "নিউজ সফলভাবে প্রকাশ হয়েছে!";

    document.getElementById("pubMsg").style.color = "green";

    document.getElementById("title").value = "";
    document.getElementById("category").value = "";
    document.getElementById("image").value = "";
    document.getElementById("body").value = "";

    loadAdminNews();

  } catch (error) {

    console.error(error);

    document.getElementById("pubMsg").textContent =
      "নিউজ প্রকাশ হয়নি: " + error.message;

    document.getElementById("pubMsg").style.color = "red";
  }
}


// ==================== ADMIN NEWS LIST ====================

async function loadAdminNews() {

  const list = document.getElementById("adminList");

  if (!list) return;

  try {

    const snapshot = await db
      .collection("news")
      .orderBy("createdAt", "desc")
      .limit(20)
      .get();

    list.innerHTML = "";

    snapshot.forEach(function(doc) {

      const data = doc.data();

      const div = document.createElement("div");

      div.style.padding = "10px";
      div.style.marginBottom = "10px";
      div.style.border = "1px solid #ddd";

      div.innerHTML =
        "<strong>" + (data.title || "") + "</strong>" +
        "<br>" +
        "<small>" + (data.category || "") + "</small>";

      list.appendChild(div);
    });

  } catch (error) {

    console.error(error);

    list.textContent =
      "নিউজ লোড হয়নি: " + error.message;
  }
}


// ==================== LOGIN STATUS ====================

auth.onAuthStateChanged(function(user) {

  const loginBox = document.getElementById("loginBox");
  const dash = document.getElementById("dash");

  if (!loginBox || !dash) return;

  if (user) {

    loginBox.style.display = "none";
    dash.style.display = "block";

    loadAdminNews();

  } else {

    loginBox.style.display = "block";
    dash.style.display = "none";
  }
});
window.login = login;
window.logout = logout;
