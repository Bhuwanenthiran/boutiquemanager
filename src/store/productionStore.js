import { create } from 'zustand';
import { productionService } from '../services/productionService';

/**
 * ProductionStore — manages production pipeline state.
 * 
 * ARCHITECTURE: Screen → Store → Service → Data Source
 * This store NEVER imports mockData directly. All data flows through productionService.
 * Business logic (status filtering, stage timestamps) lives in the service.
 */
export const useProductionStore = create((set, get) => ({
    productionOrders: [],
    productionStages: {},
    tailors: [],
    activeTimers: {},
    filterTailor: 'all',
    filterDate: null,
    isLoading: false,

    /**
     * Initialize production data from the service layer.
     * Should be called once on app start or screen mount.
     */
    init: async () => {
        set({ isLoading: true });
        try {
            const [productionOrders, productionStages, tailors] = await Promise.all([
                productionService.getProductionOrders(),
                productionService.getProductionStages(),
                productionService.getTailors(),
            ]);
            set({ productionOrders, productionStages, tailors, isLoading: false });
        } catch (error) {
            set({ isLoading: false });
            console.error('Failed to initialize production store:', error);
        }
    },

    getFilteredProduction: () => {
        const { productionOrders, filterTailor } = get();
        let filtered = [...productionOrders];
        if (filterTailor !== 'all') {
            filtered = filtered.filter(o => o.tailorId === filterTailor);
        }
        return filtered;
    },

    setFilterTailor: (tailorId) => set({ filterTailor: tailorId }),

    updateProductionStatus: async (orderId, field, value) => {
        set({ isLoading: true });
        try {
            await productionService.updateProductionStatus(orderId, field, value);
            set((state) => ({
                productionOrders: state.productionOrders.map(o =>
                    o.id === orderId ? { ...o, [field]: value } : o
                ),
                isLoading: false,
            }));
        } catch (error) {
            set({ isLoading: false });
            console.error('Update production status failed:', error);
            throw error;
        }
    },

    updateStage: async (orderId, stageKey, updates) => {
        set({ isLoading: true });
        try {
            const result = await productionService.updateStage(orderId, stageKey, updates);
            set((state) => ({
                productionStages: {
                    ...state.productionStages,
                    [orderId]: {
                        ...(state.productionStages[orderId] || {}),
                        [stageKey]: {
                            ...(state.productionStages[orderId]?.[stageKey] || {}),
                            ...result,
                        },
                    },
                },
                isLoading: false,
            }));
        } catch (error) {
            set({ isLoading: false });
            console.error('Update stage failed:', error);
            throw error;
        }
    },

    startTimer: (orderId) => set((state) => ({
        activeTimers: { ...state.activeTimers, [orderId]: Date.now() },
    })),

    startStage: async (orderId, stageKey) => {
        set({ isLoading: true });
        try {
            const result = await productionService.startStage(orderId, stageKey);
            set((state) => ({
                productionStages: {
                    ...state.productionStages,
                    [orderId]: {
                        ...(state.productionStages[orderId] || {}),
                        [stageKey]: {
                            ...(state.productionStages[orderId]?.[stageKey] || {}),
                            status: result.status,
                            startedAt: result.startedAt,
                        },
                    },
                },
                isLoading: false,
            }));
        } catch (error) {
            set({ isLoading: false });
            console.error('Start stage failed:', error);
            throw error;
        }
    },

    completeStage: async (orderId, stageKey) => {
        set({ isLoading: true });
        try {
            const result = await productionService.completeStage(orderId, stageKey);
            set((state) => ({
                productionStages: {
                    ...state.productionStages,
                    [orderId]: {
                        ...(state.productionStages[orderId] || {}),
                        [stageKey]: {
                            ...(state.productionStages[orderId]?.[stageKey] || {}),
                            status: result.status,
                            completedAt: result.completedAt,
                        },
                    },
                },
                isLoading: false,
            }));
        } catch (error) {
            set({ isLoading: false });
            console.error('Complete stage failed:', error);
            throw error;
        }
    },

    stopTimer: (orderId) => set((state) => {
        const timers = { ...state.activeTimers };
        delete timers[orderId];
        return { activeTimers: timers };
    }),

    assignTailor: async (orderId, tailorId, tailorName) => {
        set({ isLoading: true });
        try {
            await productionService.assignTailor(orderId, tailorId, tailorName);
            set((state) => ({
                productionOrders: state.productionOrders.map(o =>
                    o.id === orderId ? { ...o, tailorId, tailorName } : o
                ),
                isLoading: false,
            }));
        } catch (error) {
            set({ isLoading: false });
            console.error('Assign tailor failed:', error);
            throw error;
        }
    },
}));
