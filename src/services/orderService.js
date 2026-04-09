import { MOCK_CUSTOMERS, MOCK_DESIGNS, DESIGN_TEMPLATES, MOCK_TAILORS, MEASUREMENT_FIELDS, MOCK_ORDERS } from './mockData';
import { now, toEpoch } from './dateUtils';

// Note: Firestore integration is configured in firebase.js but we are using 
// MOCK_ORDERS for now to ensure stability during the rebrand.

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
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));
        return [...MOCK_ORDERS].sort((a, b) => b.createdAt - a.createdAt);
    }

    async addOrder(order) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const newOrder = {
            ...order,
            id: `ORD${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
            deliveryDate: toEpoch(order.deliveryDate),
            createdAt: now(),
            updatedAt: now(),
            isDraft: false,
        };
        MOCK_ORDERS.unshift(newOrder);
        return newOrder;
    }

    async updateOrder(id, updates) {
        await new Promise(resolve => setTimeout(resolve, 500));
        const index = MOCK_ORDERS.findIndex(o => o.id === id);
        if (index !== -1) {
            const updated = {
                ...MOCK_ORDERS[index],
                ...updates,
                updatedAt: now(),
            };
            if ('deliveryDate' in updates) {
                updated.deliveryDate = toEpoch(updates.deliveryDate);
            }
            MOCK_ORDERS[index] = updated;
            return updated;
        }
        throw new Error('Order not found');
    }

    async deleteOrder(id) {
        await new Promise(resolve => setTimeout(resolve, 500));
        const index = MOCK_ORDERS.findIndex(o => o.id === id);
        if (index !== -1) {
            MOCK_ORDERS.splice(index, 1);
            return true;
        }
        return false;
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
