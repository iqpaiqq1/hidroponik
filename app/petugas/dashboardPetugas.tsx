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
    Modal,
    TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Leaf, Home, Settings, User, Thermometer, Droplets, Edit, MapPin, Activity, X, Clock } from "lucide-react-native";
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

interface CountdownData {
    tanaman: Tanaman;
    targetDate: Date;
    daysRemaining: number;
    percentage: number;
    statusText: string;
    statusColor: string;
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
    tgl_produksi: string;
    lama_produksi: string;
}

interface CountdownKandang {
    kandang: Kandang;
    targetDate: Date;
    daysRemaining: number;
    percentage: number;
    statusText: string;
    statusColor: string;
}

interface Sensor {
    id_sensor: number;
    id_tanaman: number | null;
    id_kandang: number | null;
    lokasi: string;
    populasi: number;
    suhu: string;
    kelembapan: string;
    produktivitas: string;
    status_kesehatan: string;
}

export default function DashboardPetugas() {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [tanaman, setTanaman] = useState<Tanaman[]>([]);
    const [countdownList, setCountdownList] = useState<CountdownData[]>([]);
    const [kandang, setKandang] = useState<Kandang[]>([]);
    const [countdownKandangList, setCountdownKandangList] = useState<CountdownKandang[]>([]);
    const [sensor, setSensor] = useState<Sensor[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedTab, setSelectedTab] = useState("Tanaman");

    // Modal states
    const [modalVisible, setModalVisible] = useState(false);
    const [editMode, setEditMode] = useState<"tanaman" | "kandang" | "sensor" | null>(null);
    const [editData, setEditData] = useState<any>(null);
    const [saving, setSaving] = useState(false);

    // Modal Panen Tanaman states
    const [panenModalVisible, setPanenModalVisible] = useState(false);
    const [selectedTanaman, setSelectedTanaman] = useState<CountdownData | null>(null);
    const [kualitas, setKualitas] = useState("");
    const [jumlahPanen, setJumlahPanen] = useState("");
    const [processingPanen, setProcessingPanen] = useState(false);

    // Modal Panen Kandang states
    const [panenKandangModalVisible, setPanenKandangModalVisible] = useState(false);
    const [selectedKandang, setSelectedKandang] = useState<CountdownKandang | null>(null);
    const [kualitasKandang, setKualitasKandang] = useState("");
    const [jumlahPanenKandang, setJumlahPanenKandang] = useState("");
    const [processingPanenKandang, setProcessingPanenKandang] = useState(false);

    const router = useRouter();

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            const user = await AsyncStorage.getItem("user");
            if (user) {
                const parsed = JSON.parse(user);

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

    const calculateCountdown = (tglTanam: string, lamaPanen: string): CountdownData | null => {
        try {
            // Validasi input
            if (!tglTanam || !lamaPanen) return null;

            const plantDate = new Date(tglTanam);

            // Cek apakah tanggal valid
            if (isNaN(plantDate.getTime())) return null;

            const match = lamaPanen.match(/\d+/);
            if (!match) return null;
            const daysToHarvest = parseInt(match[0]);

            const targetDate = new Date(plantDate);
            targetDate.setDate(targetDate.getDate() + daysToHarvest);

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const plantDateReset = new Date(plantDate);
            plantDateReset.setHours(0, 0, 0, 0);

            const diffTime = today.getTime() - plantDateReset.getTime();
            const daysPassed = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            const daysRemaining = daysToHarvest - daysPassed;

            let percentage = 0;
            if (daysPassed < 0) {
                percentage = 0;
            } else if (daysPassed >= daysToHarvest) {
                percentage = 100;
            } else {
                percentage = Math.min(100, Math.floor((daysPassed / daysToHarvest) * 100));
            }

            let statusText = "";
            let statusColor = "";

            if (daysRemaining > 3) {
                statusText = "Baru Ditanam";
                statusColor = "#2196F3";
            } else if (daysRemaining > 0 && daysRemaining <= 3) {
                statusText = "Segera Panen";
                statusColor = "#FF9800";
            } else if (daysRemaining === 0) {
                statusText = "Sudah Waktunya Panen";
                statusColor = "#4CAF50";
            } else if (daysRemaining < 0) {
                statusText = "Terlambat Panen";
                statusColor = "#F44336";
                percentage = 100;
            }

            return {
                tanaman: {} as Tanaman,
                targetDate,
                daysRemaining,
                percentage,
                statusText,
                statusColor,
            };
        } catch (error) {
            console.error("Error calculating countdown:", error);
            return null;
        }
    };

    const fetchAllData = async () => {
        await Promise.all([fetchTanaman(), fetchKandang(), fetchSensor()]);
    };

    const fetchTanaman = async () => {
        try {
            const response = await fetch(API_URLS.TANAMAN);
            const data: Tanaman[] = await response.json();
            setTanaman(data);

            // Calculate countdown untuk setiap tanaman
            const countdowns: CountdownData[] = data
                .map(tanaman => {
                    const countdown = calculateCountdown(tanaman.tgl_tanam, tanaman.lama_panen);
                    if (countdown) {
                        countdown.tanaman = tanaman;
                        return countdown;
                    }
                    return null;
                })
                .filter((item): item is CountdownData => item !== null);

            setCountdownList(countdowns);
        } catch (error) {
            console.error("Error fetching tanaman:", error);
        }
    };

    const fetchKandang = async () => {
        try {
            const response = await fetch(API_URLS.KANDANG);
            const data: Kandang[] = await response.json();
            setKandang(data);

            // Calculate countdown untuk setiap kandang (jika ada tgl_produksi dan lama_produksi)
            const countdowns: CountdownKandang[] = data
                .map(kandang => {
                    if (kandang.tgl_produksi && kandang.lama_produksi) {
                        const countdown = calculateCountdown(kandang.tgl_produksi, kandang.lama_produksi);
                        if (countdown) {
                            return {
                                kandang: kandang,
                                targetDate: countdown.targetDate,
                                daysRemaining: countdown.daysRemaining,
                                percentage: countdown.percentage,
                                statusText: countdown.statusText,
                                statusColor: countdown.statusColor,
                            };
                        }
                    }
                    return null;
                })
                .filter((item): item is CountdownKandang => item !== null);

            setCountdownKandangList(countdowns);
        } catch (error) {
            console.error("Error fetching kandang:", error);
        }
    };

    const fetchSensor = async () => {
        try {
            const response = await fetch(API_URLS.SENSOR);
            const data = await response.json();

            if (Array.isArray(data)) {
                setSensor(data);
            } else {
                console.error("Sensor data is not an array:", data);
                setSensor([]);
            }
        } catch (error) {
            console.error("Error fetching sensor:", error);
            setSensor([]);
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

    const formatDate = (date: Date) => {
        const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
        return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
    };

    const getStatusColor = (status: string) => {
        const s = status?.toLowerCase() || "";
        if (s.includes("sehat") || s.includes("normal") || s.includes("optimal") || s.includes("baik") || s.includes("produktif"))
            return "#66BB6A";
        if (s.includes("panas") || s.includes("siap") || s.includes("warning") || s.includes("peringatan"))
            return "#FFA726";
        if (s.includes("bahaya") || s.includes("kritis") || s.includes("buruk"))
            return "#EF5350";
        return "#666";
    };

    const isHarvestable = (item: CountdownData | CountdownKandang) => {
        return item.daysRemaining <= 0;
    };

    const handlePanenPress = (item: CountdownData) => {
        if (item.daysRemaining <= 0) {
            setSelectedTanaman(item);
            setJumlahPanen(item.tanaman.jumlah.toString());
            setPanenModalVisible(true);
        }
    };

    const handlePanenKandangPress = (item: CountdownKandang) => {
        if (item.daysRemaining <= 0) {
            setSelectedKandang(item);
            setJumlahPanenKandang(item.kandang.Jml_produksi.toString());
            setPanenKandangModalVisible(true);
        }
    };

    const prosessPanen = async () => {
        if (!selectedTanaman) return;

        if (!kualitas.trim()) {
            Alert.alert("Error", "Mohon isi kualitas panen");
            return;
        }

        if (!jumlahPanen || parseInt(jumlahPanen) <= 0) {
            Alert.alert("Error", "Jumlah panen harus lebih dari 0");
            return;
        }

        setProcessingPanen(true);

        try {
            const response = await fetch(
                `${API_URLS.TANAMAN}/${selectedTanaman.tanaman.id_tanaman}/panen`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        kualitas: kualitas,
                        jumlah_panen: parseInt(jumlahPanen)
                    })
                }
            );

            const result = await response.json();

            if (response.ok) {
                Alert.alert("Sukses", "Tanaman berhasil dipanen dan dipindahkan ke data panen");
                setPanenModalVisible(false);
                setKualitas("");
                setJumlahPanen("");
                setSelectedTanaman(null);
                await fetchAllData();
            } else {
                Alert.alert("Error", result.message || "Gagal memproses panen");
            }
        } catch (error) {
            Alert.alert("Error", "Terjadi kesalahan saat memproses panen");
            console.error(error);
        } finally {
            setProcessingPanen(false);
        }
    };

    const prosessPanenKandang = async () => {
        if (!selectedKandang) return;

        if (!kualitasKandang.trim()) {
            Alert.alert("Error", "Mohon isi kualitas produksi");
            return;
        }

        if (!jumlahPanenKandang || parseInt(jumlahPanenKandang) <= 0) {
            Alert.alert("Error", "Jumlah produksi harus lebih dari 0");
            return;
        }

        setProcessingPanenKandang(true);

        try {
            const response = await fetch(
                `${API_URLS.KANDANG}/${selectedKandang.kandang.id_kandang}/panen`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        kualitas: kualitasKandang,
                        jumlah_produksi: parseInt(jumlahPanenKandang)
                    })
                }
            );

            const result = await response.json();

            if (response.ok) {
                Alert.alert("Sukses", "Produksi kandang berhasil dipanen! Data kandang tetap tersimpan.");
                setPanenKandangModalVisible(false);
                setKualitasKandang("");
                setJumlahPanenKandang("");
                setSelectedKandang(null);
                await fetchAllData();
            } else {
                Alert.alert("Error", result.message || "Gagal memproses panen kandang");
            }
        } catch (error) {
            Alert.alert("Error", "Terjadi kesalahan saat memproses panen kandang");
            console.error(error);
        } finally {
            setProcessingPanenKandang(false);
        }
    };

    const openEditModal = (type: "tanaman" | "kandang" | "sensor", data: any) => {
        setEditMode(type);
        setEditData({ ...data });
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
        setEditMode(null);
        setEditData(null);
    };

    const handleSave = async () => {
        if (!editData || !editMode) return;

        setSaving(true);
        try {
            let url = "";
            let method = "PUT";

            switch (editMode) {
                case "tanaman":
                    url = `${API_URLS.TANAMAN}/${editData.id_tanaman}`;
                    break;
                case "kandang":
                    url = `${API_URLS.KANDANG}/${editData.id_kandang}`;
                    break;
                case "sensor":
                    url = `${API_URLS.SENSOR}/${editData.id_sensor}`;
                    break;
            }

            const response = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(editData),
            });

            if (response.ok) {
                if (editMode === "tanaman") {
                    setTanaman(prev => prev.map(item =>
                        item.id_tanaman === editData.id_tanaman ? editData : item
                    ));
                } else if (editMode === "kandang") {
                    setKandang(prev => prev.map(item =>
                        item.id_kandang === editData.id_kandang ? editData : item
                    ));
                } else if (editMode === "sensor") {
                    setSensor(prev => prev.map(item =>
                        item.id_sensor === editData.id_sensor ? editData : item
                    ));
                }

                closeModal();
                Alert.alert("Berhasil", "Data berhasil diperbarui!");
                fetchAllData();
            } else {
                Alert.alert("Gagal", "Terjadi kesalahan saat menyimpan data.");
            }
        } catch (error) {
            console.error("Error saving data:", error);
            Alert.alert("Error", "Terjadi kesalahan saat menyimpan data.");
        } finally {
            setSaving(false);
        }
    };

    const renderEditForm = () => {
        if (!editData || !editMode) return null;

        switch (editMode) {
            case "tanaman":
                return (
                    <ScrollView style={styles.formContainer}>
                        <Text style={styles.formTitle}>Edit Data Tanaman</Text>

                        <Text style={styles.inputLabel}>Nama Tanaman</Text>
                        <TextInput
                            style={styles.input}
                            value={editData.nm_tanaman}
                            onChangeText={(text) => setEditData({ ...editData, nm_tanaman: text })}
                        />

                        <Text style={styles.inputLabel}>Varietas</Text>
                        <TextInput
                            style={styles.input}
                            value={editData.varietas}
                            onChangeText={(text) => setEditData({ ...editData, varietas: text })}
                        />

                        <Text style={styles.inputLabel}>Jumlah</Text>
                        <TextInput
                            style={styles.input}
                            value={String(editData.jumlah)}
                            onChangeText={(text) => setEditData({ ...editData, jumlah: parseInt(text) || 0 })}
                            keyboardType="numeric"
                        />

                        <Text style={styles.inputLabel}>Lokasi</Text>
                        <TextInput
                            style={styles.input}
                            value={editData.lokasi}
                            onChangeText={(text) => setEditData({ ...editData, lokasi: text })}
                        />

                        <Text style={styles.inputLabel}>Status</Text>
                        <TextInput
                            style={styles.input}
                            value={editData.status}
                            onChangeText={(text) => setEditData({ ...editData, status: text })}
                        />

                        <Text style={styles.inputLabel}>Lama Panen (hari)</Text>
                        <TextInput
                            style={styles.input}
                            value={editData.lama_panen}
                            onChangeText={(text) => setEditData({ ...editData, lama_panen: text })}
                        />
                    </ScrollView>
                );

            case "kandang":
                return (
                    <ScrollView style={styles.formContainer}>
                        <Text style={styles.formTitle}>Edit Data Kandang</Text>

                        <Text style={styles.inputLabel}>Nama Kandang</Text>
                        <TextInput
                            style={styles.input}
                            value={editData.nm_kandang}
                            onChangeText={(text) => setEditData({ ...editData, nm_kandang: text })}
                        />

                        <Text style={styles.inputLabel}>Jenis Hewan</Text>
                        <TextInput
                            style={styles.input}
                            value={editData.jenis_hewan}
                            onChangeText={(text) => setEditData({ ...editData, jenis_hewan: text })}
                        />

                        <Text style={styles.inputLabel}>Kapasitas</Text>
                        <TextInput
                            style={styles.input}
                            value={String(editData.kapasitas)}
                            onChangeText={(text) => setEditData({ ...editData, kapasitas: parseInt(text) || 0 })}
                            keyboardType="numeric"
                        />

                        <Text style={styles.inputLabel}>Jumlah Hewan</Text>
                        <TextInput
                            style={styles.input}
                            value={String(editData.jumlah_hewan)}
                            onChangeText={(text) => setEditData({ ...editData, jumlah_hewan: parseInt(text) || 0 })}
                            keyboardType="numeric"
                        />

                        <Text style={styles.inputLabel}>Hasil Produksi</Text>
                        <TextInput
                            style={styles.input}
                            value={editData.Hasil_Produksi}
                            onChangeText={(text) => setEditData({ ...editData, Hasil_Produksi: text })}
                        />

                        <Text style={styles.inputLabel}>Jumlah Produksi</Text>
                        <TextInput
                            style={styles.input}
                            value={String(editData.Jml_produksi)}
                            onChangeText={(text) => setEditData({ ...editData, Jml_produksi: parseInt(text) || 0 })}
                            keyboardType="numeric"
                        />

                        <Text style={styles.inputLabel}>Keterangan</Text>
                        <TextInput
                            style={styles.input}
                            value={editData.keterangan || ""}
                            onChangeText={(text) => setEditData({ ...editData, keterangan: text })}
                        />
                    </ScrollView>
                );

            case "sensor":
                return (
                    <ScrollView style={styles.formContainer}>
                        <Text style={styles.formTitle}>Edit Data Sensor</Text>

                        <Text style={styles.inputLabel}>Lokasi</Text>
                        <TextInput
                            style={styles.input}
                            value={editData.lokasi}
                            onChangeText={(text) => setEditData({ ...editData, lokasi: text })}
                        />

                        <Text style={styles.inputLabel}>ID Tanaman (opsional)</Text>
                        <TextInput
                            style={styles.input}
                            value={editData.id_tanaman ? String(editData.id_tanaman) : ""}
                            onChangeText={(text) => setEditData({ ...editData, id_tanaman: text ? parseInt(text) : null })}
                            keyboardType="numeric"
                            placeholder="Kosongkan jika tidak ada"
                        />

                        <Text style={styles.inputLabel}>ID Kandang (opsional)</Text>
                        <TextInput
                            style={styles.input}
                            value={editData.id_kandang ? String(editData.id_kandang) : ""}
                            onChangeText={(text) => setEditData({ ...editData, id_kandang: text ? parseInt(text) : null })}
                            keyboardType="numeric"
                            placeholder="Kosongkan jika tidak ada"
                        />

                        <Text style={styles.inputLabel}>Populasi</Text>
                        <TextInput
                            style={styles.input}
                            value={String(editData.populasi)}
                            onChangeText={(text) => setEditData({ ...editData, populasi: parseInt(text) || 0 })}
                            keyboardType="numeric"
                        />

                        <Text style={styles.inputLabel}>Suhu</Text>
                        <TextInput
                            style={styles.input}
                            value={editData.suhu}
                            onChangeText={(text) => setEditData({ ...editData, suhu: text })}
                            placeholder="contoh: 28°C"
                        />

                        <Text style={styles.inputLabel}>Kelembapan</Text>
                        <TextInput
                            style={styles.input}
                            value={editData.kelembapan}
                            onChangeText={(text) => setEditData({ ...editData, kelembapan: text })}
                            placeholder="contoh: 65%"
                        />

                        <Text style={styles.inputLabel}>Produktivitas</Text>
                        <TextInput
                            style={styles.input}
                            value={editData.produktivitas}
                            onChangeText={(text) => setEditData({ ...editData, produktivitas: text })}
                        />

                        <Text style={styles.inputLabel}>Status Kesehatan</Text>
                        <TextInput
                            style={styles.input}
                            value={editData.status_kesehatan}
                            onChangeText={(text) => setEditData({ ...editData, status_kesehatan: text })}
                        />
                    </ScrollView>
                );

            default:
                return null;
        }
    };

    const renderTabContent = () => {
        if (selectedTab === "Tanaman") {
            return countdownList.map((item, index) => (
                <View key={index} style={styles.itemCard}>
                    <View style={styles.itemHeader}>
                        <View style={styles.itemHeaderLeft}>
                            <Text style={styles.itemCode}>T-{String(item.tanaman.id_tanaman).padStart(4, "0")}</Text>
                            <View style={[styles.statusBadge, { backgroundColor: item.statusColor }]}>
                                <Text style={styles.statusText}>{item.statusText}</Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.editButton}
                            onPress={() => openEditModal("tanaman", item.tanaman)}
                        >
                            <Edit size={16} color="#fff" />
                            <Text style={styles.editButtonText}>Edit</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.itemContent}>
                        <View style={styles.itemImageContainer}>
                            {item.tanaman.Foto ? (
                                <Image source={{ uri: item.tanaman.Foto }} style={styles.itemImage} resizeMode="cover" />
                            ) : (
                                <View style={styles.itemImagePlaceholder}>
                                    <Leaf size={40} color="#7CB342" />
                                </View>
                            )}
                        </View>

                        <View style={styles.itemInfo}>
                            <Text style={styles.itemName}>{item.tanaman.nm_tanaman}</Text>
                            <Text style={styles.itemDetail}>{item.tanaman.varietas}</Text>
                            <Text style={styles.itemDetail}>{item.tanaman.lokasi}</Text>
                            <Text style={styles.itemDetail}>Jumlah: {item.tanaman.jumlah} tanaman</Text>
                        </View>
                    </View>

                    {/* Countdown Info */}
                    <View style={styles.countdownSection}>
                        <View style={styles.dateInfo}>
                                <Clock size={14} color="#666" />
                                <Text style={styles.countdownDateText}>
                                    Ditanam: {formatDate(new Date(item.tanaman.tgl_tanam))}
                                </Text>
                            </View>

                        <View style={styles.progressSection}>
                            <View style={styles.progressHeader}>
                                <Text style={styles.progressLabel}>
                                    {item.daysRemaining > 0
                                        ? `${item.daysRemaining} Hari Lagi`
                                        : item.statusText}
                                </Text>
                                <Text style={styles.progressPercentage}>{item.percentage}%</Text>
                            </View>
                            <View style={styles.progressBarContainer}>
                                <View style={[styles.progressBar, { width: `${item.percentage}%` }]} />
                            </View>
                        </View>

                        <Text style={styles.targetDate}>
                            Target Panen: {formatDate(item.targetDate)}
                        </Text>

                        {isHarvestable(item) && (
                            <TouchableOpacity
                                style={styles.panenButton}
                                onPress={() => handlePanenPress(item)}
                            >
                                <Text style={styles.panenButtonText}>🌾 Panen Sekarang</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            ));
        }

        if (selectedTab === "Ternak") {
            return kandang.map((item, index) => {  
                const countdown = countdownKandangList.find(c => c.kandang.id_kandang === item.id_kandang);

                return (
                    <View key={index} style={styles.itemCard}>
                        <View style={styles.itemHeader}>
                            <View style={styles.itemHeaderLeft}>
                                <Text style={styles.itemCode}>K-{String(item.id_kandang).padStart(4, "0")}</Text>
                                {countdown && (
                                    <View style={[styles.statusBadge, { backgroundColor: countdown.statusColor }]}>
                                        <Text style={styles.statusText}>{countdown.statusText}</Text>
                                    </View>
                                )}
                            </View>

                            <TouchableOpacity
                                style={styles.editButton}
                                onPress={() => openEditModal("kandang", item)}
                            >
                                <Edit size={16} color="#fff" />
                                <Text style={styles.editButtonText}>Edit</Text>
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
                                <Text style={styles.itemDetail}>{item.jenis_hewan}</Text>
                                <Text style={styles.itemDetail}>Produksi: {item.Hasil_Produksi}</Text>
                                <Text style={styles.itemDetail}>Jumlah: {item.jumlah_hewan}/{item.kapasitas}</Text>
                            </View>
                        </View>

                        {countdown && (
                            <View style={styles.countdownSection}>
                                <View style={styles.dateInfo}>
                                    <Clock size={14} color="#666" />
                                    <Text style={styles.countdownDateText}>
                                        Produksi Dimulai: {formatDate(new Date(item.tgl_produksi))}
                                    </Text>
                                </View>

                                <View style={styles.progressSection}>
                                    <View style={styles.progressHeader}>
                                        <Text style={styles.progressLabel}>
                                            {countdown.daysRemaining > 0
                                                ? `${countdown.daysRemaining} Hari Lagi`
                                                : countdown.statusText}
                                        </Text>
                                        <Text style={styles.progressPercentage}>{countdown.percentage}%</Text>
                                    </View>
                                    <View style={styles.progressBarContainer}>
                                        <View style={[styles.progressBar, { width: `${countdown.percentage}%` }]} />
                                    </View>
                                </View>

                                <Text style={styles.targetDate}>
                                    Target Panen: {formatDate(countdown.targetDate)}
                                </Text>

                                {isHarvestable(countdown) && (
                                    <TouchableOpacity
                                        style={styles.panenButton}
                                        onPress={() => handlePanenKandangPress(countdown)}
                                    >
                                        <Text style={styles.panenButtonText}>🥚 Panen Produksi</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}
                    </View>
                );
            });
        }

        return sensor.map((item, index) => (
            <View key={index} style={styles.sensorCard}>
                <View style={styles.itemHeader}>
                    <View style={styles.itemHeaderLeft}>
                        <Text style={styles.itemCode}>S-{String(item.id_sensor).padStart(4, "0")}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status_kesehatan) }]}>
                            <Text style={styles.statusText}>{item.status_kesehatan}</Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => openEditModal("sensor", item)}
                    >
                        <Edit size={16} color="#fff" />
                        <Text style={styles.editButtonText}>Edit</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.sensorInfoSection}>
                    <View style={styles.sensorInfoRow}>
                        <MapPin size={16} color="#666" />
                        <Text style={styles.sensorInfoLabel}>Lokasi:</Text>
                        <Text style={styles.sensorInfoValue}>{item.lokasi}</Text>
                    </View>

                    {item.id_tanaman && (
                        <View style={styles.sensorInfoRow}>
                            <Leaf size={16} color="#7CB342" />
                            <Text style={styles.sensorInfoLabel}>ID Tanaman:</Text>
                            <Text style={styles.sensorInfoValue}>T-{String(item.id_tanaman).padStart(4, "0")}</Text>
                        </View>
                    )}

                    {item.id_kandang && (
                        <View style={styles.sensorInfoRow}>
                            <PawPrint size={16} color="#FFA726" />
                            <Text style={styles.sensorInfoLabel}>ID Kandang:</Text>
                            <Text style={styles.sensorInfoValue}>K-{String(item.id_kandang).padStart(4, "0")}</Text>
                        </View>
                    )}

                    <View style={styles.sensorInfoRow}>
                        <Activity size={16} color="#666" />
                        <Text style={styles.sensorInfoLabel}>Populasi:</Text>
                        <Text style={styles.sensorInfoValue}>{item.populasi}</Text>
                    </View>
                </View>

                <View style={styles.sensorDataContainer}>
                    <View style={styles.sensorDataBox}>
                        <Thermometer size={20} color="#EF5350" />
                        <Text style={styles.sensorDataLabel}>Suhu</Text>
                        <Text style={styles.sensorDataValue}>{item.suhu}</Text>
                    </View>

                    <View style={styles.sensorDataBox}>
                        <Droplets size={20} color="#42A5F5" />
                        <Text style={styles.sensorDataLabel}>Kelembapan</Text>
                        <Text style={styles.sensorDataValue}>{item.kelembapan}</Text>
                    </View>

                    <View style={styles.sensorDataBox}>
                        <Activity size={20} color="#66BB6A" />
                        <Text style={styles.sensorDataLabel}>Produktivitas</Text>
                        <Text style={styles.sensorDataValue}>{item.produktivitas}</Text>
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
                            <Text style={styles.statLabel}>Sensor</Text>
                            <View style={styles.statBadge}><Text style={styles.statValue}>{sensor.length}</Text></View>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}> Ternak</Text>
                            <View style={styles.statBadge}><Text style={styles.statValue}>{kandang.length}</Text></View>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Tanaman</Text>
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

            {/* Modal Edit */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={closeModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Edit Data</Text>
                            <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                                <X size={24} color="#333" />
                            </TouchableOpacity>
                        </View>

                        {renderEditForm()}

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={closeModal}
                                disabled={saving}
                            >
                                <Text style={styles.cancelButtonText}>Batal</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.modalButton, styles.saveButton]}
                                onPress={handleSave}
                                disabled={saving}
                            >
                                {saving ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={styles.saveButtonText}>Simpan</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Modal Panen Tanaman */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={panenModalVisible}
                onRequestClose={() => setPanenModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.panenModalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Konfirmasi Panen</Text>
                            <TouchableOpacity
                                onPress={() => setPanenModalVisible(false)}
                                style={styles.closeButton}
                            >
                                <X size={24} color="#333" />
                            </TouchableOpacity>
                        </View>

                        {selectedTanaman && (
                            <View style={styles.panenModalInfo}>
                                <Text style={styles.panenModalInfoText}>
                                    Tanaman: {selectedTanaman.tanaman.nm_tanaman}
                                </Text>
                                <Text style={styles.panenModalInfoText}>
                                    Varietas: {selectedTanaman.tanaman.varietas}
                                </Text>
                            </View>
                        )}

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Jumlah Panen:</Text>
                            <TextInput
                                style={styles.input}
                                value={jumlahPanen}
                                onChangeText={setJumlahPanen}
                                keyboardType="numeric"
                                placeholder="Masukkan jumlah panen"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Kualitas:</Text>
                            <TextInput
                                style={styles.input}
                                value={kualitas}
                                onChangeText={setKualitas}
                                placeholder="Contoh: Baik, Sangat Baik, Sedang"
                            />
                        </View>

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => {
                                    setPanenModalVisible(false);
                                    setKualitas("");
                                    setJumlahPanen("");
                                }}
                                disabled={processingPanen}
                            >
                                <Text style={styles.cancelButtonText}>Batal</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.modalButton, styles.confirmPanenButton]}
                                onPress={prosessPanen}
                                disabled={processingPanen}
                            >
                                {processingPanen ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={styles.saveButtonText}>Konfirmasi Panen</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Modal Panen Kandang */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={panenKandangModalVisible}
                onRequestClose={() => setPanenKandangModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.panenModalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Konfirmasi Panen Produksi</Text>
                            <TouchableOpacity
                                onPress={() => setPanenKandangModalVisible(false)}
                                style={styles.closeButton}
                            >
                                <X size={24} color="#333" />
                            </TouchableOpacity>
                        </View>

                        {selectedKandang && (
                            <View style={styles.panenModalInfo}>
                                <Text style={styles.panenModalInfoText}>
                                    Kandang: {selectedKandang.kandang.nm_kandang}
                                </Text>
                                <Text style={styles.panenModalInfoText}>
                                    Jenis: {selectedKandang.kandang.jenis_hewan}
                                </Text>
                                <Text style={styles.panenModalInfoText}>
                                    Produksi: {selectedKandang.kandang.Hasil_Produksi}
                                </Text>
                                <Text style={[styles.panenModalInfoText, { color: "#4CAF50", fontWeight: "600" }]}>
                                    ℹ️ Data kandang tetap tersimpan setelah panen
                                </Text>
                            </View>
                        )}

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Jumlah Produksi:</Text>
                            <TextInput
                                style={styles.input}
                                value={jumlahPanenKandang}
                                onChangeText={setJumlahPanenKandang}
                                keyboardType="numeric"
                                placeholder="Masukkan jumlah produksi"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Kualitas:</Text>
                            <TextInput
                                style={styles.input}
                                value={kualitasKandang}
                                onChangeText={setKualitasKandang}
                                placeholder="Contoh: Baik, Sangat Baik, Sedang"
                            />
                        </View>

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => {
                                    setPanenKandangModalVisible(false);
                                    setKualitasKandang("");
                                    setJumlahPanenKandang("");
                                }}
                                disabled={processingPanenKandang}
                            >
                                <Text style={styles.cancelButtonText}>Batal</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.modalButton, styles.confirmPanenButton]}
                                onPress={prosessPanenKandang}
                                disabled={processingPanenKandang}
                            >
                                {processingPanenKandang ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={styles.saveButtonText}>Konfirmasi Panen</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
    dateText: { fontSize: 16, fontWeight: "600", color: "#333" },
    statsCard: { backgroundColor: "#fff", marginHorizontal: 20, marginTop: 15, padding: 20, borderRadius: 12 },
    statsTitle: { fontSize: 16, fontWeight: "700", marginBottom: 15 },
    statsRow: { flexDirection: "row", justifyContent: "space-between", gap: 10 },
    statItem: { flex: 1, alignItems: "center" },
    statLabel: { fontSize: 12, color: "#666", textAlign: "center", marginBottom: 8 },
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
    itemContent: { flexDirection: "row", gap: 15, marginBottom: 12 },
    itemImageContainer: { width: 80, height: 80, borderRadius: 12, overflow: "hidden", backgroundColor: "#F5F5F5" },
    itemImage: { width: "100%", height: "100%" },
    itemImagePlaceholder: { flex: 1, justifyContent: "center", alignItems: "center" },
    itemInfo: { flex: 1, justifyContent: "center" },
    itemName: { fontSize: 16, fontWeight: "700", color: "#333", marginBottom: 4 },
    itemDetail: { fontSize: 12, marginTop: 2, color: "#666" },

    // Countdown Section
    countdownSection: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: "#E0E0E0",
    },
    progressSection: {
        marginBottom: 12,
    },
    dateInfo: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    countdownDateText: {
        fontSize: 12,
        color: "#666",
        marginLeft: 6,
    },
    progressHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    progressLabel: {
        fontSize: 13,
        fontWeight: "600",
        color: "#333",
    },
    progressPercentage: {
        fontSize: 12,
        fontWeight: "600",
        color: "#666",
    },
    progressBarContainer: {
        height: 8,
        backgroundColor: "#E0E0E0",
        borderRadius: 4,
        overflow: "hidden",
    },
    progressBar: {
        height: "100%",
        backgroundColor: "#2D2D2D",
        borderRadius: 4,
    },
    targetDate: {
        fontSize: 12,
        color: "#666",
        marginBottom: 10,
    },
    panenButton: {
        backgroundColor: "#4CAF50",
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 4,
    },
    panenButtonText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "700",
    },

    // Sensor Card Styles
    sensorCard: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 15,
        marginBottom: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
    },
    sensorInfoSection: {
        marginTop: 12,
        marginBottom: 15,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: "#E0E0E0"
    },
    sensorInfoRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 8
    },
    sensorInfoLabel: {
        fontSize: 13,
        color: "#666",
        fontWeight: "500"
    },
    sensorInfoValue: {
        fontSize: 13,
        color: "#333",
        fontWeight: "600"
    },
    sensorDataContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 10,
        marginTop: 12
    },
    sensorDataBox: {
        flex: 1,
        backgroundColor: "#F5F5F5",
        padding: 12,
        borderRadius: 10,
        alignItems: "center",
        gap: 6
    },
    sensorDataLabel: {
        fontSize: 11,
        color: "#666",
        fontWeight: "500",
        textAlign: "center"
    },
    sensorDataValue: {
        fontSize: 15,
        fontWeight: "700",
        color: "#333",
        textAlign: "center"
    },

    bottomNav: { flexDirection: "row", justifyContent: "space-evenly", backgroundColor: "#7CB342", paddingVertical: 15 },
    navItem: { padding: 10 },
    navItemActive: { backgroundColor: "#FFA726", borderRadius: 30 },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "flex-end",
    },
    modalContent: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: "85%",
        paddingBottom: 20,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#E0E0E0",
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#333",
    },
    closeButton: {
        padding: 5,
    },
    formContainer: {
        padding: 20,
        maxHeight: 400,
    },
    formTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#7CB342",
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: "#333",
        marginBottom: 8,
        marginTop: 12,
    },
    input: {
        backgroundColor: "#F5F5F5",
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        borderWidth: 1,
        borderColor: "#E0E0E0",
    },
    modalActions: {
        flexDirection: "row",
        gap: 10,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: "center",
    },
    cancelButton: {
        backgroundColor: "#E0E0E0",
    },
    cancelButtonText: {
        color: "#666",
        fontSize: 16,
        fontWeight: "600",
    },
    saveButton: {
        backgroundColor: "#7CB342",
    },
    saveButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },

    // Modal Panen Styles
    panenModalContent: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 20,
    },
    panenModalInfo: {
        backgroundColor: "#F5F5F5",
        padding: 15,
        marginHorizontal: 20,
        marginTop: 10,
        borderRadius: 10,
    },
    panenModalInfoText: {
        fontSize: 14,
        color: "#666",
        marginBottom: 5,
    },
    inputGroup: {
        paddingHorizontal: 20,
        marginTop: 15,
    },
    confirmPanenButton: {
        backgroundColor: "#4CAF50",
    },
});