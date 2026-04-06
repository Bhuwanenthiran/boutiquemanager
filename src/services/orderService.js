import { db } from '../config/firebase';
import {
    collection, doc,
    getDocs, addDoc, updateDoc, deleteDoc,
    serverTimestamp, query, orderBy,
} from 'firebase/firestore';
import { MOCK_CUSTOMERS, MOCK_DESIGNS, DESIGN_TEMPLATES, MOCK_TAILORS, MEASUREMENT_FIELDS } from './mockData';
import { now, toEpoch, fromFirestoreTimestamp } from './dateUtils';

// ─── Firestore References ───
const ORDERS_REF = collection(db, 'orders');

// ─── Date fields that need Timestamp → epoch conversion on read ───
const ORDER_DATE_FIELDS = ['deliveryDate', 'createdAt', 'updatedAt'];

/**
 * Converts Firestore Timestamp fields on a document to numeric epoch (ms).
 * Passes through values that are already numeric.
 */
function convertTimestamps(data) {
    const result = { ...data };
    ORDER_DATE_FIELDS.forEach(field => {
        if (field in result && result[field] != null) {
            result[field] = fromFirestoreTimestamp(result[field]);
        }
    });
    return result;
}

/**
 * Strips undefined values from an object before writing to Firestore.
 * Firestore rejects undefined fields.
 */
function stripUndefined(obj) {
    const result = {};
    Object.entries(obj).forEach(([key, value]) => {
        if (value !== undefined) {
            result[key] = value;
        }
    });
    return result;
}

/**
 * OrderService handles all operations related to orders, customers, designs, and tailors.
 * Orders are stored in Firestore. Reference data (customers, designs, tailors, templates)
 * remains local until those collections are migrated.
 *
 * CONTRACT:
 * - All date fields returned from this service are numeric epoch (ms).
 * - Date strings from user input (e.g. 'YYYY-MM-DD') are normalized at the service boundary.
 */
class OrderService {

    // ===== Orders (Firestore) =====

    async getOrders() {
        const q = query(ORDERS_REF, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(docSnap =>
            convertTimestamps({ id: docSnap.id, ...docSnap.data() })
        );
    }

    async addOrder(order) {
        // Build Firestore document — normalize dates, add server timestamps
        const orderData = stripUndefined({
            ...order,
            deliveryDate: toEpoch(order.deliveryDate),
            isDraft: false,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
        // Remove client-side id — Firestore auto-generates document ID
        delete orderData.id;

        const docRef = await addDoc(ORDERS_REF, orderData);

        // Return order with Firestore-generated ID and client-side timestamp
        // (server timestamp resolves async; client epoch keeps the store responsive)
        return {
            ...order,
            id: docRef.id,
            deliveryDate: toEpoch(order.deliveryDate),
            createdAt: now(),
            updatedAt: now(),
            isDraft: false,
        };
    }

    async updateOrder(id, updates) {
        const docRef = doc(db, 'orders', id);

        const payload = stripUndefined({ ...updates });

        // Normalize date fields if present in the update
        if ('deliveryDate' in payload) {
            payload.deliveryDate = toEpoch(payload.deliveryDate);
        }
        payload.updatedAt = serverTimestamp();

        await updateDoc(docRef, payload);

        // Return shape the store expects: { id, ...updates }
        return {
            id,
            ...updates,
            ...('deliveryDate' in updates ? { deliveryDate: toEpoch(updates.deliveryDate) } : {}),
            updatedAt: now(),
        };
    }

    async deleteOrder(id) {
        const docRef = doc(db, 'orders', id);
        await deleteDoc(docRef);
        return true;
    }

    // ===== Reference Data (Local — migrate later) =====

    async getCustomers() {
        return [...MOCK_CUSTOMERS];
    }

    async getDesigns() {
        return [...MOCK_DESIGNS];
    }

    async getTailors() {
        return [...MOCK_TAILORS];
    }

    async getMeasurementFields() {
        return { ...MEASUREMENT_FIELDS };
    }

    async getDesignTemplates() {
        return { ...DESIGN_TEMPLATES };
    }
}

export const orderService = new OrderService();
