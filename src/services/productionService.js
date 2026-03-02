import { MOCK_ORDERS, PRODUCTION_STAGES, MOCK_FINISHING, MOCK_SHOOTS, MOCK_TAILORS } from './mockData';
import { now, normalizeDates } from './dateUtils';

/**
 * Date fields on production stage objects.
 */
const STAGE_DATE_FIELDS = ['startedAt', 'completedAt'];

/**
 * Date fields on finishing records.
 */
const FINISHING_DATE_FIELDS = ['approvedAt'];

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
 * - All date fields returned from this service are numeric epoch (ms).
 * - Stage start/complete timestamps use `now()`.
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
        // Deep-normalize all stage date fields
        const result = {};
        Object.entries(PRODUCTION_STAGES).forEach(([orderId, stages]) => {
            result[orderId] = {};
            Object.entries(stages).forEach(([stageKey, stageData]) => {
                result[orderId][stageKey] = normalizeDates(stageData, STAGE_DATE_FIELDS);
            });
        });
        return result;
    }

    async startStage(orderId, stageKey) {
        await this.delay();
        return { orderId, stageKey, status: 'in_progress', startedAt: now() };
    }

    async completeStage(orderId, stageKey) {
        await this.delay();
        return { orderId, stageKey, status: 'completed', completedAt: now() };
    }

    async updateStage(orderId, stageKey, updates) {
        await this.delay();
        const normalized = normalizeDates(updates, STAGE_DATE_FIELDS);
        return { orderId, stageKey, ...normalized };
    }

    // ===== Finishing =====

    async getFinishingData() {
        await this.delay();
        const result = {};
        Object.entries(MOCK_FINISHING).forEach(([orderId, finishing]) => {
            result[orderId] = normalizeDates(finishing, FINISHING_DATE_FIELDS);
        });
        return result;
    }

    async updateFinishing(orderId, updates) {
        await this.delay();
        const normalized = normalizeDates(updates, FINISHING_DATE_FIELDS);
        return { orderId, ...normalized };
    }

    async markAsReady(orderId, approvedBy) {
        await this.delay();
        return {
            orderId,
            isReady: true,
            qualityApproval: true,
            approvedBy,
            approvedAt: now(),
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
}

export const productionService = new ProductionService();
