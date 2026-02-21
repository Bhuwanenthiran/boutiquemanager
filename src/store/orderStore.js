import { create } from 'zustand';
import { orderService } from '../services/orderService';
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
    isLoading: false,

    // Actions
    fetchOrders: async () => {
        set({ isLoading: true });
        try {
            const orders = await orderService.getOrders();
            set({ orders, isLoading: false });
        } catch (error) {
            set({ isLoading: false });
            console.error('Failed to fetch orders:', error);
        }
    },

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

    addOrder: async (orderData) => {
        set({ isLoading: true });
        try {
            const newOrder = await orderService.addOrder(orderData);
            set((state) => ({
                orders: [newOrder, ...state.orders],
                draftOrder: null,
                isLoading: false,
            }));
            return newOrder;
        } catch (error) {
            set({ isLoading: false });
            throw error;
        }
    },

    updateOrder: async (id, updates) => {
        try {
            const updated = await orderService.updateOrder(id, updates);
            set((state) => ({
                orders: state.orders.map(o => o.id === id ? { ...o, ...updated } : o),
            }));
        } catch (error) {
            console.error('Update failed:', error);
        }
    },

    deleteOrder: async (id) => {
        try {
            await orderService.deleteOrder(id);
            set((state) => ({
                orders: state.orders.filter(o => o.id !== id),
            }));
        } catch (error) {
            console.error('Delete failed:', error);
        }
    },

    saveDraft: (draft) => set({ draftOrder: draft }),
    clearDraft: () => set({ draftOrder: null }),

    updateOrderStatus: async (id, status) => {
        try {
            await orderService.updateOrder(id, { status });
            set((state) => ({
                orders: state.orders.map(o => o.id === id ? { ...o, status } : o),
            }));
        } catch (error) {
            console.error('Update status failed:', error);
        }
    },
}));
