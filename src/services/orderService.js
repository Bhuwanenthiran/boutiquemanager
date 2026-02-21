import { MOCK_ORDERS, MOCK_CUSTOMERS, MOCK_DESIGNS, MOCK_TAILORS, MEASUREMENT_FIELDS } from './mockData';

/**
 * OrderService handles all operations related to orders, customers, designs, and tailors.
 * Currently uses mock data but is structured to be swapped with Firebase.
 */
class OrderService {
    // Simulating API delay
    delay(ms = 500) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async getOrders() {
        await this.delay();
        return [...MOCK_ORDERS];
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

    async addOrder(order) {
        await this.delay();
        // logic for adding order
        const newOrder = {
            ...order,
            id: order.id || `ORD${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
            createdAt: new Date().toISOString().split('T')[0],
            isDraft: false
        };
        // In a real app, we would push to MOCK_ORDERS or database
        return newOrder;
    }

    async updateOrder(id, updates) {
        await this.delay();
        return { id, ...updates };
    }

    async deleteOrder(id) {
        await this.delay();
        return true;
    }
}

export const orderService = new OrderService();
