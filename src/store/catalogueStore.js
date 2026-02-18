import { create } from 'zustand';
import { MOCK_HOLD_ORDERS, MOCK_CANCELLED_ORDERS, MOCK_ALTERATIONS } from '../services/mockData';

export const useCatalogueStore = create((set, get) => ({
    holdOrders: [...MOCK_HOLD_ORDERS],
    cancelledOrders: [...MOCK_CANCELLED_ORDERS],
    alterations: [...MOCK_ALTERATIONS],
    activeTab: 'hold',

    setActiveTab: (tab) => set({ activeTab: tab }),

    addHoldOrder: (order) => set((state) => ({
        holdOrders: [...state.holdOrders, { ...order, id: `hold${state.holdOrders.length + 1}` }],
    })),

    removeHoldOrder: (id) => set((state) => ({
        holdOrders: state.holdOrders.filter(h => h.id !== id),
    })),

    restoreHoldOrder: (id) => set((state) => ({
        holdOrders: state.holdOrders.filter(h => h.id !== id),
    })),

    addCancelledOrder: (order) => set((state) => ({
        cancelledOrders: [...state.cancelledOrders, { ...order, id: `can${state.cancelledOrders.length + 1}` }],
    })),

    deleteCancelledOrder: (id) => set((state) => ({
        cancelledOrders: state.cancelledOrders.filter(c => c.id !== id),
    })),

    addAlteration: (alteration) => set((state) => ({
        alterations: [...state.alterations, { ...alteration, id: `alt${state.alterations.length + 1}` }],
    })),

    updateAlteration: (id, updates) => set((state) => ({
        alterations: state.alterations.map(a => a.id === id ? { ...a, ...updates } : a),
    })),

    deleteAlteration: (id) => set((state) => ({
        alterations: state.alterations.filter(a => a.id !== id),
    })),
}));
