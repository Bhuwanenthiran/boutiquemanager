import { PRODUCTION_STAGES, MOCK_FINISHING, MOCK_SHOOTS } from './mockData';

class ProductionService {
    delay(ms = 500) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async getProductionStages() {
        await this.delay();
        return { ...PRODUCTION_STAGES };
    }

    async updateStage(orderId, stageKey, updates) {
        await this.delay();
        return { orderId, stageKey, ...updates };
    }

    async getFinishingData() {
        await this.delay();
        return { ...MOCK_FINISHING };
    }

    async updateFinishing(orderId, updates) {
        await this.delay();
        return { orderId, ...updates };
    }

    async getShoots() {
        await this.delay();
        return [...MOCK_SHOOTS];
    }
}

export const productionService = new ProductionService();
