import React, { useState, useRef, useMemo, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, FlatList, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS, SHADOWS, getColors } from '../../theme';
import { useThemeStore } from '../../store/themeStore';
import { useStoreManagementStore } from '../../store/storeManagementStore';
import { Card, EmptyState, LoadingOverlay, ErrorOverlay, ScreenWrapper } from '../../components/common';
import { SearchBar, FilterChip, FormButton } from '../../components/forms';
import { formatDate } from '../../services/dateUtils';

const InventoryItem = React.memo(({ item, colors, isLoading, onUpdateQty, onSell }) => {
    const getStockStyle = (status) => {
        switch (status) {
            case 'in_stock': return { bg: colors.successLight, text: colors.success, label: 'In Stock' };
            case 'low_stock': return { bg: colors.warningLight, text: colors.warning, label: 'Low Stock' };
            case 'out_of_stock': return { bg: colors.errorLight, text: colors.error, label: 'Out of Stock' };
            default: return { bg: colors.borderLight, text: colors.textMuted, label: status };
        }
    };

    const stockStyle = getStockStyle(item.status);
    return (
        <Card elevated style={styles.inventoryCard}>
            <View style={[styles.inventoryHeader, { borderBottomColor: colors.borderLight }]}>
                <View style={[styles.inventoryImageWrap, { backgroundColor: colors.primaryMuted }]}>
                    <Ionicons name="shirt-outline" size={24} color={colors.primary} />
                </View>
                <View style={{ flex: 1, marginLeft: SIZES.md }}>
                    <Text style={[styles.inventoryName, { color: colors.textPrimary }]}>{item.name}</Text>
                    <Text style={[styles.inventoryCategory, { color: colors.textMuted }]}>{item.category}</Text>
                </View>
                <View style={[styles.stockBadge, { backgroundColor: stockStyle.bg }]}>
                    <Text style={[styles.stockText, { color: stockStyle.text }]}>{stockStyle.label}</Text>
                </View>
            </View>

            <View style={[styles.inventoryDetails, { backgroundColor: colors.bgElevated }]}>
                <View style={styles.detailItem}>
                    <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Price</Text>
                    <Text style={[styles.detailValue, { color: colors.textPrimary }]}>₹{item.price.toLocaleString('en-IN')}</Text>
                </View>
                <View style={styles.detailItem}>
                    <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Quantity</Text>
                    <View style={styles.qtyControls}>
                        <TouchableOpacity
                            style={[styles.qtyBtn, { borderColor: colors.border, backgroundColor: colors.bgCard }]}
                            onPress={() => onUpdateQty(item.id, -1)}
                            disabled={isLoading}
                        >
                            <Ionicons name="remove" size={16} color={colors.textPrimary} />
                        </TouchableOpacity>
                        <Text style={[styles.qtyValue, { color: colors.textPrimary }]}>{item.quantity}</Text>
                        <TouchableOpacity
                            style={[styles.qtyBtn, { borderColor: colors.border, backgroundColor: colors.bgCard }]}
                            onPress={() => onUpdateQty(item.id, 1)}
                            disabled={isLoading}
                        >
                            <Ionicons name="add" size={16} color={colors.textPrimary} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {item.quantity > 0 && (
                <TouchableOpacity
                    style={[styles.sellBtn, { backgroundColor: colors.primaryMuted }]}
                    onPress={() => onSell(item)}
                    activeOpacity={0.7}
                    disabled={isLoading}
                >
                    <Ionicons name="cart-outline" size={14} color={colors.primary} />
                    <Text style={[styles.sellBtnText, { color: colors.primary }]}>Mark as Sold</Text>
                </TouchableOpacity>
            )}

            {item.status === 'low_stock' && (
                <View style={[styles.alertBanner, { backgroundColor: colors.warningLight }]}>
                    <Ionicons name="alert-circle-outline" size={14} color={colors.warning} />
                    <Text style={[styles.alertText, { color: colors.warning }]}>Low stock — reorder soon</Text>
                </View>
            )}
        </Card>
    );
});

const SoldItem = React.memo(({ item, colors }) => (
    <Card style={styles.soldCard}>
        <View style={styles.soldRow}>
            <View style={{ flex: 1 }}>
                <Text style={[styles.soldName, { color: colors.textPrimary }]}>{item.name}</Text>
                <Text style={[styles.soldMeta, { color: colors.textMuted }]}>{item.category} • {item.customer}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
                <Text style={[styles.soldPrice, { color: colors.success }]}>₹{item.price.toLocaleString('en-IN')}</Text>
                <Text style={[styles.soldDate, { color: colors.textMuted }]}>{formatDate(item.soldDate)}</Text>
            </View>
        </View>
    </Card>
));

