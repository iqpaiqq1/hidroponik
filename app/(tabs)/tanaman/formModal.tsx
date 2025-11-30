import React, { useState, useEffect } from "react";
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Platform,
    Image,
    Alert,
    ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from 'expo-image-picker';
import { Camera, ImageIcon } from "lucide-react-native";

type FormDataType = {
    nm_tanaman: string;
    varietas: string;
    jumlah: number;
    tgl_tanam: string;
    lama_panen: string;
    lokasi: string;
    status: string;
    Foto: string;
};

type FormModalProps = {
    visible: boolean;
    onClose: () => void;
    onSubmit: (data: FormDataType) => void;
    initialData?: FormDataType;
    selectedTanaman?: any;
};

const tanamanOptions = [
    { nama: "Kangkung", varietas: "Kangkung Bangkok", lama_panen: "25–30 Hari" },
    { nama: "Bayam Hijau", varietas: "Bayam Hijau Lokal", lama_panen: "25–30 Hari" },
    { nama: "Bayam Merah", varietas: "Bayam Merah Lokal", lama_panen: "28–32 Hari" },
    { nama: "Selada", varietas: "Selada Keriting Hijau", lama_panen: "35–45 Hari" },
    { nama: "Selada Merah", varietas: "Red Coral Lettuce", lama_panen: "40–50 Hari" },
    { nama: "Pakcoy", varietas: "Pakcoy Taiwan", lama_panen: "30–35 Hari" },
    { nama: "Sawi Hijau", varietas: "Sawi Hijau Vitamin", lama_panen: "30–35 Hari" },
    { nama: "Sawi Putih", varietas: "Chinese Cabbage", lama_panen: "45–55 Hari" },
    { nama: "Seledri", varietas: "Seledri Lokal", lama_panen: "40–50 Hari" },
    { nama: "Kale", varietas: "Kale Hijau Curly", lama_panen: "45–60 Hari" },
    { nama: "Kale Red Russian", varietas: "Red Russian Kale", lama_panen: "50–65 Hari" },
    { nama: "Basil", varietas: "Sweet Basil", lama_panen: "25–30 Hari" },
    { nama: "Mint", varietas: "Peppermint", lama_panen: "20–30 Hari" },
    { nama: "Tomat", varietas: "Tomat Cherry Hidroponik", lama_panen: "60–75 Hari" },
    { nama: "Cabai Rawit", varietas: "Rawit Hidroponik", lama_panen: "70–90 Hari" },
    { nama: "Paprika", varietas: "Bell Pepper", lama_panen: "70–90 Hari" },
    { nama: "Mentimun", varietas: "Cucumber Mini Hidroponik", lama_panen: "40–50 Hari" },
    { nama: "Strawberry", varietas: "Strawberry Hidroponik", lama_panen: "60–90 Hari" },
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
        Foto: "",
    });

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [imageUri, setImageUri] = useState<string>("");

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
            setImageUri(initialData.Foto || "");
        } else {
            setFormData({
                nm_tanaman: "",
                varietas: "",
                jumlah: 0,
                tgl_tanam: "",
                lama_panen: "",
                lokasi: "",
                status: "Sehat",
                Foto: "",
            });
            setImageUri("");
        }
    }, [initialData]);

    const requestPermissions = async () => {
        if (Platform.OS !== 'web') {
            const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
            const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
                Alert.alert(
                    'Permission Required',
                    'Mohon izinkan akses ke kamera dan galeri untuk mengupload foto'
                );
                return false;
            }
        }
        return true;
    };

    // FIX: Pastikan base64 diaktifkan
    const pickImageFromGallery = async () => {
        const hasPermission = await requestPermissions();
        if (!hasPermission) return;

        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
                base64: true, // ✅ PERBAIKAN: Aktifkan base64
            });

            if (!result.canceled && result.assets[0]) {
                const asset = result.assets[0];
                const base64Image = `data:image/jpeg;base64,${asset.base64}`;
                setImageUri(asset.uri);
                setFormData({ ...formData, Foto: base64Image });
                console.log("✅ Foto berhasil dipilih dari galeri");
            }
        } catch (error) {
            Alert.alert('Error', 'Gagal memilih foto dari galeri');
            console.error("❌ Error pickImageFromGallery:", error);
        }
    };

    const takePhoto = async () => {
        const hasPermission = await requestPermissions();
        if (!hasPermission) return;

        try {
            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
                base64: true,
            });

            if (!result.canceled && result.assets[0]) {
                const asset = result.assets[0];
                const base64Image = `data:image/jpeg;base64,${asset.base64}`;
                setImageUri(asset.uri);
                setFormData({ ...formData, Foto: base64Image });
                console.log("✅ Foto berhasil diambil dari kamera");
            }
        } catch (error) {
            Alert.alert('Error', 'Gagal mengambil foto dari kamera');
            console.error("❌ Error takePhoto:", error);
        }
    };

    const pickImageWeb = (event: any) => {
        const file = event.target.files[0];
        if (file) {
            // Validasi ukuran file (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                Alert.alert('Error', 'Ukuran file terlalu besar. Maksimal 5MB');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setImageUri(base64String);
                setFormData({ ...formData, Foto: base64String });
                console.log("✅ Foto berhasil dipilih (web)");
            };
            reader.onerror = () => {
                Alert.alert('Error', 'Gagal membaca file');
            };
            reader.readAsDataURL(file);
        }
    };

    const showImagePickerOptions = () => {
        Alert.alert(
            'Pilih Foto',
            'Pilih sumber foto tanaman',
            [
                {
                    text: 'Kamera',
                    onPress: takePhoto,
                },
                {
                    text: 'Galeri',
                    onPress: pickImageFromGallery,
                },
                {
                    text: 'Batal',
                    style: 'cancel',
                },
            ]
        );
    };

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

    const handleDateChange = (event: any, selectedDate?: Date | undefined) => {
        if (Platform.OS !== "web") setShowDatePicker(false);
        if (selectedDate) {
            const formatted = selectedDate.toISOString().split("T")[0];
            setFormData({ ...formData, tgl_tanam: formatted });
        }
    };

    // FIX: Validasi lengkap sebelum submit
    const handleSubmit = () => {
        console.log("🔍 Validating form data...");

        // Validasi foto
        if (!formData.Foto) {
            Alert.alert('Error', 'Mohon upload foto tanaman');
            return;
        }

        // Validasi nama tanaman
        if (!formData.nm_tanaman || formData.nm_tanaman.trim() === "") {
            Alert.alert('Error', 'Mohon pilih nama tanaman');
            return;
        }

        // Validasi jumlah
        if (!formData.jumlah || formData.jumlah <= 0) {
            Alert.alert('Error', 'Mohon isi jumlah tanaman dengan benar');
            return;
        }

        // Validasi tanggal tanam
        if (!formData.tgl_tanam) {
            Alert.alert('Error', 'Mohon pilih tanggal tanam');
            return;
        }

        // Validasi lokasi
        if (!formData.lokasi || formData.lokasi.trim() === "") {
            Alert.alert('Error', 'Mohon isi lokasi tanam');
            return;
        }

        console.log("✅ Validation passed");
        console.log("📤 Submitting data:", {
            ...formData,
            Foto: formData.Foto.substring(0, 50) + "..." // Log sebagian untuk debug
        });

        const dataToSend = selectedTanaman
            ? { ...formData, id: selectedTanaman.id }
            : formData;

        onSubmit(dataToSend);
    };

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.overlay}>
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    <View style={styles.modal}>
                        <Text style={styles.title}>
                            {initialData ? "Edit Data Tanaman Anda" : "Tambah Tanaman Anda"}
                        </Text>

                        {/* Upload Foto Section */}
                        <View style={styles.photoSection}>
                            <Text style={styles.label}>Foto Tanaman *</Text>
                            {imageUri ? (
                                <View style={styles.imagePreviewContainer}>
                                    <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                                    <TouchableOpacity
                                        style={styles.changePhotoBtn}
                                        onPress={Platform.OS === 'web' ? undefined : showImagePickerOptions}
                                    >
                                        <Text style={styles.changePhotoText}>Ganti Foto</Text>
                                    </TouchableOpacity>
                                    {Platform.OS === 'web' && (
                                        <label htmlFor="photo-change" style={{ cursor: 'pointer' }}>
                                            <input
                                                id="photo-change"
                                                type="file"
                                                accept="image/*"
                                                onChange={pickImageWeb}
                                                style={{ display: 'none' }}
                                            />
                                        </label>
                                    )}
                                </View>
                            ) : (
                                <View style={styles.uploadContainer}>
                                    {Platform.OS === 'web' ? (
                                        <label htmlFor="photo-upload" style={styles.webUploadLabel}>
                                            <View style={styles.uploadButton}>
                                                <ImageIcon size={40} color="#4A7C2C" />
                                                <Text style={styles.uploadText}>Pilih Foto</Text>
                                            </View>
                                            <input
                                                id="photo-upload"
                                                type="file"
                                                accept="image/*"
                                                onChange={pickImageWeb}
                                                style={{ display: 'none' }}
                                            />
                                        </label>
                                    ) : (
                                        <>
                                            <TouchableOpacity
                                                style={styles.uploadButton}
                                                onPress={pickImageFromGallery}
                                            >
                                                <ImageIcon size={40} color="#4A7C2C" />
                                                <Text style={styles.uploadText}>Pilih dari Galeri</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={styles.uploadButton}
                                                onPress={takePhoto}
                                            >
                                                <Camera size={40} color="#4A7C2C" />
                                                <Text style={styles.uploadText}>Ambil Foto</Text>
                                            </TouchableOpacity>
                                        </>
                                    )}
                                </View>
                            )}
                        </View>

                        {/* Pilihan Nama Tanaman */}
                        <Text style={styles.label}>Nama Tanaman *</Text>
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
                        <Text style={styles.label}>Varietas</Text>
                        <TextInput
                            style={[styles.input, styles.disabledInput]}
                            placeholder="Varietas"
                            value={formData.varietas}
                            editable={false}
                        />

                        {/* Lama Panen otomatis */}
                        <Text style={styles.label}>Lama Panen</Text>
                        <TextInput
                            style={[styles.input, styles.disabledInput]}
                            placeholder="Lama Panen"
                            value={formData.lama_panen}
                            editable={false}
                        />

                        <Text style={styles.label}>Jumlah Tanaman *</Text>
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
                        <Text style={styles.label}>Tanggal Tanam *</Text>
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
                                    <Text style={formData.tgl_tanam ? styles.dateText : styles.placeholderText}>
                                        {formData.tgl_tanam || "Pilih Tanggal Tanam"}
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
                        <Text style={styles.label}>Lokasi Tanam *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Lokasi Tanam"
                            value={formData.lokasi}
                            onChangeText={(val) => setFormData({ ...formData, lokasi: val })}
                        />

                        {/* Status */}
                        <Text style={styles.label}>Status *</Text>
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
                </ScrollView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "#0008",
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 20,
    },
    modal: {
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 10,
        width: "90%",
        maxWidth: 500,
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center",
        color: "#4A7C2C",
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: "#333",
        marginBottom: 5,
        marginTop: 5,
    },
    photoSection: {
        marginBottom: 15,
    },
    uploadContainer: {
        flexDirection: Platform.OS === 'web' ? 'column' : 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        gap: 10,
        marginTop: 10,
    },
    uploadButton: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        borderWidth: 2,
        borderColor: '#4A7C2C',
        borderStyle: 'dashed',
        borderRadius: 10,
        backgroundColor: '#F5F5F5',
        flex: Platform.OS === 'web' ? undefined : 1,
        width: Platform.OS === 'web' ? '100%' : undefined,
    },
    webUploadLabel: {
        cursor: 'pointer',
        width: '100%',
    },
    uploadText: {
        marginTop: 10,
        color: '#4A7C2C',
        fontWeight: '600',
        textAlign: 'center',
    },
    imagePreviewContainer: {
        alignItems: 'center',
        marginTop: 10,
    },
    imagePreview: {
        width: '100%',
        height: 200,
        borderRadius: 10,
        resizeMode: 'cover',
    },
    changePhotoBtn: {
        marginTop: 10,
        backgroundColor: '#4A7C2C',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    changePhotoText: {
        color: '#fff',
        fontWeight: '600',
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 10,
        marginBottom: 10,
        backgroundColor: '#fff',
    },
    disabledInput: {
        backgroundColor: '#F5F5F5',
        color: '#666',
    },
    dateInput: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 12,
        marginBottom: 10,
        backgroundColor: '#fff',
    },
    dateText: {
        color: '#333',
    },
    placeholderText: {
        color: '#999',
    },
    buttons: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginTop: 20,
        gap: 10,
    },
    saveBtn: {
        backgroundColor: "#4A7C2C",
        padding: 12,
        borderRadius: 8,
        flex: 1,
        alignItems: 'center',
    },
    cancelBtn: {
        backgroundColor: "#ccc",
        padding: 12,
        borderRadius: 8,
        flex: 1,
        alignItems: 'center',
    },
    saveText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 16,
    },
    cancelText: {
        color: "#000",
        fontWeight: "600",
        fontSize: 16,
    },
});