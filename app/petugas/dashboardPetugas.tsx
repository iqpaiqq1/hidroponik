import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    ScrollView,
    Image,
    TouchableOpacity,
    Dimensions,
    Alert,
    RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Leaf, Home, Settings, User, Thermometer, Droplets, Edit } from "lucide-react-native";
import { API_URLS } from "../api/apiConfig";
import { PawPrint } from "lucide-react-native";

const { width } = Dimensions.get("window");

interface UserData {
    gmail: string;
    nama: string;
    role: string;
}

interface Tanaman {
    id_tanaman: number;
    nm_tanaman: string;
    varietas: string;
    jumlah: number;
    tgl_tanam: string;
    lama_panen: string;
    lokasi: string;
    status: string;
    Foto: string | null;
}

interface Kandang {
    id_kandang: number;
    nm_kandang: string;
    kapasitas: number;
    jumlah_hewan: number;
    jenis_hewan: string;
    Hasil_Produksi: string;
    Jml_produksi: number;
    foto_hasil: string | null;
    keterangan: string | null;
}

interface Sensor {
    id_sensor: number;
    kd_sensor: string;
    nm_sensor: string;
    suhu: string;
    kelembaban: string;
    status: string;
}

export default function DashboardPetugas() {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [tanaman, setTanaman] = useState<Tanaman[]>([]);
    const [kandang, setKandang] = useState<Kandang[]>([]);
    const [sensor, setSensor] = useState<Sensor[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedTab, setSelectedTab] = useState("Tanaman");
    const router = useRouter();

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            const user = await AsyncStorage.getItem("user");
            if (user) {
                const parsed = JSON.parse(user);

                // Hanya petugas boleh akses halaman ini
                if (parsed.role?.toLowerCase() !== "petugas") {
                    switch (parsed.role?.toLowerCase()) {
                        case "admin":
                            router.replace("/dashboard");
                            break;
                        case "kurir":
                            router.replace("/kurir/dashboardKurir");
                            break;
                        case "user":
                            router.replace("/user/dashboardUser");
                            break;
                        default:
                            router.replace("/LoginScreen");
                            break;
                    }
                    return;
                }

                setUserData({
                    gmail: parsed.gmail || "",
                    nama: parsed.nama || "",
                    role: parsed.role || "",
                });

                await fetchAllData();
            } else {
                router.replace("/LoginScreen");
            }
        } catch (error) {
            console.error("Error loading user data:", error);
            router.replace("/LoginScreen");
        } finally {
            setLoading(false);
        }
    };

    const fetchAllData = async () => {
        await Promise.all([fetchTanaman(), fetchKandang(), fetchSensor()]);
    };

    const fetchTanaman = async () => {
        try {
            const response = await fetch(API_URLS.TANAMAN);
            const data = await response.json();
            setTanaman(data);
        } catch (error) {
            console.error("Error fetching tanaman:", error);
        }
    };

    const fetchKandang = async () => {
        try {
            const response = await fetch(API_URLS.KANDANG);
            const data = await response.json();
            setKandang(data);
        } catch (error) {
            console.error("Error fetching kandang:", error);
        }
    };

    const fetchSensor = async () => {
        try {
            const response = await fetch(API_URLS.SENSOR);
            const data = await response.json();
            setSensor(data);
        } catch (error) {
            console.error("Error fetching sensor:", error);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchAllData();
        setRefreshing(false);
    };

    const getCurrentDate = () => {
        const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
        const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
        const now = new Date();
        return `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
    };

    const getStatusColor = (status: string) => {
        const s = status?.toLowerCase() || "";
        if (s.includes("sehat") || s.includes("normal") || s.includes("optimal") || s.includes("baik") || s.includes("produktif"))
            return "#66BB6A";
        if (s.includes("panas") || s.includes("siap") || s.includes("warning"))
            return "#FFA726";
        if (s.includes("bahaya") || s.includes("kritis"))
            return "#EF5350";
        return "#666";
    };

    const renderTabContent = () => {
        if (selectedTab === "Tanaman") {
            return tanaman.map((item, index) => (
                <View key={index} style={styles.itemCard}>
                    <View style={styles.itemHeader}>
                        <View style={styles.itemHeaderLeft}>
                            <Text style={styles.itemCode}>T-{String(item.id_tanaman).padStart(4, "0")}</Text>
                            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                                <Text style={styles.statusText}>{item.status}</Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.editButton}
                                
                        >
                            <Edit size={16} color="#fff" />
                            <Text style={styles.editButtonText}>Detail</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.itemContent}>
                        <View style={styles.itemImageContainer}>
                            {item.Foto ? (
                                <Image source={{ uri: item.Foto }} style={styles.itemImage} resizeMode="cover" />
                            ) : (
                                <View style={styles.itemImagePlaceholder}>
                                    <Leaf size={40} color="#7CB342" />
                                </View>
                            )}
                        </View>

                        <View style={styles.itemInfo}>
                            <Text style={styles.itemName}>{item.nm_tanaman}</Text>
                            <Text style={styles.itemDetail}>{item.lokasi}</Text>
                            <Text style={styles.itemDetail}>Jumlah: {item.jumlah} tanaman</Text>
                        </View>
                    </View>
                </View>
            ));
        }

        if (selectedTab === "Ternak") {
            return kandang.map((item, index) => (
                <View key={index} style={styles.itemCard}>
                    <View style={styles.itemHeader}>
                        <View style={styles.itemHeaderLeft}>
                            <Text style={styles.itemCode}>K-{String(item.id_kandang).padStart(4, "0")}</Text>
                            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.keterangan || "Normal") }]}>
                                <Text style={styles.statusText}>{item.keterangan || "Normal"}</Text>
                            </View>
                        </View>

                        <TouchableOpacity style={styles.editButton}>
                            <Edit size={16} color="#fff" />
                            <Text style={styles.editButtonText}>Detail</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.itemContent}>
                        <View style={styles.itemImageContainer}>
                            {item.foto_hasil ? (
                                <Image source={{ uri: item.foto_hasil }} style={styles.itemImage} resizeMode="cover" />
                            ) : (
                                <View style={styles.itemImagePlaceholder}>
                                    <PawPrint size={40} color="#FFA726" />
                                </View>
                            )}
                        </View>

                        <View style={styles.itemInfo}>
                            <Text style={styles.itemName}>{item.nm_kandang}</Text>
                            <Text style={styles.itemDetail}>{item.jenis_hewan} - {item.Hasil_Produksi}</Text>
                            <Text style={styles.itemDetail}>Jumlah: {item.jumlah_hewan}/{item.kapasitas}</Text>
                        </View>
                    </View>
                </View>
            ));
        }

        return sensor.map((item, index) => (
            <View key={index} style={styles.itemCard}>
                <View style={styles.itemHeader}>
                    <View style={styles.itemHeaderLeft}>
                        <Text style={styles.itemCode}>{item.kd_sensor}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                            <Text style={styles.statusText}>{item.status}</Text>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.editButton}>
                        <Edit size={16} color="#fff" />
                        <Text style={styles.editButtonText}>Edit</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.itemContent}>
                    <View style={styles.itemInfo}>
                        <Text style={styles.itemName}>{item.nm_sensor}</Text>
                        <View style={styles.sensorDataRow}>
                            <View style={styles.sensorData}>
                                <Thermometer size={16} />
                                <Text style={styles.sensorValue}>Suhu {item.suhu}</Text>
                            </View>
                            <View style={styles.sensorData}>
                                <Droplets size={16} />
                                <Text style={styles.sensorValue}>{item.kelembaban}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        ));
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#7CB342" />
                <Text style={styles.loadingText}>Memuat...</Text>
            </View>
        );
    }

    if (!userData) return null;

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.userSection}>
                        <View style={styles.userAvatar}>
                            <Text style={styles.avatarText}>{userData.nama.charAt(0).toUpperCase()}</Text>
                        </View>
                        <View>
                            <Text style={styles.greeting}>Selamat datang petugas,</Text>
                            <Text style={styles.userName}>{userData.nama}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.dateCard}>
                    <Text style={styles.dateText}>📅 {getCurrentDate()}</Text>
                </View>

                <View style={styles.statsCard}>
                    <Text style={styles.statsTitle}>Statistik Sistem:</Text>
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Edit Sensor</Text>
                            <View style={styles.statBadge}><Text style={styles.statValue}>{sensor.length}</Text></View>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Update Stok</Text>
                            <View style={styles.statBadge}><Text style={styles.statValue}>{kandang.length}</Text></View>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Edit Tanaman</Text>
                            <View style={styles.statBadge}><Text style={styles.statValue}>{tanaman.length}</Text></View>
                        </View>
                    </View>
                </View>

                <View style={styles.tabsContainer}>
                    {["Tanaman", "Ternak", "Sensor"].map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            style={[styles.tab, selectedTab === tab && styles.tabActive]}
                            onPress={() => setSelectedTab(tab)}
                        >
                            <Text style={[styles.tabText, selectedTab === tab && styles.tabTextActive]}>
                                {tab}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.contentContainer}>{renderTabContent()}</View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Bottom Navigation */}
            <View style={styles.bottomNav}>
                <TouchableOpacity style={styles.navItem} onPress={() => router.push("/user/settings")}>
                    <Settings size={24} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity style={[styles.navItem, styles.navItemActive]}>
                    <Home size={28} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => router.push({ pathname: "/user/profile", params: { from: "dashboard" } })}
                >
                    <User size={24} color="#fff" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F5F5F5" },
    scrollView: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F5F5F5" },
    loadingText: { marginTop: 10, fontSize: 16 },
    header: { backgroundColor: "#7CB342", paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20 },
    userSection: { flexDirection: "row", alignItems: "center", gap: 15 },
    userAvatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: "#FFA726", justifyContent: "center", alignItems: "center" },
    avatarText: { color: "#fff", fontSize: 20, fontWeight: "700" },
    greeting: { fontSize: 13, color: "#fff", opacity: 0.9 },
    userName: { fontSize: 18, fontWeight: "700", color: "#fff" },
    dateCard: { backgroundColor: "#fff", marginHorizontal: 20, marginTop: 20, padding: 15, borderRadius: 12 },
    dateText: { fontSize: 14, fontWeight: "600" },
    statsCard: { backgroundColor: "#fff", marginHorizontal: 20, marginTop: 15, padding: 20, borderRadius: 12 },
    statsTitle: { fontSize: 16, fontWeight: "700" },
    statsRow: { flexDirection: "row", justifyContent: "space-between", gap: 10 },
    statItem: { flex: 1, alignItems: "center" },
    statLabel: { fontSize: 12, color: "#666", textAlign: "center" },
    statBadge: { backgroundColor: "#5D4037", paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20 },
    statValue: { color: "#fff", fontSize: 16, fontWeight: "700" },
    tabsContainer: { flexDirection: "row", backgroundColor: "#7CB342", marginHorizontal: 20, marginTop: 20, borderRadius: 25, padding: 5, gap: 5 },
    tab: { flex: 1, paddingVertical: 12, alignItems: "center", borderRadius: 20 },
    tabActive: { backgroundColor: "#FFA726" },
    tabText: { fontSize: 14, fontWeight: "600", color: "#fff" },
    tabTextActive: { color: "#fff" },
    contentContainer: { paddingHorizontal: 20, paddingTop: 20, gap: 15 },
    itemCard: { backgroundColor: "#fff", borderRadius: 12, padding: 15, marginBottom: 5 },
    itemHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
    itemHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
    itemCode: { fontSize: 16, fontWeight: "700", color: "#333" },
    statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
    statusText: { fontSize: 11, fontWeight: "600", color: "#fff" },
    editButton: { flexDirection: "row", alignItems: "center", backgroundColor: "#66BB6A", paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, gap: 5 },
    editButtonText: { color: "#fff", fontSize: 12, fontWeight: "600" },
    itemContent: { flexDirection: "row", gap: 15 },
    itemImageContainer: { width: 80, height: 80, borderRadius: 12, overflow: "hidden", backgroundColor: "#F5F5F5" },
    itemImage: { width: "100%", height: "100%" },
    itemImagePlaceholder: { flex: 1, justifyContent: "center", alignItems: "center" },
    itemInfo: { flex: 1, justifyContent: "center" },
    itemName: { fontSize: 16, fontWeight: "700", color: "#333" },
    itemDetail: { fontSize: 12, marginTop: 4, color: "#666" },
    sensorDataRow: { flexDirection: "row", gap: 15, marginTop: 10 },
    sensorData: { flexDirection: "row", alignItems: "center", gap: 8 },
    sensorValue: { fontSize: 13, fontWeight: "600" },
    bottomNav: { flexDirection: "row", justifyContent: "space-evenly", backgroundColor: "#7CB342", paddingVertical: 15 },
    navItem: { padding: 10 },
    navItemActive: { backgroundColor: "#FFA726", borderRadius: 30 }
});
