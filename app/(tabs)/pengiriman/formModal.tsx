import React, { useEffect, useState } from "react";
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ScrollView,
    ActivityIndicator
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { API_URLS } from "../../api/apiConfig";

// ============ INTERFACE ============
export interface User {
    id_user: number;
    name: string;
    username: string;
    gmail: string;
    role?: string;
    password?: string;
    profile_picture?: string | null;
    id?: number;
    nama?: string;
    email?: string;
}

interface Pengiriman {
    id_pengiriman?: number;
    id_supply?: number | null;
    id_panen?: number | null;
    tgl_pengiriman?: string;
    tujuan?: string;
    jumlah_dikirim?: number;
    status_pengiriman?: "pending" | "selesai";
    id_kurir?: number | null;
    keterangan?: string;
}

interface Supply {
    id_supply: number;
    nm_supply: string;
    jenis_supply: string;
}

interface Panen {
    id_panen: number;
    jenis_panen: string;
    kualitas: string;
}

interface FormModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: () => void;
    selectedItem?: Pengiriman | null;
    supplyData?: Supply[];
    panenData?: Panen[];
    kurirData?: User[];
}

type ProductOption = {
    id: number;
    name: string;
    type: "supply" | "panen";
};

const FormModal: React.FC<FormModalProps> = ({
    visible,
    onClose,
    onSubmit,
    selectedItem,
    supplyData = [],
    panenData = [],
    kurirData = []
}) => {
    // ============ STATE ============
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
    const [selectedType, setSelectedType] = useState<"supply" | "panen">("supply");
    const [selectedProductId, setSelectedProductId] = useState<string>("");
    const [productOptions, setProductOptions] = useState<ProductOption[]>([]);
    const [validKurirData, setValidKurirData] = useState<User[]>([]);
    const [isLoadingKurir, setIsLoadingKurir] = useState<boolean>(false);
    const [apiError, setApiError] = useState<string | null>(null);
    
    const [formData, setFormData] = useState<Pengiriman>({
        id_supply: null,
        id_panen: null,
        tgl_pengiriman: "",
        tujuan: "",
        jumlah_dikirim: 0,
        status_pengiriman: "pending",
        id_kurir: null,
        keterangan: "",
    });

    // ============ HELPER FUNCTIONS ============
    const formatDate = (date: Date): string => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const getDayName = (date: Date): string => {
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        return days[date.getDay()];
    };

    const getMonthName = (date: Date): string => {
        const months = [
            'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ];
        return months[date.getMonth()];
    };

    const formatDateFull = (date: Date): string => {
        const dayName = getDayName(date);
        const day = date.getDate();
        const monthName = getMonthName(date);
        const year = date.getFullYear();
        return `${dayName}, ${day} ${monthName} ${year}`;
    };

    const formatDateForAPI = (date: Date): string => {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const parseDateString = (dateStr: string): Date => {
        if (!dateStr) return new Date();
        
        // Coba format dd/mm/yyyy
        const parts = dateStr.split('/');
        if (parts.length === 3) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1;
            const year = parseInt(parts[2], 10);
            return new Date(year, month, day);
        }
        
        // Coba format yyyy-mm-dd
        if (dateStr.includes('-')) {
            return new Date(dateStr);
        }
        
        return new Date();
    };

    // ============ FETCH KURIR ============
    const fetchKurirData = async () => {
        try {
            console.log("🔍 Fetching kurir data...");
            setIsLoadingKurir(true);
            setApiError(null);
            
            const response = await fetch(API_URLS.USER, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const responseData = await response.json();
            
            let users: any[] = [];
            if (Array.isArray(responseData)) {
                users = responseData;
            } else if (responseData.data && Array.isArray(responseData.data)) {
                users = responseData.data;
            } else {
                throw new Error("Format response tidak dikenali");
            }
            
            const transformedUsers: User[] = users.map((user: any) => ({
                id_user: user.id_user || user.id || 0,
                name: user.name || user.nama || '',
                username: user.username || '',
                gmail: user.gmail || user.email || '',
                role: user.role || '',
                password: user.password || '',
                profile_picture: user.profile_picture || null,
                id: user.id_user || user.id || 0,
                nama: user.name || user.nama || '',
                email: user.gmail || user.email || '',
            }));
            
            const filteredKurirs = transformedUsers.filter(user => {
                if (!user || !user.id_user || !user.name) return false;
                const userRole = (user.role || '').toString().toLowerCase().trim();
                return userRole === 'kurir';
            });
            
            if (filteredKurirs.length === 0) {
                setApiError("Tidak ada data kurir tersedia");
                setValidKurirData(kurirData || []);
            } else {
                setValidKurirData(filteredKurirs);
            }
            
        } catch (error: any) {
            console.error("Error fetch kurir:", error);
            setApiError(error.message || "Gagal memuat data kurir");
            setValidKurirData(kurirData || []);
        } finally {
            setIsLoadingKurir(false);
        }
    };

    // ============ EFFECTS ============
    // Product options
    useEffect(() => {
        if (selectedType === "supply") {
            const options = supplyData
                .filter(item => item?.id_supply)
                .map(item => ({
                    id: item.id_supply,
                    name: `${item.nm_supply} (${item.jenis_supply})`,
                    type: "supply" as const
                }));
            setProductOptions(options);
        } else {
            const options = panenData
                .filter(item => item?.id_panen)
                .map(item => ({
                    id: item.id_panen,
                    name: `${item.jenis_panen} (${item.kualitas})`,
                    type: "panen" as const
                }));
            setProductOptions(options);
        }
    }, [selectedType, supplyData, panenData]);

    // Load kurir on modal open
    useEffect(() => {
        if (visible) {
            fetchKurirData();
        } else {
            setValidKurirData([]);
            setApiError(null);
        }
    }, [visible]);

    // Set tanggal otomatis hari ini saat buka modal
    useEffect(() => {
        if (visible) {
            const today = new Date();
            const formattedToday = formatDate(today);
            
            if (!selectedItem) {
                // Untuk tambah data baru
                setSelectedDate(today);
                setFormData(prev => ({ 
                    ...prev, 
                    tgl_pengiriman: formattedToday 
                }));
            }
        }
    }, [visible, selectedItem]);

    // Handle selected item
    useEffect(() => {
        if (!visible) return;
        
        if (selectedItem) {
            // Edit mode
            setSelectedProductId("");
            
            if (selectedItem.id_supply) {
                setSelectedType("supply");
                setSelectedProductId(selectedItem.id_supply?.toString() || "");
            } else if (selectedItem.id_panen) {
                setSelectedType("panen");
                setSelectedProductId(selectedItem.id_panen?.toString() || "");
            }
            
            const safeData = {
                id_supply: selectedItem.id_supply || null,
                id_panen: selectedItem.id_panen || null,
                tgl_pengiriman: selectedItem.tgl_pengiriman || formatDate(new Date()),
                tujuan: selectedItem.tujuan || "",
                jumlah_dikirim: selectedItem.jumlah_dikirim || 0,
                status_pengiriman: selectedItem.status_pengiriman || "pending",
                id_kurir: selectedItem.id_kurir || null,
                keterangan: selectedItem.keterangan || "",
            };
            
            setFormData(safeData);
            
            // Set tanggal
            const dateObj = selectedItem.tgl_pengiriman 
                ? parseDateString(selectedItem.tgl_pengiriman)
                : new Date();
            setSelectedDate(dateObj);
            
        } else {
            // Add mode
            const today = new Date();
            const todayFormatted = formatDate(today);
            
            setFormData({
                id_supply: null,
                id_panen: null,
                tgl_pengiriman: todayFormatted,
                tujuan: "",
                jumlah_dikirim: 0,
                status_pengiriman: "pending",
                id_kurir: null,
                keterangan: "",
            });
            setSelectedType("supply");
            setSelectedProductId("");
            setSelectedDate(today);
        }
    }, [selectedItem, visible]);

    // ============ HANDLERS ============
    const handleDateConfirm = (date: Date) => {
        setSelectedDate(date);
        const formattedDate = formatDate(date);
        setFormData(prev => ({ ...prev, tgl_pengiriman: formattedDate }));
        setShowDatePicker(false);
    };

    const handleDateCancel = () => {
        setShowDatePicker(false);
    };

    const handleResetToToday = () => {
        const today = new Date();
        const formattedToday = formatDate(today);
        setSelectedDate(today);
        setFormData(prev => ({ ...prev, tgl_pengiriman: formattedToday }));
    };

    const handleTypeChange = (type: "supply" | "panen") => {
        setSelectedType(type);
        setSelectedProductId("");
        setFormData(prev => ({
            ...prev,
            id_supply: type === "supply" ? null : prev.id_supply,
            id_panen: type === "panen" ? null : prev.id_panen
        }));
    };

    const handleProductChange = (productId: string) => {
        setSelectedProductId(productId);
        const id = productId ? parseInt(productId) : null;
        
        if (selectedType === "supply") {
            setFormData(prev => ({
                ...prev,
                id_supply: id,
                id_panen: null
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                id_supply: null,
                id_panen: id
            }));
        }
    };

    const handleKurirChange = (kurirId: string) => {
        const id = kurirId ? parseInt(kurirId) : null;
        setFormData(prev => ({ ...prev, id_kurir: id }));
    };

    const handleSubmit = async () => {
        // Validasi
        if (!formData.tgl_pengiriman || !formData.tujuan || !formData.jumlah_dikirim) {
            Alert.alert("Peringatan", "Harap isi tanggal, tujuan, dan jumlah!");
            return;
        }

        if (!selectedProductId) {
            Alert.alert("Peringatan", "Harap pilih produk!");
            return;
        }

        try {
            const payload: any = {
                tgl_pengiriman: formatDateForAPI(selectedDate),
                tujuan: formData.tujuan,
                jumlah_dikirim: formData.jumlah_dikirim || 0,
                status_pengiriman: formData.status_pengiriman || "pending",
                keterangan: formData.keterangan || "",
            };

            if (formData.id_kurir) {
                payload.id_kurir = formData.id_kurir;
            }

            if (selectedType === "supply") {
                payload.id_supply = parseInt(selectedProductId);
                payload.id_panen = null;
            } else {
                payload.id_panen = parseInt(selectedProductId);
                payload.id_supply = null;
            }

            const method = selectedItem ? "PUT" : "POST";
            const url = selectedItem
                ? `${API_URLS.PENGIRIMAN}/${selectedItem.id_pengiriman}`
                : API_URLS.PENGIRIMAN;

            const response = await fetch(url, {
                method,
                headers: { 
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                Alert.alert(
                    "Sukses",
                    selectedItem
                        ? "Data pengiriman berhasil diperbarui!"
                        : "Data pengiriman berhasil ditambahkan!"
                );
                onSubmit();
                onClose();
            } else {
                Alert.alert("Gagal", "Terjadi kesalahan server");
            }
        } catch (error: any) {
            console.error("Error:", error);
            Alert.alert("Error", "Tidak dapat terhubung ke server");
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
                                { 
                                    method: "DELETE",
                                    headers: {
                                        "Content-Type": "application/json"
                                    }
                                }
                            );
                            
                            if (response.ok) {
                                Alert.alert("Sukses", "Data berhasil dihapus!");
                                onSubmit();
                                onClose();
                            } else {
                                Alert.alert("Gagal", "Tidak dapat menghapus data");
                            }
                        } catch (error) {
                            Alert.alert("Error", "Terjadi kesalahan koneksi!");
                        }
                    },
                },
            ]
        );
    };

    const getSelectedKurirName = (): string => {
        if (!formData.id_kurir) return "Belum dipilih";
        const kurir = validKurirData.find(k => k.id_user === formData.id_kurir);
        return kurir ? kurir.name : `ID: ${formData.id_kurir}`;
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <ScrollView 
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={true}
                    >
                        {/* Header */}
                        <Text style={styles.title}>
                            {selectedItem ? "Edit Pengiriman" : "Tambah Pengiriman"}
                        </Text>
                        <Text style={styles.subtitle}>Isi Lengkap Data</Text>

                        {/* Jenis Produk */}
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Jenis Produk *</Text>
                            <View style={styles.typeContainer}>
                                <TouchableOpacity
                                    style={[
                                        styles.typeButton,
                                        selectedType === "supply" && styles.typeButtonActive
                                    ]}
                                    onPress={() => handleTypeChange("supply")}
                                >
                                    <Text style={[
                                        styles.typeButtonText,
                                        selectedType === "supply" && styles.typeButtonTextActive
                                    ]}>📦 Supply</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.typeButton,
                                        selectedType === "panen" && styles.typeButtonActive
                                    ]}
                                    onPress={() => handleTypeChange("panen")}
                                >
                                    <Text style={[
                                        styles.typeButtonText,
                                        selectedType === "panen" && styles.typeButtonTextActive
                                    ]}>🌱 Panen</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Pilih Produk */}
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Pilih Produk *</Text>
                            <View style={styles.pickerWrapper}>
                                <Picker
                                    selectedValue={selectedProductId}
                                    onValueChange={handleProductChange}
                                >
                                    <Picker.Item 
                                        label={`Pilih ${selectedType === "supply" ? "supply" : "panen"}...`} 
                                        value="" 
                                    />
                                    {productOptions.map((product) => (
                                        <Picker.Item 
                                            key={product.id} 
                                            label={product.name} 
                                            value={product.id.toString()} 
                                        />
                                    ))}
                                </Picker>
                            </View>
                        </View>

                        {/* Tanggal */}
                        <View style={styles.formGroup}>
                            <View style={styles.dateHeader}>
                                <Text style={styles.label}>Tanggal *</Text>
                                <TouchableOpacity 
                                    style={styles.resetButton}
                                    onPress={handleResetToToday}
                                >
                                    <Text style={styles.resetButtonText}>⟳ Hari Ini</Text>
                                </TouchableOpacity>
                            </View>
                            
                            <TouchableOpacity 
                                style={styles.dateInput} 
                                onPress={() => setShowDatePicker(true)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.dateInputContent}>
                                    <View style={styles.dateInfo}>
                                        <Text style={styles.dateDay}>{getDayName(selectedDate)}</Text>
                                        <Text style={styles.dateValue}>{formatDateFull(selectedDate)}</Text>
                                        <Text style={styles.dateHint}>
                                            Klik untuk mengubah tanggal
                                        </Text>
                                    </View>
                                    <View style={styles.dateAction}>
                                        <Text style={styles.calendarIcon}>📅</Text>
                                        <Text style={styles.editText}>Edit</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </View>

                        {/* Jumlah */}
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Jumlah *</Text>
                            <View style={styles.inputWrapper}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Contoh: 5"
                                    placeholderTextColor="#999"
                                    keyboardType="numeric"
                                    value={formData.jumlah_dikirim?.toString() || "0"}
                                    onChangeText={(v) => {
                                        const num = parseInt(v) || 0;
                                        setFormData(prev => ({ ...prev, jumlah_dikirim: num }));
                                    }}
                                />
                                <Text style={styles.inputSuffix}>Unit</Text>
                            </View>
                        </View>

                        {/* Tujuan */}
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Tujuan *</Text>
                            <TextInput
                                style={styles.textArea}
                                placeholder="Alamat tujuan..."
                                placeholderTextColor="#999"
                                multiline
                                numberOfLines={3}
                                value={formData.tujuan || ""}
                                onChangeText={(v) => setFormData(prev => ({ ...prev, tujuan: v }))}
                            />
                        </View>

                        {/* Pilih Kurir */}
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Pilih Kurir (Opsional)</Text>
                            
                            {isLoadingKurir ? (
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator size="small" color="#1E3A3A" />
                                    <Text style={styles.loadingText}>Memuat data kurir...</Text>
                                </View>
                            ) : apiError ? (
                                <View style={styles.errorContainer}>
                                    <Text style={styles.errorText}>❌ {apiError}</Text>
                                    <TouchableOpacity 
                                        style={styles.retryButton}
                                        onPress={fetchKurirData}
                                    >
                                        <Text style={styles.retryText}>Coba Lagi</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : validKurirData.length === 0 ? (
                                <View style={styles.emptyContainer}>
                                    <Text style={styles.emptyText}>📭 Tidak ada data kurir</Text>
                                    <Text style={styles.emptyHint}>
                                        Pastikan ada user dengan role "Kurir" di database
                                    </Text>
                                </View>
                            ) : (
                                <>
                                    <View style={styles.pickerWrapper}>
                                        <Picker
                                            selectedValue={formData.id_kurir?.toString() || ""}
                                            onValueChange={handleKurirChange}
                                        >
                                            <Picker.Item 
                                                label="Pilih kurir..." 
                                                value="" 
                                            />
                                            {validKurirData.map((kurir) => (
                                                <Picker.Item 
                                                    key={kurir.id_user} 
                                                    label={`${kurir.name} (${kurir.gmail || kurir.username || 'No email'})`}
                                                    value={kurir.id_user.toString()} 
                                                />
                                            ))}
                                        </Picker>
                                    </View>
                                    
                                    {formData.id_kurir && (
                                        <View style={styles.selectedKurir}>
                                            <Text style={styles.selectedKurirLabel}>Kurir terpilih:</Text>
                                            <Text style={styles.selectedKurirName}>{getSelectedKurirName()}</Text>
                                        </View>
                                    )}
                                </>
                            )}
                        </View>

                        {/* Status */}
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Status *</Text>
                            <View style={styles.pickerWrapper}>
                                <Picker
                                    selectedValue={formData.status_pengiriman}
                                    onValueChange={(v) =>
                                        setFormData(prev => ({ ...prev, status_pengiriman: v as "pending" | "selesai" }))
                                    }
                                >
                                    <Picker.Item label="⏳ Pending" value="pending" />
                                    <Picker.Item label="✅ Selesai" value="selesai" />
                                </Picker>
                            </View>
                        </View>

                        {/* Keterangan */}
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Keterangan (Opsional)</Text>
                            <TextInput
                                style={styles.textArea}
                                placeholder="Catatan tambahan..."
                                placeholderTextColor="#999"
                                multiline
                                numberOfLines={3}
                                value={formData.keterangan || ""}
                                onChangeText={(v) => setFormData(prev => ({ ...prev, keterangan: v }))}
                            />
                        </View>

                        {/* Buttons */}
                        <View style={styles.buttonRow}>
                            {selectedItem && (
                                <TouchableOpacity
                                    style={[styles.button, styles.deleteButton]}
                                    onPress={handleDelete}
                                >
                                    <Text style={styles.buttonText}>🗑️ Hapus</Text>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity
                                style={[styles.button, styles.saveButton]}
                                onPress={handleSubmit}
                            >
                                <Text style={styles.buttonText}>
                                    {selectedItem ? "💾 Simpan" : "➕ Tambah"}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.cancelButton]}
                                onPress={onClose}
                            >
                                <Text style={styles.cancelButtonText}>✖️ Batal</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>

                    {/* Date Picker Modal */}
                    <DateTimePickerModal
                        isVisible={showDatePicker}
                        mode="date"
                        date={selectedDate}
                        onConfirm={handleDateConfirm}
                        onCancel={handleDateCancel}
                        display="inline"
                        locale="id_ID"
                        confirmTextIOS="Pilih"
                        cancelTextIOS="Batal"
                    />
                </View>
            </View>
        </Modal>
    );
};

