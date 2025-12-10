import { AlexBrush_400Regular, useFonts } from "@expo-google-fonts/alex-brush";
import {
    Poppins_400Regular,
    Poppins_600SemiBold,
} from "@expo-google-fonts/poppins";
import AppLoading from "expo-app-loading";
import { useRouter } from "expo-router";
import {
    BarChart3,
    Cpu,
    Dog,
    LayoutGrid,
    Leaf,
    LogOut,
    Truck,
    User,
} from "lucide-react-native";
import React from "react";
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Alert
} from "react-native";
import { API_URLS } from "../api/apiConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface MenuSidebarProps {
    activeMenu: string;
    gmail: string;
    nama: string;
}

export default function MenuSidebar({ activeMenu, gmail, nama }: MenuSidebarProps) {
    const router = useRouter();

    const [fontsLoaded] = useFonts({
        AlexBrush_400Regular,
        Poppins_400Regular,
        Poppins_600SemiBold,
    });

    if (!fontsLoaded) {
        return <AppLoading />;
    }

    const menus = [ 
        { label: "Dashboard", icon: LayoutGrid, path: "/dashboard" },
        { label: "Tanaman", icon: Leaf, path: "/(tabs)/tanaman/tanamanI" },
        { label: "Ternak", icon: Dog, path: "/(tabs)/ternak/DataTernak" },
        { label: "Sensor", icon: Cpu, path: "/(tabs)/sensor/sensorDashboard" },
        { label: "Laporan", icon: BarChart3, path: "/(tabs)/laporan/panen" },
        { label: "Pengiriman", icon: Truck, path: "/(tabs)/pengiriman/pengirimanDashboard" },
        { label: "Your Profile", icon: User, path: "/(tabs)/profile" },
    ];

    // ✅ FIX 1: Tambahkan log untuk debug dan perbaiki handler
    const handleLogout = () => {
        console.log("🟢 Logout button PRESSED");
        
        Alert.alert(
            "Konfirmasi Logout",
            "Apakah Anda yakin ingin keluar?",
            [
                {
                    text: "Batal",
                    style: "cancel",
                    onPress: () => console.log("🔵 Logout cancelled")
                },
                {
                    text: "Logout",
                    onPress: () => performLogout(),
                    style: "destructive"
                }
            ],
            { cancelable: true }
        );
    };

    // ✅ FIX 2: Pisahkan logic logout ke fungsi terpisah
    const performLogout = async () => {
        try {
            console.log("🟢 Starting logout process...");
            
            // 1. Clear AsyncStorage FIRST (prioritas utama)
            console.log("🟢 Clearing AsyncStorage...");
            await AsyncStorage.multiRemove(['user', 'token']);
            
            // 2. Coba panggil API logout jika ada koneksi
            try {
                console.log("🟢 Calling logout API:", API_URLS.LOGOUT);
                
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000);
                
                const response = await fetch(API_URLS.LOGOUT, {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                console.log("🟢 API Response status:", response.status);
                
                if (response.ok) {
                    console.log("🟢 API Logout successful");
                } else {
                    console.log("🟡 API Logout failed but local storage cleared");
                }
            } catch (apiError) {
                console.log("🟡 API call failed, continuing with local logout:", apiError);
            }
            
            // 3. Tampilkan pesan sukses
            Alert.alert(
                "Logout Berhasil",
                "Anda telah keluar dari aplikasi.",
                [
                    {
                        text: "OK",
                        onPress: () => {
                            console.log("🟢 Navigating to login screen...");
                            // ✅ FIX 3: Perbaiki path ke login
                            // Coba salah satu dari ini:
                            router.replace("/LoginScreen"); // Jika ada di folder auth
                            // ATAU
                            // router.replace("/login"); // Jika file login di root
                            // ATAU
                            // router.replace("/LoginScreen"); // Jika nama file persis
                        }
                    }
                ]
            );
            
        } catch (error) {
            console.log("🔴 Error during logout:", error);
            
            // Tetap coba redirect ke login
            Alert.alert(
                "Info",
                "Logout lokal berhasil dilakukan.",
                [
                    {
                        text: "OK",
                        onPress: () => {
                            router.replace("../login");
                        }
                    }
                ]
            );
        }
    };

    const handleMenuPress = (item: any) => {
        console.log('🔵 Menu clicked:', item.label);
        console.log('🔵 Target path:', item.path);
        
        try {
            router.push({
                pathname: item.path as any,
                params: { gmail, nama },
            });
        } catch (error) {
            console.log('🔴 Navigation error:', error);
            Alert.alert("Error", `Gagal membuka ${item.label}`);
        }
    };

    return (
        <View style={styles.sidebar}>
            {/* Logo Section */}
            <View style={styles.logoContainer}>
                <Text style={[styles.logo, { fontFamily: "AlexBrush_400Regular" }]}>
                    Agrotech
                </Text>
                <View style={styles.divider} />
            </View>

            {/* Menu List */}
            <View style={styles.menuList}>
                {menus.map((item) => (
                    <TouchableOpacity
                        key={item.label}
                        onPress={() => handleMenuPress(item)}
                        style={[
                            styles.menuItem,
                            activeMenu === item.label && styles.menuItemActive,
                        ]}
                    >
                        <item.icon
                            size={22}
                            color={activeMenu === item.label ? "#fff" : "#d4c4b0"}
                            strokeWidth={2}
                        />
                        <Text
                            style={[
                                styles.menuText,
                                {
                                    color: activeMenu === item.label ? "#fff" : "#d4c4b0",
                                    fontFamily:
                                        activeMenu === item.label
                                            ? "Poppins_600SemiBold"
                                            : "Poppins_400Regular",
                                },
                            ]}
                        >
                            {item.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* ✅ FIX 4: Perbaiki styling logout button */}
            <TouchableOpacity 
                onPress={handleLogout} 
                style={styles.logoutButton}
                activeOpacity={0.7}
            >
                <LogOut size={20} color="#d4c4b0" strokeWidth={2} />
                <Text style={[styles.logoutText, { fontFamily: "Poppins_400Regular" }]}>
                    Logout
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    sidebar: {
        width: 200,
        height: "100%",
        backgroundColor: "#4a2f1a",
        paddingTop: 30,
        paddingBottom: 30,
        paddingHorizontal: 18,
        justifyContent: "space-between",
        borderRadius: 20,
        margin: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    logoContainer: {
        marginBottom: 24,
    },
    logo: {
        fontSize: 40,
        color: "#fff",
        fontStyle: "italic",
        marginBottom: 16,
        textAlign: "center",
        letterSpacing: 1.5,
        textShadowColor: "rgba(0, 0, 0, 0.3)",
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 4,
    },
    divider: {
        height: 2,
        backgroundColor: "#fff",
        width: "100%",
    },
    menuList: {
        flexGrow: 1,
        marginBottom: 20,
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 14,
        marginBottom: 5,
        borderRadius: 10,
    },
    menuItemActive: {
        backgroundColor: "#5a8c36",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    menuText: {
        fontSize: 14,
        marginLeft: 10,
        letterSpacing: 0.2,
    },
    // ✅ FIX 5: Tambahkan styling untuk feedback visual
    logoutButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 10,
        backgroundColor: "rgba(255, 255, 255, 0.1)", // Tambahkan background
        borderWidth: 1,
        borderColor: "rgba(212, 196, 176, 0.3)",
    },
    logoutText: {
        color: "#d4c4b0",
        fontSize: 14,
        marginLeft: 10,
        letterSpacing: 0.2,
    },
});