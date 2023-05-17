const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const initializeApp = require("firebase/app");
const {
  getFirestore,
  collection,
  setDoc,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  getDocs,
} = require("firebase/firestore");
const {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
} = require("firebase/auth");

const firebaseConfig = {
  apiKey: "AIzaSyBkabnaLq5En2Be6meNSDJIHTFfC-q_0Xw",
  authDomain: "adoye-naturals.firebaseapp.com",
  projectId: "adoye-naturals",
  storageBucket: "adoye-naturals.appspot.com",
  messagingSenderId: "589726381438",
  appId: "1:589726381438:web:60982e2ad758956636ef2f",
  measurementId: "G-12JTCN2BL2",
};
const firebaseApp = initializeApp.initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

const app = express();

app.use(cors());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/", function (req: any, res: { send: (arg0: string) => void }) {
  res.send("<h1>Welcome</h1>");
});

app.post(
  "/api/register",
  async function (
    req: {
      body: { fullName: any; email: any; phoneNumber: any; password: any };
    },
    res: { json: (arg0: any) => void }
  ) {
    console.log(req.body);

    const userMap = {
      fullName: `${req.body.fullName}`,
      email: `${req.body.email}`,
      phoneNumber: `${req.body.phoneNumber}`,
      password: `${req.body.password}`,
    };
    const response = await authenticateUser(JSON.stringify(userMap));
    console.log(`Reso: ${JSON.stringify(response)}`);
    res.json(response);
  }
);

async function authenticateUser(userJson: any) {
  let user = JSON.parse(userJson);
  const usersRef = collection(db, "users");

  const userMap = {
    fullName: `${user.fullName}`,
    email: `${user.email}`,
    phoneNumber: `${user.phoneNumber}`,
    password: `${user.password}`,
  };

  console.log(user);

  try {
    //auth
    await createUserWithEmailAndPassword(auth, user.email, user.password);

    //storing
    await setDoc(doc(usersRef, user.email), userMap);

    userJson = {
      fullName: `${user.fullName}`,
      email: `${user.email}`,
      phoneNumber: `${user.phoneNumber}`,
      userStatus: "Saved",
    };

    return userJson;
  } catch (error) {
    console.log(`Error is: ${error}`);

    const errorJson = {
      error,
    };
    return errorJson;
  }
}

app.post(
  "/api/login",
  async function (
    req: { body: { email: any; password: any } },
    res: { json: (arg0: any) => void }
  ) {
    console.log(req.body);

    const userMap = {
      email: `${req.body.email}`,
      password: `${req.body.password}`,
    };

    const response = await loginUser(JSON.stringify(userMap));
    console.log(`Reso: ${JSON.stringify(response)}`);
    res.json(response);
  }
);

async function loginUser(userJson: any) {
  let user = JSON.parse(userJson);
  const usersRef = collection(db, "users");

  const userMap = {
    email: `${user.email}`,
    password: `${user.password}`,
  };

  try {
    //auth
    await signInWithEmailAndPassword(auth, user.email, user.password);

    //getting
    let userDoc = await getUser(db, user.email);

    userJson = {
      fullName: `${userDoc.fullName}`,
      email: `${userDoc.email}`,
      phoneNumber: `${userDoc.phoneNumber}`,
      userStatus: "Logged in",
    };

    return userJson;
  } catch (error) {
    console.log(`Error is: ${error}`);

    const errorJson = {
      error,
    };
    return errorJson;
  }
}

app.get(
  "/api/login",
  async function (req: { body: any }, res: { json: (arg0: any[]) => void }) {
    console.log(req.body);
    const response = await getLoginUsers(db);
    console.log(`students: ${JSON.stringify(response)}`);
    res.json(response);
  }
);

async function getLoginUsers(db: any) {
  const products: any[] = [];
  const colRef = collection(db, "users");
  const querySnapshot = await getDocs(colRef);
  console.log(`Heeeee: ${querySnapshot}`);
  querySnapshot.forEach((doc: { id: any; data: () => any }) => {
    // doc.data() is never undefined for query doc snapshots
    console.log(doc.id, " => ", doc.data());
    products.push(doc.data());
  });

  console.log(`Applicants: ${products}`);
  return products;
}

