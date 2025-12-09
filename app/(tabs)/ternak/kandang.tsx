import { Picker } from "@react-native-picker/picker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { API_URLS } from "../../api/apiConfig";
import MenuSidebar from "../sidebar";

type Kandang = {
    id_kandang: number;
    nm_kandang: string;
    kapasitas: number;
    jumlah_hewan: number;
    jenis_hewan: string;
    Hasil_Produksi: string;
    Jml_produksi: number;
    keterangan: string;
    tgl_produksi: string | null; // Format: YYYY-MM-DD
    lama_produksi: number; // Siklus produksi dalam hari
};

type CountdownData = {
    kandang: Kandang;
    daysRemaining: number;
    daysPassed: number;
    percentage: number;
    statusText: string;
    statusColor: string;
    isReadyForProduction: boolean;
};

// Data hewan dengan siklus produksi
const HEWAN_OPTIONS = [
    {
        nama: "Ayam Petelur",
        varietas: "Ayam Ras Petelur",
        lama_produksi: 21,
        siklus_produksi: 1,
        Hasil_Produksi: "Telur",
        min_produksi: 50,
        max_produksi: 200,
        satuan_produksi: "butir/hari",
        estimasi_produksi: "85-95%"
    },
    {
        nama: "Ayam Pedaging",
        varietas: "Ayam Broiler",
        lama_produksi: 35,
        siklus_produksi: 35,
        Hasil_Produksi: "Daging",
        min_produksi: 1,
        max_produksi: 3,
        satuan_produksi: "kg/ekor",
        estimasi_produksi: "2-3 kg/ekor"
    },
    {
        nama: "Lele",
        varietas: "Lele Sangkuriang",
        lama_produksi: 70,
        siklus_produksi: 70,
        Hasil_Produksi: "Ikan",
        min_produksi: 100,
        max_produksi: 500,
        satuan_produksi: "ekor",
        estimasi_produksi: "80-90% survival"
    },
    {
        nama: "Bebek Petelur",
        varietas: "Bebek Mojosari",
        lama_produksi: 22,
        siklus_produksi: 1,
        Hasil_Produksi: "Telur Bebek",
        min_produksi: 30,
        max_produksi: 100,
        satuan_produksi: "butir/hari",
        estimasi_produksi: "70-85%"
    },
    {
        nama: "Puyuh",
        varietas: "Puyuh Lokal",
        lama_produksi: 40,
        siklus_produksi: 1,
        Hasil_Produksi: "Telur Puyuh",
        min_produksi: 80,
        max_produksi: 150,
        satuan_produksi: "butir/hari",
        estimasi_produksi: "75-90%"
    },
    {
        nama: "Kambing",
        varietas: "Kambing Peranakan Etawa",
        lama_produksi: 180,
        siklus_produksi: 1,
        Hasil_Produksi: "Susu",
        min_produksi: 1,
        max_produksi: 3,
        satuan_produksi: "liter/hari",
        estimasi_produksi: "1-2 liter/hari"
    },
    {
        nama: "Sapi Perah",
        varietas: "Friesian Holstein",
        lama_produksi: 240,
        siklus_produksi: 1,
        Hasil_Produksi: "Susu Sapi",
        min_produksi: 15,
        max_produksi: 25,
        satuan_produksi: "liter/hari",
        estimasi_produksi: "15-20 liter/hari"
    },
    {
        nama: "Itik Pedaging",
        varietas: "Itik Mojosari",
        lama_produksi: 60,
        siklus_produksi: 60,
        Hasil_Produksi: "Daging Itik",
        min_produksi: 2,
        max_produksi: 4,
        satuan_produksi: "kg/ekor",
        estimasi_produksi: "2-4 kg/ekor"
    }
];

