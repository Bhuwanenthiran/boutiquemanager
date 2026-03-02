import { MOCK_INVENTORY, MOCK_SOLD_ITEMS } from './mockData';
import { now, normalizeDates } from './dateUtils';

/**
 * Date fields on sold items.
 */
const SOLD_ITEM_DATE_FIELDS = ['soldDate'];

/**
 * InventoryService handles store inventory and sales transactions.
 * 
 * This is the ONLY layer that touches the data source (mockData / Firebase).
 * Stores must call these methods instead of importing data directly.
 * 
 * CONTRACT:
 * - All date fields returned from this service are numeric epoch (ms).
 * - ID generation happens here, not in the store.
 */
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
        return MOCK_SOLD_ITEMS.map(item => normalizeDates(item, SOLD_ITEM_DATE_FIELDS));
    }

    async addInventoryItem(item) {
        await this.delay();
        const newItem = {
            ...item,
            id: item.id || `inv${Math.random().toString(36).substr(2, 6)}`,
        };
        return newItem;
    }

    async updateInventoryItem(id, updates) {
        await this.delay();
        return { id, ...updates };
    }

    async updateStock(id, quantity) {
        await this.delay();
        return { id, quantity };
    }

    /**
     * Creates a sold-item record from an inventory item.
     * Business logic for sold-item creation lives here, not in the store.
     */
    async markAsSold(inventoryItem, customerName) {
        await this.delay();
        const soldItem = {
            id: `sold${Math.random().toString(36).substr(2, 6)}`,
            name: inventoryItem.name,
            category: inventoryItem.category,
            price: inventoryItem.price,
            soldDate: now(),
            customer: customerName || 'Walk-in Customer',
        };
        return soldItem;
    }
}

export const inventoryService = new InventoryService();
