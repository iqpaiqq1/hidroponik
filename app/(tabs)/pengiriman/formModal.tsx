import React, { useEffect, useState } from "react";
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { API_URLS } from "../../api/apiConfig";

interface Pengiriman {
    id_pengiriman?: number;
    id_supply?: string;
    id_panen?: string;
    tgl_pengiriman?: string;
    tujuan?: string;
    jumlah_dikirim?: string;
    status_pengiriman?: "pending" | "selesai";
    id_kurir?: string;
    keterangan?: string;
}

interface FormModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: () => void;
    selectedItem?: Pengiriman | null;
}

const FormModal: React.FC<FormModalProps> = ({
    visible,
    onClose,
    onSubmit,
    selectedItem,
}) => {
    const [formData, setFormData] = useState<Pengiriman>({
        id_supply: "",
        id_panen: "",
        tgl_pengiriman: "",
        tujuan: "",
        jumlah_dikirim: "",
        status_pengiriman: "pending",
        id_kurir: "",
        keterangan: "",
    });

    useEffect(() => {
        if (selectedItem) {
            setFormData(selectedItem);
        } else {
            setFormData({
                id_supply: "",
                id_panen: "",
                tgl_pengiriman: "",
                tujuan: "",
                jumlah_dikirim: "",
                status_pengiriman: "pending",
                id_kurir: "",
                keterangan: "",
            });
        }
    }, [selectedItem]);

    const handleChange = (key: keyof Pengiriman, value: string) => {
        setFormData({ ...formData, [key]: value });
    };

    const handleSubmit = async () => {
        console.log("=== SUBMIT CLICKED ===");
        console.log("Form Data:", formData);

        // Validasi
        if (
            !formData.tgl_pengiriman ||
            !formData.tujuan ||
            !formData.jumlah_dikirim
        ) {
            console.log("Validasi gagal - field kosong");
            Alert.alert("Peringatan", "Harap isi semua data yang wajib diisi!");
            return;
        }

        try {
            const method = selectedItem ? "PUT" : "POST";
            const url = selectedItem
                ? `${API_URLS.PENGIRIMAN}/${selectedItem.id_pengiriman}`
                : API_URLS.PENGIRIMAN;

            console.log("Method:", method);
            console.log("URL:", url);
            console.log("Body:", JSON.stringify(formData));

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            console.log("Response status:", response.status);
            const responseData = await response.text();
            console.log("Response data:", responseData);

            if (response.ok) {
                Alert.alert(
                    "Sukses",
                    selectedItem
                        ? "Data pengiriman berhasil diperbarui!"
                        : "Data pengiriman berhasil ditambahkan!"
                );
                onSubmit(); // Refresh data
                onClose(); // Tutup modal
            } else {
                Alert.alert("Gagal", `Terjadi kesalahan: ${responseData}`);
            }
        } catch (error) {
            console.error("Error:", error);
            Alert.alert("Error", `Tidak dapat terhubung ke server: ${error}`);
        }
    };

    const handleDelete = async () => {
        if (!selectedItem?.id_pengiriman) return;
        Alert.alert(
            "Konfirmasi",
            "Apakah kamu yakin ingin menghapus data ini?",
            [
                { text: "Batal", style: "cancel" },
                {
                    text: "Hapus",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const response = await fetch(
                                `${API_URLS.PENGIRIMAN}/${selectedItem.id_pengiriman}`,
                                { method: "DELETE" }
                            );
                            if (response.ok) {
                                Alert.alert("Sukses", "Data berhasil dihapus!");
                                onSubmit();
                                onClose();
                            } else {
                                Alert.alert("Gagal", "Tidak dapat menghapus data!");
                            }
                        } catch (error) {
                            Alert.alert("Error", "Terjadi kesalahan koneksi server!");
                        }
                    },
                },
            ]
        );
    };

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <Text style={styles.title}>
                        {selectedItem ? "Edit Pengiriman" : "Tambah Pengiriman"}
                    </Text>
                    <Text style={styles.subtitle}>Isi Lengkap Data</Text>

                    {/* Input Fields */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Tanggal *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="dd/mm/yyyy"
                            value={formData.tgl_pengiriman}
                            onChangeText={(v) => handleChange("tgl_pengiriman", v)}
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Jumlah *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Contoh: 5 Box"
                            value={formData.jumlah_dikirim}
                            onChangeText={(v) => handleChange("jumlah_dikirim", v)}
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Tujuan *</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Alamat tujuan..."
                            multiline
                            value={formData.tujuan}
                            onChangeText={(v) => handleChange("tujuan", v)}
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Status *</Text>
                        <View style={styles.pickerWrapper}>
                            <Picker
                                selectedValue={formData.status_pengiriman}
                                onValueChange={(v) =>
                                    handleChange("status_pengiriman", v as "pending" | "selesai")
                                }
                            >
                                <Picker.Item label="Pending" value="pending" />
                                <Picker.Item label="Selesai" value="selesai" />
                            </Picker>
                        </View>
                    </View>

                    {/* Buttons */}
                    <View style={styles.buttonRow}>
                        {selectedItem && (
                            <TouchableOpacity
                                style={[styles.button, styles.deleteButton]}
                                onPress={handleDelete}
                            >
                                <Text style={styles.buttonText}>Hapus</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            style={[styles.button, styles.saveButton]}
                            onPress={handleSubmit}
                        >
                            <Text style={styles.buttonText}>
                                {selectedItem ? "Simpan" : "Tambah"}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={onClose}
                        >
                            <Text style={[styles.buttonText, { color: "#000" }]}>Batal</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default FormModal;

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContainer: {
        backgroundColor: "#fff",
        width: "85%",
        borderRadius: 15,
        padding: 20,
        elevation: 5,
    },
    title: {
        fontSize: 18,
        fontWeight: "700",
        color: "#000",
    },
    subtitle: {
        fontSize: 14,
        color: "#666",
        marginBottom: 15,
    },
    formGroup: {
        marginBottom: 12,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: "#333",
        marginBottom: 6,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 10,
        fontSize: 14,
        color: "#333",
    },
    textArea: {
        height: 70,
        textAlignVertical: "top",
    },
    pickerWrapper: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
    },
    buttonRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20,
    },
    button: {
        flex: 1,
        alignItems: "center",
        paddingVertical: 12,
        borderRadius: 8,
        marginHorizontal: 5,
    },
    saveButton: {
        backgroundColor: "#2D2D2D",
    },
    deleteButton: {
        backgroundColor: "#B71C1C",
    },
    cancelButton: {
        backgroundColor: "#E0E0E0",
    },
    buttonText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
    },
});