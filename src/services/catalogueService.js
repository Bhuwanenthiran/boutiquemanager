import { MOCK_HOLD_ORDERS, MOCK_CANCELLED_ORDERS, MOCK_ALTERATIONS } from './mockData';
import { normalizeDates } from './dateUtils';

/**
 * Date fields on catalogue-related records.
 */
const HOLD_DATE_FIELDS = ['holdDate'];
const CANCELLED_DATE_FIELDS = ['cancelledDate'];
const ALTERATION_DATE_FIELDS = ['date'];

/**
 * CatalogueService handles hold orders, cancellations, and alterations.
 * 
 * This is the ONLY layer that touches the data source (mockData / Firebase).
 * Stores must call these methods instead of importing data directly.
 * 
 * CONTRACT:
 * - All date fields returned from this service are numeric epoch (ms).
 * - ID generation happens here, not in the store.
 */
class CatalogueService {
    delay(ms = 500) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // ===== Hold Orders =====

    async getHoldOrders() {
        await this.delay();
        return MOCK_HOLD_ORDERS.map(order => normalizeDates(order, HOLD_DATE_FIELDS));
    }

    async addHoldOrder(order) {
        await this.delay();
        const newOrder = {
            ...normalizeDates(order, HOLD_DATE_FIELDS),
            id: order.id || `hold${Math.random().toString(36).substr(2, 6)}`,
        };
        return newOrder;
    }

    async removeHoldOrder(id) {
        await this.delay();
        return { id };
    }

    async restoreHoldOrder(id) {
        await this.delay();
        return { id };
    }

    // ===== Cancelled Orders =====

    async getCancelledOrders() {
        await this.delay();
        return MOCK_CANCELLED_ORDERS.map(order => normalizeDates(order, CANCELLED_DATE_FIELDS));
    }

    async addCancelledOrder(order) {
        await this.delay();
        const newOrder = {
            ...normalizeDates(order, CANCELLED_DATE_FIELDS),
            id: order.id || `can${Math.random().toString(36).substr(2, 6)}`,
        };
        return newOrder;
    }

    async deleteCancelledOrder(id) {
        await this.delay();
        return { id };
    }

    // ===== Alterations =====

    async getAlterations() {
        await this.delay();
        return MOCK_ALTERATIONS.map(alt => normalizeDates(alt, ALTERATION_DATE_FIELDS));
    }

    async addAlteration(alteration) {
        await this.delay();
        const normalized = normalizeDates(alteration, ALTERATION_DATE_FIELDS);
        return { ...normalized, id: `alt${Math.random().toString(36).substr(2, 6)}` };
    }

    async updateAlteration(id, updates) {
        await this.delay();
        return { id, ...updates };
    }

    async deleteAlteration(id) {
        await this.delay();
        return { id };
    }
}

export const catalogueService = new CatalogueService();
