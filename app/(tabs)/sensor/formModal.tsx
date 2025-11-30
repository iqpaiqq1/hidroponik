import React, { useState, useEffect } from "react";
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Platform,
    ScrollView,
    Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { API_URLS } from "../../api/apiConfig";

// Data hewan dari KandangScreen
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
    }
];

type FormDataType = {
    id_tanaman?: number | null;
    id_kandang?: number | null;
    lokasi: string;
    populasi: string;
    suhu: number;
    kelembapan: number;
    produktivitas: number;
    status_kesehatan: string;
    waktu: string;
};

type FormModalProps = {
    visible: boolean;
    onClose: () => void;
    onSubmit: (data: FormDataType) => void;
    initialData?: any;
    selectedSensor?: any;
    activeTab: "ternak" | "tanaman";
};

const statusOptions = ["Sehat", "Perlu Perhatian"];

export default function FormModal({
    visible,
    onClose,
    onSubmit,
    initialData,
    selectedSensor,
    activeTab,
}: FormModalProps) {
    const [formData, setFormData] = useState<FormDataType>({
        id_tanaman: null,
        id_kandang: null,
        lokasi: "",
        populasi: "",
        suhu: 0,
        kelembapan: 0,
        produktivitas: 0,
        status_kesehatan: "Sehat",
        waktu: "",
    });

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [kandangList, setKandangList] = useState<any[]>([]);
    const [tanamanList, setTanamanList] = useState<any[]>([]);
    const [selectedKandangInfo, setSelectedKandangInfo] = useState<any>(null);
    const [selectedTanamanInfo, setSelectedTanamanInfo] = useState<any>(null);

    // Fetch data saat modal dibuka
    useEffect(() => {
        if (visible) {
            console.log("🔄 Modal dibuka, fetching data...");
            fetchKandang();
            fetchTanaman();
        }
    }, [visible]);

    // Reset atau isi form
    useEffect(() => {
        if (initialData) {
            console.log("✏️ Mode EDIT, data:", initialData);
            setFormData({
                id_tanaman: initialData.id_tanaman || null,
                id_kandang: initialData.id_kandang || null,
                lokasi: initialData.lokasi || "",
                populasi: initialData.populasi?.toString() || "",
                suhu: initialData.suhu || 0,
                kelembapan: initialData.kelembapan || 0,
                produktivitas: initialData.produktivitas || 0,
                status_kesehatan: initialData.status_kesehatan || "Sehat",
                waktu: initialData.waktu ? initialData.waktu.split("T")[0] : "",
            });
        } else {
            console.log("➕ Mode TAMBAH BARU");
            setFormData({
                id_tanaman: null,
                id_kandang: null,
                lokasi: "",
                populasi: "",
                suhu: 0,
                kelembapan: 0,
                produktivitas: 0,
                status_kesehatan: "Sehat",
                waktu: "",
            });
            setSelectedKandangInfo(null);
            setSelectedTanamanInfo(null);
        }
    }, [initialData, visible, activeTab]);

    const handleKandangChange = (id_kandang: number | null) => {
        console.log("🐄 ID Kandang dipilih:", id_kandang);
        
        if (id_kandang) {
            const selectedKandang = kandangList.find((item) => item.id_kandang == id_kandang);
            console.log("🎯 Kandang ditemukan:", selectedKandang);

            if (selectedKandang) {
                const hewanInfo = HEWAN_OPTIONS.find(h => h.nama === selectedKandang.jenis_hewan);

                setSelectedKandangInfo({
                    ...selectedKandang,
                    hewanInfo
                });

                const newFormData = {
                    ...formData,
                    id_kandang,
                    lokasi: selectedKandang.nm_kandang || "Kandang", // Isi dengan nama kandang
                    populasi: selectedKandang.jumlah_hewan?.toString() || "0",
                };

                console.log("✅ SETTING FORM DATA:", newFormData);
                setFormData(newFormData);
                
                Alert.alert(
                    "✓ Data Terisi",
                    `Populasi: ${newFormData.populasi} ekor ${selectedKandang.jenis_hewan}`
                );
            }
        } else {
            setSelectedKandangInfo(null);
            setFormData(prev => ({
                ...prev,
                id_kandang: null,
                lokasi: "",
                populasi: "",
            }));
        }
    };

    const handleTanamanChange = (id_tanaman: number | null) => {
        console.log("🌱 ID Tanaman dipilih:", id_tanaman);
        
        if (id_tanaman) {
            const selectedTanaman = tanamanList.find((item) => item.id_tanaman == id_tanaman);
            console.log("🎯 Tanaman ditemukan:", selectedTanaman);

            if (selectedTanaman) {
                setSelectedTanamanInfo(selectedTanaman);

                const newFormData = {
                    ...formData,
                    id_tanaman,
                    lokasi: selectedTanaman.lokasi || "",
                    populasi: selectedTanaman.jumlah?.toString() || "0",
                };

                console.log("✅ SETTING FORM DATA:", newFormData);
                setFormData(newFormData);
                
                Alert.alert(
                    "✓ Data Terisi",
                    `Lokasi: ${newFormData.lokasi}\nPopulasi: ${newFormData.populasi}`
                );
            }
        } else {
            setSelectedTanamanInfo(null);
            setFormData(prev => ({
                ...prev,
                id_tanaman: null,
                lokasi: "",
                populasi: "",
            }));
        }
    };

    const fetchKandang = async () => {
        try {
            console.log("📡 Fetching kandang...");
            const response = await fetch(API_URLS.KANDANG);
            const result = await response.json();
            const data = Array.isArray(result) ? result : (result.data || []);
            console.log("✅ Total kandang:", data.length);
            setKandangList(data);
        } catch (error) {
            console.error("❌ Gagal fetch kandang:", error);
            Alert.alert("Error", "Gagal mengambil data kandang");
            setKandangList([]);
        }
    };

    const fetchTanaman = async () => {
        try {
            console.log("📡 Fetching tanaman...");
            const response = await fetch(API_URLS.TANAMAN);
            const result = await response.json();
            const data = Array.isArray(result) ? result : (result.data || []);
            console.log("✅ Total tanaman:", data.length);
            setTanamanList(data);
        } catch (error) {
            console.error("❌ Error fetching tanaman:", error);
            Alert.alert("Error", "Gagal mengambil data tanaman");
            setTanamanList([]);
        }
    };

    const handleDateChange = (event: any, selectedDate?: Date | undefined) => {
        if (Platform.OS !== "web") setShowDatePicker(false);
        if (selectedDate) {
            const formatted = selectedDate.toISOString().split("T")[0];
            setFormData({ ...formData, waktu: formatted });
        }
    };

    const handleSubmit = () => {
        console.log("💾 Submit form data:", formData);
        
        // Untuk kandang, pastikan lokasi ada (isi dengan nama kandang)
        if (activeTab === "ternak" && !formData.lokasi.trim()) {
            const kandang = kandangList.find(k => k.id_kandang == formData.id_kandang);
            if (kandang) {
                formData.lokasi = kandang.nm_kandang;
            }
        }
        
        // Validasi lokasi untuk tanaman
        if (activeTab === "tanaman" && !formData.lokasi.trim()) {
            Alert.alert("Error", "Lokasi harus diisi!");
            return;
        }

        if (!formData.populasi.trim()) {
            Alert.alert("Error", "Populasi harus diisi!");
            return;
        }

        if (!formData.waktu) {
            Alert.alert("Error", "Waktu harus diisi!");
            return;
        }

        if (activeTab === "ternak" && !formData.id_kandang) {
            Alert.alert("Error", "Pilih kandang terlebih dahulu!");
            return;
        }

        if (activeTab === "tanaman" && !formData.id_tanaman) {
            Alert.alert("Error", "Pilih tanaman terlebih dahulu!");
            return;
        }

        const dataToSend = {
            ...formData,
            populasi: formData.populasi,
            lokasi: formData.lokasi || (activeTab === "ternak" ? "Kandang" : ""), // Fallback
            id_tanaman: activeTab === "tanaman" ? formData.id_tanaman : null,
            id_kandang: activeTab === "ternak" ? formData.id_kandang : null,
        };

        console.log("📤 Data yang akan dikirim:", dataToSend);
        onSubmit(dataToSend);
    };

    const isEditMode = !!initialData;

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <Text style={styles.title}>
                            {isEditMode ? "Edit Data Sensor" : "Tambah Data Sensor"}
                        </Text>
                        <Text style={styles.subtitle}>
                            Mode: {activeTab === "ternak" ? "🐄 Kandang" : "🌱 Tanaman"}
                        </Text>

                        {/* DEBUG INFO */}
                        <View style={styles.debugBox}>
                            <Text style={styles.debugText}>
                                📊 {activeTab === "ternak" ? `${kandangList.length} kandang` : `${tanamanList.length} tanaman`} tersedia
                            </Text>
                        </View>

                        {/* ========== KANDANG ========== */}
                        {activeTab === "ternak" && (
                            <>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Pilih Kandang *</Text>
                                    <Picker
                                        selectedValue={formData.id_kandang}
                                        onValueChange={handleKandangChange}
                                        style={styles.input}
                                        enabled={!isEditMode}
                                    >
                                        <Picker.Item label="-- Pilih Kandang --" value={null} />
                                        {kandangList.map((item) => (
                                            <Picker.Item
                                                key={item.id_kandang}
                                                label={`${item.nm_kandang} - ${item.jenis_hewan} (${item.jumlah_hewan})`}
                                                value={item.id_kandang}
                                            />
                                        ))}
                                    </Picker>
                                </View>

                                {selectedKandangInfo && (
                                    <View style={styles.infoBox}>
                                        <Text style={styles.infoTitle}>📋 Detail Kandang</Text>
                                        <Text style={styles.infoText}>🏠 Nama: {selectedKandangInfo.nm_kandang}</Text>
                                        <Text style={styles.infoText}>🐾 Jenis: {selectedKandangInfo.jenis_hewan}</Text>
                                        {selectedKandangInfo.hewanInfo && (
                                            <>
                                                <Text style={styles.infoText}>🧬 Varietas: {selectedKandangInfo.hewanInfo.varietas}</Text>
                                                <Text style={styles.infoText}>📦 Hasil: {selectedKandangInfo.hewanInfo.Hasil_Produksi}</Text>
                                                <Text style={styles.infoText}>📊 Estimasi: {selectedKandangInfo.hewanInfo.estimasi_produksi}</Text>
                                                <Text style={styles.infoText}>⏱️ Lama Produksi: {selectedKandangInfo.hewanInfo.lama_produksi} hari</Text>
                                            </>
                                        )}
                                        <Text style={styles.infoText}>👥 Populasi: {selectedKandangInfo.jumlah_hewan} / {selectedKandangInfo.kapasitas}</Text>
                                    </View>
                                )}
                            </>
                        )}

                        {/* ========== TANAMAN ========== */}
                        {activeTab === "tanaman" && (
                            <>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Pilih Tanaman *</Text>
                                    <Picker
                                        selectedValue={formData.id_tanaman}
                                        onValueChange={handleTanamanChange}
                                        style={styles.input}
                                        enabled={!isEditMode}
                                    >
                                        <Picker.Item label="-- Pilih Tanaman --" value={null} />
                                        {tanamanList.map((item) => (
                                            <Picker.Item
                                                key={item.id_tanaman}
                                                label={`${item.nm_tanaman} - ${item.varietas} (${item.jumlah})`}
                                                value={item.id_tanaman}
                                            />
                                        ))}
                                    </Picker>
                                </View>

                                {selectedTanamanInfo && (
                                    <View style={styles.infoBox}>
                                        <Text style={styles.infoTitle}>📋 Detail Tanaman</Text>
                                        <Text style={styles.infoText}>🌱 Nama: {selectedTanamanInfo.nm_tanaman}</Text>
                                        <Text style={styles.infoText}>🧬 Varietas: {selectedTanamanInfo.varietas}</Text>
                                        <Text style={styles.infoText}>📍 Lokasi: {selectedTanamanInfo.lokasi}</Text>
                                        <Text style={styles.infoText}>👥 Jumlah: {selectedTanamanInfo.jumlah} Tanaman</Text>
                                        <Text style={styles.infoText}>📅 Tanggal Tanam: {selectedTanamanInfo.tgl_tanam}</Text>
                                        <Text style={styles.infoText}>⏱️ Lama Panen: {selectedTanamanInfo.lama_panen}</Text>
                                        <Text style={styles.infoText}>💚 Status: {selectedTanamanInfo.status}</Text>
                                    </View>
                                )}
                            </>
                        )}

                        {/* ========== LOKASI (HANYA TANAMAN) ========== */}
                        {activeTab === "tanaman" && (
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Lokasi *</Text>
                                <TextInput
                                    style={[styles.input, formData.lokasi && styles.inputAutoFilled]}
                                    value={formData.lokasi}
                                    placeholder="Akan terisi otomatis..."
                                    editable={false}
                                />
                                {formData.lokasi && (
                                    <Text style={styles.autoFillText}>✓ Terisi otomatis</Text>
                                )}
                            </View>
                        )}

                        {/* ========== POPULASI ========== */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>
                                Populasi {activeTab === "ternak" ? "(Jumlah Hewan)" : "(Jumlah Tanaman)"} *
                            </Text>
                            <TextInput
                                style={[styles.input, formData.populasi && styles.inputAutoFilled]}
                                placeholder="Akan terisi otomatis..."
                                keyboardType="numeric"
                                value={formData.populasi}
                                editable={false}
                            />
                            {formData.populasi && (
                                <Text style={styles.autoFillText}>✓ Terisi otomatis</Text>
                            )}
                        </View>

                        {/* Suhu */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Suhu (°C) *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Contoh: 24"
                                keyboardType="numeric"
                                value={formData.suhu?.toString() || ""}
                                onChangeText={(val) =>
                                    setFormData({ ...formData, suhu: parseFloat(val) || 0 })
                                }
                            />
                        </View>

                        {/* Kelembapan */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Kelembapan (%) *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Contoh: 65"
                                keyboardType="numeric"
                                value={formData.kelembapan?.toString() || ""}
                                onChangeText={(val) =>
                                    setFormData({ ...formData, kelembapan: parseFloat(val) || 0 })
                                }
                            />
                        </View>

                        {/* Produktivitas */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Produktivitas (%) *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Contoh: 89"
                                keyboardType="numeric"
                                value={formData.produktivitas?.toString() || ""}
                                onChangeText={(val) =>
                                    setFormData({ ...formData, produktivitas: parseFloat(val) || 0 })
                                }
                            />
                        </View>

                        {/* Status Kesehatan */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Status Kesehatan *</Text>
                            <Picker
                                selectedValue={formData.status_kesehatan}
                                onValueChange={(val) =>
                                    setFormData({ ...formData, status_kesehatan: val })
                                }
                                style={styles.input}
                            >
                                {statusOptions.map((s) => (
                                    <Picker.Item key={s} label={s} value={s} />
                                ))}
                            </Picker>
                        </View>

                        {/* Waktu */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Tanggal & Waktu *</Text>
                            {Platform.OS === "web" ? (
                                <input
                                    type="date"
                                    value={formData.waktu}
                                    onChange={(e) => {
                                        setFormData({ ...formData, waktu: e.target.value });
                                    }}
                                    style={{
                                        borderWidth: 1,
                                        borderColor: "#ccc",
                                        borderRadius: 8,
                                        padding: 10,
                                        width: "100%",
                                    }}
                                />
                            ) : (
                                <>
                                    <TouchableOpacity
                                        onPress={() => setShowDatePicker(true)}
                                        style={styles.dateInput}
                                    >
                                        <Text>{formData.waktu ? formData.waktu : "Pilih Tanggal"}</Text>
                                    </TouchableOpacity>
                                    {showDatePicker && (
                                        <DateTimePicker
                                            value={formData.waktu ? new Date(formData.waktu) : new Date()}
                                            mode="date"
                                            display="default"
                                            onChange={handleDateChange}
                                        />
                                    )}
                                </>
                            )}
                        </View>

                        <View style={styles.buttons}>
                            <TouchableOpacity style={styles.saveBtn} onPress={handleSubmit}>
                                <Text style={styles.saveText}>
                                    {isEditMode ? "💾 Simpan" : "➕ Tambah"}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                                <Text style={styles.cancelText}>❌ Batal</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#0008",
    },
    modal: {
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 12,
        width: "90%",
        maxWidth: 500,
        maxHeight: "90%",
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 5,
        color: "#333",
    },
    subtitle: {
        fontSize: 14,
        color: "#666",
        marginBottom: 15,
    },
    debugBox: {
        backgroundColor: "#f0f0f0",
        padding: 8,
        borderRadius: 5,
        marginBottom: 15,
    },
    debugText: {
        fontSize: 12,
        color: "#666",
    },
    inputGroup: {
        marginBottom: 15,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: "#333",
        marginBottom: 5,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 10,
        fontSize: 14,
        backgroundColor: "#fff",
    },
    inputAutoFilled: {
        backgroundColor: "#e8f5e9",
        borderColor: "#4CAF50",
    },
    dateInput: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 12,
        backgroundColor: "#fff",
    },
    infoBox: {
        backgroundColor: "#f0f8ff",
        borderLeftWidth: 4,
        borderLeftColor: "#4A7C2C",
        borderRadius: 8,
        padding: 12,
        marginBottom: 15,
    },
    infoTitle: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 8,
    },
    infoText: {
        fontSize: 13,
        color: "#555",
        marginBottom: 4,
    },
    autoFillText: {
        fontSize: 12,
        color: "#4CAF50",
        marginTop: 4,
        fontStyle: "italic",
    },
    buttons: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20,
        gap: 10,
    },
    saveBtn: {
        backgroundColor: "#4A7C2C",
        padding: 12,
        borderRadius: 8,
        flex: 1,
        alignItems: "center",
    },
    cancelBtn: {
        backgroundColor: "#ccc",
        padding: 12,
        borderRadius: 8,
        flex: 1,
        alignItems: "center",
    },
    saveText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 14,
    },
    cancelText: {
        color: "#333",
        fontWeight: "600",
        fontSize: 14,
    },
});