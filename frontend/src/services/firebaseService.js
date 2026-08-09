import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import firebaseConfig from '../../../firebase-applet-config.json';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

// Handle named database ID if present, otherwise default
export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Helper to deeply sanitize objects and strip DOM elements, functions, or circular references
const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  try {
    return JSON.parse(JSON.stringify(obj, (key, value) => {
      if (
        typeof value === 'function' || 
        (typeof value === 'object' && value !== null && (value instanceof HTMLElement || value.nodeType || value.stateNode))
      ) {
        return undefined;
      }
      return value;
    }));
  } catch (err) {
    console.warn('[Firestore] Failed to JSON stringify object during sanitation:', err);
    return {};
  }
};

/**
 * Save ticket directly to Firestore database for worldwide real-time verification across any device
 */
export const saveTicketToFirestore = async (ticketData) => {
  if (!ticketData || !ticketData.bookingReference) return false;
  
  try {
    const cleanData = sanitizeObject(ticketData);
    const pnr = (cleanData.bookingReference || '').trim().toUpperCase();
    if (!pnr) return false;

    const docRef = doc(db, 'tickets', pnr);

    const payload = {
      ...cleanData,
      bookingReference: pnr,
      pnrClean: pnr.replace('-', ''),
      lastNameLower: (cleanData.lastName || '').trim().toLowerCase(),
      updatedAt: new Date().toISOString()
    };

    await setDoc(docRef, payload, { merge: true });
    console.log(`[Firestore] Successfully saved ticket ${pnr} to cloud database`);
    return true;
  } catch (error) {
    console.error('[Firestore] Error saving ticket to cloud:', error);
    return false;
  }
};

/**
 * Search ticket from Firestore cloud database
 */
export const searchTicketInFirestore = async (pnrInput, lastNameInput = '') => {
  if (!pnrInput) return null;

  const queryRef = pnrInput.trim().toUpperCase();
  const cleanRef = queryRef.replace('-', '');
  const queryName = lastNameInput ? lastNameInput.trim().toLowerCase() : '';

  try {
    // 1. Try direct lookup by PNR document ID
    const directDocRef = doc(db, 'tickets', queryRef);
    const directSnap = await getDoc(directDocRef);

    if (directSnap.exists()) {
      const ticket = directSnap.data();
      if (matchesLastName(ticket, queryName)) {
        console.log('[Firestore] Match found via direct document key');
        return ticket;
      }
    }

    // 2. Query by bookingReference or pnrClean or ticketNumber
    const ticketsRef = collection(db, 'tickets');
    
    // Check cleanRef
    const qClean = query(ticketsRef, where('pnrClean', '==', cleanRef));
    const cleanSnap = await getDocs(qClean);
    for (const d of cleanSnap.docs) {
      const ticket = d.data();
      if (matchesLastName(ticket, queryName)) {
        return ticket;
      }
    }

    // Check ticketNumber
    const qTicketNo = query(ticketsRef, where('ticketNumber', '==', queryRef));
    const ticketNoSnap = await getDocs(qTicketNo);
    for (const d of ticketNoSnap.docs) {
      const ticket = d.data();
      if (matchesLastName(ticket, queryName)) {
        return ticket;
      }
    }

    return null;
  } catch (error) {
    console.error('[Firestore] Error searching ticket in cloud:', error);
    return null;
  }
};

const matchesLastName = (ticket, queryName) => {
  if (!queryName) return true;
  const mainLast = (ticket.lastName || '').toLowerCase();
  const listMatch = ticket.passengerList?.some(p => (p.lastName || '').toLowerCase().includes(queryName));
  return mainLast.includes(queryName) || listMatch;
};
