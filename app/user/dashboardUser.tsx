import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    ScrollView,
    Image,
    TouchableOpacity,
    TextInput,
    Dimensions,
    Alert,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Leaf, Egg, Search, Home, Settings, User, Download } from "lucide-react-native";
import { API_URLS } from "../api/apiConfig";
import { useLanguage } from "./contexts/LanguageContext";
import { useTheme } from "./contexts/ThemeContext";
import { PawPrint } from "lucide-react-native";
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { tanamanDetailData } from "./detail";

const { width } = Dimensions.get("window");

interface UserData {
    gmail: string;
    nama: string;
    role: string;
}

interface Tanaman {
    id_tanaman: number;
    nm_tanaman: string;
    varietas: string;
    jumlah: number;
    tgl_tanam: string;
    lama_panen: string;
    lokasi: string;
    status: string;
    Foto: string | null;
}

interface Kandang {
    id_kandang: number;
    nm_kandang: string;
    kapasitas: number;
    jumlah_hewan: number;
    jenis_hewan: string;
    Hasil_Produksi: string;
    Jml_produksi: number;
    foto_hasil: string | null;
    keterangan: string | null;
}

export default function DashboardUser() {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [tanaman, setTanaman] = useState<Tanaman[]>([]);
    const [kandang, setKandang] = useState<Kandang[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const router = useRouter();
    const { t, language } = useLanguage();
    const { colors, isDark } = useTheme();

    console.log("Current language:", language);

    useEffect(() => {
        const loadUserData = async () => {
            try {
                const user = await AsyncStorage.getItem("user");
                if (user) {
                    const parsed = JSON.parse(user);

                    if (parsed.role?.toLowerCase() !== "user") {
                        const role = parsed.role?.toLowerCase();
                        switch (role) {
                            case "admin":
                                router.replace("/dashboard");
                                break;
                            case "kurir":
                                router.replace("/kurir/dashboardKurir");
                                break;
                            default:
                                router.replace("/LoginScreen");
                                break;
                        }
                        return;
                    }

                    setUserData({
                        gmail: parsed.gmail || "",
                        nama: parsed.nama || "",
                        role: parsed.role || "",
                    });

                    await Promise.all([fetchTanaman(), fetchKandang()]);
                } else {
                    router.replace("/LoginScreen");
                }
            } catch (error) {
                console.error("Error loading user data:", error);
                router.replace("/LoginScreen");
            } finally {
                setLoading(false);
            }
        };

        loadUserData();
    }, []);

    const fetchTanaman = async () => {
        try {
            const response = await fetch(API_URLS.TANAMAN);
            const data = await response.json();
            setTanaman(data);
        } catch (error) {
            console.error("Error fetching tanaman:", error);
        }
    };

    const fetchKandang = async () => {
        try {
            const response = await fetch(API_URLS.KANDANG);
            const data = await response.json();
            setKandang(data);
        } catch (error) {
            console.error("Error fetching kandang:", error);
        }
    };

    const getFilteredData = () => {
        let combined: Array<any> = [];

        if (selectedCategory === "All" || selectedCategory === "Vegetable") {
            combined = [
                ...combined,
                ...tanaman.map((t) => ({ ...t, type: "tanaman" })),
            ];
        }

        if (selectedCategory === "All" || selectedCategory === "Chicken") {
            combined = [
                ...combined,
                ...kandang.map((k) => ({ ...k, type: "kandang" })),
            ];
        }

        if (searchQuery) {
            combined = combined.filter((item) => {
                const searchLower = searchQuery.toLowerCase();
                if (item.type === "tanaman") {
                    return item.nm_tanaman.toLowerCase().includes(searchLower);
                } else {
                    return (
                        item.Hasil_Produksi.toLowerCase().includes(searchLower) ||
                        item.jenis_hewan.toLowerCase().includes(searchLower)
                    );
                }
            });
        }

        return combined;
    };

    const handleDownloadItem = async (item: any) => {
        try {
            if (item.type !== 'tanaman') {
                Alert.alert(
                    language === 'id' ? 'Info' : 'Info',
                    language === 'id' ? 'Download PDF hanya tersedia untuk tanaman' : 'PDF download only available for plants'
                );
                return;
            }

            const isIndonesian = language === 'id';

            // Gunakan data dari tanamanDetailData jika ada
            const detailData = tanamanDetailData[item.nm_tanaman] || {
                nama: item.nm_tanaman,
                deskripsi: {
                    id: "Detail lengkap tidak tersedia",
                    en: "Detailed information not available"
                },
                keunggulan: { id: [], en: [] },
                syaratTumbuh: {},
                caraPenanaman: { id: [], en: [] },
                lamaPanen: item.lama_panen || "-"
            };
        } catch (error) {
            console.error('Error generating PDF:', error);
            Alert.alert(
                language === 'id' ? 'Error' : 'Error',
                language === 'id' ? 'Gagal membuat PDF' : 'Failed to generate PDF'
            );
        }
    };

    const filteredData = getFilteredData();

    const styles = createStyles(colors, isDark, width);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>{t("loading")}</Text>
            </View>
        );
    }

    if (!userData) {
        return null;
    }

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Header with User Info */}
                <View style={styles.header}>
                    <View>
                        <View style={styles.userAvatar}>
                            <Text style={styles.avatarText}>
                                {userData.nama.charAt(0).toUpperCase()}
                            </Text>
                        </View>
                        <Text style={styles.userName}>{userData.nama}</Text>
                        <Text style={styles.userRole}>{t("welcomeTo")}</Text>
                    </View>
                </View>

                {/* Hero Banner */}
                <View style={styles.heroBanner}>
                    <View style={styles.bannerContent}>
                        <Text style={styles.bannerTitle}>{t("growWithoutSoil")}</Text>
                        <Text style={styles.bannerTitle}>{t("harvestWithoutLimits")}</Text>
                        <TouchableOpacity
                            style={styles.bannerButton}
                            onPress={() => router.push({
                                pathname: "/user/know_more",
                                params: {
                                    gmail: userData?.gmail || "",
                                    nama: userData?.nama || "",
                                }
                            })}
                        >
                            <Text style={styles.bannerButtonText}>{t("knowMore")}</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.bannerImageContainer}>
                        <Leaf size={100} color="#fff" strokeWidth={1.5} />
                    </View>
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Search size={20} color={colors.textSecondary} style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder={t("searchPlaceholder")}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholderTextColor={colors.textSecondary}
                    />
                </View>

                {/* Categories */}
                <View style={styles.categorySection}>
                    <View style={styles.categoryHeader}>
                        <Text style={styles.categoryTitle}>{t("categories")}</Text>
                    </View>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingRight: 20 }}
                    >
                        <View style={styles.categoryButtons}>
                            <TouchableOpacity
                                style={[
                                    styles.categoryButton,
                                    selectedCategory === "All" && styles.categoryButtonActive,
                                ]}
                                onPress={() => setSelectedCategory("All")}
                            >
                                <Leaf size={24} color={selectedCategory === "All" ? "#fff" : colors.primary} />
                                <Text
                                    style={[
                                        styles.categoryButtonText,
                                        selectedCategory === "All" && styles.categoryButtonTextActive,
                                    ]}
                                >
                                    {t("all")}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.categoryButton,
                                    selectedCategory === "Vegetable" && styles.categoryButtonActive,
                                ]}
                                onPress={() => setSelectedCategory("Vegetable")}
                            >
                                <Leaf size={24} color={selectedCategory === "Vegetable" ? "#fff" : colors.primary} />
                                <Text
                                    style={[
                                        styles.categoryButtonText,
                                        selectedCategory === "Vegetable" && styles.categoryButtonTextActive,
                                    ]}
                                >
                                    {t("vegetable")}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.categoryButton,
                                    selectedCategory === "Chicken" && styles.categoryButtonActive,
                                ]}
                                onPress={() => setSelectedCategory("Chicken")}
                            >
                                <PawPrint size={24} color={selectedCategory === "Chicken" ? "#fff" : colors.primary} />
                                <Text
                                    style={[
                                        styles.categoryButtonText,
                                        selectedCategory === "Chicken" && styles.categoryButtonTextActive,
                                    ]}
                                >
                                    {t("chicken")}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>

                {/* Products Grid */}
                <View style={styles.productsGrid}>
                    {filteredData.map((item, index) => (
                        <View key={index} style={styles.productCard}>
                            <View style={styles.productImageContainer}>
                                {item.Foto || item.foto_hasil ? (
                                    <Image
                                        source={{ uri: item.Foto || item.foto_hasil }}
                                        style={styles.productImage}
                                        resizeMode="cover"
                                    />
                                ) : (
                                    <View style={styles.productImagePlaceholder}>
                                        {item.type === "tanaman" ? (
                                            <Leaf size={50} color={colors.primary} strokeWidth={1.5} />
                                        ) : (
                                            <PawPrint size={50} color="#D2691E" strokeWidth={1.5} />
                                        )}
                                    </View>
                                )}
                            </View>

                            <View style={styles.productInfo}>
                                <Text style={styles.productName}>
                                    {item.type === "tanaman"
                                        ? item.nm_tanaman
                                        : item.jenis_hewan}
                                </Text>
                                <TouchableOpacity
                                    style={styles.detailButton}
                                    onPress={() => {
                                        if (item.type === "tanaman") {
                                            router.push({
                                                pathname: "/user/detail",
                                                params: { nama: item.nm_tanaman }
                                            });
                                        } else {
                                            // Route ke detailHewan untuk hewan ternak
                                            router.push({
                                                pathname: "/user/detailHewan",
                                                params: { nama: item.jenis_hewan }
                                            });
                                        }
                                    }}
                                >
                                    <Text style={styles.detailButtonText}>{t("seeDetail")}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Empty State */}
                {filteredData.length === 0 && (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyStateText}>
                            {t("noProducts")}
                        </Text>
                    </View>
                )}

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Bottom Navigation */}
            <View style={styles.bottomNav}>
                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => router.push("/user/settings")}
                >
                    <Settings size={24} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.navItem, styles.navItemActive]}
                    onPress={() => router.push("/user/dashboardUser")}
                >
                    <Home size={28} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => router.push({
                        pathname: "/user/profile",
                        params: { from: "dashboard" }
                    })}
                >
                    <User size={24} color="#fff" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const createStyles = (colors: any, isDark: boolean, width: number) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollView: {
        flex: 1,
        backgroundColor: colors.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.background,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: colors.text,
    },
    header: {
        padding: 20,
        paddingTop: 40,
        backgroundColor: colors.background,
    },
    userAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: colors.secondary,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 8,
    },
    avatarText: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "700",
    },
    userName: {
        fontSize: 18,
        fontWeight: "700",
        color: colors.text,
    },
    userRole: {
        fontSize: 12,
        color: colors.textSecondary,
        marginTop: 2,
    },
    heroBanner: {
        margin: 20,
        marginTop: 10,
        backgroundColor: colors.primary,
        borderRadius: 20,
        padding: 20,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        overflow: "hidden",
    },
    bannerContent: {
        flex: 1,
    },
    bannerTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#fff",
        lineHeight: 24,
    },
    bannerButton: {
        marginTop: 15,
        backgroundColor: "rgba(255,255,255,0.3)",
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        alignSelf: "flex-start",
    },
    bannerButtonText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "600",
    },
    bannerImageContainer: {
        marginLeft: 10,
    },
    searchContainer: {
        marginHorizontal: 20,
        marginBottom: 20,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: isDark ? colors.card : "#f5f5f5",
        borderRadius: 12,
        paddingHorizontal: 15,
        height: 50,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: colors.text,
    },
    categorySection: {
        marginHorizontal: 20,
        marginBottom: 20,
    },
    categoryHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 15,
    },
    categoryTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: colors.text,
    },
    seeAllText: {
        fontSize: 14,
        color: colors.primary,
        fontWeight: "600",
    },
    categoryButtons: {
        flexDirection: "row",
        gap: 12,
    },
    categoryButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.card,
        borderWidth: 2,
        borderColor: colors.primary,
        borderRadius: 15,
        paddingHorizontal: 20,
        paddingVertical: 12,
        gap: 8,
    },
    categoryButtonActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    categoryButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.primary,
    },
    categoryButtonTextActive: {
        color: "#fff",
    },
    productsGrid: {
        marginHorizontal: 20,
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 15,
    },
    productCard: {
        width: (width - 55) / 2,
        backgroundColor: colors.card,
        borderRadius: 15,
        overflow: "hidden",
        elevation: isDark ? 0 : 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0 : 0.1,
        shadowRadius: 4,
        marginBottom: 5,
    },
    productImageContainer: {
        width: "100%",
        height: 150,
        backgroundColor: isDark ? colors.border : "#f5f5f5",
        position: "relative",
    },
    productImage: {
        width: "100%",
        height: "100%",
    },
    productImagePlaceholder: {
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: isDark ? colors.border : "#f9f9f9",
    },
    downloadIcon: {
        position: "absolute",
        top: 10,
        right: 10,
        backgroundColor: isDark ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.95)",
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
    },
    productInfo: {
        padding: 12,
        backgroundColor: colors.card,
    },
    productName: {
        fontSize: 15,
        fontWeight: "700",
        color: colors.text,
        marginBottom: 10,
        minHeight: 20,
    },
    detailButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        width: "100%",
        alignItems: "center",
    },
    detailButtonText: {
        color: "#fff",
        fontSize: 13,
        fontWeight: "700",
    },
    emptyState: {
        padding: 40,
        alignItems: "center",
    },
    emptyStateText: {
        fontSize: 16,
        color: colors.textSecondary,
        fontStyle: "italic",
    },
    bottomNav: {
        flexDirection: "row",
        backgroundColor: colors.primary,
        borderRadius: 35,
        marginHorizontal: 20,
        marginBottom: 20,
        paddingVertical: 15,
        paddingHorizontal: 30,
        justifyContent: "space-around",
        alignItems: "center",
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    navItem: {
        padding: 10,
    },
    navItemActive: {
        backgroundColor: "rgba(255,255,255,0.2)",
        borderRadius: 50,
        padding: 15,
    },
});