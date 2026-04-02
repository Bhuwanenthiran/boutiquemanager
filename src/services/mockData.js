// Mock Data for Boutique Management System
import uuid from 'react-native-uuid';
import { toEpoch } from './dateUtils';

const generateId = () => uuid.v4();

// ===== CUSTOMERS =====
export const MOCK_CUSTOMERS = [
    { id: '1', name: 'Priya Sharma', phone: '9876543210', email: 'priya@email.com', address: '12 Silk Street, Chennai' },
    { id: '2', name: 'Ananya Reddy', phone: '9876543211', email: 'ananya@email.com', address: '45 Cotton Lane, Bangalore' },
    { id: '3', name: 'Meera Patel', phone: '9876543212', email: 'meera@email.com', address: '78 Velvet Road, Mumbai' },
    { id: '4', name: 'Kavitha Nair', phone: '9876543213', email: 'kavitha@email.com', address: '23 Brocade Ave, Kochi' },
    { id: '5', name: 'Deepa Iyer', phone: '9876543214', email: 'deepa@email.com', address: '56 Chiffon Blvd, Coimbatore' },
];

// ===== DESIGNS (Legacy flat list — used by existing orders) =====
export const MOCK_DESIGNS = [
    { id: 'd1', name: 'Classic Anarkali', category: 'Anarkali', image: null, description: 'Traditional floor-length anarkali with heavy embroidery' },
    { id: 'd2', name: 'Modern Lehenga', category: 'Lehenga', image: null, description: 'Contemporary lehenga with minimal work' },
    { id: 'd3', name: 'Silk Saree Blouse', category: 'Blouse', image: null, description: 'Designer blouse for silk saree' },
    { id: 'd4', name: 'Bridal Lehenga', category: 'Bridal', image: null, description: 'Heavy bridal lehenga with zardozi work' },
    { id: 'd5', name: 'Salwar Kameez', category: 'Salwar', image: null, description: 'Elegant salwar kameez with dupatta' },
    { id: 'd6', name: 'Party Gown', category: 'Gown', image: null, description: 'Western-style party gown' },
    { id: 'd7', name: 'Churidar Set', category: 'Churidar', image: null, description: 'Fitted churidar with short kurti' },
    { id: 'd8', name: 'Aari Work Blouse', category: 'Blouse', image: null, description: 'Intricate aari embroidery blouse' },
];

// ===== DESIGN TEMPLATES (4-category structured templates for order entry) =====
export const DESIGN_TEMPLATES = {
    blousePatterns: Array.from({ length: 10 }, (_, i) => ({
        id: `bp${i + 1}`,
        name: `Blouse Pattern ${i + 1}`,
        image: `https://via.placeholder.com/150?text=Blouse+${i + 1}`,
        category: 'blousePattern',
    })),
    frontNeckDesigns: Array.from({ length: 10 }, (_, i) => ({
        id: `fn${i + 1}`,
        name: `Front Neck ${i + 1}`,
        image: `https://via.placeholder.com/150?text=FrontNeck+${i + 1}`,
        category: 'frontNeck',
    })),
    backNeckDesigns: Array.from({ length: 10 }, (_, i) => ({
        id: `bn${i + 1}`,
        name: `Back Neck ${i + 1}`,
        image: `https://via.placeholder.com/150?text=BackNeck+${i + 1}`,
        category: 'backNeck',
    })),
    aariDesigns: Array.from({ length: 10 }, (_, i) => ({
        id: `ad${i + 1}`,
        name: `Aari Design ${i + 1}`,
        image: `https://via.placeholder.com/150?text=Aari+${i + 1}`,
        category: 'aariDesign',
    })),
};

