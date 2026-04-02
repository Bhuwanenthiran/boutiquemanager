import { MOCK_ORDERS, MOCK_CUSTOMERS, MOCK_DESIGNS, DESIGN_TEMPLATES, MOCK_TAILORS, MEASUREMENT_FIELDS } from './mockData';
import { now, toEpoch, normalizeDates } from './dateUtils';

/**
 * Date fields present on Order objects.
 * Used by normalizeDates to ensure all date values are numeric epoch.
 */
const ORDER_DATE_FIELDS = ['deliveryDate', 'createdAt'];

/**
 * OrderService handles all operations related to orders, customers, designs, and tailors.
 * Currently uses mock data but is structured to be swapped with Firebase.
 * 
 * CONTRACT:
 * - All date fields returned from this service are numeric epoch (ms).
 * - Date strings from user input (e.g. 'YYYY-MM-DD') are normalized at the service boundary.
 */
class OrderService {
    // Simulating API delay
    delay(ms = 500) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async getOrders() {
        await this.delay();
        // Normalize dates on read — ensures mock data is consistently epoch
        return MOCK_ORDERS.map(order => normalizeDates(order, ORDER_DATE_FIELDS));
    }

    async getCustomers() {
        await this.delay();
        return [...MOCK_CUSTOMERS];
    }

    async getDesigns() {
        await this.delay();
        return [...MOCK_DESIGNS];
    }

    async getTailors() {
        await this.delay();
        return [...MOCK_TAILORS];
    }

    async getMeasurementFields() {
        await this.delay();
        return { ...MEASUREMENT_FIELDS };
    }

    async getDesignTemplates() {
        await this.delay();
        return { ...DESIGN_TEMPLATES };
    }

    async addOrder(order) {
        await this.delay();
        // Normalize any incoming date strings (e.g. deliveryDate from form input)
        const normalized = normalizeDates(order, ORDER_DATE_FIELDS);
        const newOrder = {
            ...normalized,
            id: order.id || `ORD${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
            createdAt: now(),
            isDraft: false
        };
        // In a real app, we would push to database
        return newOrder;
    }

    async updateOrder(id, updates) {
        await this.delay();
        // Normalize any date fields in the update payload
        const normalized = normalizeDates(updates, ORDER_DATE_FIELDS);
        return { id, ...normalized };
    }

    async deleteOrder(id) {
        await this.delay();
        return true;
    }
}

export const orderService = new OrderService();
