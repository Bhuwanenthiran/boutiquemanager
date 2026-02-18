import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../theme';
import { useStoreManagementStore } from '../../store/storeManagementStore';
import { Card, EmptyState } from '../../components/common';
import { SearchBar, FilterChip, FormButton } from '../../components/forms';

const StoreManagementScreen = ({ navigation }) => {
    const inventory = useStoreManagementStore((s) => s.inventory);
    const soldItems = useStoreManagementStore((s) => s.soldItems);
    const searchQuery = useStoreManagementStore((s) => s.searchQuery);
    const setSearchQuery = useStoreManagementStore((s) => s.setSearchQuery);
    const filterCategory = useStoreManagementStore((s) => s.filterCategory);
    const setFilterCategory = useStoreManagementStore((s) => s.setFilterCategory);
    const getFilteredInventory = useStoreManagementStore((s) => s.getFilteredInventory);
    const getCategories = useStoreManagementStore((s) => s.getCategories);
    const updateQuantity = useStoreManagementStore((s) => s.updateQuantity);
    const markAsSold = useStoreManagementStore((s) => s.markAsSold);

    const [activeTab, setActiveTab] = useState('inventory');
    const filteredInventory = getFilteredInventory();
    const categories = getCategories();

    const getStockStyle = (status) => {
        switch (status) {
            case 'in_stock': return { bg: COLORS.successLight, text: COLORS.success, label: 'In Stock' };
            case 'low_stock': return { bg: COLORS.warningLight, text: COLORS.warning, label: 'Low Stock' };
            case 'out_of_stock': return { bg: COLORS.errorLight, text: COLORS.error, label: 'Out of Stock' };
            default: return { bg: COLORS.borderLight, text: COLORS.textMuted, label: status };
        }
    };

    const handleSell = (item) => {
        Alert.alert(
            'Confirm Sale',
            `Mark "${item.name}" as sold?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Sell', onPress: () => markAsSold(item.id, 'Walk-in Customer') },
            ]
        );
    };

    const renderInventoryItem = ({ item }) => {
        const stockStyle = getStockStyle(item.status);
        return (
            <Card elevated style={styles.inventoryCard}>
                <View style={styles.inventoryHeader}>
                    <View style={styles.inventoryImageWrap}>
                        <Ionicons name="shirt-outline" size={24} color={COLORS.primary} />
                    </View>
                    <View style={{ flex: 1, marginLeft: SIZES.md }}>
                        <Text style={styles.inventoryName}>{item.name}</Text>
                        <Text style={styles.inventoryCategory}>{item.category}</Text>
                    </View>
                    <View style={[styles.stockBadge, { backgroundColor: stockStyle.bg }]}>
                        <Text style={[styles.stockText, { color: stockStyle.text }]}>{stockStyle.label}</Text>
                    </View>
                </View>

                <View style={styles.inventoryDetails}>
                    <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Price</Text>
                        <Text style={styles.detailValue}>₹{item.price.toLocaleString('en-IN')}</Text>
                    </View>
                    <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Quantity</Text>
                        <View style={styles.qtyControls}>
                            <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQuantity(item.id, -1)}>
                                <Ionicons name="remove" size={16} color={COLORS.textPrimary} />
                            </TouchableOpacity>
                            <Text style={styles.qtyValue}>{item.quantity}</Text>
                            <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQuantity(item.id, 1)}>
                                <Ionicons name="add" size={16} color={COLORS.textPrimary} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {item.quantity > 0 && (
                    <TouchableOpacity style={styles.sellBtn} onPress={() => handleSell(item)} activeOpacity={0.7}>
                        <Ionicons name="cart-outline" size={14} color={COLORS.primary} />
                        <Text style={styles.sellBtnText}>Mark as Sold</Text>
                    </TouchableOpacity>
                )}

                {item.status === 'low_stock' && (
                    <View style={styles.alertBanner}>
                        <Ionicons name="alert-circle-outline" size={14} color={COLORS.warning} />
                        <Text style={styles.alertText}>Low stock — reorder soon</Text>
                    </View>
                )}
            </Card>
        );
    };

    const renderSoldItem = ({ item }) => (
        <Card style={styles.soldCard}>
            <View style={styles.soldRow}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.soldName}>{item.name}</Text>
                    <Text style={styles.soldMeta}>{item.category} • {item.customer}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.soldPrice}>₹{item.price.toLocaleString('en-IN')}</Text>
                    <Text style={styles.soldDate}>{item.soldDate}</Text>
                </View>
            </View>
        </Card>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Store</Text>
                <Text style={styles.headerSubtitle}>Inventory & sales management</Text>
            </View>

            {/* Tabs */}
            <View style={styles.tabBar}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'inventory' && styles.tabActive]}
                    onPress={() => setActiveTab('inventory')}
                >
                    <Ionicons name="cube-outline" size={16} color={activeTab === 'inventory' ? COLORS.primary : COLORS.textMuted} />
                    <Text style={[styles.tabText, activeTab === 'inventory' && styles.tabTextActive]}>
                        Ready Stock ({inventory.length})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'sold' && styles.tabActive]}
                    onPress={() => setActiveTab('sold')}
                >
                    <Ionicons name="bag-check-outline" size={16} color={activeTab === 'sold' ? COLORS.primary : COLORS.textMuted} />
                    <Text style={[styles.tabText, activeTab === 'sold' && styles.tabTextActive]}>
                        Sold ({soldItems.length})
                    </Text>
                </TouchableOpacity>
            </View>

            {activeTab === 'inventory' && (
                <>
                    <SearchBar value={searchQuery} onChangeText={setSearchQuery} placeholder="Search inventory..." />
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersRow}>
                        {categories.map(cat => (
                            <FilterChip
                                key={cat}
                                label={cat === 'all' ? 'All' : cat}
                                active={filterCategory === cat}
                                onPress={() => setFilterCategory(cat)}
                            />
                        ))}
                    </ScrollView>
                </>
            )}

            {activeTab === 'inventory' ? (
                filteredInventory.length === 0 ? (
                    <EmptyState icon="cube-outline" title="No items found" subtitle="Try adjusting your search or filters" />
                ) : (
                    <FlatList
                        data={filteredInventory}
                        renderItem={renderInventoryItem}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                    />
                )
            ) : (
                <FlatList
                    data={soldItems}
                    renderItem={renderSoldItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <EmptyState icon="bag-outline" title="No sold items" subtitle="Sold items will appear here" />
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bg,
    },
    header: {
        paddingHorizontal: SIZES.lg,
        paddingTop: SIZES.xxxl + SIZES.lg,
        paddingBottom: SIZES.sm,
    },
    headerTitle: {
        fontSize: SIZES.heading,
        color: COLORS.textPrimary,
        ...FONTS.bold,
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        fontSize: SIZES.small,
        color: COLORS.textMuted,
        ...FONTS.regular,
        marginTop: 2,
    },
    tabBar: {
        flexDirection: 'row',
        marginHorizontal: SIZES.lg,
        backgroundColor: COLORS.bgElevated,
        borderRadius: SIZES.radiusMd,
        padding: SIZES.xs,
        marginBottom: SIZES.sm,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SIZES.sm + 2,
        borderRadius: SIZES.radiusSm,
    },
    tabActive: {
        backgroundColor: COLORS.bgCard,
        ...SHADOWS.small,
    },
    tabText: {
        fontSize: SIZES.small,
        color: COLORS.textMuted,
        ...FONTS.medium,
        marginLeft: 6,
    },
    tabTextActive: {
        color: COLORS.primary,
        ...FONTS.semiBold,
    },
    filtersRow: {
        paddingHorizontal: SIZES.lg,
        paddingVertical: SIZES.sm,
    },
    listContent: {
        paddingHorizontal: SIZES.lg,
        paddingBottom: 100,
    },
    inventoryCard: {
        marginBottom: SIZES.md,
    },
    inventoryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SIZES.md,
    },
    inventoryImageWrap: {
        width: 48,
        height: 48,
        borderRadius: SIZES.radiusMd,
        backgroundColor: COLORS.primaryMuted,
        justifyContent: 'center',
        alignItems: 'center',
    },
    inventoryName: {
        fontSize: SIZES.bodyLg,
        color: COLORS.textPrimary,
        ...FONTS.semiBold,
    },
    inventoryCategory: {
        fontSize: SIZES.caption,
        color: COLORS.textMuted,
        ...FONTS.regular,
        marginTop: 1,
    },
    stockBadge: {
        paddingHorizontal: SIZES.sm,
        paddingVertical: SIZES.xs,
        borderRadius: SIZES.radiusFull,
    },
    stockText: {
        fontSize: SIZES.caption,
        ...FONTS.semiBold,
    },
    inventoryDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: COLORS.bgElevated,
        borderRadius: SIZES.radiusMd,
        padding: SIZES.md,
        marginBottom: SIZES.sm,
    },
    detailItem: {
        alignItems: 'center',
    },
    detailLabel: {
        fontSize: SIZES.caption,
        color: COLORS.textMuted,
        ...FONTS.regular,
        marginBottom: 4,
    },
    detailValue: {
        fontSize: SIZES.bodyLg,
        color: COLORS.textPrimary,
        ...FONTS.bold,
    },
    qtyControls: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    qtyBtn: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: COLORS.bgCard,
        borderWidth: 1,
        borderColor: COLORS.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    qtyValue: {
        fontSize: SIZES.bodyLg,
        color: COLORS.textPrimary,
        ...FONTS.bold,
        marginHorizontal: SIZES.md,
        minWidth: 24,
        textAlign: 'center',
    },
    sellBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.primaryMuted,
        borderRadius: SIZES.radiusMd,
        paddingVertical: SIZES.sm,
    },
    sellBtnText: {
        fontSize: SIZES.small,
        color: COLORS.primary,
        ...FONTS.semiBold,
        marginLeft: 6,
    },
    alertBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.warningLight,
        borderRadius: SIZES.radiusSm,
        padding: SIZES.sm,
        marginTop: SIZES.sm,
    },
    alertText: {
        fontSize: SIZES.caption,
        color: COLORS.warning,
        ...FONTS.medium,
        marginLeft: 6,
    },
    soldCard: {
        marginBottom: SIZES.sm,
    },
    soldRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    soldName: {
        fontSize: SIZES.body,
        color: COLORS.textPrimary,
        ...FONTS.semiBold,
    },
    soldMeta: {
        fontSize: SIZES.caption,
        color: COLORS.textMuted,
        ...FONTS.regular,
        marginTop: 2,
    },
    soldPrice: {
        fontSize: SIZES.bodyLg,
        color: COLORS.success,
        ...FONTS.bold,
    },
    soldDate: {
        fontSize: SIZES.caption,
        color: COLORS.textMuted,
        ...FONTS.regular,
        marginTop: 2,
    },
});

export default StoreManagementScreen;
