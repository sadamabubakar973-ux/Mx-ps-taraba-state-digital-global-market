// ================== PI INIT ==================
Pi.init({ version: "2.0" });

let user = null;
let cart = [];

// ================== FIREBASE CONFIG ==================
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "XXXX",
  appId: "XXXX",
};

// ================== INIT FIREBASE ==================
firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
const storage = firebase.storage();

// ================== LOGIN ==================
async function login() {
  try {
    const scopes = ["username", "payments"];

    const auth = await Pi.authenticate(
      scopes,
      onIncompletePaymentFound
    );

    user = auth.user;

    document.getElementById("user").innerText =
      "Welcome " + user.username;

    loadAds();
  } catch (e) {
    console.error(e);
  }
}

// ================== POST AD ==================
async function postAd() {
  const file = document.getElementById("image").files[0];
  const title = document.getElementById("title").value;
  const price = document.getElementById("price").value;

  if (!file || !title || !price) {
    alert("Please fill all fields");
    return;
  }

  try {
    const storageRef = storage.ref("ads/" + file.name);
    await storageRef.put(file);

    const imageUrl = await storageRef.getDownloadURL();

    await db.collection("ads").add({
      title: title,
      price: price,
      image: imageUrl,
      username: user ? user.username : "Guest",
      createdAt: new Date()
    });

    alert("Product posted successfully");
    loadAds();
  } catch (error) {
    console.error(error);
  }
}

// ================== LOAD ADS ==================
async function loadAds() {
  const productsDiv = document.getElementById("products");
  productsDiv.innerHTML = "";

  const snapshot = await db.collection("ads").get();

  snapshot.forEach((doc) => {
    const ad = doc.data();

    productsDiv.innerHTML += `
      <div class="card">
        <img src="${ad.image}" width="150">
        <h3>${ad.title}</h3>
        <p>₦${ad.price}</p>
        <p>By ${ad.username}</p>
      </div>
    `;
  });
}
