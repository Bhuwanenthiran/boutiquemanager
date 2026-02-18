import { create } from 'zustand';
import { MOCK_ORDERS, PRODUCTION_STAGES, MOCK_TAILORS } from '../services/mockData';

export const useProductionStore = create((set, get) => ({
    productionOrders: MOCK_ORDERS.filter(o => ['Marking', 'Cutting', 'In Production', 'Pending'].includes(o.status)),
    productionStages: { ...PRODUCTION_STAGES },
    tailors: [...MOCK_TAILORS],
    activeTimers: {},
    filterTailor: 'all',
    filterDate: null,

    getFilteredProduction: () => {
        const { productionOrders, filterTailor } = get();
        let filtered = [...productionOrders];
        if (filterTailor !== 'all') {
            filtered = filtered.filter(o => o.tailorId === filterTailor);
        }
        return filtered;
    },

    setFilterTailor: (tailorId) => set({ filterTailor: tailorId }),

    updateProductionStatus: (orderId, field, value) => set((state) => ({
        productionOrders: state.productionOrders.map(o =>
            o.id === orderId ? { ...o, [field]: value } : o
        ),
    })),

    updateStage: (orderId, stageKey, updates) => set((state) => ({
        productionStages: {
            ...state.productionStages,
            [orderId]: {
                ...(state.productionStages[orderId] || {}),
                [stageKey]: {
                    ...(state.productionStages[orderId]?.[stageKey] || {}),
                    ...updates,
                },
            },
        },
    })),

    startTimer: (orderId) => set((state) => ({
        activeTimers: { ...state.activeTimers, [orderId]: Date.now() },
    })),

    stopTimer: (orderId) => set((state) => {
        const timers = { ...state.activeTimers };
        delete timers[orderId];
        return { activeTimers: timers };
    }),

    assignTailor: (orderId, tailorId, tailorName) => set((state) => ({
        productionOrders: state.productionOrders.map(o =>
            o.id === orderId ? { ...o, tailorId, tailorName } : o
        ),
    })),
}));
