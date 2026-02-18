import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS, SHADOWS } from '../theme';

// Screens
import HomeScreen from '../screens/home/HomeScreen';
import OrderListScreen from '../screens/orders/OrderListScreen';
import OrderEntryScreen from '../screens/orders/OrderEntryScreen';
import OrderDetailScreen from '../screens/orders/OrderDetailScreen';
import StitchingProductionScreen from '../screens/production/StitchingProductionScreen';
import WorkProductionScreen from '../screens/production/WorkProductionScreen';
import FinishingScreen from '../screens/finishing/FinishingScreen';
import ShootScreen from '../screens/shoot/ShootScreen';
import StoreManagementScreen from '../screens/store/StoreManagementScreen';
import CatalogueScreen from '../screens/catalogue/CatalogueScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const TAB_ICONS = {
    HomeTab: { active: 'home', inactive: 'home-outline' },
    OrdersTab: { active: 'receipt', inactive: 'receipt-outline' },
    ProductionTab: { active: 'construct', inactive: 'construct-outline' },
    StoreTab: { active: 'storefront', inactive: 'storefront-outline' },
    MoreTab: { active: 'grid', inactive: 'grid-outline' },
};

const TAB_LABELS = {
    HomeTab: 'Home',
    OrdersTab: 'Orders',
    ProductionTab: 'Production',
    StoreTab: 'Store',
    MoreTab: 'More',
};

const BottomTabs = () => (
    <Tab.Navigator
        screenOptions={({ route }) => ({
            headerShown: false,
            tabBarIcon: ({ focused, size }) => {
                const icons = TAB_ICONS[route.name];
                return (
                    <View style={focused ? styles.activeTabIcon : null}>
                        <Ionicons
                            name={focused ? icons.active : icons.inactive}
                            size={focused ? 22 : 20}
                            color={focused ? COLORS.primary : COLORS.textMuted}
                        />
                    </View>
                );
            },
            tabBarLabel: TAB_LABELS[route.name],
            tabBarActiveTintColor: COLORS.primary,
            tabBarInactiveTintColor: COLORS.textMuted,
            tabBarStyle: styles.tabBar,
            tabBarLabelStyle: styles.tabLabel,
            tabBarItemStyle: styles.tabItem,
        })}
    >
        <Tab.Screen name="HomeTab" component={HomeScreen} />
        <Tab.Screen name="OrdersTab" component={OrderListScreen} />
        <Tab.Screen name="ProductionTab" component={StitchingProductionScreen} />
        <Tab.Screen name="StoreTab" component={StoreManagementScreen} />
        <Tab.Screen name="MoreTab" component={MoreNavigator} />
    </Tab.Navigator>
);

const MoreStack = createStackNavigator();

const MoreNavigator = () => (
    <MoreStack.Navigator screenOptions={{ headerShown: false }}>
        <MoreStack.Screen name="MoreMenu" component={MoreMenuScreen} />
        <MoreStack.Screen name="WorkProduction" component={WorkProductionScreen} />
        <MoreStack.Screen name="Finishing" component={FinishingScreen} />
        <MoreStack.Screen name="Shoot" component={ShootScreen} />
        <MoreStack.Screen name="Catalogue" component={CatalogueScreen} />
    </MoreStack.Navigator>
);

// More Menu Screen

const MoreMenuScreen = ({ navigation }) => {
    const menuItems = [
        { label: 'Work Production', subtitle: 'Stitching, Aari & Detailing stages', icon: 'layers-outline', screen: 'WorkProduction', color: COLORS.accent },
        { label: 'Finishing', subtitle: 'Quality check & ready for delivery', icon: 'checkmark-done-outline', screen: 'Finishing', color: COLORS.success },
        { label: 'Media & Shoot', subtitle: 'Product photography & social uploads', icon: 'camera-outline', screen: 'Shoot', color: COLORS.primary },
        { label: 'Catalogue', subtitle: 'Hold, cancelled & alteration records', icon: 'albums-outline', screen: 'Catalogue', color: COLORS.slate },
    ];

    return (
        <View style={styles.moreContainer}>
            <View style={styles.moreHeader}>
                <Text style={styles.moreTitle}>More</Text>
                <Text style={styles.moreSubtitle}>Additional modules</Text>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.moreContent}>
                {menuItems.map((item, idx) => (
                    <TouchableOpacity
                        key={idx}
                        style={styles.menuCard}
                        onPress={() => navigation.navigate(item.screen)}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.menuIcon, { backgroundColor: item.color + '18' }]}>
                            <Ionicons name={item.icon} size={24} color={item.color} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.menuLabel}>{item.label}</Text>
                            <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
                    </TouchableOpacity>
                ))}

                {/* App Info */}
                <View style={styles.appInfo}>
                    <View style={styles.appLogoWrap}>
                        <Ionicons name="diamond-outline" size={28} color={COLORS.primary} />
                    </View>
                    <Text style={styles.appName}>Atelier Boutique</Text>
                    <Text style={styles.appVersion}>Version 1.0.0</Text>
                    <Text style={styles.appTagline}>Crafted with care for tailoring excellence</Text>
                </View>
            </ScrollView>
        </View>
    );
};

