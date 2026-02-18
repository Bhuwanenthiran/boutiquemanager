import { create } from 'zustand';
import { MOCK_SHOOTS } from '../services/mockData';

export const useShootStore = create((set, get) => ({
    shoots: [...MOCK_SHOOTS],

    getShootByOrder: (orderId) => {
        return get().shoots.find(s => s.orderId === orderId) || null;
    },

    addShoot: (shoot) => set((state) => ({
        shoots: [...state.shoots, { ...shoot, id: `s${state.shoots.length + 1}` }],
    })),

    updateShoot: (id, updates) => set((state) => ({
        shoots: state.shoots.map(s => s.id === id ? { ...s, ...updates } : s),
    })),

    addImage: (shootId, imageUri) => set((state) => ({
        shoots: state.shoots.map(s =>
            s.id === shootId ? { ...s, images: [...s.images, imageUri] } : s
        ),
    })),

    removeImage: (shootId, imageUri) => set((state) => ({
        shoots: state.shoots.map(s =>
            s.id === shootId ? { ...s, images: s.images.filter(i => i !== imageUri) } : s
        ),
    })),
}));