app.post(
  "/api/reset-password",
  async function (
    req: { body: { email: any } },
    res: { json: (arg0: any) => void }
  ) {
    console.log(req.body);

    const userMap = {
      email: `${req.body.email}`,
    };

    const response = await resetPassword(JSON.stringify(userMap));
    console.log(`Reso: ${JSON.stringify(response)}`);
    res.json(response);
  }
);



  const resetPassword = async (email: any) => {
    try {
      await sendPasswordResetEmail(auth, email);

      console.log("Password reset email sent successfully!");
    } catch (error) {
      console.error("Error sending password reset email:", error);
    }
  

  // try {
  //   //auth
  //   await signInWithEmailAndPassword(auth, user.email, user.password);

  //   //getting
  //   let userDoc = await getUser(db, user.email);

  //   userJson = {
  //     fullName: `${userDoc.fullName}`,
  //     email: `${userDoc.email}`,
  //     phoneNumber: `${userDoc.phoneNumber}`,
  //     userStatus: "Logged in",
  //   };

  //   return userJson;
  // } catch (error) {
  //   console.log(`Error is: ${error}`);

  //   const errorJson = {
  //     error,
  //   };
  //   return errorJson;
  // }
}

app.get(
  "/api/latest-products",
  async function (req: { body: any }, res: { json: (arg0: any[]) => void }) {
    console.log(req.body);
    const response = await getProducts(db);
    console.log(`students: ${JSON.stringify(response)}`);
    res.json(response);
  }
);

async function getProducts(db: any) {
  const products: any[] = [];
  const colRef = collection(db, "latest products");
  const querySnapshot = await getDocs(colRef);
  console.log(`Heeeee: ${querySnapshot}`);
  querySnapshot.forEach((doc: { id: any; data: () => any }) => {
    // doc.data() is never undefined for query doc snapshots
    console.log(doc.id, " => ", doc.data());
    products.push(doc.data());
  });

  console.log(`Applicants: ${products}`);
  return products;
}

app.get("/api/latest-products/:id", async (req, res) => {
  const id = req.params.id;

  // Use the `db` instance to fetch data from Firebase based on the ID
  const docRef = doc(db, "latest products", id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    res.send(docSnap.data());
  } else {
    res.status(404).send("Document not found");
  }
});

app.get(
  "/api/soap",
  async function (req: { body: any }, res: { json: (arg0: any[]) => void }) {
    console.log(req.body);
    const response = await getSoaps(db);
    console.log(`students: ${JSON.stringify(response)}`);
    res.json(response);
  }
);

async function getSoaps(db: any) {
  const products: any[] = [];
  const colRef = collection(db, "soap");
  const querySnapshot = await getDocs(colRef);
  console.log(`soapy: ${querySnapshot}`);
  querySnapshot.forEach((doc: { id: any; data: () => any }) => {
    // doc.data() is never undefined for query doc snapshots
    console.log(doc.id, " => ", doc.data());
    products.push(doc.data());
  });

  console.log(`soaped: ${products}`);
  return products;
}

app.get("/api/soap/:id", async (req, res) => {
  const id = req.params.id;

  // Use the `db` instance to fetch data from Firebase based on the ID
  const docRef = doc(db, "soap", id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    res.send(docSnap.data());
  } else {
    res.status(404).send("Document not found");
  }
});

async function getUser(db: any, userEmail: any) {
  //if the email isn't valid here throw an error

  const docRef = doc(db, "users", userEmail);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    console.log("Document data:", docSnap.data());
    return docSnap.data();
  } else {
    // doc.data() will be undefined in this case
    console.log("No such document!");
    return;
  }
}

app.listen(process.env.PORT || 3001, function () {
  console.log("Server running on port 3001");
});
export {};
