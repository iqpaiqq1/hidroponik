import { AlexBrush_400Regular, useFonts } from "@expo-google-fonts/alex-brush";
import {
    Poppins_400Regular,
    Poppins_600SemiBold,
} from "@expo-google-fonts/poppins";
import AppLoading from "expo-app-loading";
import { useRouter } from "expo-router";
import {
    BarChart3,
    Briefcase,
    CheckSquare,
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
    View
} from "react-native";
import { API_URLS } from "../api/apiConfig";

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
        { label: "Selesai", icon: CheckSquare, path: "/(tabs)/tanaman/tanamanI" },
        { label: "Pending", icon: Briefcase, path: "/(tabs)/ternak/DataTernak" },
        { label: "Your Profile", icon: User, path: "/(tabs)/profile" },
    ];

    const handleLogout = async () => {
        try {
            const res = await fetch(API_URLS.LOGOUT, { method: "GET" });
            if (res.ok) {
                alert("Logout Berhasil!");
                router.push("/");
            } else alert("Gagal Logout");
        } catch {
            alert("Server tidak merespons");
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
                        onPress={() =>
                            router.push({
                                pathname: item.path as any,
                                params: { gmail, nama },
                            })
                        }
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

            {/* Logout Button */}
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
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
        backgroundColor: "#D01C1C",
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
        backgroundColor: "#E8BC6A",
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
    logoutButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 10,
    },
    logoutText: {
        color: "#d4c4b0",
        fontSize: 14,
        marginLeft: 10,
        letterSpacing: 0.2,
    },
});