import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
    LayoutGrid,
    Leaf,
    Dog,
    Cpu,
    BarChart3,
    Truck,
    User,
    LogOut,
} from "lucide-react-native";

export default function DashboardScreen() {
    const { gmail, nama } = useLocalSearchParams();
    const router = useRouter();

    const handleLogout = async () => {
        try {
            const response = await fetch("http://192.168.0.144:8000/api/logout", {
                method: "GET",
            });

            if (response.ok) {
                alert("Logout Berhasil!");
                router.push("/");
            } else {
                alert("Gagal Logout");
            }
        } catch (error) {
            alert("Tidak dapat terhubung ke server.");
        }
    };

    type MenuItemProps = {
        icon: React.ComponentType<{ size?: number; color?: string }>;
        label: string;
        active?: boolean;
        onPress?: () => void;
    };

    const MenuItem: React.FC<MenuItemProps> = ({ icon: Icon, label, active, onPress }) => (
        <TouchableOpacity
            onPress={onPress}
            style={[
                styles.menuItem,
                active && { backgroundColor: "#4A7C2C", borderRadius: 12 },
            ]}
        >
            <Icon size={20} color={active ? "#fff" : "#d1c7b8"} /> {/* <— warna nonaktif lebih terang */}
            <Text
                style={[
                    styles.menuText,
                    { color: active ? "#fff" : "#d1c7b8", fontWeight: active ? "600" : "400" },
                ]}
            >
                {label}
            </Text>
        </TouchableOpacity>
    );


    return (
        <View style={styles.container}>
            {/* Sidebar */}
            <View style={styles.sidebar}>
                <Text style={styles.logo}>Agrotech</Text>

                <ScrollView style={styles.menuList} showsVerticalScrollIndicator={false}>
                    <MenuItem icon={LayoutGrid} label="Dashboard" onPress={() =>
                        router.push({
                            pathname: "/dashboard",
                            params: { gmail, nama },
                        })
                    }
                    />
                    <MenuItem icon={Leaf} label="Tanaman" active onPress={() => { }} />
                    <MenuItem icon={Dog} label="Ternak" onPress={() => { }} active={undefined} />
                    <MenuItem icon={Cpu} label="Sensor" onPress={() => { }} active={undefined} />
                    <MenuItem icon={BarChart3} label="Laporan" onPress={() => { }} active={undefined} />
                    <MenuItem icon={Truck} label="Pengiriman" onPress={() => { }} active={undefined} />
                    <MenuItem icon={User} label="Your Profile" onPress={() => { }} active={undefined} />
                </ScrollView>

                <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                    <LogOut size={18} color="#fff" />
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>

            {/* Main content area */}
            <View style={styles.content}>
                <Text style={styles.welcomeText}>Selamat Datang, {nama} 👋</Text>
                <Text style={styles.subText}>Email: {gmail}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, flexDirection: "row", backgroundColor: "#fdfaf2" },
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
    content: {
        flex: 1,
        padding: 30,
        backgroundColor: "#fdfaf2",
    },
    welcomeText: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#3e2a10",
    },
    subText: {
        marginTop: 8,
        color: "#5b4c3a",
        fontSize: 16,
    },
});
