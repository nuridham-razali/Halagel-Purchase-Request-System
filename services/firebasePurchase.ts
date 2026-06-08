import { db } from '../firebase';
import { collection, doc, setDoc, getDocs, query, orderBy, getDoc } from 'firebase/firestore';
import { PurchaseLog } from '../type';

const PURCHASE_COLLECTION = 'purchaseRequests';

export const savePurchaseLog = async (log: PurchaseLog): Promise<void> => {
  try {
    const docRef = doc(db, PURCHASE_COLLECTION, log.id);
    await setDoc(docRef, log);
  } catch (error) {
    console.error("Error saving purchase log: ", error);
  }
};

export const getPurchaseLogs = async (): Promise<PurchaseLog[]> => {
  try {
    const q = query(collection(db, PURCHASE_COLLECTION));
    const querySnapshot = await getDocs(q);
    const logs: PurchaseLog[] = [];
    querySnapshot.forEach((doc) => {
      logs.push(doc.data() as PurchaseLog);
    });
    // Sort descending by dateCreated/time (or ID which is usually Date.now)
    return logs.sort((a, b) => Number(b.id) - Number(a.id));
  } catch (error) {
    console.error("Error getting purchase logs: ", error);
    return [];
  }
};
