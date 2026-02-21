import { MOCK_HOLD_ORDERS, MOCK_CANCELLED_ORDERS, MOCK_ALTERATIONS } from './mockData';

class CatalogueService {
    delay(ms = 500) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async getHoldOrders() {
        await this.delay();
        return [...MOCK_HOLD_ORDERS];
    }

    async getCancelledOrders() {
        await this.delay();
        return [...MOCK_CANCELLED_ORDERS];
    }

    async getAlterations() {
        await this.delay();
        return [...MOCK_ALTERATIONS];
    }

    async addAlteration(alteration) {
        await this.delay();
        return { ...alteration, id: `alt${Math.random().toString(36).substr(2, 5)}` };
    }
}

export const catalogueService = new CatalogueService();