// ===== TAILORS =====
export const MOCK_TAILORS = [
    { id: 't1', name: 'Ramu Master', specialty: 'Bridal Wear', rating: 4.8, activeOrders: 3 },
    { id: 't2', name: 'Lakshmi Tailor', specialty: 'Blouse Stitching', rating: 4.9, activeOrders: 5 },
    { id: 't3', name: 'Karthik Designer', specialty: 'Lehenga', rating: 4.7, activeOrders: 2 },
    { id: 't4', name: 'Vimala Stitcher', specialty: 'Salwar & Churidar', rating: 4.6, activeOrders: 4 },
    { id: 't5', name: 'Senthil Master', specialty: 'All-round', rating: 4.5, activeOrders: 6 },
];

// ===== MEASUREMENT TEMPLATES =====
export const MEASUREMENT_FIELDS = {
    Blouse: ['Shoulder', 'Bust', 'Waist', 'Hip', 'Sleeve Length', 'Sleeve Round', 'Back Neck', 'Front Neck', 'Blouse Length', 'Armhole'],
    Lehenga: ['Waist', 'Hip', 'Length', 'Flare', 'Can Can Length'],
    Salwar: ['Waist', 'Hip', 'Length', 'Bottom', 'Knee', 'Thigh'],
    Churidar: ['Waist', 'Hip', 'Length', 'Bottom', 'Knee', 'Thigh', 'Calf'],
    Anarkali: ['Shoulder', 'Bust', 'Waist', 'Hip', 'Length', 'Sleeve Length', 'Armhole', 'Flare'],
    Gown: ['Shoulder', 'Bust', 'Waist', 'Hip', 'Length', 'Sleeve Length', 'Armhole', 'Back Neck'],
    Bridal: ['Shoulder', 'Bust', 'Waist', 'Hip', 'Length', 'Sleeve Length', 'Armhole', 'Flare', 'Train Length'],
    Default: ['Chest', 'Waist', 'Hip', 'Length', 'Shoulder', 'Sleeve Length'],
};

