import { create } from 'zustand';
import { MOCK_FINISHING } from '../services/mockData';

export const useFinishingStore = create((set, get) => ({
    finishingRecords: { ...MOCK_FINISHING },

    getFinishing: (orderId) => {
        const records = get().finishingRecords;
        return records[orderId] || {
            checking: false,
            ironing: false,
            threadCutting: false,
            qualityApproval: false,
            approvedBy: null,
            approvedAt: null,
            isReady: false,
        };
    },

    toggleChecklist: (orderId, field) => set((state) => {
        const current = state.finishingRecords[orderId] || {
            checking: false, ironing: false, threadCutting: false, qualityApproval: false,
            approvedBy: null, approvedAt: null, isReady: false,
        };
        return {
            finishingRecords: {
                ...state.finishingRecords,
                [orderId]: { ...current, [field]: !current[field] },
            },
        };
    }),

    markAsReady: (orderId, approvedBy) => set((state) => ({
        finishingRecords: {
            ...state.finishingRecords,
            [orderId]: {
                ...(state.finishingRecords[orderId] || {}),
                isReady: true,
                qualityApproval: true,
                approvedBy,
                approvedAt: new Date().toISOString().split('T')[0],
            },
        },
    })),
}));