export default function KandangScreen() {
    const params = useLocalSearchParams();
    const gmail = (params.gmail as string) || "";
    const nama = (params.nama as string) || "";

    const [data, setData] = useState<Kandang[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [nmKandang, setNmKandang] = useState("");
    const [kapasitas, setKapasitas] = useState("");
    const [jumlahHewan, setJumlahHewan] = useState("");
    const [jenisHewan, setJenisHewan] = useState("");
    const [keterangan, setKeterangan] = useState("");
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    // ✅ Fungsi hitung berdasarkan tgl_produksi dan lama_produksi dari DB
    const calculateCountdown = (kandang: Kandang): CountdownData => {
        const hewanInfo = HEWAN_OPTIONS.find(h => h.nama === kandang.jenis_hewan);

        if (!hewanInfo) {
            return {
                kandang,
                daysRemaining: 0,
                daysPassed: 0,
                percentage: 100,
                statusText: "Jenis Tidak Dikenal",
                statusColor: "#FF6B6B",
                isReadyForProduction: false
            };
        }

        // Ambil lama_produksi dari database (jika ada), jika tidak gunakan dari HEWAN_OPTIONS
        const cycleLength = kandang.lama_produksi || hewanInfo.lama_produksi;

        // Hitung hari yang sudah berlalu sejak tgl_produksi
        let daysPassed = 0;
        if (kandang.tgl_produksi) {
            const startDate = new Date(kandang.tgl_produksi);
            const today = new Date();
            const diffTime = today.getTime() - startDate.getTime();
            daysPassed = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            daysPassed = Math.max(0, daysPassed); // Tidak boleh negatif
        }

        const daysRemaining = Math.max(0, cycleLength - daysPassed);
        const percentage = Math.min(100, Math.floor((daysPassed / cycleLength) * 100));

        let statusText = "";
        let statusColor = "";
        let isReadyForProduction = false;

        if (!kandang.tgl_produksi || daysPassed === 0) {
            statusText = "Baru Ditambahkan";
            statusColor = "#2196F3";
        } else if (daysRemaining > 7) {
            statusText = "Tumbuh";
            statusColor = "#2196F3";
        } else if (daysRemaining > 0 && daysRemaining <= 7) {
            statusText = "Segera Produksi";
            statusColor = "#FF9800";
        } else if (daysRemaining === 0 && daysPassed >= cycleLength) {
            statusText = "Siap Produksi";
            statusColor = "#4CAF50";
            isReadyForProduction = true;
        } else {
            statusText = "Dalam Produksi";
            statusColor = "#4CAF50";
            isReadyForProduction = true;
        }

        return {
            kandang,
            daysRemaining,
            daysPassed,
            percentage,
            statusText,
            statusColor,
            isReadyForProduction
        };
    };

    // ✅ Fungsi generate produksi otomatis
    const generateProduction = (kandang: Kandang): number => {
        const hewanInfo = HEWAN_OPTIONS.find(h => h.nama === kandang.jenis_hewan);
        if (!hewanInfo) return 0;

        let production = 0;

        switch (kandang.jenis_hewan) {
            case "Ayam Petelur":
            case "Bebek Petelur":
            case "Puyuh":
                const productionRate = 0.85;
                production = Math.floor(kandang.jumlah_hewan * productionRate);
                break;

            case "Ayam Pedaging":
                const avgWeight = 2.5;
                production = Math.floor(kandang.jumlah_hewan * avgWeight);
                break;

            case "Lele":
                const survivalRate = 0.85;
                production = Math.floor(kandang.jumlah_hewan * survivalRate);
                break;

            case "Kambing":
                production = Math.floor(kandang.jumlah_hewan * 1.5);
                break;

            case "Sapi Perah":
                production = Math.floor(kandang.jumlah_hewan * 18);
                break;

            case "Itik Pedaging":
                const avgWeightItik = 3;
                production = Math.floor(kandang.jumlah_hewan * avgWeightItik);
                break;

            default:
                production = 0;
        }

        return production;
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch(API_URLS.KANDANG);
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const json = await res.json();
            const kandangData = json.data || json;
            setData(Array.isArray(kandangData) ? kandangData : []);
        } catch (error) {
            console.error("Fetch error:", error);
            Alert.alert("Error", "Gagal mengambil data kandang");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSave = async () => {
        if (!nmKandang.trim()) {
            return Alert.alert("Error", "Nama kandang harus diisi");
        }
        if (!kapasitas || parseInt(kapasitas) <= 0) {
            return Alert.alert("Error", "Kapasitas harus lebih dari 0");
        }
        if (!jumlahHewan || parseInt(jumlahHewan) < 0) {
            return Alert.alert("Error", "Jumlah hewan tidak valid");
        }
        if (!jenisHewan) {
            return Alert.alert("Error", "Jenis hewan harus dipilih");
        }
        if (!keterangan.trim()) {
            return Alert.alert("Error", "Keterangan harus diisi");
        }
        if (parseInt(jumlahHewan) > parseInt(kapasitas)) {
            return Alert.alert("Error", "Jumlah hewan tidak boleh melebihi kapasitas");
        }

        const hewanInfo = HEWAN_OPTIONS.find(h => h.nama === jenisHewan);
        if (!hewanInfo) {
            return Alert.alert("Error", "Jenis hewan tidak valid");
        }

        setSaving(true);

        try {
            const method = selectedId ? "PUT" : "POST";
            const url = selectedId ? `${API_URLS.KANDANG}/${selectedId}` : API_URLS.KANDANG;

            // ✅ Get today's date in YYYY-MM-DD format (local timezone)
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            const todayString = `${year}-${month}-${day}`;

            // ✅ Untuk CREATE: SELALU kirim tgl_produksi & lama_produksi
            // ✅ Untuk UPDATE: tetap kirim lama_produksi untuk update jika jenis hewan berubah
            const payload = selectedId ? {
                nm_kandang: nmKandang.trim(),
                kapasitas: parseInt(kapasitas),
                jumlah_hewan: parseInt(jumlahHewan),
                jenis_hewan: jenisHewan,
                Hasil_Produksi: hewanInfo.Hasil_Produksi,
                lama_produksi: hewanInfo.lama_produksi,
                keterangan: keterangan.trim()
            } : {
                nm_kandang: nmKandang.trim(),
                kapasitas: parseInt(kapasitas),
                jumlah_hewan: parseInt(jumlahHewan),
                jenis_hewan: jenisHewan,
                Hasil_Produksi: hewanInfo.Hasil_Produksi,
                Jml_produksi: 0,
                lama_produksi: hewanInfo.lama_produksi,
                tgl_produksi: todayString,
                keterangan: keterangan.trim()
            };

            console.log("📤 Sending payload:", JSON.stringify(payload, null, 2));

            const res = await fetch(url, {
                method,
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload),
            });

            console.log("📥 Response status:", res.status);

            const contentType = res.headers.get("content-type") || "";
            let responseData: any = null;

            try {
                if (contentType.includes("application/json")) {
                    responseData = await res.json();
                } else {
                    responseData = await res.text();
                }
            } catch (err) {
                responseData = null;
            }

            console.log("📥 Response data:", responseData);

            if (res.ok) {
                Alert.alert("Sukses", selectedId ? "Data berhasil diupdate" : "Data berhasil ditambahkan");
                resetForm();
                fetchData();
            } else {
                const msg = responseData?.message || responseData || `Error ${res.status}`;
                throw new Error(msg);
            }
        } catch (error: any) {
            console.error("❌ Error detail:", error);
            Alert.alert("Error", error.message || "Gagal menyimpan data");
        } finally {
            setSaving(false);
        }
    };

    const resetForm = () => {
        setNmKandang("");
        setKapasitas("");
        setJumlahHewan("");
        setJenisHewan("");
        setKeterangan("");
        setSelectedId(null);
        setModalVisible(false);
        setSaving(false);
    };

    const handleEdit = (item: Kandang) => {
        setSelectedId(item.id_kandang);
        setNmKandang(item.nm_kandang);
        setKapasitas(item.kapasitas.toString());
        setJumlahHewan(item.jumlah_hewan.toString());
        setJenisHewan(item.jenis_hewan);
        setKeterangan(item.keterangan || "");
        setModalVisible(true);
    };

    const handleDelete = (id_kandang: number) => {
        Alert.alert(
            "Hapus Kandang",
            `Yakin ingin menghapus "${data.find(d => d.id_kandang === id_kandang)?.nm_kandang}"?`,
            [
                {
                    text: "Batal",
                    style: "cancel"
                },
                {
                    text: "Hapus",
                    style: "destructive",
                    onPress: () => deleteKandang(id_kandang)
                },
            ]
        );
    };

    const deleteKandang = async (id_kandang: number) => {
        try {
            setDeletingId(id_kandang);

            const response = await fetch(`${API_URLS.KANDANG}/${id_kandang}`, {
                method: "DELETE",
                headers: {
                    "Accept": "application/json"
                }
            });

            const contentType = response.headers.get("content-type") || "";
            let responseData: any = null;

            try {
                if (contentType.includes("application/json")) {
                    responseData = await response.json();
                } else {
                    responseData = await response.text();
                }
            } catch (err) {
                responseData = null;
            }

            if (response.ok) {
                Alert.alert("Sukses", "Data berhasil dihapus");
                fetchData();
            } else {
                const msg = responseData?.message || `Error ${response.status}`;
                Alert.alert("Error", `Gagal hapus: ${msg}`);
            }
        } catch (error: any) {
            Alert.alert("Error", "Gagal menghapus data: " + (error.message || "Unknown error"));
        } finally {
            setDeletingId(null);
        }
    };

    // ✅ Fungsi untuk update produksi (panen)
    const handleUpdateProduction = async (kandang: Kandang) => {
        const countdownData = calculateCountdown(kandang);

        if (!countdownData.isReadyForProduction) {
            Alert.alert("Info", "Hewan belum siap untuk produksi");
            return;
        }

        const newProduction = generateProduction(kandang);
        const hewanInfo = HEWAN_OPTIONS.find(h => h.nama === kandang.jenis_hewan);

        // Reset siklus: tgl_produksi = hari ini, Jml_produksi = hasil panen
        const payload = {
            Jml_produksi: newProduction,
            tgl_produksi: new Date().toISOString().split('T')[0] // Reset ke hari ini
        };

        try {
            const res = await fetch(`${API_URLS.KANDANG}/${kandang.id_kandang}`, {
                method: "PUT",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload),
            });

            const contentType = res.headers.get("content-type") || "";
            let responseData: any = null;

            try {
                if (contentType.includes("application/json")) {
                    responseData = await res.json();
                } else {
                    responseData = await res.text();
                }
            } catch (err) {
                responseData = null;
            }

            if (res.ok) {
                Alert.alert(
                    "Sukses",
                    `Produksi ${kandang.Hasil_Produksi} berhasil!\n\nHasil: ${newProduction} ${hewanInfo?.satuan_produksi}\n\nSiklus baru dimulai hari ini.`
                );
                fetchData();
            } else {
                const msg = responseData?.message || responseData || `Error ${res.status}`;
                throw new Error(msg);
            }
        } catch (error) {
            Alert.alert("Error", "Gagal mengupdate produksi");
        }
    };

    const getPercentage = (current: number, max: number) => {
        if (max === 0) return 0;
        return Math.round((current / max) * 100);
    };

    const getOvercrowdedItems = () => {
        return data.filter((item) => {
            const percentage = getPercentage(item.jumlah_hewan, item.kapasitas);
            return percentage >= 90;
        });
    };

    const renderWarningItem = (item: Kandang) => (
        <View style={styles.warningCard} key={item.id_kandang}>
            <View style={styles.warningIcon}>
                <Text style={styles.warningIconText}>⚠️</Text>
            </View>
            <Text style={styles.warningText}>
                {item.nm_kandang} penuh ({item.jumlah_hewan}/{item.kapasitas} {item.jenis_hewan})!
            </Text>
        </View>
    );

    const renderKandangItem = ({ item }: { item: Kandang }) => {
        const countdownData = calculateCountdown(item);
        const hewanInfo = HEWAN_OPTIONS.find(h => h.nama === item.jenis_hewan);
        const isDeleting = deletingId === item.id_kandang;
        const capacityPercentage = getPercentage(item.jumlah_hewan, item.kapasitas);

        return (
            <View style={[styles.kandangCard, isDeleting && styles.cardDeleting]}>
                <View style={styles.kandangHeader}>
                    <View style={styles.kandangInfo}>
                        <Text style={styles.kandangName}>{item.nm_kandang}</Text>
                        <Text style={styles.kandangJenis}>🐾 {item.jenis_hewan}</Text>
                        {hewanInfo && (
                            <Text style={styles.kandangVarietas}>{hewanInfo.varietas}</Text>
                        )}
                        <Text style={styles.kandangProduksi}>
                            📦 {item.Hasil_Produksi}: {item.Jml_produksi} {hewanInfo?.satuan_produksi}
                        </Text>
                        {item.tgl_produksi && (
                            <Text style={styles.kandangTglProduksi}>
                                📅 Mulai: {new Date(item.tgl_produksi).toLocaleDateString('id-ID')}
                            </Text>
                        )}
                        {item.keterangan && (
                            <Text style={styles.kandangKeterangan}>📝 {item.keterangan}</Text>
                        )}
                    </View>
                    <View style={styles.kandangStats}>
                        <TouchableOpacity
                            style={[styles.statusBadge, { backgroundColor: countdownData.statusColor }]}
                            onPress={() => handleUpdateProduction(item)}
                            disabled={!countdownData.isReadyForProduction}
                        >
                            <Text style={styles.statusText}>{countdownData.statusText}</Text>
                        </TouchableOpacity>
                        <Text style={styles.kandangAmount}>
                            {item.jumlah_hewan}/{item.kapasitas}
                        </Text>
                        <Text style={styles.kandangPercentage}>{capacityPercentage}% Terisi</Text>
                    </View>
                </View>

                {/* Progress Bar Kapasitas */}
                <View style={styles.progressBarContainer}>
                    <View
                        style={[
                            styles.progressBar,
                            {
                                width: `${Math.min(capacityPercentage, 100)}%`,
                                backgroundColor: capacityPercentage >= 90
                                    ? "#FF6B6B"
                                    : capacityPercentage >= 75
                                        ? "#FFA500"
                                        : "#1E3A3A",
                            },
                        ]}
                    />
                </View>

                {/* Countdown Progress */}
                <View style={styles.countdownSection}>
                    <View style={styles.countdownHeader}>
                        <Text style={styles.countdownLabel}>
                            {countdownData.daysRemaining > 0
                                ? `${countdownData.daysRemaining} Hari Menuju Produksi (${countdownData.daysPassed} hari berlalu)`
                                : "Siap Untuk Produksi"
                            }
                        </Text>
                        <Text style={styles.countdownPercentage}>{countdownData.percentage}%</Text>
                    </View>
                    <View style={styles.countdownProgressContainer}>
                        <View
                            style={[
                                styles.countdownProgressBar,
                                {
                                    width: `${Math.min(countdownData.percentage, 100)}%`,
                                    backgroundColor: countdownData.statusColor
                                },
                            ]}
                        />
                    </View>
                </View>

                {countdownData.isReadyForProduction && (
                    <TouchableOpacity
                        style={styles.productionButton}
                        onPress={() => handleUpdateProduction(item)}
                    >
                        <Text style={styles.productionButtonText}>🔄 Panen & Reset Siklus</Text>
                    </TouchableOpacity>
                )}

                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={[styles.editBtn, isDeleting && styles.btnDisabled]}
                        onPress={() => handleEdit(item)}
                        disabled={isDeleting}
                    >
                        <Text style={styles.btnIcon}>✏️</Text>
                        <Text style={styles.btnText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.deleteBtn, isDeleting && styles.btnDisabled]}
                        onPress={() => handleDelete(item.id_kandang)}
                        disabled={isDeleting}
                        activeOpacity={0.7}
                    >
                        {isDeleting ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <>
                                <Text style={styles.btnIcon}>🗑️</Text>
                                <Text style={styles.btnText}>Hapus</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const overcrowdedItems = getOvercrowdedItems();

    return (
        <View style={styles.mainContainer}>
            <MenuSidebar activeMenu="Ternak" gmail={gmail} nama={nama} />

            <View style={styles.container}>
                {/* Top Navigation Bar */}
                <View style={styles.topNavContainer}>
                    <TouchableOpacity style={[styles.navButton, styles.navButtonActive]}>
                        <Text style={[styles.navText, styles.navTextActive]}>Kandang</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.navButton}
                        onPress={() => router.push({
                            pathname: "/(tabs)/ternak/DataTernak" as any,
                            params: { gmail, nama },
                        })}
                    >
                        <Text style={styles.navText}>Inventori Pakan</Text>
                    </TouchableOpacity>
                </View>

                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Manajemen Kandang</Text>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => setModalVisible(true)}
                    >
                        <Text style={styles.addButtonText}>+ Tambah Kandang</Text>
                    </TouchableOpacity>
                </View>

                {/* Warning Cards */}
                {overcrowdedItems.length > 0 && (
                    <View style={styles.warningSection}>
                        {overcrowdedItems.map((item) => renderWarningItem(item))}
                    </View>
                )}

                {/* Data List */}
                {loading ? (
                    <ActivityIndicator size="large" color="#1E3A3A" style={styles.loader} />
                ) : data.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyStateText}>Belum ada data kandang</Text>
                        <Text style={styles.emptyStateSubtext}>
                            Tekan "Tambah Kandang" untuk menambahkan data pertama
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={data}
                        keyExtractor={(item) => item.id_kandang.toString()}
                        renderItem={renderKandangItem}
                        contentContainerStyle={styles.listContainer}
                        showsVerticalScrollIndicator={false}
                    />
                )}

                {/* Modal Form */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={resetForm}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>
                                {selectedId ? "Edit Data Kandang" : "Tambah Data Kandang"}
                            </Text>

                            <ScrollView
                                showsVerticalScrollIndicator={false}
                                style={styles.modalScrollView}
                            >
                                <Text style={styles.inputLabel}>Nama Kandang *</Text>
                                <TextInput
                                    placeholder="Masukkan nama kandang"
                                    style={styles.input}
                                    value={nmKandang}
                                    onChangeText={setNmKandang}
                                />

                                <Text style={styles.inputLabel}>Kapasitas Maksimal *</Text>
                                <TextInput
                                    placeholder="Masukkan kapasitas"
                                    style={styles.input}
                                    value={kapasitas}
                                    keyboardType="numeric"
                                    onChangeText={setKapasitas}
                                />

                                <Text style={styles.inputLabel}>Jumlah Hewan *</Text>
                                <TextInput
                                    placeholder="Masukkan jumlah hewan"
                                    style={styles.input}
                                    value={jumlahHewan}
                                    keyboardType="numeric"
                                    onChangeText={setJumlahHewan}
                                />

                                <Text style={styles.inputLabel}>Jenis Hewan *</Text>
                                <View style={styles.pickerContainer}>
                                    <Picker
                                        selectedValue={jenisHewan}
                                        onValueChange={(itemValue) => setJenisHewan(itemValue)}
                                        style={styles.picker}
                                    >
                                        <Picker.Item label="Pilih Jenis Hewan" value="" />
                                        {HEWAN_OPTIONS.map((hewan, index) => (
                                            <Picker.Item
                                                key={index}
                                                label={`${hewan.nama} - ${hewan.lama_produksi} hari`}
                                                value={hewan.nama}
                                            />
                                        ))}
                                    </Picker>
                                </View>

                                {jenisHewan && (
                                    <View style={styles.hewanInfo}>
                                        <Text style={styles.hewanInfoText}>
                                            Hasil Produksi: {HEWAN_OPTIONS.find(h => h.nama === jenisHewan)?.Hasil_Produksi}
                                        </Text>
                                        <Text style={styles.hewanInfoText}>
                                            Siklus: {HEWAN_OPTIONS.find(h => h.nama === jenisHewan)?.lama_produksi} hari
                                        </Text>
                                        <Text style={styles.hewanInfoText}>
                                            Estimasi: {HEWAN_OPTIONS.find(h => h.nama === jenisHewan)?.estimasi_produksi}
                                        </Text>
                                    </View>
                                )}

                                <Text style={styles.inputLabel}>Keterangan *</Text>
                                <TextInput
                                    placeholder="Masukkan keterangan tambahan"
                                    style={[styles.input, styles.textArea]}
                                    value={keterangan}
                                    onChangeText={setKeterangan}
                                    multiline
                                    numberOfLines={3}
                                />
                            </ScrollView>

                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={[styles.modalBtn, styles.cancelBtn]}
                                    onPress={resetForm}
                                    disabled={saving}
                                >
                                    <Text style={styles.cancelBtnText}>Batal</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.modalBtn, styles.saveBtn, saving && styles.btnDisabled]}
                                    onPress={handleSave}
                                    disabled={saving}
                                >
                                    {saving ? (
                                        <ActivityIndicator size="small" color="#fff" />
                                    ) : (
                                        <Text style={styles.saveBtnText}>
                                            {selectedId ? "Update" : "Simpan"}
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        flexDirection: "row",
        backgroundColor: "#E8F4F8",
    },
    container: {
        flex: 1,
        backgroundColor: "#E8F4F8",
        padding: 20,
    },
    topNavContainer: {
        flexDirection: "row",
        backgroundColor: "#1E3A3A",
        borderRadius: 35,
        padding: 5,
        marginBottom: 25,
        justifyContent: "space-between",
    },
    navButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 30,
        alignItems: "center",
        justifyContent: "center",
        marginHorizontal: 2,
    },
    navButtonActive: {
        backgroundColor: "#4A3A2A",
    },
    navText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "500",
        textAlign: "center",
    },
    navTextActive: {
        fontWeight: "600",
    },
    header: {
        backgroundColor: "white",
        padding: 20,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderRadius: 15,
        marginBottom: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#1E3A3A",
    },
    addButton: {
        backgroundColor: "#1E3A3A",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
    },
    addButtonText: {
        color: "white",
        fontWeight: "600",
        fontSize: 14,
    },
    warningSection: {
        marginBottom: 15,
    },
    warningCard: {
        backgroundColor: "#FFF4E6",
        borderLeftWidth: 4,
        borderLeftColor: "#FF9800",
        borderRadius: 8,
        padding: 12,
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    warningIcon: {
        marginRight: 10,
    },
    warningIconText: {
        fontSize: 20,
    },
    warningText: {
        color: "#E65100",
        fontSize: 14,
        fontWeight: "500",
        flex: 1,
    },
    listContainer: {
        paddingBottom: 15,
    },
    kandangCard: {
        backgroundColor: "white",
        borderRadius: 12,
        padding: 16,
        marginBottom: 15,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardDeleting: {
        opacity: 0.6,
    },
    kandangHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    kandangInfo: {
        flex: 1,
    },
    kandangName: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#1E3A3A",
        marginBottom: 4,
    },
    kandangJenis: {
        fontSize: 14,
        color: "#666",
        marginBottom: 2,
    },
    kandangVarietas: {
        fontSize: 12,
        color: "#888",
        marginBottom: 2,
        fontStyle: 'italic',
    },
    kandangProduksi: {
        fontSize: 14,
        color: "#666",
        marginBottom: 2,
    },
    kandangTglProduksi: {
        fontSize: 12,
        color: "#4CAF50",
        marginBottom: 2,
        fontWeight: "500",
    },
    kandangKeterangan: {
        fontSize: 12,
        color: "#999",
        fontStyle: "italic",
    },
    kandangStats: {
        alignItems: "flex-end",
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
        marginBottom: 5,
    },
    statusText: {
        color: "#fff",
        fontSize: 11,
        fontWeight: "600",
    },
    kandangAmount: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#1E3A3A",
    },
    kandangPercentage: {
        fontSize: 13,
        color: "#666",
        marginTop: 2,
    },
    progressBarContainer: {
        height: 8,
        backgroundColor: "#E0E0E0",
        borderRadius: 4,
        overflow: "hidden",
        marginBottom: 12,
    },
    progressBar: {
        height: "100%",
        borderRadius: 4,
    },
    countdownSection: {
        marginBottom: 12,
    },
    countdownHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    countdownLabel: {
        fontSize: 11,
        fontWeight: "600",
        color: "#333",
        flex: 1,
    },
    countdownPercentage: {
        fontSize: 12,
        fontWeight: "600",
        color: "#666",
    },
    countdownProgressContainer: {
        height: 6,
        backgroundColor: "#F0F0F0",
        borderRadius: 3,
        overflow: "hidden",
    },
    countdownProgressBar: {
        height: "100%",
        borderRadius: 3,
    },
    productionButton: {
        backgroundColor: "#4CAF50",
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 6,
        alignItems: "center",
        marginBottom: 12,
    },
    productionButtonText: {
        color: "white",
        fontSize: 13,
        fontWeight: "600",
    },
    actionButtons: {
        flexDirection: "row",
        justifyContent: "flex-end",
        gap: 10,
    },
    deleteBtn: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#DC3545",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 6,
        minWidth: 80,
        justifyContent: "center",
    },
    editBtn: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1E3A3A",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 6,
    },
    btnIcon: {
        marginRight: 4,
        fontSize: 14,
    },
    btnText: {
        color: "white",
        fontSize: 13,
        fontWeight: "600",
    },
    loader: {
        marginTop: 50,
    },
    emptyState: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 50,
    },
    emptyStateText: {
        fontSize: 16,
        color: "#666",
        marginBottom: 8,
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: "#999",
        textAlign: "center",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    modalContent: {
        backgroundColor: "white",
        borderRadius: 16,
        padding: 24,
        width: "100%",
        maxWidth: 400,
        maxHeight: "80%",
    },
    modalScrollView: {
        maxHeight: 500,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#1E3A3A",
        marginBottom: 20,
        textAlign: "center",
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: "#1E3A3A",
        marginBottom: 5,
        marginTop: 5,
    },
    input: {
        borderWidth: 1,
        borderColor: "#E0E0E0",
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        fontSize: 14,
        backgroundColor: "#fff",
    },
    textArea: {
        height: 80,
        textAlignVertical: "top",
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: "#E0E0E0",
        borderRadius: 8,
        marginBottom: 12,
        backgroundColor: "#fff",
        overflow: "hidden",
    },
    picker: {
        height: 50,
    },
    hewanInfo: {
        backgroundColor: "#F0F8FF",
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
        borderLeftWidth: 3,
        borderLeftColor: "#2196F3",
    },
    hewanInfoText: {
        fontSize: 12,
        color: "#1E3A3A",
        marginBottom: 4,
        fontWeight: "500",
    },
    modalButtons: {
        flexDirection: "row",
        gap: 10,
        marginTop: 10,
    },
    modalBtn: {
        flex: 1,
        padding: 14,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    cancelBtn: {
        backgroundColor: "#F5F5F5",
    },
    cancelBtnText: {
        color: "#757575",
        fontWeight: "600",
        fontSize: 15,
    },
    saveBtn: {
        backgroundColor: "#1E3A3A",
    },
    saveBtnText: {
        color: "white",
        fontWeight: "600",
        fontSize: 15,
    },
    btnDisabled: {
        opacity: 0.6,
    },
});