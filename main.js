// ========== Firebase Config ==========
const firebaseConfig = {
  apiKey: "AIzaSyBiATvSKibli32q1ysDvglGWJVurzuGxIg",
  authDomain: "easy-cesh.firebaseapp.com",
  databaseURL: "https://easy-cesh-default-rtdb.firebaseio.com",
  projectId: "easy-cesh",
  storageBucket: "easy-cesh.appspot.com",
  messagingSenderId: "119628641215",
  appId: "1:119628641215:web:063d67c09996d12672670a"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

let currentUser = null;

// ======= Login/Register System =======
document.getElementById("login-btn").addEventListener("click", () => {
  const email = document.getElementById("user-email").value.trim();
  const password = document.getElementById("user-password").value.trim();
  if (!email || !password) return alert("⚠️ Enter email and password!");

  auth.signInWithEmailAndPassword(email, password)
    .then(userCred => {
      currentUser = userCred.user;
      alert("✅ Logged in as " + currentUser.email);
      document.getElementById("login-form").style.display = "none";
      initWebsite();
    })
    .catch(() => {
      auth.createUserWithEmailAndPassword(email, password)
        .then(userCred => {
          currentUser = userCred.user;
          alert("🎉 Registered as " + currentUser.email);
          document.getElementById("login-form").style.display = "none";
          initWebsite();
        })
        .catch(e => alert(e.message));
    });
});

// ======= Initialize Site =======
function initWebsite() {
  const products = document.querySelectorAll(".product-card");

  products.forEach(prod => {
    const prodId = prod.dataset.id;
    const likeBtn = prod.querySelector(".like-btn");
    const commentToggle = prod.querySelector(".comment-toggle");
    const commentsSection = prod.querySelector(".comments-section");
    const commentInput = prod.querySelector(".comment-input");
    const commentSubmit = prod.querySelector(".comment-submit");
    const commentList = prod.querySelector(".comment-list");

    likeBtn.innerHTML = `❤️ <span class="like-count">0</span>`;
    commentToggle.innerHTML = `💬 Comments`;

    // ========== Realtime Like Count ==========
    db.ref("likes/" + prodId).on("value", snapshot => {
      const likesData = snapshot.val() || {};
      const totalLikes = Object.values(likesData).filter(v => v === true).length;
      likeBtn.querySelector(".like-count").innerText = totalLikes;

      if (likesData[currentUser.uid]) {
        likeBtn.classList.add("liked");
        likeBtn.style.color = "red";
      } else {
        likeBtn.classList.remove("liked");
        likeBtn.style.color = "black";
      }
    });

    // ===== Like Button =====
    likeBtn.addEventListener("click", () => {
      const ref = db.ref("likes/" + prodId + "/" + currentUser.uid);
      ref.once("value").then(snap => {
        if (snap.exists()) {
          ref.remove(); // unlike
        } else {
          ref.set(true); // like
        }
      });
    });

    // ===== Toggle Comments =====
    commentToggle.addEventListener("click", () => {
      commentsSection.style.display =
        commentsSection.style.display === "block" ? "none" : "block";
    });

    // ===== Realtime Comments =====
    db.ref("comments/" + prodId).on("value", snapshot => {
      const comments = snapshot.val() || {};
      commentList.innerHTML = "";
      Object.values(comments).forEach(c => {
        const div = document.createElement("div");
        div.innerHTML = `🙂 <b>${c.user}</b>: ${c.text}`;
        commentList.appendChild(div);
      });
    });

    // ===== Add Comment =====
    commentSubmit.addEventListener("click", () => {
      const text = commentInput.value.trim();
      if (!text) return;
      const newRef = db.ref("comments/" + prodId).push();
      newRef.set({
        user: currentUser.email.split("@")[0],
        text: text
      });
      commentInput.value = "";
    });
  });

  // ====== Buy Button ======
  document.querySelectorAll(".buy-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const prodName = btn.closest(".product-card").querySelector("h3").innerText;
      window.open(`https://wa.me/923179891214?text=👋 I want to buy ${prodName}`, "_blank");
    });
  });

  // ====== Hire Button ======
  document.querySelectorAll(".hire-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const service = btn.closest(".service-card").querySelector("h3").innerText;
      window.open(`https://wa.me/923179891214?text=👋 I want to hire you for ${service}`, "_blank");
    });
  });
}