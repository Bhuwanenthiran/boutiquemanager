import { MOCK_INVENTORY, MOCK_SOLD_ITEMS } from './mockData';

class InventoryService {
    delay(ms = 500) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async getInventory() {
        await this.delay();
        return [...MOCK_INVENTORY];
    }

    async getSoldItems() {
        await this.delay();
        return [...MOCK_SOLD_ITEMS];
    }

    async updateStock(id, quantity) {
        await this.delay();
        return { id, quantity };
    }

    async markAsSold(id, customerData) {
        await this.delay();
        return { id, ...customerData, soldDate: new Date().toISOString().split('T')[0] };
    }
}

export const inventoryService = new InventoryService();
