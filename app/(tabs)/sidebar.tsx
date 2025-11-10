import { useRouter } from "expo-router";
import { BarChart3, Cpu, Dog, LayoutGrid, Leaf, LogOut, Truck, User } from "lucide-react-native";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { API_URLS } from "../api/apiConfig";
interface MenuSidebarProps {
    activeMenu: string;
    gmail: string;
    nama: string;
}

export default function MenuSidebar({ activeMenu, gmail, nama }: MenuSidebarProps) {
    const router = useRouter();

    const menus = [
        { label: "Dashboard", icon: LayoutGrid, path: "/dashboard" },
        { label: "Tanaman", icon: Leaf, path: "/(tabs)/tanaman/tanamanI" },
        { label: "Ternak", icon: Dog, path: "/(tabs)/ternak/DataTernak" },
        { label: "Sensor", icon: Cpu, path: "/sensor" },
        { label: "Laporan", icon: BarChart3, path: "/laporan" },
        { label: "Pengiriman", icon: Truck, path: "/pengiriman" },
        { label: "Your Profile", icon: User, path: "/profile" },
    ];

    const handleLogout = async () => {
        try {
            const res = await fetch(API_URLS.LOGOUT,  { method: "GET" });
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
            <Text style={styles.logo}>Agrotech</Text>

            <ScrollView style={styles.menuList} showsVerticalScrollIndicator={false}>
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
                            activeMenu === item.label && { backgroundColor: "#4A7C2C", borderRadius: 12 },
                        ]}
                    >
                        <item.icon size={20} color={activeMenu === item.label ? "#fff" : "#d1c7b8"} />
                        <Text
                            style={[
                                styles.menuText,
                                { color: activeMenu === item.label ? "#fff" : "#d1c7b8", fontWeight: activeMenu === item.label ? "600" : "400" },
                            ]}
                        >
                            {item.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                <LogOut size={18} color="#fff" />
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    sidebar: {
        width: 220,
        backgroundColor: "#4b2e12",
        paddingVertical: 40,
        paddingHorizontal: 20,
        justifyContent: "space-between",
    },
    logo: {
        fontSize: 30,
        color: "#fff",
        fontStyle: "italic",
        fontWeight: "bold",
        marginBottom: 40,
        textAlign: "center",
    },
    menuList: { flexGrow: 1 },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 14,
        marginBottom: 10,
    },
    menuText: { fontSize: 15, marginLeft: 10 },
    logoutButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#3b240d",
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 10,
        justifyContent: "center",
    },
    logoutText: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "600",
        marginLeft: 8,
    },
});
