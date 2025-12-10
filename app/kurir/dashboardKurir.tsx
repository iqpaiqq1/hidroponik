import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    Dimensions,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    Image,
    Modal,
    Alert
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { API_URLS } from "../api/apiConfig";
import { Home, SettingsIcon, UserIcon } from "lucide-react-native";

const { width } = Dimensions.get("window");

type UserData = {
    gmail: string;
    nama: string;
    role: string;
    id_kurir?: number;
};

type Pengiriman = {
    id_pengiriman: number;
    id_supply: number;
    id_panen: number;
    tgl_pengiriman: string;
    tujuan: string;
    jumlah_dikirim: number;
    status_pengiriman: "Pending" | "Selesai";
    id_kurir: number;
    keterangan: string;
};

export default function DashboardKurir() {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [pengirimanData, setPengirimanData] = useState<Pengiriman[]>([]);
    const [pendingCount, setPendingCount] = useState(0);
    const [selesaiCount, setSelesaiCount] = useState(0);
    const [confirmModalVisible, setConfirmModalVisible] = useState(false);
    const [selectedPengiriman, setSelectedPengiriman] = useState<Pengiriman | null>(null);
    const [processing, setProcessing] = useState(false);
    const router = useRouter();

    // Fungsi untuk mendapatkan tanggal hari ini
    const getTodayDate = () => {
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        const today = new Date();
        return `${days[today.getDay()]}, ${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`;
    };

    // Fungsi untuk fetch data pengiriman dari API
    const fetchPengirimanData = async (idKurir: number) => {
        try {
            console.log("🔍 Fetching pengiriman untuk kurir ID:", idKurir);
            const url = `${API_URLS.PENGIRIMAN}?id_kurir=${idKurir}`;
            console.log("📡 URL:", url);

            const response = await fetch(url);
            const data = await response.json();

            console.log("📦 Response data:", data);

            // Check berbagai format response yang mungkin
            let pengirimanArray = [];

            if (data.success && data.pengiriman) {
                // Format: { success: true, pengiriman: [...] }
                pengirimanArray = data.pengiriman;
            } else if (data.data) {
                // Format: { data: [...] }
                pengirimanArray = data.data;
            } else if (Array.isArray(data)) {
                // Format: [...]
                pengirimanArray = data;
            }

            console.log("✅ Pengiriman array:", pengirimanArray);

            setPengirimanData(pengirimanArray);

            // Hitung jumlah pending dan selesai
            const pending = pengirimanArray.filter((p: Pengiriman) =>
                p.status_pengiriman === 'Pending'
            ).length;
            const selesai = pengirimanArray.filter((p: Pengiriman) =>
                p.status_pengiriman === 'Selesai'
            ).length;

            console.log("📊 Pending:", pending, "Selesai:", selesai);

            setPendingCount(pending);
            setSelesaiCount(selesai);
        } catch (error) {
            console.error("❌ Error fetching pengiriman:", error);
        }
    };

    const loadUserData = async () => {
        try {
            const user = await AsyncStorage.getItem("user");
            if (user) {
                const parsed = JSON.parse(user);
                console.log("👤 User data:", parsed);

                const role = parsed.role?.toLowerCase();

                if (role !== "kurir") {
                    switch (role) {
                        case "user":
                            router.replace("/user/dashboardUser");
                            return;
                        case "admin":
                            router.replace("/dashboard");
                            return;
                        default:
                            router.replace("/LoginScreen");
                            return;
                    }
                }

                // Coba berbagai field untuk ID kurir
                const idKurir = parsed.id_kurir || parsed.id || parsed.user_id || 0;
                console.log("🔑 ID Kurir yang digunakan:", idKurir);

                const userInfo = {
                    gmail: parsed.gmail || "",
                    nama: parsed.nama || "",
                    role: parsed.role || "",
                    id_kurir: idKurir,
                };

                setUserData(userInfo);

                // Fetch pengiriman data
                if (idKurir && idKurir > 0) {
                    await fetchPengirimanData(idKurir);
                } else {
                    console.warn("⚠️ ID Kurir tidak valid:", idKurir);
                }
            } else {
                router.replace("/LoginScreen");
            }
        } catch (e) {
            console.error("Error loading user data:", e);
            router.replace("/LoginScreen");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUserData();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadUserData();
        setRefreshing(false);
    };

    const handleKirimSekarang = (pengiriman: Pengiriman) => {
        setSelectedPengiriman(pengiriman);
        setConfirmModalVisible(true);
    };

    const prosesKirim = async () => {
        if (!selectedPengiriman) return;

        setProcessing(true);

        try {
            const url = `${API_URLS.PENGIRIMAN}/${selectedPengiriman.id_pengiriman}`;

            console.log("=".repeat(50));
            console.log("🚀 STARTING UPDATE PENGIRIMAN");
            console.log("=".repeat(50));
            console.log("📍 Full URL:", url);
            console.log("🆔 ID Pengiriman:", selectedPengiriman.id_pengiriman);
            console.log("📦 Current Status:", selectedPengiriman.status_pengiriman);

            // TESTING: Coba beberapa format berbeda
            const formatOptions = [
                'Selesai',     // Format 1: Huruf besar di awal
                'selesai',     // Format 2: Semua lowercase
                'SELESAI',     // Format 3: Semua uppercase
            ];

            let success = false;
            let lastError = "";

            for (const format of formatOptions) {
                console.log(`\n🔄 Trying format: "${format}"`);

                const requestBody = {
                    status_pengiriman: format
                };
                console.log("📦 Request body:", JSON.stringify(requestBody, null, 2));

                const response = await fetch(url, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    body: JSON.stringify(requestBody)
                });

                console.log("📡 Response status:", response.status);
                console.log("📡 Response ok:", response.ok);

                let result;
                try {
                    const responseText = await response.text();
                    result = responseText ? JSON.parse(responseText) : { success: response.ok };
                    console.log("📄 Response:", JSON.stringify(result, null, 2));
                } catch (e) {
                    result = { success: response.ok };
                }

                if (response.ok || response.status === 200 || response.status === 201) {
                    console.log(`✅ SUCCESS with format: "${format}"`);
                    success = true;

                    Alert.alert(
                        "✅ Berhasil!",
                        `Pengiriman berhasil diselesaikan!\n(Format: "${format}")`,
                        [{
                            text: "OK",
                            onPress: async () => {
                                setConfirmModalVisible(false);
                                setSelectedPengiriman(null);

                                if (userData?.id_kurir) {
                                    await new Promise(resolve => setTimeout(resolve, 1000));
                                    await fetchPengirimanData(userData.id_kurir);
                                }
                            }
                        }]
                    );
                    break; // Keluar dari loop jika berhasil
                } else {
                    const errorMsg = result?.message || result?.error || 'Unknown error';
                    lastError = errorMsg;
                    console.log(`❌ Failed with format "${format}": ${errorMsg}`);
                }
            }

            if (!success) {
                console.log("❌ All formats failed!");
                Alert.alert(
                    "Error Validasi",
                    `Semua format gagal!\n\nError terakhir: ${lastError}\n\n` +
                    `💡 Tolong cek validasi backend di PengirimanController.php\n` +
                    `Format yang dicoba:\n- "Selesai"\n- "selesai"\n- "SELESAI"`
                );
            }

        } catch (error) {
            console.error("❌ FATAL ERROR in prosesKirim:");
            console.error("Error message:", error instanceof Error ? error.message : 'Unknown');

            Alert.alert(
                "Error",
                `Terjadi kesalahan: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
        } finally {
            setProcessing(false);
            console.log("=".repeat(50));
            console.log("🏁 PROSES KIRIM SELESAI");
            console.log("=".repeat(50));
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#dc2626" />
                <Text style={styles.loadingText}>Memuat data...</Text>
            </View>
        );
    }

    if (!userData) return null;

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Header Section */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <View style={styles.logoContainer}>
                            <Image
                                source={require("../../assets/images/AgroTech.png")}
                                style={styles.logo}
                                resizeMode="contain"
                            />
                        </View>
                    </View>
                    <View style={styles.headerRight}>
                        <Text style={styles.greetingText}>Hai, <Text style={styles.nameText}>{userData.nama}!</Text></Text>
                        <Text style={styles.welcomeSubText}>Welcome to your Workspace</Text>
                        <Text style={styles.dateText}>{getTodayDate()}</Text>
                    </View>
                </View>

                {/* Stats Cards */}
                <View style={styles.statsContainer}>
                    <View style={[styles.statCard, styles.redCard]}>
                        <View style={styles.statIcon}>
                            <Ionicons name="time-outline" size={32} color="#fff" />
                        </View>
                        <View style={styles.statContent}>
                            <Text style={styles.statLabel}>Pengiriman{'\n'}Tertunda</Text>
                            <Text style={styles.statNumber}>{pendingCount}</Text>
                        </View>
                    </View>

                    <View style={[styles.statCard, styles.greenCard]}>
                        <View style={styles.statIcon}>
                            <Ionicons name="checkmark-done-outline" size={32} color="#fff" />
                        </View>
                        <View style={styles.statContent}>
                            <Text style={styles.statLabel}>Pengiriman{'\n'}Selesai</Text>
                            <Text style={styles.statNumber}>{selesaiCount}</Text>
                        </View>
                    </View>
                </View>

                {/* Pengiriman Berikutnya Section */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Pengiriman Berikutnya</Text>

                    {pengirimanData
                        .filter(p => p.status_pengiriman === 'Pending')
                        .slice(0, 3)
                        .map((pengiriman, index) => (
                            <View key={pengiriman.id_pengiriman} style={styles.pengirimanCard}>
                                <View style={styles.cardHeader}>
                                    <View style={styles.cardHeaderLeft}>
                                        <Text style={styles.pengirimanId}>PG-{String(pengiriman.id_pengiriman).padStart(3, '0')}</Text>
                                        <Text style={styles.pengirimanDetail}>{pengiriman.tujuan}</Text>
                                    </View>
                                    <View style={styles.statusBadge}>
                                        <Text style={styles.statusText}>Pending</Text>
                                    </View>
                                </View>

                                <View style={styles.cardBody}>
                                    <View style={styles.infoRow}>
                                        <Ionicons name="location-outline" size={16} color="#dc2626" />
                                        <Text style={styles.infoText}>{pengiriman.tujuan}</Text>
                                    </View>

                                    <View style={styles.infoRow}>
                                        <Ionicons name="calendar-outline" size={16} color="#22c55e" />
                                        <Text style={styles.infoText}>
                                            Tanggal: {new Date(pengiriman.tgl_pengiriman).toLocaleDateString('id-ID')}
                                        </Text>
                                    </View>

                                    <View style={styles.infoRow}>
                                        <Ionicons name="cube-outline" size={16} color="#3b82f6" />
                                        <Text style={styles.infoText}>
                                            Jumlah: {pengiriman.jumlah_dikirim} kg
                                        </Text>
                                    </View>

                                    {pengiriman.keterangan && (
                                        <View style={styles.infoRow}>
                                            <Ionicons name="information-circle-outline" size={16} color="#f59e0b" />
                                            <Text style={styles.infoText}>
                                                {pengiriman.keterangan}
                                            </Text>
                                        </View>
                                    )}
                                </View>

                                <TouchableOpacity
                                    style={styles.kirimButton}
                                    onPress={() => handleKirimSekarang(pengiriman)}
                                >
                                    <Text style={styles.kirimButtonText}>Kirim Sekarang</Text>
                                </TouchableOpacity>
                            </View>
                        ))}

                    {pengirimanData.filter(p => p.status_pengiriman === 'Pending').length === 0 && (
                        <View style={styles.emptyState}>
                            <Ionicons name="checkmark-circle-outline" size={64} color="#22c55e" />
                            <Text style={styles.emptyStateText}>Tidak ada pengiriman tertunda</Text>
                        </View>
                    )}
                </View>

                {/* Summary Cards */}
                <View style={styles.summaryContainer}>
                    <View style={[styles.summaryCard, styles.yellowCard]}>
                        <Text style={styles.summaryNumber}>{pengirimanData.length}</Text>
                        <Text style={styles.summaryLabel}>Total Pengiriman Anda</Text>
                    </View>

                    <View style={[styles.summaryCard, styles.orangeCard]}>
                        <Text style={styles.summaryNumber}>
                            {pengirimanData.reduce((sum, p) => sum + p.jumlah_dikirim, 0)}
                        </Text>
                        <Text style={styles.summaryLabel}>Total Jumlah Dikirim (kg)</Text>
                    </View>
                </View>

                {/* Spacing untuk navbar */}
                <View style={{ height: 100 }} />
            </ScrollView>

            {/* MODAL KONFIRMASI - INI YANG DITAMBAHKAN */}
            <Modal
                visible={confirmModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setConfirmModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Ionicons name="alert-circle" size={64} color="#f59e0b" />
                        </View>

                        <Text style={styles.modalTitle}>Konfirmasi Pengiriman</Text>

                        {selectedPengiriman && (
                            <View style={styles.modalInfo}>
                                <View style={styles.modalInfoRow}>
                                    <Text style={styles.modalInfoLabel}>ID Pengiriman:</Text>
                                    <Text style={styles.modalInfoValue}>
                                        PG-{String(selectedPengiriman.id_pengiriman).padStart(3, '0')}
                                    </Text>
                                </View>

                                <View style={styles.modalInfoRow}>
                                    <Text style={styles.modalInfoLabel}>Tujuan:</Text>
                                    <Text style={styles.modalInfoValue}>{selectedPengiriman.tujuan}</Text>
                                </View>

                                <View style={styles.modalInfoRow}>
                                    <Text style={styles.modalInfoLabel}>Jumlah:</Text>
                                    <Text style={styles.modalInfoValue}>{selectedPengiriman.jumlah_dikirim} kg</Text>
                                </View>

                                <View style={[styles.modalInfoRow, { borderBottomWidth: 0 }]}>
                                    <Text style={styles.modalInfoLabel}>Tanggal:</Text>
                                    <Text style={styles.modalInfoValue}>
                                        {new Date(selectedPengiriman.tgl_pengiriman).toLocaleDateString('id-ID')}
                                    </Text>
                                </View>
                            </View>
                        )}

                        <Text style={styles.modalWarning}>
                            ⚠️ Pastikan pengiriman sudah sampai tujuan. Status akan berubah menjadi "Selesai".
                        </Text>

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => {
                                    setConfirmModalVisible(false);
                                    setSelectedPengiriman(null);
                                }}
                                disabled={processing}
                            >
                                <Ionicons name="close-circle-outline" size={20} color="#6b7280" />
                                <Text style={styles.cancelButtonText}>Batal</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.modalButton, styles.confirmButton]}
                                onPress={prosesKirim}
                                disabled={processing}
                            >
                                {processing ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <>
                                        <Ionicons name="checkmark-circle" size={20} color="#fff" />
                                        <Text style={styles.confirmButtonText}>Konfirmasi</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

                         {/* Bottom Navigation */}
                                     <View style={[styles.bottomNav, { backgroundColor: "#dc2626" }]}>
                                        <TouchableOpacity
                                            style={styles.navItem}
                                            onPress={() => router.push("/kurir/settings")}
                                        >
                                            <SettingsIcon size={28} color="#fff" />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                        style={[styles.navItem, styles.navItemActive]}
                                            onPress={() => router.push("/kurir/dashboardKurir")}
                                        >
                                            <Home size={24} color="#fff" />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.navItem}
                                            onPress={() => router.push({
                                                pathname: "/kurir/profile",
                                                params: { from: "settings" }
                                            })}
                                        >
                                            <UserIcon size={24} color="#fff" />
                                        </TouchableOpacity>
                                    </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fdfaf2",
    },
    scrollView: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fdfaf2",
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: "#5b4c3a",
    },
    header: {
        backgroundColor: "#dc2626",
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        padding: 20,
        paddingTop: 40,
        paddingBottom: 30,
        flexDirection: "row",
        alignItems: "center",
    },
    headerLeft: {
        marginRight: 15,
    },
    logoContainer: {
        width: 60,
        height: 60,
        backgroundColor: "#fff",
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
    },
    logo: {
        width: 50,
        height: 50,
    },
    headerRight: {
        flex: 1,
    },
    greetingText: {
        fontSize: 20,
        color: "#fff",
        fontWeight: "400",
    },
    nameText: {
        fontWeight: "bold",
        fontSize: 22,
    },
    welcomeSubText: {
        fontSize: 13,
        color: "#fecaca",
        marginTop: 2,
    },
    dateText: {
        fontSize: 12,
        color: "#fef2f2",
        marginTop: 8,
        fontStyle: "italic",
    },
    statsContainer: {
        flexDirection: "row",
        padding: 20,
        gap: 15,
    },
    statCard: {
        flex: 1,
        borderRadius: 15,
        padding: 20,
        flexDirection: "row",
        alignItems: "center",
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    redCard: {
        backgroundColor: "#dc2626",
    },
    greenCard: {
        backgroundColor: "#22c55e",
    },
    statIcon: {
        marginRight: 15,
    },
    statContent: {
        flex: 1,
    },
    statLabel: {
        fontSize: 13,
        color: "#fff",
        fontWeight: "500",
        marginBottom: 5,
    },
    statNumber: {
        fontSize: 36,
        fontWeight: "bold",
        color: "#fff",
    },
    sectionContainer: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#1f2937",
        marginBottom: 15,
    },
    pengirimanCard: {
        backgroundColor: "#fff",
        borderRadius: 15,
        padding: 15,
        marginBottom: 15,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        borderLeftWidth: 4,
        borderLeftColor: "#dc2626",
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 15,
    },
    cardHeaderLeft: {
        flex: 1,
    },
    pengirimanId: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#1f2937",
        marginBottom: 4,
    },
    pengirimanDetail: {
        fontSize: 14,
        color: "#6b7280",
    },
    statusBadge: {
        backgroundColor: "#fef3c7",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statusText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#92400e",
    },
    cardBody: {
        gap: 10,
        marginBottom: 15,
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    infoText: {
        fontSize: 14,
        color: "#4b5563",
        flex: 1,
    },
    kirimButton: {
        backgroundColor: "#dc2626",
        borderRadius: 10,
        padding: 12,
        alignItems: "center",
    },
    kirimButtonText: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "bold",
    },
    emptyState: {
        alignItems: "center",
        padding: 40,
    },
    emptyStateText: {
        fontSize: 16,
        color: "#9ca3af",
        marginTop: 15,
    },
    summaryContainer: {
        flexDirection: "row",
        padding: 20,
        paddingTop: 0,
        gap: 15,
        marginBottom: 20,
    },
    summaryCard: {
        flex: 1,
        borderRadius: 15,
        padding: 25,
        alignItems: "center",
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    yellowCard: {
        backgroundColor: "#fbbf24",
    },
    orangeCard: {
        backgroundColor: "#f97316",
    },
    summaryNumber: {
        fontSize: 48,
        fontWeight: "bold",
        color: "#fff",
        marginBottom: 10,
    },
    summaryLabel: {
        fontSize: 14,
        color: "#fff",
        textAlign: "center",
        fontWeight: "500",
    },
    bottomNav: {
        flexDirection: "row",
        borderRadius: 35,
        marginHorizontal: 20,
        marginBottom: 20,
        paddingVertical: 15,
        paddingHorizontal: 30,
        justifyContent: "space-around",
        alignItems: "center",
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    navItem: {
        padding: 10,
    },
    navItemActive: {
        backgroundColor: "rgba(255,255,255,0.2)",
        borderRadius: 50,
        padding: 15,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    modalContent: {
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 25,
        width: "100%",
        maxWidth: 400,
        alignItems: "center",
    },
    modalHeader: {
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#1f2937",
        marginBottom: 20,
        textAlign: "center",
    },
    modalInfo: {
        backgroundColor: "#f9fafb",
        borderRadius: 12,
        padding: 15,
        width: "100%",
        marginBottom: 20,
    },
    modalInfoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
    },
    modalInfoLabel: {
        fontSize: 14,
        color: "#6b7280",
        fontWeight: "500",
    },
    modalInfoValue: {
        fontSize: 14,
        color: "#1f2937",
        fontWeight: "600",
    },
    modalWarning: {
        fontSize: 13,
        color: "#f59e0b",
        textAlign: "center",
        marginBottom: 20,
        paddingHorizontal: 10,
    },
    modalActions: {
        flexDirection: "row",
        gap: 10,
        width: "100%",
    },
    modalButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: 8,
    },
    cancelButton: {
        backgroundColor: "#e5e7eb",
    },
    cancelButtonText: {
        color: "#6b7280",
        fontSize: 16,
        fontWeight: "600",
    },
    confirmButton: {
        backgroundColor: "#22c55e",
    },
    confirmButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
});