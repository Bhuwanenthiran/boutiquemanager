import { create } from 'zustand';
import { MOCK_INVENTORY, MOCK_SOLD_ITEMS } from '../services/mockData';

export const useStoreManagementStore = create((set, get) => ({
    inventory: [...MOCK_INVENTORY],
    soldItems: [...MOCK_SOLD_ITEMS],
    searchQuery: '',
    filterCategory: 'all',

    getFilteredInventory: () => {
        const { inventory, searchQuery, filterCategory } = get();
        let filtered = [...inventory];
        if (filterCategory !== 'all') {
            filtered = filtered.filter(i => i.category === filterCategory);
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(i =>
                i.name.toLowerCase().includes(q) ||
                i.category.toLowerCase().includes(q)
            );
        }
        return filtered;
    },

    setSearchQuery: (query) => set({ searchQuery: query }),
    setFilterCategory: (category) => set({ filterCategory: category }),

    addInventoryItem: (item) => set((state) => ({
        inventory: [...state.inventory, { ...item, id: `inv${state.inventory.length + 1}` }],
    })),

    updateInventoryItem: (id, updates) => set((state) => ({
        inventory: state.inventory.map(i => i.id === id ? { ...i, ...updates } : i),
    })),

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

    markAsSold: (id, customerName) => set((state) => {
        const item = state.inventory.find(i => i.id === id);
        if (!item || item.quantity === 0) return state;
        const soldItem = {
            id: `sold${state.soldItems.length + 1}`,
            name: item.name,
            category: item.category,
            price: item.price,
            soldDate: new Date().toISOString().split('T')[0],
            customer: customerName || 'Walk-in Customer',
        };
        return {
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
        };
    }),

    getCategories: () => {
        const { inventory } = get();
        const cats = new Set(inventory.map(i => i.category));
        return ['all', ...Array.from(cats)];
    },
}));
