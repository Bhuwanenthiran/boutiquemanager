import { create } from 'zustand';
import { MOCK_ORDERS, MOCK_CUSTOMERS, MOCK_DESIGNS, MOCK_TAILORS, MEASUREMENT_FIELDS } from '../services/mockData';

export const useOrderStore = create((set, get) => ({
    orders: [...MOCK_ORDERS],
    customers: [...MOCK_CUSTOMERS],
    designs: [...MOCK_DESIGNS],
    tailors: [...MOCK_TAILORS],
    measurementFields: MEASUREMENT_FIELDS,
    draftOrder: null,
    filterStatus: 'all',
    searchQuery: '',

    // Get filtered orders
    getFilteredOrders: () => {
        const { orders, filterStatus, searchQuery } = get();
        let filtered = [...orders];
        if (filterStatus !== 'all') {
            filtered = filtered.filter(o => o.status.toLowerCase().replace(/\s/g, '_') === filterStatus.toLowerCase().replace(/\s/g, '_'));
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(o =>
                o.customerName.toLowerCase().includes(q) ||
                o.designName.toLowerCase().includes(q) ||
                o.id.toLowerCase().includes(q)
            );
        }
        return filtered;
    },

    setFilterStatus: (status) => set({ filterStatus: status }),
    setSearchQuery: (query) => set({ searchQuery: query }),

    addOrder: (order) => set((state) => ({
        orders: [{ ...order, id: `ORD${String(state.orders.length + 1).padStart(3, '0')}`, createdAt: new Date().toISOString().split('T')[0], isDraft: false }, ...state.orders],
        draftOrder: null,
    })),

    updateOrder: (id, updates) => set((state) => ({
        orders: state.orders.map(o => o.id === id ? { ...o, ...updates } : o),
    })),

    deleteOrder: (id) => set((state) => ({
        orders: state.orders.filter(o => o.id !== id),
    })),

    saveDraft: (draft) => set({ draftOrder: draft }),
    clearDraft: () => set({ draftOrder: null }),

    updateOrderStatus: (id, status) => set((state) => ({
        orders: state.orders.map(o => o.id === id ? { ...o, status } : o),
    })),
}));