const StoreManagementScreen = ({ navigation }) => {
    const isDark = useThemeStore(s => s.isDark);
    const C = getColors(isDark);
    const insets = useSafeAreaInsets();

    // Store values
    const inventory = useStoreManagementStore((s) => s.inventory || []);
    const soldItems = useStoreManagementStore((s) => s.soldItems || []);
    const searchQuery = useStoreManagementStore((s) => s.searchQuery);
    const setSearchQuery = useStoreManagementStore((s) => s.setSearchQuery);
    const filterCategory = useStoreManagementStore((s) => s.filterCategory);
    const setFilterCategory = useStoreManagementStore((s) => s.setFilterCategory);
    const getFilteredInventory = useStoreManagementStore((s) => s.getFilteredInventory);
    const getCategories = useStoreManagementStore((s) => s.getCategories);
    const updateQuantity = useStoreManagementStore((s) => s.updateQuantity);
    const markAsSold = useStoreManagementStore((s) => s.markAsSold);
    const isLoading = useStoreManagementStore((s) => s.isLoading);
    const error = useStoreManagementStore((s) => s.error);
    const clearError = useStoreManagementStore((s) => s.clearError);

    const [activeTab, setActiveTab] = useState('inventory');

    // Memoize derived data to prevent unnecessary re-renders and potential loops
    const filteredInventory = useMemo(() => getFilteredInventory() || [], [inventory, searchQuery, filterCategory]);
    const categories = useMemo(() => getCategories() || ['all'], [inventory]);

    const flatListRef = useRef(null);

    useEffect(() => {
        // Only scroll if we have a list and a specific filter (not 'all')
        if (flatListRef.current && categories.length > 0 && filterCategory !== 'all') {
            const index = categories.indexOf(filterCategory);
            if (index !== -1) {
                try {
                    flatListRef.current.scrollToIndex({
                        index,
                        animated: true,
                        viewPosition: 0.5,
                    });
                } catch (e) {
                    // Silently fail if index is not ready
                }
            }
        }
    }, [filterCategory, categories]);

    const handleSell = (item) => {
        Alert.alert(
            'Confirm Sale',
            `Mark "${item.name}" as sold?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Sell', onPress: async () => {
                        try {
                            await markAsSold(item.id, 'Walk-in Customer');
                        } catch (error) {
                            // Handled in store
                        }
                    }
                },
            ]
        );
    };

    const handleUpdateQty = async (id, delta) => {
        try {
            await updateQuantity(id, delta);
        } catch (error) {
            // Handled in store
        }
    };

    const renderInventoryItem = ({ item }) => (
        <InventoryItem
            item={item}
            colors={C}
            isLoading={isLoading}
            onUpdateQty={handleUpdateQty}
            onSell={handleSell}
        />
    );

    const renderSoldItem = ({ item }) => (
        <SoldItem item={item} colors={C} />
    );

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScreenWrapper useSafeTop>
                <LoadingOverlay visible={isLoading && !error} message="Processing..." />
                <ErrorOverlay
                    visible={!!error}
                    error={error}
                    onRetry={() => { }} // Retry not easily dynamic here
                    onClose={clearError}
                />
                <View style={styles.header}>
                    <Text style={[styles.headerTitle, { color: C.textPrimary }]}>Store</Text>
                    <Text style={[styles.headerSubtitle, { color: C.textMuted }]}>Inventory & sales management</Text>
                </View>

                {/* Tabs */}
                <View style={[styles.tabBar, { backgroundColor: C.bgElevated }]}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'inventory' && [styles.tabActive, { backgroundColor: C.bgCard }]]}
                        onPress={() => setActiveTab('inventory')}
                        disabled={isLoading}
                    >
                        <Ionicons name="cube-outline" size={16} color={activeTab === 'inventory' ? C.primary : C.textMuted} />
                        <Text style={[styles.tabText, { color: C.textMuted }, activeTab === 'inventory' && [styles.tabTextActive, { color: C.primary }]]}>
                            Ready Stock ({inventory.length})
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'sold' && [styles.tabActive, { backgroundColor: C.bgCard }]]}
                        onPress={() => setActiveTab('sold')}
                        disabled={isLoading}
                    >
                        <Ionicons name="bag-check-outline" size={16} color={activeTab === 'sold' ? C.primary : C.textMuted} />
                        <Text style={[styles.tabText, { color: C.textMuted }, activeTab === 'sold' && [styles.tabTextActive, { color: C.primary }]]}>
                            Sold ({soldItems.length})
                        </Text>
                    </TouchableOpacity>
                </View>

                {activeTab === 'inventory' && (
                    <>
                        <SearchBar
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholder="Search inventory..."
                            editable={!isLoading}
                        />
                        <FlatList
                            ref={flatListRef}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={{ flexGrow: 0, marginBottom: 12 }}
                            contentContainerStyle={styles.filtersRow}
                            data={categories}
                            keyExtractor={(item) => item}
                            renderItem={({ item: cat }) => (
                                <FilterChip
                                    label={cat === 'all' ? 'All' : cat}
                                    active={filterCategory === cat}
                                    onPress={() => setFilterCategory(cat)}
                                    disabled={isLoading}
                                />
                            )}
                            onScrollToIndexFailed={(info) => {
                                setTimeout(() => {
                                    flatListRef.current?.scrollToIndex({
                                        index: info.index,
                                        animated: true,
                                        viewPosition: 0.5
                                    });
                                }, 500);
                            }}
                        />
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
                            contentContainerStyle={[styles.listContent, { paddingBottom: 100 + insets.bottom }]}
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                            style={{ flex: 1 }}
                            initialNumToRender={5}
                            windowSize={5}
                            maxToRenderPerBatch={5}
                            removeClippedSubviews={Platform.OS === 'android'}
                        />
                    )
                ) : (
                    <FlatList
                        data={soldItems}
                        renderItem={renderSoldItem}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={[styles.listContent, { paddingBottom: 100 + insets.bottom }]}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        style={{ flex: 1 }}
                        initialNumToRender={10}
                        windowSize={5}
                        maxToRenderPerBatch={10}
                        removeClippedSubviews={Platform.OS === 'android'}
                        ListEmptyComponent={
                            <EmptyState icon="bag-outline" title="No sold items" subtitle="Sold items will appear here" />
                        }
                    />
                )}
            </ScreenWrapper>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bg,
    },
    header: {
        paddingHorizontal: SIZES.lg,
        paddingTop: SIZES.lg,
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
        paddingBottom: 20,
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
