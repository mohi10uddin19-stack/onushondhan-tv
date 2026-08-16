// ================= FIREBASE =================

const firebaseConfig = {
  apiKey: "AIzaSyAPP-Z3985x6e6Is2noMxQZ0JAWVILAceU",
  authDomain: "onushondhan-v.firebaseapp.com",
  projectId: "onushondhan-v",
  storageBucket: "onushondhan-v.firebasestorage.app",
  messagingSenderId: "669433176030",
  appId: "1:669433176030:web:bc736dad4c3926b287074f"
};

firebase.initializeApp(firebaseConfig);

const firebaseAuth = firebase.auth();
const firestoreDB = firebase.firestore();


// ================= LOGIN =================

window.login = async function () {

  const emailInput = document.getElementById("user");
  const passwordInput = document.getElementById("pass");
  const message = document.getElementById("loginMsg");

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    message.textContent = "Email ও Password দিন।";
    message.style.color = "red";
    return;
  }

  try {

    await firebaseAuth.signInWithEmailAndPassword(email, password);

    message.textContent = "Login সফল হয়েছে!";
    message.style.color = "green";

    const loginBox = document.getElementById("loginBox");
    const dashboard = document.getElementById("dash");

    if (loginBox) loginBox.style.display = "none";
    if (dashboard) dashboard.style.display = "block";

    loadAdminNews();

  } catch (error) {

    console.error("LOGIN ERROR:", error);

    message.textContent = "Login হয়নি: " + error.message;
    message.style.color = "red";
  }
};


// ================= LOGOUT =================

window.logout = async function () {

  try {

    await firebaseAuth.signOut();

    const loginBox = document.getElementById("loginBox");
    const dashboard = document.getElementById("dash");

    if (loginBox) loginBox.style.display = "block";
    if (dashboard) dashboard.style.display = "none";

  } catch (error) {

    console.error("LOGOUT ERROR:", error);
  }
};


// ================= PUBLISH NEWS =================

window.publish = async function () {

  if (!firebaseAuth.currentUser) {
    alert("আগে Admin Login করুন।");
    return;
  }

  const title = document.getElementById("title").value.trim();
  const category = document.getElementById("category").value.trim();
  const image = document.getElementById("image").value.trim();
  const body = document.getElementById("body").value.trim();

  if (!title || !body) {
    alert("শিরোনাম ও নিউজের লেখা দিন।");
    return;
  }

  try {

    await firestoreDB.collection("news").add({
      title: title,
      category: category || "সাধারণ",
      image: image || "",
      body: body,
      author: firebaseAuth.currentUser.email,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    alert("নিউজ সফলভাবে প্রকাশ হয়েছে!");

    document.getElementById("title").value = "";
    document.getElementById("category").value = "";
    document.getElementById("image").value = "";
    document.getElementById("body").value = "";

    loadAdminNews();

  } catch (error) {

    console.error("PUBLISH ERROR:", error);
    alert("নিউজ প্রকাশ হয়নি: " + error.message);
  }
};


// ================= ADMIN NEWS =================

async function loadAdminNews() {

  const list = document.getElementById("adminList");

  if (!list || !firebaseAuth.currentUser) return;

  try {

    const snapshot = await firestoreDB
      .collection("news")
      .orderBy("createdAt", "desc")
      .limit(20)
      .get();

    list.innerHTML = "";

    snapshot.forEach(function (doc) {

      const data = doc.data();

      const div = document.createElement("div");

      div.innerHTML =
        "<strong>" + (data.title || "") + "</strong>" +
        "<br>" +
        "<small>" + (data.category || "") + "</small>";

      list.appendChild(div);
    });

  } catch (error) {

    console.error("NEWS ERROR:", error);
  }
}


// ================= AUTH STATUS =================

firebaseAuth.onAuthStateChanged(function (user) {

  const loginBox = document.getElementById("loginBox");
  const dashboard = document.getElementById("dash");

  if (!loginBox || !dashboard) return;

  if (user) {

    loginBox.style.display = "none";
    dashboard.style.display = "block";

    loadAdminNews();

  } else {

    loginBox.style.display = "block";
    dashboard.style.display = "none";
  }
});
