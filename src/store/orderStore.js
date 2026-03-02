import { create } from 'zustand';
import { orderService } from '../services/orderService';

/**
 * OrderStore — manages all order-related state.
 * 
 * ARCHITECTURE: Screen → Store → Service → Data Source
 * This store NEVER imports mockData directly. All data flows through orderService.
 */
export const useOrderStore = create((set, get) => ({
    orders: [],
    customers: [],
    designs: [],
    tailors: [],
    measurementFields: {},
    draftOrder: null,
    filterStatus: 'all',
    searchQuery: '',
    isLoading: false,

    /**
     * Initialize all order-related data from the service layer.
     * Should be called once on app start or screen mount.
     */
    init: async () => {
        set({ isLoading: true });
        try {
            const [orders, customers, designs, tailors, measurementFields] = await Promise.all([
                orderService.getOrders(),
                orderService.getCustomers(),
                orderService.getDesigns(),
                orderService.getTailors(),
                orderService.getMeasurementFields(),
            ]);
            set({ orders, customers, designs, tailors, measurementFields, isLoading: false });
        } catch (error) {
            set({ isLoading: false });
            console.error('Failed to initialize order store:', error);
        }
    },

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
        set({ isLoading: true });
        try {
            const updated = await orderService.updateOrder(id, updates);
            set((state) => ({
                orders: state.orders.map(o => o.id === id ? { ...o, ...updated } : o),
                isLoading: false,
            }));
        } catch (error) {
            set({ isLoading: false });
            console.error('Update failed:', error);
            throw error;
        }
    },

    deleteOrder: async (id) => {
        set({ isLoading: true });
        try {
            await orderService.deleteOrder(id);
            set((state) => ({
                orders: state.orders.filter(o => o.id !== id),
                isLoading: false,
            }));
        } catch (error) {
            set({ isLoading: false });
            console.error('Delete failed:', error);
            throw error;
        }
    },

    saveDraft: (draft) => set({ draftOrder: draft }),
    clearDraft: () => set({ draftOrder: null }),

    updateOrderStatus: async (id, status) => {
        set({ isLoading: true });
        try {
            await orderService.updateOrder(id, { status });
            set((state) => ({
                orders: state.orders.map(o => o.id === id ? { ...o, status } : o),
                isLoading: false,
            }));
        } catch (error) {
            set({ isLoading: false });
            console.error('Update status failed:', error);
            throw error;
        }
    },
}));
