import { create } from 'zustand';
import { catalogueService } from '../services/catalogueService';

/**
 * CatalogueStore — manages hold orders, cancellations, and alterations.
 * 
 * ARCHITECTURE: Screen → Store → Service → Data Source
 * This store NEVER imports mockData directly. All data flows through catalogueService.
 * ID generation and date normalization happen in the service.
 */
export const useCatalogueStore = create((set, get) => ({
    holdOrders: [],
    cancelledOrders: [],
    alterations: [],
    activeTab: 'hold',
    isLoading: false,

    /**
     * Initialize catalogue data from the service layer.
     */
    init: async () => {
        set({ isLoading: true });
        try {
            const [holdOrders, cancelledOrders, alterations] = await Promise.all([
                catalogueService.getHoldOrders(),
                catalogueService.getCancelledOrders(),
                catalogueService.getAlterations(),
            ]);
            set({ holdOrders, cancelledOrders, alterations, isLoading: false });
        } catch (error) {
            set({ isLoading: false });
            console.error('Failed to initialize catalogue store:', error);
        }
    },

    setActiveTab: (tab) => set({ activeTab: tab }),

    addHoldOrder: async (order) => {
        set({ isLoading: true });
        try {
            const newOrder = await catalogueService.addHoldOrder(order);
            set((state) => ({
                holdOrders: [...state.holdOrders, newOrder],
                isLoading: false,
            }));
        } catch (error) {
            set({ isLoading: false });
            console.error('Add hold order failed:', error);
            throw error;
        }
    },

    removeHoldOrder: async (id) => {
        set({ isLoading: true });
        try {
            await catalogueService.removeHoldOrder(id);
            set((state) => ({
                holdOrders: state.holdOrders.filter(h => h.id !== id),
                isLoading: false,
            }));
        } catch (error) {
            set({ isLoading: false });
            console.error('Remove hold order failed:', error);
            throw error;
        }
    },

    restoreHoldOrder: async (id) => {
        set({ isLoading: true });
        try {
            await catalogueService.restoreHoldOrder(id);
            set((state) => ({
                holdOrders: state.holdOrders.filter(h => h.id !== id),
                isLoading: false,
            }));
        } catch (error) {
            set({ isLoading: false });
            console.error('Restore hold order failed:', error);
            throw error;
        }
    },

    addCancelledOrder: async (order) => {
        set({ isLoading: true });
        try {
            const newOrder = await catalogueService.addCancelledOrder(order);
            set((state) => ({
                cancelledOrders: [...state.cancelledOrders, newOrder],
                isLoading: false,
            }));
        } catch (error) {
            set({ isLoading: false });
            console.error('Add cancelled order failed:', error);
            throw error;
        }
    },

    deleteCancelledOrder: async (id) => {
        set({ isLoading: true });
        try {
            await catalogueService.deleteCancelledOrder(id);
            set((state) => ({
                cancelledOrders: state.cancelledOrders.filter(c => c.id !== id),
                isLoading: false,
            }));
        } catch (error) {
            set({ isLoading: false });
            console.error('Delete cancelled order failed:', error);
            throw error;
        }
    },

    addAlteration: async (alteration) => {
        set({ isLoading: true });
        try {
            const newAlteration = await catalogueService.addAlteration(alteration);
            set((state) => ({
                alterations: [...state.alterations, newAlteration],
                isLoading: false,
            }));
        } catch (error) {
            set({ isLoading: false });
            console.error('Add alteration failed:', error);
            throw error;
        }
    },

    updateAlteration: async (id, updates) => {
        set({ isLoading: true });
        try {
            await catalogueService.updateAlteration(id, updates);
            set((state) => ({
                alterations: state.alterations.map(a => a.id === id ? { ...a, ...updates } : a),
                isLoading: false,
            }));
        } catch (error) {
            set({ isLoading: false });
            console.error('Update alteration failed:', error);
            throw error;
        }
    },

    deleteAlteration: async (id) => {
        set({ isLoading: true });
        try {
            await catalogueService.deleteAlteration(id);
            set((state) => ({
                alterations: state.alterations.filter(a => a.id !== id),
                isLoading: false,
            }));
        } catch (error) {
            set({ isLoading: false });
            console.error('Delete alteration failed:', error);
            throw error;
        }
    },
}));