// ============ STYLES ============
const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    modalContainer: {
        backgroundColor: "#fff",
        width: "100%",
        maxWidth: 500,
        borderRadius: 20,
        maxHeight: "85%",
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 15,
        elevation: 10,
    },
    scrollContent: {
        padding: 25,
    },
    title: {
        fontSize: 22,
        fontWeight: "700",
        color: "#1E3A3A",
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: "#666",
        marginBottom: 25,
        fontWeight: "500",
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 15,
        fontWeight: "600",
        color: "#2D3748",
        marginBottom: 10,
    },
    // Date Styles
    dateHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },
    resetButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: "#F7FAFC",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    resetButtonText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#4A5568",
    },
    dateInput: {
        borderWidth: 1.5,
        borderColor: "#E2E8F0",
        borderRadius: 12,
        backgroundColor: "#fff",
        overflow: "hidden",
    },
    dateInputContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
    },
    dateInfo: {
        flex: 1,
    },
    dateDay: {
        fontSize: 14,
        fontWeight: "600",
        color: "#1E3A3A",
        marginBottom: 2,
    },
    dateValue: {
        fontSize: 16,
        fontWeight: "700",
        color: "#2D3748",
        marginBottom: 4,
    },
    dateHint: {
        fontSize: 12,
        color: "#718096",
        fontStyle: "italic",
    },
    dateAction: {
        alignItems: "center",
        marginLeft: 16,
    },
    calendarIcon: {
        fontSize: 24,
        marginBottom: 4,
    },
    editText: {
        fontSize: 12,
        color: "#1E3A3A",
        fontWeight: "600",
    },
    // Type Selector
    typeContainer: {
        flexDirection: "row",
        gap: 12,
    },
    typeButton: {
        flex: 1,
        padding: 14,
        backgroundColor: "#F7FAFC",
        borderRadius: 10,
        alignItems: "center",
        borderWidth: 1.5,
        borderColor: "#E2E8F0",
    },
    typeButtonActive: {
        backgroundColor: "#1E3A3A",
        borderColor: "#1E3A3A",
    },
    typeButtonText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#718096",
    },
    typeButtonTextActive: {
        color: "white",
    },
    // Picker
    pickerWrapper: {
        borderWidth: 1.5,
        borderColor: "#E2E8F0",
        borderRadius: 10,
        backgroundColor: "#fff",
        overflow: "hidden",
    },
    // Input
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1.5,
        borderColor: "#E2E8F0",
        borderRadius: 10,
        backgroundColor: "#fff",
        overflow: "hidden",
    },
    input: {
        flex: 1,
        padding: 15,
        fontSize: 15,
        color: "#2D3748",
        minHeight: 52,
    },
    inputSuffix: {
        paddingHorizontal: 15,
        fontSize: 14,
        color: "#718096",
        fontWeight: "500",
        borderLeftWidth: 1,
        borderLeftColor: "#E2E8F0",
        paddingVertical: 17,
    },
    // Text Area
    textArea: {
        borderWidth: 1.5,
        borderColor: "#E2E8F0",
        borderRadius: 10,
        backgroundColor: "#fff",
        padding: 15,
        fontSize: 15,
        color: "#2D3748",
        minHeight: 100,
        textAlignVertical: "top",
        lineHeight: 22,
    },
    // Loading & Error
    loadingContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        backgroundColor: "#F7FAFC",
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: "#E2E8F0",
        borderStyle: "dashed",
    },
    loadingText: {
        marginLeft: 12,
        fontSize: 14,
        color: "#4A5568",
        fontWeight: "500",
    },
    errorContainer: {
        padding: 20,
        backgroundColor: "#FFF5F5",
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: "#FED7D7",
        alignItems: "center",
    },
    errorText: {
        fontSize: 14,
        color: "#C53030",
        marginBottom: 12,
        textAlign: "center",
        fontWeight: "500",
    },
    retryButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: "#1E3A3A",
        borderRadius: 8,
    },
    retryText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
    },
    emptyContainer: {
        padding: 20,
        backgroundColor: "#EBF8FF",
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: "#BEE3F8",
        alignItems: "center",
    },
    emptyText: {
        fontSize: 14,
        color: "#2B6CB0",
        fontWeight: "600",
        marginBottom: 6,
    },
    emptyHint: {
        fontSize: 12,
        color: "#4299E1",
        textAlign: "center",
        lineHeight: 16,
    },
    // Selected Kurir
    selectedKurir: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 12,
        padding: 12,
        backgroundColor: "#F0FFF4",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#C6F6D5",
    },
    selectedKurirLabel: {
        fontSize: 13,
        color: "#276749",
        fontWeight: "600",
        marginRight: 8,
    },
    selectedKurirName: {
        fontSize: 14,
        color: "#1E3A3A",
        fontWeight: "700",
    },
    // Buttons
    buttonRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 30,
        gap: 12,
    },
    button: {
        flex: 1,
        alignItems: "center",
        paddingVertical: 16,
        borderRadius: 12,
        minHeight: 52,
        justifyContent: "center",
    },
    saveButton: {
        backgroundColor: "#1E3A3A",
    },
    deleteButton: {
        backgroundColor: "#E53E3E",
    },
    cancelButton: {
        backgroundColor: "#fff",
        borderWidth: 1.5,
        borderColor: "#E2E8F0",
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
    },
    cancelButtonText: {
        color: "#4A5568",
        fontSize: 16,
        fontWeight: "700",
    },
});

export default FormModal;