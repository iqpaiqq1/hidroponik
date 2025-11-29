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
import MenuSidebar from "../sidebar";
import { API_URLS } from "../../api/apiConfig";
import { Picker } from "@react-native-picker/picker";

type Kandang = {
    id_kandang: number;
    nm_kandang: string;
    kapasitas: number;
    jumlah_hewan: number;
    jenis_hewan: string;
    Hasil_Produksi: string;
    Jml_produksi: number;
    foto_hasil: string;
    keterangan: string;
};

// Dummy data untuk hewan sesuai dengan struktur database
const HEWAN_OPTIONS = [
    {
        nama: "Ayam Petelur",
        varietas: "Ayam Ras Petelur",
        lama_panen: "1–2 Hari",
        Hasil_Produksi: "Telur",
        min_produksi: 50,
        max_produksi: 200
    },
    {
        nama: "Ayam Pedaging",
        varietas: "Ayam Broiler",
        lama_panen: "30–40 Hari",
        Hasil_Produksi: "Daging",
        min_produksi: 1,
        max_produksi: 3
    },
    {
        nama: "Lele",
        varietas: "Lele Sangkuriang",
        lama_panen: "60–80 Hari",
        Hasil_Produksi: "Ikan",
        min_produksi: 100,
        max_produksi: 500
    },
    {
        nama: "Bebek Petelur",
        varietas: "Bebek Mojosari",
        lama_panen: "1–2 Hari",
        Hasil_Produksi: "Telur Bebek",
        min_produksi: 30,
        max_produksi: 100
    },
    {
        nama: "Puyuh",
        varietas: "Puyuh Lokal",
        lama_panen: "1–2 Hari",
        Hasil_Produksi: "Telur Puyuh",
        min_produksi: 80,
        max_produksi: 150
    },
    {
        nama: "Kambing",
        varietas: "Kambing Peranakan Etawa",
        lama_panen: "180–240 Hari",
        Hasil_Produksi: "Susu",
        min_produksi: 1,
        max_produksi: 3
    },
    {
        nama: "Sapi Perah",
        varietas: "Friesian Holstein",
        lama_panen: "1–2 Hari",
        Hasil_Produksi: "Susu Sapi",
        min_produksi: 15,
        max_produksi: 25
    },
    {
        nama: "Ikan Nila",
        varietas: "Nila Merah",
        lama_panen: "120–150 Hari",
        Hasil_Produksi: "Ikan",
        min_produksi: 80,
        max_produksi: 300
    },
    {
        nama: "Ikan Gurame",
        varietas: "Gurame Soang",
        lama_panen: "180–240 Hari",
        Hasil_Produksi: "Ikan",
        min_produksi: 20,
        max_produksi: 50
    },
    {
        nama: "tes",
        varietas: "tes",
        lama_panen: "0",
        Hasil_Produksi: "daging",
        min_produksi: 10,
        max_produksi: 20
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

    const fetchData = async () => {
        setLoading(true);
        try {
            console.log("Fetching from:", API_URLS.KANDANG);
            const res = await fetch(API_URLS.KANDANG);
            console.log("Fetch status:", res.status);

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const json = await res.json();
            console.log("Data received:", json);

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

        // Sesuaikan payload dengan struktur database dan controller
        const payload = {
            nm_kandang: nmKandang.trim(),
            kapasitas: parseInt(kapasitas),
            jumlah_hewan: parseInt(jumlahHewan),
            jenis_hewan: jenisHewan,
            Hasil_Produksi: hewanInfo.Hasil_Produksi, // Perhatikan huruf besar
            Jml_produksi: 0, // Mulai dari 0, sesuai dengan nullable di controller
            foto_hasil: "", // Default empty string
            keterangan: keterangan.trim()
        };

        console.log("Payload:", payload);
        setSaving(true);

        try {
            const method = selectedId ? "PUT" : "POST";
            const url = selectedId ? `${API_URLS.KANDANG}/${selectedId}` : API_URLS.KANDANG;

            console.log("Request:", method, url);

            const res = await fetch(url, {
                method,
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload),
            });

            console.log("Response status:", res.status);
            const responseData = await res.json();
            console.log("Response data:", responseData);

            if (res.ok) {
                Alert.alert("Sukses", selectedId ? "Data berhasil diupdate" : "Data berhasil ditambahkan");
                resetForm();
                fetchData();
            } else {
                throw new Error(responseData.message || `Error ${res.status}`);
            }
        } catch (error: any) {
            console.error("Error detail:", error);
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

    const handleDelete = async (id_kandang: number) => {
        Alert.alert(
            "Konfirmasi Hapus",
            "Apakah Anda yakin ingin menghapus kandang ini?",
            [
                { text: "Batal", style: "cancel" },
                {
                    text: "Hapus",
                    style: "destructive",
                    onPress: () => deleteKandang(id_kandang),
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
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
            });

            console.log("Delete response status:", response.status);
            const responseData = await response.json();
            console.log("Delete response data:", responseData);

            if (response.ok) {
                await fetchData();
                Alert.alert("Sukses", "Data berhasil dihapus");
            } else {
                throw new Error(responseData.message || `Error ${response.status}`);
            }
        } catch (error: any) {
            console.error("Delete error:", error);
            Alert.alert("Error", error.message || "Gagal menghapus data");
        } finally {
            setDeletingId(null);
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
        const percentage = getPercentage(item.jumlah_hewan, item.kapasitas);
        const isOvercrowded = percentage >= 90;
        const isAlmostFull = percentage >= 75 && percentage < 90;
        const isDeleting = deletingId === item.id_kandang;
        const hewanInfo = HEWAN_OPTIONS.find(h => h.nama === item.jenis_hewan);

        return (
            <View style={[styles.kandangCard, isDeleting && styles.cardDeleting]}>
                <View style={styles.kandangHeader}>
                    <View style={styles.kandangInfo}>
                        <Text style={styles.kandangName}>{item.nm_kandang}</Text>
                        <Text style={styles.kandangJenis}>🐾 {item.jenis_hewan}</Text>
                        {hewanInfo && (
                            <Text style={styles.kandangVarietas}>{hewanInfo.varietas}</Text>
                        )}
                        <Text style={styles.kandangProduksi}>📦 {item.Hasil_Produksi}: {item.Jml_produksi}</Text>
                        {item.keterangan && (
                            <Text style={styles.kandangKeterangan}>📝 {item.keterangan}</Text>
                        )}
                    </View>
                    <View style={styles.kandangStats}>
                        <Text style={styles.kandangAmount}>
                            {item.jumlah_hewan}/{item.kapasitas}
                        </Text>
                        <Text style={styles.kandangPercentage}>{percentage}% Terisi</Text>
                    </View>
                </View>

                <View style={styles.progressBarContainer}>
                    <View
                        style={[
                            styles.progressBar,
                            {
                                width: `${Math.min(percentage, 100)}%`,
                                backgroundColor: isOvercrowded
                                    ? "#FF6B6B"
                                    : isAlmostFull
                                        ? "#FFA500"
                                        : "#1E3A3A",
                            },
                        ]}
                    />
                </View>

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
                                                label={`${hewan.nama} - ${hewan.lama_panen}`}
                                                value={hewan.nama}
                                            />
                                        ))}
                                    </Picker>
                                </View>

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
    kandangKeterangan: {
        fontSize: 12,
        color: "#999",
        fontStyle: "italic",
    },
    kandangStats: {
        alignItems: "flex-end",
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