const AppNavigator = () => (
    <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="MainTabs" component={BottomTabs} />
            <Stack.Screen
                name="OrderEntry"
                component={OrderEntryScreen}
                options={{ presentation: 'modal' }}
            />
            <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
            <Stack.Screen name="StitchingProduction" component={StitchingProductionScreen} />
            <Stack.Screen name="WorkProduction" component={WorkProductionScreen} />
            <Stack.Screen name="Finishing" component={FinishingScreen} />
            <Stack.Screen name="Shoot" component={ShootScreen} />
            <Stack.Screen name="StoreManagement" component={StoreManagementScreen} />
            <Stack.Screen name="Catalogue" component={CatalogueScreen} />
        </Stack.Navigator>
    </NavigationContainer>
);

const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: COLORS.bgCard,
        borderTopWidth: 1,
        borderTopColor: COLORS.borderLight,
        height: Platform.OS === 'ios' ? 88 : 64,
        paddingTop: SIZES.xs,
        paddingBottom: Platform.OS === 'ios' ? SIZES.xl : SIZES.sm,
        ...SHADOWS.small,
    },
    tabLabel: {
        fontSize: 10,
        ...FONTS.medium,
        marginTop: 2,
    },
    tabItem: {
        paddingTop: 4,
    },
    activeTabIcon: {
        backgroundColor: COLORS.primaryMuted,
        borderRadius: SIZES.radiusFull,
        padding: 6,
        marginBottom: -4,
    },
    // More Menu
    moreContainer: {
        flex: 1,
        backgroundColor: COLORS.bg,
    },
    moreHeader: {
        paddingHorizontal: SIZES.lg,
        paddingTop: SIZES.xxxl + SIZES.lg,
        paddingBottom: SIZES.md,
    },
    moreTitle: {
        fontSize: SIZES.heading,
        color: COLORS.textPrimary,
        ...FONTS.bold,
        letterSpacing: -0.5,
    },
    moreSubtitle: {
        fontSize: SIZES.small,
        color: COLORS.textMuted,
        ...FONTS.regular,
        marginTop: 2,
    },
    moreContent: {
        paddingHorizontal: SIZES.lg,
        paddingBottom: SIZES.xxxl,
    },
    menuCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.bgCard,
        borderRadius: SIZES.radiusLg,
        padding: SIZES.base,
        marginBottom: SIZES.md,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
        ...SHADOWS.small,
    },
    menuIcon: {
        width: 48,
        height: 48,
        borderRadius: SIZES.radiusMd,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SIZES.md,
    },
    menuLabel: {
        fontSize: SIZES.bodyLg,
        color: COLORS.textPrimary,
        ...FONTS.semiBold,
    },
    menuSubtitle: {
        fontSize: SIZES.small,
        color: COLORS.textMuted,
        ...FONTS.regular,
        marginTop: 2,
    },
    appInfo: {
        alignItems: 'center',
        marginTop: SIZES.xxl,
        paddingVertical: SIZES.xl,
    },
    appLogoWrap: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: COLORS.primaryMuted,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SIZES.md,
    },
    appName: {
        fontSize: SIZES.subtitle,
        color: COLORS.textPrimary,
        ...FONTS.bold,
    },
    appVersion: {
        fontSize: SIZES.caption,
        color: COLORS.textMuted,
        ...FONTS.regular,
        marginTop: 4,
    },
    appTagline: {
        fontSize: SIZES.small,
        color: COLORS.textMuted,
        ...FONTS.regular,
        marginTop: SIZES.sm,
        fontStyle: 'italic',
    },
});

export default AppNavigator;
