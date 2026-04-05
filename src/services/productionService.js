import { MOCK_ORDERS, PRODUCTION_STAGES, MOCK_FINISHING, MOCK_SHOOTS, MOCK_TAILORS } from './mockData';
import { now, normalizeDates } from './dateUtils';

/**
 * Statuses that qualify an order for the production pipeline.
 */
const PRODUCTION_STATUSES = ['Marking', 'Cutting', 'In Production', 'Pending'];


/**
 * ProductionService handles production orders, stages, finishing, and shoots.
 * 
 * This is the ONLY layer that touches the data source (mockData / Firebase).
 * Stores must call these methods instead of importing data directly.
 * 
 * CONTRACT:
 * - Stage progression is tracked by status changes only.
 * - ID generation happens here, not in the store.
 */

class ProductionService {
    delay(ms = 500) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // ===== Production Orders =====

    /**
     * Returns orders that are currently in the production pipeline.
     */
    async getProductionOrders() {
        await this.delay();
        return MOCK_ORDERS
            .filter(o => PRODUCTION_STATUSES.includes(o.status))
            .map(o => ({ ...o }));
    }

    async getTailors() {
        await this.delay();
        return [...MOCK_TAILORS];
    }

    async assignTailor(orderId, tailorId, tailorName) {
        await this.delay();
        return { orderId, tailorId, tailorName };
    }

    async updateProductionStatus(orderId, field, value) {
        await this.delay();
        return { orderId, field, value };
    }

    // ===== Production Stages =====

    async getProductionStages() {
        await this.delay();
        return { ...PRODUCTION_STAGES };
    }


    async startStage(orderId, stageKey) {
        await this.delay();
        return { orderId, stageKey, status: 'in_progress' };
    }

    async completeStage(orderId, stageKey) {
        await this.delay();
        return { orderId, stageKey, status: 'completed' };
    }

    async updateStage(orderId, stageKey, updates) {
        await this.delay();
        return { orderId, stageKey, ...updates };
    }


    // ===== Finishing =====

    async getFinishingData() {
        await this.delay();
        return { ...MOCK_FINISHING };
    }

    async updateFinishing(orderId, updates) {
        await this.delay();
        return { orderId, ...updates };
    }


    async markAsReady(orderId, approvedBy) {
        await this.delay();
        return {
            orderId,
            isReady: true,
            qualityApproval: true,
            approvedBy,
        };
    }


    async toggleChecklist(orderId, field, currentRecord) {
        await this.delay();
        // Checklist ordering enforcement logic
        const ORDER = ['checking', 'ironing', 'threadCutting', 'qualityApproval'];
        const targetIndex = ORDER.indexOf(field);

        // Cannot check if previous steps are not done
        if (targetIndex > 0) {
            for (let i = 0; i < targetIndex; i++) {
                if (!currentRecord[ORDER[i]]) {
                    return null; // Signal: step is locked
                }
            }
        }

        // Cannot uncheck if subsequent steps are done
        if (currentRecord[field]) {
            for (let i = targetIndex + 1; i < ORDER.length; i++) {
                if (currentRecord[ORDER[i]]) {
                    return null; // Signal: cannot uncheck
                }
            }
        }

        return { ...currentRecord, [field]: !currentRecord[field] };
    }

    // ===== Shoots =====

    async getShoots() {
        await this.delay();
        return [...MOCK_SHOOTS];
    }

    async addShoot(shoot) {
        await this.delay();
        return {
            ...shoot,
            id: shoot.id || `s${Math.random().toString(36).substr(2, 6)}`,
        };
    }

    async updateShoot(id, updates) {
        await this.delay();
        return { id, ...updates };
    }

    /**
     * Upload Image — Placeholder for Firebase Storage integration.
     * In production, this will wrap the `uploadBytes` and `getDownloadURL` SDK calls.
     */
    async uploadImage(uri, path = 'shoots') {
        await this.delay(1200); // Simulate network latency

        // MOCK: Generate a deterministic remote URL for simulation
        const filename = uri.split('/').pop() || `img_${Date.now()}.jpg`;
        const remoteUrl = `https://firebasestorage.googleapis.com/v0/b/atelier-assets/o/${path}%2F${filename}?alt=media`;

        return {
            localUri: uri,
            remoteUrl: remoteUrl,
            uploadedAt: now()
        };
    }
}


export const productionService = new ProductionService();
