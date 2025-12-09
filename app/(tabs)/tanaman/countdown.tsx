    import { router, useLocalSearchParams } from "expo-router";
    import { Clock } from "lucide-react-native";
    import React, { useEffect, useState } from "react";
    import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
    import MenuSidebar from "../sidebar";
    import { API_URLS } from "../../api/apiConfig"

    interface Tanaman {
        id_tanaman: number;
        nm_tanaman: string;
        varietas: string;
        jumlah: number;
        tgl_tanam: string;
        lama_panen: string;
        lokasi: string;
        status: string;
    }

    interface CountdownData {
        tanaman: Tanaman;
        targetDate: Date;
        daysRemaining: number;
        percentage: number;
        statusText: string;
        statusColor: string;
    }

    export default function CountdownScreen() {
        const { gmail, nama } = useLocalSearchParams();
        const [countdownList, setCountdownList] = useState<CountdownData[]>([]);
        const [loading, setLoading] = useState(true);
        const [modalVisible, setModalVisible] = useState(false);
        const [selectedTanaman, setSelectedTanaman] = useState<CountdownData | null>(null);
        const [kualitas, setKualitas] = useState("");
        const [jumlahPanen, setJumlahPanen] = useState("");
        const [processingPanen, setProcessingPanen] = useState(false);

        const calculateCountdown = (tglTanam: string, lamaPanen: string): CountdownData | null => {
            try {
                const plantDate = new Date(tglTanam);

                // Ambil angka pertama saja dari format "25–30 Hari" atau "25-30 Hari"
                const match = lamaPanen.match(/\d+/);
                if (!match) return null;
                const daysToHarvest = parseInt(match[0]); // Ambil angka pertama (misal: 25 dari "25-30")

                // Hitung target date
                const targetDate = new Date(plantDate);
                targetDate.setDate(targetDate.getDate() + daysToHarvest);

                // Hitung hari yang sudah berlalu sejak tanam
                const today = new Date();
                today.setHours(0, 0, 0, 0); // Reset jam untuk konsistensi
                const plantDateReset = new Date(plantDate);
                plantDateReset.setHours(0, 0, 0, 0);

                const diffTime = today.getTime() - plantDateReset.getTime();
                const daysPassed = Math.floor(diffTime / (1000 * 60 * 60 * 24));

                // Hitung hari tersisa
                const daysRemaining = daysToHarvest - daysPassed;

                // Perhitungan persentase berdasarkan hari yang sudah berlalu
                let percentage = 0;
                if (daysPassed < 0) {
                    percentage = 0; // Belum ditanam
                } else if (daysPassed >= daysToHarvest) {
                    percentage = 100; // Sudah melewati masa panen
                } else {
                    percentage = Math.min(100, Math.floor((daysPassed / daysToHarvest) * 100));
                }

                // Tentukan status dan warna
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

        const fetchData = async () => {
            try {
                const response = await fetch(API_URLS.TANAMAN);
                const data: Tanaman[] = await response.json();

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
                Alert.alert("Error", "Gagal memuat data countdown");
            } finally {
                setLoading(false);
            }
        };

        const handlePanenPress = (item: CountdownData) => {
            // Hanya bisa dipanen jika sudah waktunya atau terlambat
            if (item.daysRemaining <= 0) {
                setSelectedTanaman(item);
                setJumlahPanen(item.tanaman.jumlah.toString());
                setModalVisible(true);
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
                    setModalVisible(false);
                    setKualitas("");
                    setJumlahPanen("");
                    setSelectedTanaman(null);
                    // Refresh data
                    await fetchData();
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

        useEffect(() => {
            fetchData();
            const interval = setInterval(fetchData, 60000);
            return () => clearInterval(interval);
        }, []);

        const formatDate = (date: Date) => {
            const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
            return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
        };

        const isHarvestable = (item: CountdownData) => {
            return item.daysRemaining <= 0;
        };

        return (
            <View style={styles.container}>
                <MenuSidebar
                    activeMenu="Countdown"
                    gmail={Array.isArray(gmail) ? gmail[0] : gmail}
                    nama={Array.isArray(nama) ? nama[0] : nama}
                />

                <View style={styles.content}>
                    {/* Top Navigation Menu */}
                    <View style={styles.topNavContainer}>
                        <TouchableOpacity style={styles.navButton}
                            onPress={() => router.push({
                                pathname: "/(tabs)/tanaman/tanamanI",
                                params: {
                                    gmail: Array.isArray(gmail) ? gmail[0] : gmail,
                                    nama: Array.isArray(nama) ? nama[0] : nama,
                                },
                            })}>
                            <Text style={styles.navText}>Daftar Semua{'\n'}Tanaman</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.navButton, styles.navButtonActive]}>
                            <Text style={[styles.navText, styles.navTextActive]}>Countdown{'\n'}Masa Panen</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.navButton}
                            onPress={() => router.push({
                                pathname: "/(tabs)/tanaman/statistik",
                                params: {
                                    gmail: Array.isArray(gmail) ? gmail[0] : gmail,
                                    nama: Array.isArray(nama) ? nama[0] : nama,
                                },
                            })}>
                            <Text style={styles.navText}>Statistik{'\n'}Panen</Text>
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <ActivityIndicator size="large" color="#4A7C2C" style={styles.loader} />
                    ) : (
                        <ScrollView style={styles.scrollView}>
                            <View style={styles.cardsContainer}>
                                {countdownList.map((item) => (
                                    <View key={item.tanaman.id_tanaman} style={styles.card}>
                                        <View style={styles.cardHeader}>
                                            <View style={styles.plantInfo}>
                                                <View style={styles.plantIcon}>
                                                    <Text style={styles.plantIconText}>🌱</Text>
                                                </View>
                                                <View>
                                                    <Text style={styles.plantName}>{item.tanaman.nm_tanaman}</Text>
                                                    <Text style={styles.plantVariety}>{item.tanaman.varietas}</Text>
                                                </View>
                                            </View>
                                            <TouchableOpacity
                                                style={[
                                                    styles.statusBadge,
                                                    { backgroundColor: item.statusColor },
                                                    isHarvestable(item) && styles.statusBadgeClickable
                                                ]}
                                                onPress={() => handlePanenPress(item)}
                                                disabled={!isHarvestable(item)}
                                            >
                                                <Text style={styles.statusText}>{item.statusText}</Text>
                                            </TouchableOpacity>
                                        </View>

                                        <View style={styles.dateInfo}>
                                            <Clock size={16} color="#666" />
                                            <Text style={styles.dateText}>
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
                                ))}
                            </View>
                        </ScrollView>
                    )}
                </View>

                {/* Modal Panen */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Konfirmasi Panen</Text>

                            {selectedTanaman && (
                                <View style={styles.modalInfo}>
                                    <Text style={styles.modalInfoText}>
                                        Tanaman: {selectedTanaman.tanaman.nm_tanaman}
                                    </Text>
                                    <Text style={styles.modalInfoText}>
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

                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.cancelButton]}
                                    onPress={() => {
                                        setModalVisible(false);
                                        setKualitas("");
                                        setJumlahPanen("");
                                    }}
                                    disabled={processingPanen}
                                >
                                    <Text style={styles.cancelButtonText}>Batal</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.modalButton, styles.confirmButton]}
                                    onPress={prosessPanen}
                                    disabled={processingPanen}
                                >
                                    {processingPanen ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text style={styles.confirmButtonText}>Konfirmasi Panen</Text>
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
        container: {
            flex: 1,
            flexDirection: "row",
            backgroundColor: "#F5F1E8",
        },
        content: {
            flex: 1,
            padding: 20,
        },
        topNavContainer: {
            flexDirection: "row",
            backgroundColor: "#5A8C3A",
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
            fontSize: 12,
            fontWeight: "500",
            textAlign: "center",
            lineHeight: 16,
        },
        navTextActive: {
            fontWeight: "600",
        },
        loader: {
            marginTop: 50,
        },
        scrollView: {
            flex: 1,
        },
        cardsContainer: {
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 20,
            paddingBottom: 20,
        },
        card: {
            backgroundColor: "#fff",
            borderRadius: 15,
            padding: 20,
            width: "48%",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 5,
            elevation: 3,
        },
        cardHeader: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 15,
        },
        plantInfo: {
            flexDirection: "row",
            alignItems: "center",
            flex: 1,
        },
        plantIcon: {
            width: 50,
            height: 50,
            borderRadius: 25,
            backgroundColor: "#7BC940",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
        },
        plantIconText: {
            fontSize: 24,
        },
        plantName: {
            fontSize: 16,
            fontWeight: "700",
            color: "#333",
            marginBottom: 2,
        },
        plantVariety: {
            fontSize: 13,
            color: "#666",
        },
        statusBadge: {
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 15,
        },
        statusBadgeClickable: {
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 3,
            elevation: 4,
        },
        statusText: {
            color: "#fff",
            fontSize: 11,
            fontWeight: "600",
        },
        dateInfo: {
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 15,
        },
        dateText: {
            fontSize: 13,
            color: "#666",
            marginLeft: 8,
        },
        progressSection: {
            marginBottom: 15,
        },
        progressHeader: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
        },
        progressLabel: {
            fontSize: 14,
            fontWeight: "600",
            color: "#333",
        },
        progressPercentage: {
            fontSize: 13,
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
            fontSize: 13,
            color: "#666",
            marginBottom: 10,
        },
        panenButton: {
            backgroundColor: "#4CAF50",
            paddingVertical: 12,
            paddingHorizontal: 20,
            borderRadius: 10,
            alignItems: "center",
            marginTop: 10,
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
        // Modal Styles
        modalOverlay: {
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            justifyContent: "center",
            alignItems: "center",
        },
        modalContent: {
            backgroundColor: "#fff",
            borderRadius: 20,
            padding: 25,
            width: "90%",
            maxWidth: 400,
        },
        modalTitle: {
            fontSize: 20,
            fontWeight: "700",
            color: "#333",
            marginBottom: 20,
            textAlign: "center",
        },
        modalInfo: {
            backgroundColor: "#F5F5F5",
            padding: 15,
            borderRadius: 10,
            marginBottom: 20,
        },
        modalInfoText: {
            fontSize: 14,
            color: "#666",
            marginBottom: 5,
        },
        inputGroup: {
            marginBottom: 15,
        },
        inputLabel: {
            fontSize: 14,
            fontWeight: "600",
            color: "#333",
            marginBottom: 8,
        },
        input: {
            borderWidth: 1,
            borderColor: "#ddd",
            borderRadius: 10,
            padding: 12,
            fontSize: 14,
            backgroundColor: "#F9F9F9",
        },
        modalButtons: {
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 20,
            gap: 10,
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
            fontSize: 14,
            fontWeight: "600",
        },
        confirmButton: {
            backgroundColor: "#4CAF50",
        },
        confirmButtonText: {
            color: "#fff",
            fontSize: 14,
            fontWeight: "700",
        },
    });