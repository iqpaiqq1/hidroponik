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
                populasi: initialData.populasi || "",
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

    const fetchKandang = async () => {
        try {
            const response = await fetch(API_URLS.KANDANG);
            const result = await response.json();
            console.log("Data Kandang:", result);

            if (Array.isArray(result)) {
                setKandangList(result);
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
            const data = await response.json();
            setTanamanList(data);
        } catch (error) {
            console.error("Error fetching tanaman:", error);
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

        // Siapkan data untuk dikirim
        const dataToSend = {
            ...formData,
            id_tanaman: activeTab === "tanaman" ? formData.id_tanaman : null,
            id_kandang: activeTab === "ternak" ? formData.id_kandang : null,
        };

        onSubmit(dataToSend);
    };

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <Text style={styles.title}>
                            {initialData ? "Edit Data Sensor" : "Tambah Data Sensor"}
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
                                    onValueChange={(val) =>
                                        setFormData({ ...formData, id_kandang: val })
                                    }
                                    style={styles.input}
                                >
                                    <Picker.Item label="Pilih Kandang" value={null} />
                                    {kandangList.map((item) => (
                                        <Picker.Item
                                            key={item.id_kandang}
                                            label={`${item.nm_kandang} (${item.jenis_hewan || "N/A"})`}
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
                                    onValueChange={(val) =>
                                        setFormData({ ...formData, id_tanaman: val })
                                    }
                                    style={styles.input}
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

                        {/* Lokasi */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Lokasi *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Contoh: Kandang A1 / Rak A1"
                                value={formData.lokasi}
                                onChangeText={(val) =>
                                    setFormData({ ...formData, lokasi: val })
                                }
                            />
                        </View>

                        {/* Populasi */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Populasi *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Contoh: 250/300"
                                value={formData.populasi}
                                onChangeText={(val) =>
                                    setFormData({ ...formData, populasi: val })
                                }
                            />
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
                                    {initialData ? "Simpan" : "Tambah"}
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
});