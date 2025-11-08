import React, { useState, useEffect } from "react";
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";

type FormDataType = {
    nm_tanaman: string;
    varietas: string;
    jumlah: number;
    tgl_tanam: string;
    lama_panen: string;
    lokasi: string;
    status: string;
};

type FormModalProps = {
    visible: boolean;
    onClose: () => void;
    onSubmit: (data: FormDataType) => void;
    initialData?: FormDataType;
    selectedTanaman?: any;
};

const tanamanOptions = [
    { nama: "Kangkung", varietas: "Kangkung Bangkok", lama_panen: "30 Hari" },
    { nama: "Bayam", varietas: "Bayam Hijau Lokal", lama_panen: "28 Hari" },
    { nama: "Selada", varietas: "Selada Keriting", lama_panen: "40 Hari" },
    { nama: "Pakcoy", varietas: "Pakcoy Taiwan", lama_panen: "35 Hari" },
    { nama: "Sawi", varietas: "Sawi Putih", lama_panen: "32 Hari" },
];

const statusOptions = ["Sehat", "Siap Panen", "Perlu Perhatian"];

export default function FormModal({
    visible,
    onClose,
    onSubmit,
    initialData,
    selectedTanaman,
}: FormModalProps) {
    const [formData, setFormData] = useState<FormDataType>({
        nm_tanaman: "",
        varietas: "",
        jumlah: 0,
        tgl_tanam: "",
        lama_panen: "",
        lokasi: "",
        status: "Sehat",
    });

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [webDate, setWebDate] = useState(""); // untuk web date input

    useEffect(() => {
        if (initialData) {
            // Mode edit → isi form dengan data yang dipilih
            setFormData(initialData);
        } else {
            // Mode tambah → kosongkan form
            setFormData({
                nm_tanaman: "",
                varietas: "",
                jumlah: 0,
                tgl_tanam: "",
                lama_panen: "",
                lokasi: "",
                status: "Sehat",
            });
        }
    }, [initialData]);


    const handleTanamanChange = (value: string) => {
        const selected = tanamanOptions.find((t) => t.nama === value);
        if (selected) {
            setFormData({
                ...formData,
                nm_tanaman: selected.nama,
                varietas: selected.varietas,
                lama_panen: selected.lama_panen,
            });
        }
    };

    const handleDateChange = (
        event: any,
        selectedDate?: Date | undefined
    ) => {
        if (Platform.OS !== "web") setShowDatePicker(false);
        if (selectedDate) {
            const formatted = selectedDate.toISOString().split("T")[0];
            setFormData({ ...formData, tgl_tanam: formatted });
        }
    };

    const handleSubmit = () => {
        const dataToSend = selectedTanaman
            ? { ...formData, id: selectedTanaman.id }
            : formData;

        onSubmit(dataToSend);
    };

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <Text style={styles.title}>
                        {initialData ? "Edit Data Tanaman Anda" : "Tambah Tanaman Anda"}
                    </Text>

                    {/* Pilihan Nama Tanaman */}
                    <Picker
                        selectedValue={formData.nm_tanaman}
                        onValueChange={handleTanamanChange}
                        style={styles.input}
                    >
                        <Picker.Item label="Pilih Tanaman" value="" />
                        {tanamanOptions.map((item) => (
                            <Picker.Item
                                key={item.nama}
                                label={item.nama}
                                value={item.nama}
                            />
                        ))}
                    </Picker>

                    {/* Varietas otomatis */}
                    <TextInput
                        style={styles.input}
                        placeholder="Varietas"
                        value={formData.varietas}
                        editable={false}
                    />

                    {/* Lama Panen otomatis */}
                    <TextInput
                        style={styles.input}
                        placeholder="Lama Panen"
                        value={formData.lama_panen}
                        editable={false}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Jumlah Tanaman"
                        keyboardType="numeric"
                        value={formData.jumlah?.toString() || ""} 
                        onChangeText={(val) =>
                            setFormData({
                                ...formData,
                                jumlah: parseInt(val) || 0, 
                            })
                        }
                    />


                    {/* Tanggal Tanam */}
                    {Platform.OS === "web" ? (
                        <input
                            type="date"
                            value={formData.tgl_tanam}
                            onChange={(e) => {
                                setFormData({ ...formData, tgl_tanam: e.target.value });
                            }}
                            style={{
                                borderWidth: 1,
                                borderColor: "#ccc",
                                borderRadius: 8,
                                padding: 10,
                                marginBottom: 10,
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
                                    {formData.tgl_tanam
                                        ? formData.tgl_tanam
                                        : "Pilih Tanggal Tanam"}
                                </Text>
                            </TouchableOpacity>
                            {showDatePicker && (
                                <DateTimePicker
                                    value={
                                        formData.tgl_tanam
                                            ? new Date(formData.tgl_tanam)
                                            : new Date()
                                    }
                                    mode="date"
                                    display="default"
                                    onChange={handleDateChange}
                                />
                            )}
                        </>
                    )}

                    {/* Lokasi */}
                    <TextInput
                        style={styles.input}
                        placeholder="Lokasi Tanam"
                        value={formData.lokasi}
                        onChangeText={(val) => setFormData({ ...formData, lokasi: val })}
                    />

                    {/* Status */}
                    <Picker
                        selectedValue={formData.status}
                        onValueChange={(val) => setFormData({ ...formData, status: val })}
                        style={styles.input}
                    >
                        {statusOptions.map((s) => (
                            <Picker.Item key={s} label={s} value={s} />
                        ))}
                    </Picker>

                    <View style={styles.buttons}>
                        <TouchableOpacity style={styles.saveBtn} onPress={handleSubmit}>
                            <Text style={styles.saveText}>
                                {initialData ? "Simpan" : "Tambah"}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                            <Text style={styles.cancelText}>Batal</Text>
                        </TouchableOpacity>
                    </View>
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
        borderRadius: 10,
        width: "85%",
    },
    title: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 8,
        marginBottom: 10,
    },
    dateInput: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 10,
        marginBottom: 10,
    },
    buttons: { flexDirection: "row", justifyContent: "space-around", marginTop: 10 },
    saveBtn: { backgroundColor: "#4A7C2C", padding: 10, borderRadius: 8 },
    cancelBtn: { backgroundColor: "#ccc", padding: 10, borderRadius: 8 },
    saveText: { color: "#fff", fontWeight: "600" },
    cancelText: { color: "#000" },
});