// ===== ORDERS =====
// All date fields are stored as numeric epoch (ms) for Firestore compatibility
export const MOCK_ORDERS = [
    {
        id: 'ORD001',
        customerId: '1',
        customerName: 'Priya Sharma',
        designId: 'd4',
        designName: 'Bridal Lehenga',
        category: 'Bridal',
        measurements: { Shoulder: '14', Bust: '36', Waist: '30', Hip: '38', Length: '42', 'Sleeve Length': '18', Armhole: '16', Flare: '6', 'Train Length': '12' },
        deliveryDate: toEpoch('2026-03-15'),
        totalAmount: 45000,
        advanceAmount: 20000,
        balanceAmount: 25000,
        status: 'In Production',
        priority: 'high',
        notes: 'Customer wants gold zardozi work on border',
        createdAt: toEpoch('2026-02-10'),
        tailorId: 't1',
        tailorName: 'Ramu Master',
        productionStage: 'stitching',
        isDraft: false,
    },
    {
        id: 'ORD002',
        customerId: '2',
        customerName: 'Ananya Reddy',
        designId: 'd3',
        designName: 'Silk Saree Blouse',
        category: 'Blouse',
        measurements: { Shoulder: '13.5', Bust: '34', Waist: '28', Hip: '36', 'Sleeve Length': '10', 'Sleeve Round': '12', 'Back Neck': '7', 'Front Neck': '8', 'Blouse Length': '15', Armhole: '15' },
        deliveryDate: toEpoch('2026-02-28'),
        totalAmount: 3500,
        advanceAmount: 2000,
        balanceAmount: 1500,
        status: 'Ready',
        priority: 'medium',
        notes: 'Maggam work on sleeves',
        createdAt: toEpoch('2026-02-05'),
        tailorId: 't2',
        tailorName: 'Lakshmi Tailor',
        productionStage: 'completed',
        isDraft: false,
    },
    {
        id: 'ORD003',
        customerId: '3',
        customerName: 'Meera Patel',
        designId: 'd1',
        designName: 'Classic Anarkali',
        category: 'Anarkali',
        measurements: { Shoulder: '14', Bust: '35', Waist: '29', Hip: '37', Length: '50', 'Sleeve Length': '22', Armhole: '15.5', Flare: '8' },
        deliveryDate: toEpoch('2026-03-05'),
        totalAmount: 12000,
        advanceAmount: 5000,
        balanceAmount: 7000,
        status: 'Marking',
        priority: 'medium',
        notes: 'Pastel pink fabric chosen',
        createdAt: toEpoch('2026-02-12'),
        tailorId: 't3',
        tailorName: 'Karthik Designer',
        productionStage: 'marking',
        isDraft: false,
    },
    {
        id: 'ORD004',
        customerId: '4',
        customerName: 'Kavitha Nair',
        designId: 'd5',
        designName: 'Salwar Kameez',
        category: 'Salwar',
        measurements: { Waist: '28', Hip: '36', Length: '38', Bottom: '7', Knee: '14', Thigh: '20' },
        deliveryDate: toEpoch('2026-03-10'),
        totalAmount: 5500,
        advanceAmount: 3000,
        balanceAmount: 2500,
        status: 'Cutting',
        priority: 'low',
        notes: 'Georgette fabric, simple design',
        createdAt: toEpoch('2026-02-14'),
        tailorId: 't4',
        tailorName: 'Vimala Stitcher',
        productionStage: 'cutting',
        isDraft: false,
    },
    {
        id: 'ORD005',
        customerId: '5',
        customerName: 'Deepa Iyer',
        designId: 'd8',
        designName: 'Aari Work Blouse',
        category: 'Blouse',
        measurements: { Shoulder: '14', Bust: '36', Waist: '30', Hip: '38', 'Sleeve Length': '12', 'Sleeve Round': '13', 'Back Neck': '7.5', 'Front Neck': '8.5', 'Blouse Length': '16', Armhole: '16' },
        deliveryDate: toEpoch('2026-03-20'),
        totalAmount: 8000,
        advanceAmount: 4000,
        balanceAmount: 4000,
        status: 'Pending',
        priority: 'high',
        notes: 'Heavy aari work with stones',
        createdAt: toEpoch('2026-02-16'),
        tailorId: 't5',
        tailorName: 'Senthil Master',
        productionStage: 'pending',
        isDraft: false,
    },
];

// ===== PRODUCTION STAGES =====
export const PRODUCTION_STAGES = {
    ORD001: {
        production1: { status: 'completed', startedAt: toEpoch('2026-02-11'), completedAt: toEpoch('2026-02-13'), notes: 'Base stitching done' },
        production2: { status: 'in_progress', startedAt: toEpoch('2026-02-14'), completedAt: null, notes: 'Zardozi work ongoing' },
        production3: { status: 'pending', startedAt: null, completedAt: null, notes: '' },
    },
    ORD002: {
        production1: { status: 'completed', startedAt: toEpoch('2026-02-06'), completedAt: toEpoch('2026-02-07'), notes: 'Stitching complete' },
        production2: { status: 'completed', startedAt: toEpoch('2026-02-08'), completedAt: toEpoch('2026-02-10'), notes: 'Maggam work done' },
        production3: { status: 'completed', startedAt: toEpoch('2026-02-11'), completedAt: toEpoch('2026-02-12'), notes: 'Lining and hooks added' },
    },
    ORD003: {
        production1: { status: 'pending', startedAt: null, completedAt: null, notes: '' },
        production2: { status: 'pending', startedAt: null, completedAt: null, notes: '' },
        production3: { status: 'pending', startedAt: null, completedAt: null, notes: '' },
    },
};

// ===== FINISHING CHECKLISTS =====
export const MOCK_FINISHING = {
    ORD002: {
        checking: true,
        ironing: true,
        threadCutting: true,
        qualityApproval: true,
        approvedBy: 'Manager',
        approvedAt: toEpoch('2026-02-13'),
        isReady: true,
    },
    ORD001: {
        checking: false,
        ironing: false,
        threadCutting: false,
        qualityApproval: false,
        approvedBy: null,
        approvedAt: null,
        isReady: false,
    },
};

