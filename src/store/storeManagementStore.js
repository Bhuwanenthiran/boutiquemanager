import { create } from 'zustand';
import { inventoryService } from '../services/inventoryService';

/**
 * StoreManagementStore — manages inventory and sold items state.
 * 
 * ARCHITECTURE: Screen → Store → Service → Data Source
 * This store NEVER imports mockData directly. All data flows through inventoryService.
 * Business logic (sold-item creation, ID generation) lives in the service.
 */
export const useStoreManagementStore = create((set, get) => ({
    inventory: [],
    soldItems: [],
    searchQuery: '',
    filterCategory: 'all',
    isLoading: false,
    error: null,

    clearError: () => set({ error: null }),

    /**
     * Initialize inventory data from the service layer.
     */
    init: async () => {
        set({ isLoading: true, error: null });
        try {
            const [inventory, soldItems] = await Promise.all([
                inventoryService.getInventory(),
                inventoryService.getSoldItems(),
            ]);
            set({
                inventory: Array.isArray(inventory) ? inventory : [],
                soldItems: Array.isArray(soldItems) ? soldItems : [],
                isLoading: false
            });
        } catch (error) {
            set({ isLoading: false, error: 'Failed to load store inventory.' });
        }
    },

    getFilteredInventory: () => {
        const { inventory, searchQuery, filterCategory } = get();
        if (!Array.isArray(inventory)) return [];
        let filtered = [...inventory];
        if (filterCategory !== 'all') {
            filtered = filtered.filter(i => i.category === filterCategory);
        }
        if (searchQuery && searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(i =>
                (i.name && i.name.toLowerCase().includes(q)) ||
                (i.category && i.category.toLowerCase().includes(q))
            );
        }
        return filtered;
    },

    setSearchQuery: (query) => set({ searchQuery: query }),
    setFilterCategory: (category) => set({ filterCategory: category }),

    addInventoryItem: async (item) => {
        set({ isLoading: true, error: null });
        try {
            const newItem = await inventoryService.addInventoryItem(item);
            set((state) => ({
                inventory: [...state.inventory, newItem],
                isLoading: false,
            }));
        } catch (error) {
            set({ isLoading: false, error: 'Failed to add item to inventory.' });
            throw error;
        }
    },

    updateInventoryItem: async (id, updates) => {
        set({ isLoading: true, error: null });
        try {
            await inventoryService.updateInventoryItem(id, updates);
            set((state) => ({
                inventory: state.inventory.map(i => i.id === id ? { ...i, ...updates } : i),
                isLoading: false,
            }));
        } catch (error) {
            set({ isLoading: false, error: 'Failed to update inventory item.' });
            throw error;
        }
    },

    updateQuantity: (id, change) => set((state) => ({
        inventory: state.inventory.map(i => {
            if (i.id === id) {
                const newQty = Math.max(0, i.quantity + change);
                let status = 'in_stock';
                if (newQty === 0) status = 'out_of_stock';
                else if (newQty <= 2) status = 'low_stock';
                return { ...i, quantity: newQty, status };
            }
            return i;
        }),
    })),

    markAsSold: async (id, customerName) => {
        const state = get();
        const item = state.inventory.find(i => i.id === id);
        if (!item || item.quantity === 0) return;

        set({ isLoading: true, error: null });
        try {
            const soldItem = await inventoryService.markAsSold(item, customerName);
            set((state) => ({
                soldItems: [soldItem, ...state.soldItems],
                inventory: state.inventory.map(i => {
                    if (i.id === id) {
                        const newQty = i.quantity - 1;
                        let status = 'in_stock';
                        if (newQty === 0) status = 'out_of_stock';
                        else if (newQty <= 2) status = 'low_stock';
                        return { ...i, quantity: newQty, status };
                    }
                    return i;
                }),
                isLoading: false,
            }));
        } catch (error) {
            set({ isLoading: false, error: 'Failed to complete sale transaction.' });
            throw error;
        }
    },

    getCategories: () => {
        const { inventory } = get();
        if (!Array.isArray(inventory)) return ['all'];
        const cats = new Set(inventory.filter(i => i.category).map(i => i.category));
        return ['all', ...Array.from(cats)];
    },
}));
