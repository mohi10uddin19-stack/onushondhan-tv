// ================= FIREBASE =================

const firebaseConfig = {
  apiKey: "AIzaSyAPP-Z3985x6e6Is2noMxQZ0JAWVILAceU",
  authDomain: "onushondhan-v.firebaseapp.com",
  projectId: "onushondhan-v",
  storageBucket: "onushondhan-v.firebasestorage.app",
  messagingSenderId: "669433176030",
  appId: "669433176030:web:bc736dad4c3926b287074f"
};

// Firebase SDK load
let auth;
let db;

async function initFirebase() {
  try {
    const { initializeApp } =
      await import("https://www.gstatic.com/firebasejs/12.7.1/firebase-app.js");

    const {
      getAuth,
      signInWithEmailAndPassword,
      signOut,
      onAuthStateChanged
    } = await import(
      "https://www.gstatic.com/firebasejs/12.7.1/firebase-auth.js"
    );

    const {
      getFirestore,
      collection,
      addDoc,
      getDocs,
      query,
      orderBy,
      serverTimestamp
    } = await import(
      "https://www.gstatic.com/firebasejs/12.7.1/firebase-firestore.js"
    );

    const app = initializeApp(firebaseConfig);

    auth = getAuth(app);
    db = getFirestore(app);

    // Login function
    window.login = async function () {
      const email = document.getElementById("user").value.trim();
      const password = document.getElementById("pass").value;
      const msg = document.getElementById("loginMsg");

      if (!email || !password) {
        msg.textContent = "Email এবং Password দিন";
        msg.style.color = "red";
        return;
      }

      msg.textContent = "Login হচ্ছে...";
      msg.style.color = "black";

      try {
        await signInWithEmailAndPassword(auth, email, password);

        msg.textContent = "Login সফল হয়েছে!";
        msg.style.color = "green";

        document.getElementById("loginBox").style.display = "none";

        const dashboard =
          document.getElementById("dashboard");

        if (dashboard) {
          dashboard.style.display = "block";
        }

        loadNews();

      } catch (error) {
        console.error(error);

        msg.textContent =
          "Login হয়নি: " + error.message;

        msg.style.color = "red";
      }
    };

    // Logout
    window.logout = async function () {
      try {
        await signOut(auth);
        location.reload();
      } catch (error) {
        console.error(error);
      }
    };

    // Publish news
    window.publish = async function () {
      if (!auth.currentUser) {
        alert("আগে Login করুন");
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

      const msg =
        document.getElementById("pubMsg");

      if (!title || !body) {
        msg.textContent =
          "Title এবং News লিখুন";
        msg.style.color = "red";
        return;
      }

      try {
        await addDoc(collection(db, "news"), {
          title: title,
          category: category,
          image: image,
          body: body,
          createdAt: serverTimestamp()
        });

        msg.textContent =
          "News সফলভাবে Publish হয়েছে!";
        msg.style.color = "green";

        document.getElementById("title").value = "";
        document.getElementById("category").value = "";
        document.getElementById("image").value = "";
        document.getElementById("body").value = "";

        loadNews();

      } catch (error) {
        console.error(error);

        msg.textContent =
          "Publish হয়নি: " + error.message;

        msg.style.color = "red";
      }
    };

    // Load published news
    async function loadNews() {
      const list =
        document.getElementById("adminList");

      if (!list) return;

      try {
        const q = query(
          collection(db, "news"),
          orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(q);

        list.innerHTML = "";

        snapshot.forEach((doc) => {
          const news = doc.data();

          const item = document.createElement("div");

          item.className = "news-item";

          item.innerHTML = `
            <h3>${news.title || ""}</h3>
            <p>${news.category || ""}</p>
          `;

          list.appendChild(item);
        });

      } catch (error) {
        console.error(error);
      }
    }

    // Check login status
    onAuthStateChanged(auth, (user) => {

      const loginBox =
        document.getElementById("loginBox");

      const dashboard =
        document.getElementById("dashboard");

      if (user) {

        if (loginBox)
          loginBox.style.display = "none";

        if (dashboard)
          dashboard.style.display = "block";

        loadNews();

      } else {

        if (loginBox)
          loginBox.style.display = "block";

        if (dashboard)
          dashboard.style.display = "none";
      }
    });

    console.log("Firebase successfully initialized");

  } catch (error) {
    console.error(
      "Firebase initialization error:",
      error
    );

    const msg =
      document.getElementById("loginMsg");

    if (msg) {
      msg.textContent =
        "Firebase চালু হয়নি: " + error.message;

      msg.style.color = "red";
    }
  }
}

initFirebase();
