import {
    AlexBrush_400Regular,
    useFonts
} from "@expo-google-fonts/alex-brush";
import {
    Poppins_400Regular,
    Poppins_600SemiBold
} from "@expo-google-fonts/poppins";
import AppLoading from "expo-app-loading";
import { useRouter } from "expo-router";
import React from "react";
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Dimensions
} from "react-native";
import {
    LayoutGrid,
    CheckSquare,
    Briefcase,
    User,
    LogOut
} from "lucide-react-native";
import { API_URLS } from "../api/apiConfig";

const { width } = Dimensions.get("window");
const sidebarWidth = width < 380 ? 140 : 200;
const fontSmall = width < 380;

// ==============================
// ✅ Tambahkan props interface
// ==============================
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

    if (!fontsLoaded) return <AppLoading />;

    // ==============================
    // MENU LIST FULLY TYPED
    // ==============================
    const menus: { label: string; icon: any; path: string }[] = [
        { label: "Dashboard", icon: LayoutGrid, path: "/dashboard" },
        { label: "Selesai", icon: CheckSquare, path: "/(tabs)/tanaman/tanamanI" },
        { label: "Pending", icon: Briefcase, path: "/(tabs)/ternak/DataTernak" },
        { label: "Your Profile", icon: User, path: "/(tabs)/profile" },
    ];

    const handleLogout = async () => {
        try {
            const res = await fetch(API_URLS.LOGOUT, { method: "GET" });
            if (res.ok) {
                alert("Logout Berhasil!");
                router.push("/") as never;
            } else alert("Gagal Logout");
        } catch {
            alert("Server tidak merespons");
        }
    };

    return (
        <View style={styles.sidebar}>
            <View style={styles.logoContainer}>
                <Text style={[styles.logo, { fontFamily: "AlexBrush_400Regular" }]}>
                    Agrotech
                </Text>
                <View style={styles.divider} />
            </View>

            <View style={styles.menuList}>
                {menus.map((item) => (
                    <TouchableOpacity
                        key={item.label}
                        onPress={() =>
                            router.push(item.path as any) // ← SOLUSI ERROR TS
                        }
                        style={[
                            styles.menuItem,
                            activeMenu === item.label && styles.menuItemActive,
                        ]}
                    >
                        <item.icon
                            size={fontSmall ? 18 : 22}
                            color={activeMenu === item.label ? "#fff" : "#d4c4b0"}
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

            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                <LogOut size={fontSmall ? 16 : 20} color="#d4c4b0" />
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    sidebar: {
        width: sidebarWidth,
        height: "100%",
        backgroundColor: "#D01C1C",
        paddingTop: 30,
        paddingBottom: 30,
        paddingHorizontal: 14,
        justifyContent: "space-between",
        borderRadius: 20,
        margin: 10,
    },
    logoContainer: {
        marginBottom: 24,
    },
    logo: {
        fontSize: width < 380 ? 28 : 40,
        color: "#fff",
        textAlign: "center",
        marginBottom: 8,
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
        paddingVertical: width < 380 ? 8 : 12,
        paddingHorizontal: 10,
        marginBottom: 5,
        borderRadius: 10,
    },
    menuItemActive: {
        backgroundColor: "#E8BC6A",
    },
    menuText: {
        fontSize: width < 380 ? 12 : 14,
        marginLeft: 8,
    },
    logoutButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
    },
    logoutText: {
        color: "#d4c4b0",
        fontSize: width < 380 ? 12 : 14,
        marginLeft: 10,
    },
});
