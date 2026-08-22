import { initializeApp }
  from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import {
  initializeFirestore,
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

// Firestore connection
// GitHub Pages থেকে connection আটকে গেলে Long Polling ব্যবহার করবে
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true
});

console.log("Firebase successfully initialized");
console.log("Firestore Long Polling enabled");


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

  console.log("========== PUBLISH START ==========");

  const message =
    document.getElementById("pubMsg");

  try {

    // ================= LOGIN CHECK =================

    const user = auth.currentUser;

    console.log("CURRENT USER:", user);

    if (!user) {

      throw new Error(
        "Admin Login করা নেই। আগে Login করুন।"
      );
    }

    console.log("USER UID:", user.uid);
    console.log("USER EMAIL:", user.email);


    // ================= INPUT =================

    const titleBox =
      document.getElementById("title");

    const categoryBox =
      document.getElementById("category");

    const imageBox =
      document.getElementById("image");

    const bodyBox =
      document.getElementById("body");


    if (
      !titleBox ||
      !categoryBox ||
      !imageBox ||
      !bodyBox
    ) {

      throw new Error(
        "News form-এর কোনো input পাওয়া যায়নি।"
      );
    }


    const title =
      titleBox.value.trim();

    const category =
      categoryBox.value.trim();

    const image =
      imageBox.value.trim();

    const body =
      bodyBox.value.trim();


    console.log("TITLE:", title);
    console.log("CATEGORY:", category);
    console.log("IMAGE:", image);
    console.log("BODY:", body);


    // ================= VALIDATION =================

    if (!title) {

      throw new Error(
        "নিউজের শিরোনাম দিন।"
      );
    }

    if (!body) {

      throw new Error(
        "নিউজের বিস্তারিত লেখা দিন।"
      );
    }


    if (message) {

      message.textContent =
        "নিউজ প্রকাশ করা হচ্ছে...";

      message.style.color = "blue";
    }


    // ================= NEWS DATA =================

    const newsData = {

      title: title,

      category:
        category || "সাধারণ",

      image:
        image || "",

      body: body,

      author:
        user.email || "",

      createdAt:
        serverTimestamp()
    };


    console.log("NEWS DATA:", newsData);

    console.log(
      "FIRESTORE-এ নিউজ পাঠানো হচ্ছে..."
    );

    console.log(
      "PROJECT:",
      firebaseConfig.projectId
    );

    console.log(
      "COLLECTION: news"
    );


    // ================= FIRESTORE ADD =================

    const docRef = await addDoc(
      collection(db, "news"),
      newsData
    );


    // ================= SUCCESS =================

    console.log(
      "================================="
    );

    console.log(
      "NEWS SUCCESSFULLY ADDED!"
    );

    console.log(
      "DOCUMENT ID:",
      docRef.id
    );

    console.log(
      "================================="
    );


    if (message) {

      message.textContent =
        "✅ নিউজ সফলভাবে প্রকাশ হয়েছে!";

      message.style.color = "green";
    }


    // ================= CLEAR FORM =================

    titleBox.value = "";
    categoryBox.value = "";
    imageBox.value = "";
    bodyBox.value = "";


    // ================= LOAD NEWS =================

    await loadNews();


  } catch (error) {

    console.error(
      "================================="
    );

    console.error(
      "❌ REAL FIRESTORE ERROR"
    );

    console.error(
      "ERROR OBJECT:",
      error
    );

    console.error(
      "ERROR CODE:",
      error.code
    );

    console.error(
      "ERROR MESSAGE:",
      error.message
    );

    console.error(
      "================================="
    );


    if (message) {

      message.textContent =
        "❌ নিউজ প্রকাশ হয়নি: " +
        (error.message || "অজানা সমস্যা");

      message.style.color = "red";
    }


    alert(
      "নিউজ প্রকাশ হয়নি!\n\n" +
      "Error Code: " +
      (error.code || "N/A") +
      "\n\n" +
      "Error: " +
      (error.message || "অজানা সমস্যা")
    );
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


    if (snapshot.empty) {

      list.innerHTML =
        "<p>এখনো কোনো নিউজ প্রকাশিত হয়নি।</p>";

      return;
    }


    snapshot.forEach(function (doc) {

      const data = doc.data();


      const item =
        document.createElement("div");


      item.style.padding = "10px";

      item.style.marginBottom =
        "10px";

      item.style.border =
        "1px solid #ddd";


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

    console.error(
      "NEWS LOAD ERROR:",
      error
    );

    list.textContent =
      "নিউজ লোড হয়নি: " +
      error.message;
  }
}


// ================= LOGIN STATUS =================

onAuthStateChanged(
  auth,
  function (user) {

    const loginBox =
      document.getElementById("loginBox");

    const dashboard =
      document.getElementById("dash");


    if (!loginBox || !dashboard) {
      return;
    }


    if (user) {

      loginBox.style.display =
        "none";

      dashboard.style.display =
        "block";

      loadNews();

    } else {

      loginBox.style.display =
        "block";

      dashboard.style.display =
        "none";
    }
  }
);


// ================= PUBLISH BUTTON =================

const publishBtn =
  document.getElementById("publishBtn");


if (publishBtn) {

  publishBtn.addEventListener(
    "click",
    async function (event) {

      event.preventDefault();

      console.log(
        "PUBLISH BUTTON CLICKED"
      );

      await window.publish();

    }
  );
}


// ================= HOME PAGE NEWS =================

async function loadHomeNews() {

  const newsList =
    document.getElementById("newsList");


  if (!newsList) return;


  try {

    const snapshot =
      await getDocs(
        collection(db, "news")
      );


    newsList.innerHTML = "";


    if (snapshot.empty) {

      newsList.innerHTML =
        "<p>এখনো কোনো নিউজ প্রকাশিত হয়নি।</p>";

      return;
    }


    const newsArray = [];


    snapshot.forEach(function (doc) {

      const news =
        doc.data();


      newsArray.push({

        id: doc.id,

        ...news

      });

    });


    // নতুন নিউজ আগে

    newsArray.sort(
      function (a, b) {

        const timeA =
          a.createdAt
            ? a.createdAt.toMillis()
            : 0;


        const timeB =
          b.createdAt
            ? b.createdAt.toMillis()
            : 0;


        return timeB - timeA;

      }
    );


    newsArray.forEach(
      function (news) {

        const article =
          document.createElement(
            "article"
          );


        article.innerHTML = `

          <h2>
            ${news.title || ""}
          </h2>

          <p>
            <strong>
              ${news.category || "সাধারণ"}
            </strong>
          </p>

          ${
            news.image
              ? `
                <img
                  src="${news.image}"
                  alt="${news.title || "News"}"
                  style="max-width:100%;"
                >
              `
              : ""
          }

          <p>
            ${news.body || ""}
          </p>

        `;


        newsList.appendChild(
          article
        );

      }
    );


  } catch (error) {

    console.error(
      "HOME NEWS ERROR:",
      error
    );


    newsList.innerHTML =
      "<p>নিউজ লোড হয়নি: " +
      error.message +
      "</p>";
  }
}


// ================= START =================

loadHomeNews();
