import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, Alert, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../theme';
import { useShootStore } from '../../store/shootStore';
import { useOrderStore } from '../../store/orderStore';
import { Card, LoadingOverlay, ErrorOverlay, EmptyState } from '../../components/common';
import { FormButton } from '../../components/forms';
import * as ImagePicker from 'expo-image-picker';

const ShootScreen = ({ navigation }) => {
    const orders = useOrderStore((s) => s.orders);
    const shoots = useShootStore((s) => s.shoots);
    const updateShoot = useShootStore((s) => s.updateShoot);
    const addShoot = useShootStore((s) => s.addShoot);
    const addImage = useShootStore((s) => s.addImage);
    const isLoading = useShootStore((s) => s.isLoading);
    const error = useShootStore((s) => s.error);
    const clearError = useShootStore((s) => s.clearError);

    const [selectedOrder, setSelectedOrder] = useState(orders[0]?.id || null);

    const currentShoot = shoots.find(s => s.orderId === selectedOrder);
    const order = orders.find(o => o.id === selectedOrder);

    const handlePickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsMultipleSelection: true,
                quality: 0.8,
            });
            if (!result.canceled && result.assets) {
                if (!currentShoot) {
                    await addShoot({
                        orderId: selectedOrder,
                        images: result.assets.map(a => a.uri),
                        productShootDone: false,
                        instagramUploaded: false,
                        googleCatalogListed: false,
                        notes: '',
                    });
                } else {
                    for (const asset of result.assets) {
                        await addImage(currentShoot.id, asset.uri);
                    }
                }
            }
        } catch (e) {
            Alert.alert('Error', 'Could not access photos');
        }
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Check out this beautiful piece from Atelier Boutique - ${order?.designName || 'Our latest creation'}!`,
            });
        } catch (e) {
            // ignore
        }
    };

    const handleToggleStatus = async (field) => {
        if (currentShoot) {
            try {
                await updateShoot(currentShoot.id, { [field]: !currentShoot[field] });
            } catch (error) {
                // Handled in store
            }
        }
    };

    const statusItems = [
        { key: 'productShootDone', label: 'Product Shoot', icon: 'camera-outline', color: COLORS.primary },
        { key: 'instagramUploaded', label: 'Instagram Upload', icon: 'logo-instagram', color: '#E1306C' },
        { key: 'googleCatalogListed', label: 'Google Catalog', icon: 'globe-outline', color: '#4285F4' },
    ];

    return (
        <View style={styles.container}>
            <LoadingOverlay visible={isLoading && !error} message="Processing media..." />
            <ErrorOverlay
                visible={!!error}
                error={error}
                onRetry={() => { }} // Retry not easily dynamic
                onClose={clearError}
            />
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Media & Shoot</Text>
                <Text style={styles.headerSubtitle}>Product photography & social uploads</Text>
            </View>

            {orders.length === 0 ? (
                <EmptyState
                    icon="camera-outline"
                    title="No orders for shoot"
                    subtitle="Orders ready for delivery will appear here for product photography"
                />
            ) : (
                <>
                    {/* Order Selector */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.orderTabs}
                        keyboardShouldPersistTaps="handled"
                    >
                        {orders.map(o => (
                            <TouchableOpacity
                                key={o.id}
                                style={[styles.orderTab, selectedOrder === o.id && styles.orderTabActive]}
                                onPress={() => setSelectedOrder(o.id)}
                                disabled={isLoading}
                            >
                                <Text style={[styles.orderTabId, selectedOrder === o.id && styles.orderTabIdActive]}>{o.id}</Text>
                                <Text style={[styles.orderTabName, selectedOrder === o.id && styles.orderTabNameActive]} numberOfLines={1}>{o.designName}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollContent}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Image Gallery */}
                        <Card elevated>
                            <View style={styles.sectionHead}>
                                <Ionicons name="images-outline" size={18} color={COLORS.primary} />
                                <Text style={styles.sectionTitle}>Photo Gallery</Text>
                            </View>

                            {currentShoot?.images && currentShoot.images.length > 0 ? (
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.imageGallery}>
                                    {currentShoot.images.map((uri, idx) => (
                                        <View key={idx} style={styles.imageThumb}>
                                            <Image source={{ uri }} style={styles.thumbImage} />
                                        </View>
                                    ))}
                                    <TouchableOpacity style={styles.addImageBtn} onPress={handlePickImage} disabled={isLoading}>
                                        <Ionicons name="add" size={28} color={COLORS.textMuted} />
                                    </TouchableOpacity>
                                </ScrollView>
                            ) : (
                                <TouchableOpacity style={styles.uploadArea} onPress={handlePickImage} disabled={isLoading}>
                                    <View style={styles.uploadIconWrap}>
                                        <Ionicons name="cloud-upload-outline" size={32} color={COLORS.primary} />
                                    </View>
                                    <Text style={styles.uploadText}>Upload Product Photos</Text>
                                    <Text style={styles.uploadHint}>Tap to select from gallery</Text>
                                </TouchableOpacity>
                            )}
                        </Card>

                        {/* Upload Status Tracking */}
                        <Card elevated>
                            <View style={styles.sectionHead}>
                                <Ionicons name="share-social-outline" size={18} color={COLORS.primary} />
                                <Text style={styles.sectionTitle}>Upload Status</Text>
                            </View>

                            {statusItems.map((item) => (
                                <TouchableOpacity
                                    key={item.key}
                                    style={styles.statusItem}
                                    onPress={() => handleToggleStatus(item.key)}
                                    activeOpacity={0.7}
                                    disabled={isLoading}
                                >
                                    <View style={[styles.statusIcon, { backgroundColor: item.color + '18' }]}>
                                        <Ionicons name={item.icon} size={20} color={item.color} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.statusLabel}>{item.label}</Text>
                                        <Text style={styles.statusDesc}>
                                            {currentShoot?.[item.key] ? 'Uploaded ✓' : 'Not uploaded yet'}
                                        </Text>
                                    </View>
                                    <View style={[
                                        styles.statusToggle,
                                        currentShoot?.[item.key] && styles.statusToggleActive,
                                    ]}>
                                        {currentShoot?.[item.key] ? (
                                            <Ionicons name="checkmark" size={16} color={COLORS.textOnPrimary} />
                                        ) : (
                                            <Ionicons name="close" size={14} color={COLORS.textMuted} />
                                        )}
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </Card>

                        {/* Share Button */}
                        <Card elevated style={styles.shareCard}>
                            <View style={styles.shareContent}>
                                <Ionicons name="paper-plane-outline" size={22} color={COLORS.primary} />
                                <View style={{ marginLeft: SIZES.md, flex: 1 }}>
                                    <Text style={styles.shareTitle}>Share This Creation</Text>
                                    <Text style={styles.shareDesc}>Share on social media or with the customer</Text>
                                </View>
                            </View>
                            <FormButton
                                title="Share"
                                icon="share-outline"
                                onPress={handleShare}
                                variant="outline"
                                size="small"
                                disabled={isLoading}
                            />
                        </Card>

                        <View style={{ height: 40 }} />
                    </ScrollView>
                </>
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
    orderTabs: {
        paddingHorizontal: SIZES.lg,
        paddingBottom: SIZES.md,
    },
    orderTab: {
        backgroundColor: COLORS.bgCard,
        borderRadius: SIZES.radiusMd,
        paddingHorizontal: SIZES.md,
        paddingVertical: SIZES.sm,
        marginRight: SIZES.sm,
        borderWidth: 1,
        borderColor: COLORS.border,
        minWidth: 90,
    },
    orderTabActive: {
        backgroundColor: COLORS.primaryMuted,
        borderColor: COLORS.primary,
    },
    orderTabId: {
        fontSize: SIZES.caption,
        color: COLORS.textMuted,
        ...FONTS.medium,
    },
    orderTabIdActive: { color: COLORS.primary },
    orderTabName: {
        fontSize: SIZES.small,
        color: COLORS.textSecondary,
        ...FONTS.regular,
        marginTop: 2,
    },
    orderTabNameActive: {
        color: COLORS.primary,
        ...FONTS.medium,
    },
    scrollContent: {
        paddingHorizontal: SIZES.lg,
        paddingBottom: SIZES.xxxl,
    },
    sectionHead: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SIZES.md,
    },
    sectionTitle: {
        fontSize: SIZES.bodyLg,
        color: COLORS.textPrimary,
        ...FONTS.semiBold,
        marginLeft: SIZES.sm,
    },
    imageGallery: {
        paddingVertical: SIZES.sm,
    },
    imageThumb: {
        width: 100,
        height: 100,
        borderRadius: SIZES.radiusMd,
        overflow: 'hidden',
        marginRight: SIZES.sm,
        backgroundColor: COLORS.bgElevated,
    },
    thumbImage: {
        width: '100%',
        height: '100%',
    },
    addImageBtn: {
        width: 100,
        height: 100,
        borderRadius: SIZES.radiusMd,
        borderWidth: 1.5,
        borderColor: COLORS.border,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
    },
    uploadArea: {
        borderWidth: 1.5,
        borderColor: COLORS.border,
        borderStyle: 'dashed',
        borderRadius: SIZES.radiusMd,
        padding: SIZES.xxl,
        alignItems: 'center',
        backgroundColor: COLORS.bgElevated,
    },
    uploadIconWrap: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: COLORS.primaryMuted,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SIZES.md,
    },
    uploadText: {
        fontSize: SIZES.bodyLg,
        color: COLORS.textSecondary,
        ...FONTS.semiBold,
    },
    uploadHint: {
        fontSize: SIZES.small,
        color: COLORS.textMuted,
        ...FONTS.regular,
        marginTop: 4,
    },
    statusItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SIZES.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
    },
    statusIcon: {
        width: 40,
        height: 40,
        borderRadius: SIZES.radiusMd,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SIZES.md,
    },
    statusLabel: {
        fontSize: SIZES.body,
        color: COLORS.textPrimary,
        ...FONTS.medium,
    },
    statusDesc: {
        fontSize: SIZES.caption,
        color: COLORS.textMuted,
        ...FONTS.regular,
        marginTop: 1,
    },
    statusToggle: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: COLORS.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statusToggleActive: {
        backgroundColor: COLORS.success,
    },
    shareCard: {
        marginTop: SIZES.sm,
    },
    shareContent: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SIZES.md,
    },
    shareTitle: {
        fontSize: SIZES.bodyLg,
        color: COLORS.textPrimary,
        ...FONTS.semiBold,
    },
    shareDesc: {
        fontSize: SIZES.caption,
        color: COLORS.textMuted,
        ...FONTS.regular,
        marginTop: 2,
    },
});

export default ShootScreen;
