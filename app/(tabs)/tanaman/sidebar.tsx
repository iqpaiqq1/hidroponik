import React from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { LayoutGrid, Leaf, Dog, Cpu, BarChart3, Truck, User, LogOut } from "lucide-react-native";

export default function MenuSidebar({ activeMenu, gmail, nama }: { activeMenu: string; gmail: string; nama: string }) {
    const router = useRouter();

    const menus = [
        { label: "Dashboard", icon: LayoutGrid, path: "/dashboard" },
        { label: "Tanaman", icon: Leaf, path: "/tanaman" },
        { label: "Ternak", icon: Dog, path: "/ternak" },
        { label: "Sensor", icon: Cpu, path: "/sensor" },
        { label: "Laporan", icon: BarChart3, path: "/laporan" },
        { label: "Pengiriman", icon: Truck, path: "/pengiriman" },
        { label: "Your Profile", icon: User, path: "/profile" },
    ];

    const handleLogout = async () => {
        try {
            const res = await fetch("http://10.102.220.183:8000/api/logout", { method: "GET" });
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
            <ScrollView showsVerticalScrollIndicator={false}>
                {menus.map((item) => (
                    <TouchableOpacity
                        key={item.label}
                        onPress={() => router.push({ pathname: item.path as any, params: { gmail, nama } })}
                        style={[
                            styles.menuItem,
                            activeMenu === item.label && { backgroundColor: "#4A7C2C", borderRadius: 12 },
                        ]}
                    >
                        <item.icon size={20} color={activeMenu === item.label ? "#fff" : "#d1c7b8"} />
                        <Text
                            style={[
                                styles.menuText,
                                { color: activeMenu === item.label ? "#fff" : "#d1c7b8" },
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
    sidebar: { width: 220, backgroundColor: "#4b2e12", padding: 20, justifyContent: "space-between" },
    logo: { fontSize: 28, color: "#fff", fontStyle: "italic", fontWeight: "bold", textAlign: "center" },
    menuItem: { flexDirection: "row", alignItems: "center", paddingVertical: 12 },
    menuText: { fontSize: 15, marginLeft: 10 },
    logoutButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#3b240d",
        paddingVertical: 12,
        justifyContent: "center",
        borderRadius: 10,
    },
    logoutText: { color: "#fff", marginLeft: 6, fontWeight: "600" },
});
