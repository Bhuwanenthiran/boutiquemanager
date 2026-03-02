import { create } from 'zustand';
import { productionService } from '../services/productionService';

/**
 * FinishingStore — manages finishing/quality-check state.
 * 
 * ARCHITECTURE: Screen → Store → Service → Data Source
 * This store NEVER imports mockData directly. All data flows through productionService.
 * Checklist ordering enforcement logic lives in the service.
 */

const EMPTY_FINISHING = {
    checking: false,
    ironing: false,
    threadCutting: false,
    qualityApproval: false,
    approvedBy: null,
    approvedAt: null,
    isReady: false,
};

export const useFinishingStore = create((set, get) => ({
    finishingRecords: {},
    isLoading: false,
    error: null,

    clearError: () => set({ error: null }),

    /**
     * Initialize finishing data from the service layer.
     */
    init: async () => {
        set({ isLoading: true, error: null });
        try {
            const finishingRecords = await productionService.getFinishingData();
            set({ finishingRecords, isLoading: false });
        } catch (error) {
            set({ isLoading: false, error: 'Failed to load quality check data.' });
            // Error handled in UI
        }
    },

    getFinishing: (orderId) => {
        const records = get().finishingRecords;
        return records[orderId] || { ...EMPTY_FINISHING };
    },

    toggleChecklist: async (orderId, field) => {
        const current = get().finishingRecords[orderId] || { ...EMPTY_FINISHING };
        set({ isLoading: true, error: null });

        try {
            const result = await productionService.toggleChecklist(orderId, field, current);
            // null result means the toggle was blocked by ordering rules
            if (result === null) {
                set({ isLoading: false, error: 'Cannot skip quality check steps.' });
                return;
            }

            set((state) => ({
                finishingRecords: {
                    ...state.finishingRecords,
                    [orderId]: result,
                },
                isLoading: false,
            }));
        } catch (error) {
            set({ isLoading: false, error: 'Failed to update quality check status.' });
            // Error handled in UI
            throw error;
        }
    },

    markAsReady: async (orderId, approvedBy) => {
        set({ isLoading: true, error: null });
        try {
            const result = await productionService.markAsReady(orderId, approvedBy);
            set((state) => ({
                finishingRecords: {
                    ...state.finishingRecords,
                    [orderId]: {
                        ...(state.finishingRecords[orderId] || {}),
                        isReady: result.isReady,
                        qualityApproval: result.qualityApproval,
                        approvedBy: result.approvedBy,
                        approvedAt: result.approvedAt,
                    },
                },
                isLoading: false,
            }));
        } catch (error) {
            set({ isLoading: false, error: 'Failed to grant quality approval.' });
            // Error handled in UI
            throw error;
        }
    },
}));
