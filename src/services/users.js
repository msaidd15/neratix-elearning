import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { db } from "./firebase";

export async function getUserDataByEmail(email) {
  if (!email) return null;

  const usersRef = collection(db, "users");
  const usersQuery = query(usersRef, where("email", "==", email), limit(1));
  const usersSnapshot = await getDocs(usersQuery);

  if (usersSnapshot.empty) {
    return null;
  }

  const userDoc = usersSnapshot.docs[0];
  const userData = userDoc.data();

  return {
    id: userDoc.id,
    name: typeof userData.name === "string" ? userData.name : "",
    email: typeof userData.email === "string" ? userData.email : email,
    packages: Array.isArray(userData.packages) ? userData.packages : []
  };
}