// ===== SHOOT / MEDIA =====
export const MOCK_SHOOTS = [
    { id: 's1', orderId: 'ORD002', images: [], productShootDone: true, instagramUploaded: true, googleCatalogListed: false, notes: 'Shot in studio' },
    { id: 's2', orderId: 'ORD001', images: [], productShootDone: false, instagramUploaded: false, googleCatalogListed: false, notes: '' },
];

// ===== STORE INVENTORY =====
export const MOCK_INVENTORY = [
    { id: 'inv1', name: 'Ready Silk Blouse - Red', category: 'Blouse', quantity: 5, price: 2500, status: 'in_stock', image: null },
    { id: 'inv2', name: 'Designer Lehenga - Blue', category: 'Lehenga', quantity: 2, price: 18000, status: 'in_stock', image: null },
    { id: 'inv3', name: 'Cotton Salwar Set', category: 'Salwar', quantity: 8, price: 3500, status: 'in_stock', image: null },
    { id: 'inv4', name: 'Embroidered Dupatta', category: 'Accessories', quantity: 1, price: 1200, status: 'low_stock', image: null },
    { id: 'inv5', name: 'Bridal Lehenga Display', category: 'Bridal', quantity: 0, price: 55000, status: 'out_of_stock', image: null },
    { id: 'inv6', name: 'Chanderi Kurti', category: 'Kurti', quantity: 12, price: 2800, status: 'in_stock', image: null },
    { id: 'inv7', name: 'Organza Saree', category: 'Saree', quantity: 3, price: 4500, status: 'in_stock', image: null },
];

export const MOCK_SOLD_ITEMS = [
    { id: 'sold1', name: 'Silk Saree Blouse', category: 'Blouse', price: 3500, soldDate: toEpoch('2026-02-13'), customer: 'Ananya Reddy' },
    { id: 'sold2', name: 'Party Gown - Black', category: 'Gown', price: 15000, soldDate: toEpoch('2026-02-10'), customer: 'Walk-in Customer' },
    { id: 'sold3', name: 'Cotton Kurti Set', category: 'Kurti', price: 2200, soldDate: toEpoch('2026-02-08'), customer: 'Online Order' },
];

// ===== CATALOGUE / SPECIAL RECORDS =====
export const MOCK_HOLD_ORDERS = [
    { id: 'hold1', orderId: 'ORD006', customerName: 'Sita Devi', designName: 'Pattu Pavadai', reason: 'Awaiting fabric delivery', holdDate: toEpoch('2026-02-15'), status: 'on_hold' },
    { id: 'hold2', orderId: 'ORD007', customerName: 'Radha Krishnan', designName: 'Wedding Saree Blouse', reason: 'Customer requested delay', holdDate: toEpoch('2026-02-14'), status: 'on_hold' },
];

export const MOCK_CANCELLED_ORDERS = [
    { id: 'can1', orderId: 'ORD008', customerName: 'Lakshmi G', designName: 'Simple Salwar', reason: 'Changed mind', cancelledDate: toEpoch('2026-02-12'), refundAmount: 2000, refunded: true },
];

export const MOCK_ALTERATIONS = [
    { id: 'alt1', orderId: 'ORD002', customerName: 'Ananya Reddy', item: 'Silk Saree Blouse', type: 'Sleeve adjustment', status: 'completed', date: toEpoch('2026-02-14'), notes: 'Sleeve shortened by 1 inch' },
    { id: 'alt2', orderId: 'ORD009', customerName: 'Walk-in', item: 'Lehenga', type: 'Waist alteration', status: 'in_progress', date: toEpoch('2026-02-16'), notes: 'Waist taken in 2 inches' },
];
