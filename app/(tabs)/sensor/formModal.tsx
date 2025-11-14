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
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { API_URLS } from "../../api/apiConfig";

type FormDataType = {
    id_tanaman?: number | null;
    id_kandang?: number | null;
    lokasi: string;
    populasi: string | number;
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

    // Fetch daftar kandang dan tanaman
    useEffect(() => {
        fetchKandang();
        fetchTanaman();
    }, []);

    // Reset atau isi form
    useEffect(() => {
        if (initialData) {
            // Mode edit
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
            // Mode tambah - reset form
            setFormData({
                id_tanaman: activeTab === "tanaman" ? null : null,
                id_kandang: activeTab === "ternak" ? null : null,
                lokasi: "",
                populasi: "",
                suhu: 0,
                kelembapan: 0,
                produktivitas: 0,
                status_kesehatan: "Sehat",
                waktu: "",
            });
        }
    }, [initialData, visible, activeTab]);

    // Auto-fill ketika pilih kandang
    const handleKandangChange = (id_kandang: number | null) => {
        if (id_kandang) {
            const selectedKandang = kandangList.find(
                (item) => item.id_kandang === id_kandang
            );

            if (selectedKandang) {
                setFormData(prev => ({
                    ...prev,
                    id_kandang,
                    lokasi: selectedKandang.lokasi || "",
                    populasi: selectedKandang.populasi?.toString() || "",
                    // Bisa tambah field lain yang mau di auto-fill
                    // suhu: selectedKandang.suhu_optimal || prev.suhu,
                    // kelembapan: selectedKandang.kelembapan_optimal || prev.kelembapan,
                }));
            }
        } else {
            // Reset kalau pilih "Pilih Kandang"
            setFormData(prev => ({
                ...prev,
                id_kandang: null,
                lokasi: "",
                populasi: "",
            }));
        }
    };

    // Auto-fill ketika pilih tanaman
    const handleTanamanChange = (id_tanaman: number | null) => {
        if (id_tanaman) {
            const selectedTanaman = tanamanList.find(
                (item) => item.id_tanaman === id_tanaman
            );

            if (selectedTanaman) {
                setFormData(prev => ({
                    ...prev,
                    id_tanaman,
                    lokasi: selectedTanaman.lokasi || "",
                    populasi: selectedTanaman.populasi?.toString() || "",
                    // Bisa tambah field lain yang mau di auto-fill
                    // suhu: selectedTanaman.suhu_optimal || prev.suhu,
                    // kelembapan: selectedTanaman.kelembapan_optimal || prev.kelembapan,
                }));
            }
        } else {
            // Reset kalau pilih "Pilih Tanaman"
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
            const response = await fetch(API_URLS.KANDANG);
            const result = await response.json();
            console.log("Data Kandang:", result);

            if (Array.isArray(result)) {
                setKandangList(result);
            } else if (result.data && Array.isArray(result.data)) {
                setKandangList(result.data);
            } else {
                console.warn("Format data tidak sesuai:", result);
                setKandangList([]);
            }
        } catch (error) {
            console.error("Gagal fetch kandang:", error);
            setKandangList([]);
        }
    };

    const fetchTanaman = async () => {
        try {
            const response = await fetch(API_URLS.TANAMAN);
            const result = await response.json();
            console.log("Data Tanaman:", result);

            if (Array.isArray(result)) {
                setTanamanList(result);
            } else if (result.data && Array.isArray(result.data)) {
                setTanamanList(result.data);
            } else {
                console.warn("Format data tanaman tidak sesuai:", result);
                setTanamanList([]);
            }
        } catch (error) {
            console.error("Error fetching tanaman:", error);
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
        // Validasi
        if (!formData.lokasi.trim()) {
            alert("Lokasi harus diisi!");
            return;
        }

        if (!formData.populasi.trim()) {
            alert("Populasi harus diisi!");
            return;
        }

        if (!formData.waktu) {
            alert("Waktu harus diisi!");
            return;
        }

        // Validasi: harus ada salah satu id_tanaman atau id_kandang
        if (activeTab === "ternak" && !formData.id_kandang) {
            alert("Pilih kandang terlebih dahulu!");
            return;
        }

        if (activeTab === "tanaman" && !formData.id_tanaman) {
            alert("Pilih tanaman terlebih dahulu!");
            return;
        }

        // Konversi populasi ke number
        const dataToSend = {
            ...formData,
            populasi: parseInt(formData.populasi) || 0,
        
            id_tanaman: activeTab === "tanaman" ? formData.id_tanaman : null,
            id_kandang: activeTab === "ternak" ? formData.id_kandang : null,
        };

        onSubmit(dataToSend);
    };

    // Check apakah form dalam mode edit
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
                            Mode: {activeTab === "ternak" ? "Kandang" : "Tanaman"}
                        </Text>

                        {/* Pilih Kandang atau Tanaman */}
                        {activeTab === "ternak" ? (
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Kandang *</Text>
                                <Picker
                                    selectedValue={formData.id_kandang}
                                    onValueChange={handleKandangChange}
                                    style={styles.input}
                                    enabled={!isEditMode} // Disable edit di mode edit
                                >
                                    <Picker.Item label="Pilih Kandang" value={null} />
                                    {kandangList.map((item) => (
                                        <Picker.Item
                                            key={item.id_kandang}
                                            label={`${item.nm_kandang || 'Kandang'} - ${item.lokasi}`}
                                            value={item.id_kandang}
                                        />
                                    ))}
                                </Picker>
                            </View>
                        ) : (
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Tanaman *</Text>
                                <Picker
                                    selectedValue={formData.id_tanaman}
                                    onValueChange={handleTanamanChange}
                                    style={styles.input}
                                    enabled={!isEditMode} // Disable edit di mode edit
                                >
                                    <Picker.Item label="Pilih Tanaman" value={null} />
                                    {tanamanList.map((item) => (
                                        <Picker.Item
                                            key={item.id_tanaman}
                                            label={`${item.nm_tanaman} - ${item.varietas}`}
                                            value={item.id_tanaman}
                                        />
                                    ))}
                                </Picker>
                            </View>
                        )}

                        {/* Lokasi - Auto filled */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Lokasi *</Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    {
                                        backgroundColor: formData.lokasi ? "#f0f8ff" : "#fff",
                                        color: formData.lokasi ? "#0066cc" : "#000"
                                    }
                                ]}
                                value={formData.lokasi}
                                placeholder="Akan terisi otomatis..."
                                editable={!formData.lokasi} // Bisa edit kalau belum ke-isi
                                onChangeText={(text) => setFormData({ ...formData, lokasi: text })}
                            />
                            {formData.lokasi && (
                                <Text style={styles.autoFillText}>✓ Terisi otomatis</Text>
                            )}
                        </View>

                        {/* Populasi - Auto filled */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Populasi *</Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    {
                                        backgroundColor: formData.populasi ? "#f0fff0" : "#fff",
                                        color: formData.populasi ? "#228b22" : "#000"
                                    }
                                ]}
                                placeholder="Akan terisi otomatis..."
                                keyboardType="numeric"
                                value={formData.populasi}
                                editable={!formData.populasi} // Bisa edit kalau belum ke-isi
                                onChangeText={(text) => setFormData({ ...formData, populasi: text })}
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
                                    setFormData({
                                        ...formData,
                                        suhu: parseFloat(val) || 0,
                                    })
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
                                    setFormData({
                                        ...formData,
                                        kelembapan: parseFloat(val) || 0,
                                    })
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
                                    setFormData({
                                        ...formData,
                                        produktivitas: parseFloat(val) || 0,
                                    })
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
                                        <Text>
                                            {formData.waktu
                                                ? formData.waktu
                                                : "Pilih Tanggal"}
                                        </Text>
                                    </TouchableOpacity>
                                    {showDatePicker && (
                                        <DateTimePicker
                                            value={
                                                formData.waktu
                                                    ? new Date(formData.waktu)
                                                    : new Date()
                                            }
                                            mode="date"
                                            display="default"
                                            onChange={handleDateChange}
                                        />
                                    )}
                                </>
                            )}
                        </View>

                        <View style={styles.buttons}>
                            <TouchableOpacity
                                style={styles.saveBtn}
                                onPress={handleSubmit}
                            >
                                <Text style={styles.saveText}>
                                    {isEditMode ? "Simpan" : "Tambah"}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                                <Text style={styles.cancelText}>Batal</Text>
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
        marginBottom: 20,
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
    dateInput: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 12,
        backgroundColor: "#fff",
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
    autoFillText: {
        fontSize: 12,
        color: "#4A7C2C",
        marginTop: 4,
        fontStyle: "italic",
    },
});