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
    error: null,

    clearError: () => set({ error: null }),

    /**
     * Initialize catalogue data from the service layer.
     */
    init: async () => {
        set({ isLoading: true, error: null });
        try {
            const [holdOrders, cancelledOrders, alterations] = await Promise.all([
                catalogueService.getHoldOrders(),
                catalogueService.getCancelledOrders(),
                catalogueService.getAlterations(),
            ]);
            set({ holdOrders, cancelledOrders, alterations, isLoading: false });
        } catch (error) {
            set({ isLoading: false, error: 'Failed to load catalogue data.' });
            console.error('Failed to initialize catalogue store:', error);
        }
    },

    setActiveTab: (tab) => set({ activeTab: tab }),

    addHoldOrder: async (order) => {
        set({ isLoading: true, error: null });
        try {
            const newOrder = await catalogueService.addHoldOrder(order);
            set((state) => ({
                holdOrders: [...state.holdOrders, newOrder],
                isLoading: false,
            }));
        } catch (error) {
            set({ isLoading: false, error: 'Failed to place order on hold.' });
            console.error('Add hold order failed:', error);
            throw error;
        }
    },

    removeHoldOrder: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await catalogueService.removeHoldOrder(id);
            set((state) => ({
                holdOrders: state.holdOrders.filter(h => h.id !== id),
                isLoading: false,
            }));
        } catch (error) {
            set({ isLoading: false, error: 'Failed to remove hold order.' });
            console.error('Remove hold order failed:', error);
            throw error;
        }
    },

    restoreHoldOrder: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await catalogueService.restoreHoldOrder(id);
            set((state) => ({
                holdOrders: state.holdOrders.filter(h => h.id !== id),
                isLoading: false,
            }));
        } catch (error) {
            set({ isLoading: false, error: 'Failed to restore hold order.' });
            console.error('Restore hold order failed:', error);
            throw error;
        }
    },

    addCancelledOrder: async (order) => {
        set({ isLoading: true, error: null });
        try {
            const newOrder = await catalogueService.addCancelledOrder(order);
            set((state) => ({
                cancelledOrders: [...state.cancelledOrders, newOrder],
                isLoading: false,
            }));
        } catch (error) {
            set({ isLoading: false, error: 'Failed to process cancellation.' });
            console.error('Add cancelled order failed:', error);
            throw error;
        }
    },

    deleteCancelledOrder: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await catalogueService.deleteCancelledOrder(id);
            set((state) => ({
                cancelledOrders: state.cancelledOrders.filter(c => c.id !== id),
                isLoading: false,
            }));
        } catch (error) {
            set({ isLoading: false, error: 'Failed to delete cancellation record.' });
            console.error('Delete cancelled order failed:', error);
            throw error;
        }
    },

    addAlteration: async (alteration) => {
        set({ isLoading: true, error: null });
        try {
            const newAlteration = await catalogueService.addAlteration(alteration);
            set((state) => ({
                alterations: [...state.alterations, newAlteration],
                isLoading: false,
            }));
        } catch (error) {
            set({ isLoading: false, error: 'Failed to add alteration record.' });
            console.error('Add alteration failed:', error);
            throw error;
        }
    },

    updateAlteration: async (id, updates) => {
        set({ isLoading: true, error: null });
        try {
            await catalogueService.updateAlteration(id, updates);
            set((state) => ({
                alterations: state.alterations.map(a => a.id === id ? { ...a, ...updates } : a),
                isLoading: false,
            }));
        } catch (error) {
            set({ isLoading: false, error: 'Failed to update alteration.' });
            console.error('Update alteration failed:', error);
            throw error;
        }
    },

    deleteAlteration: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await catalogueService.deleteAlteration(id);
            set((state) => ({
                alterations: state.alterations.filter(a => a.id !== id),
                isLoading: false,
            }));
        } catch (error) {
            set({ isLoading: false, error: 'Failed to delete alteration record.' });
            console.error('Delete alteration failed:', error);
            throw error;
        }
    },
}));
