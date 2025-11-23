import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Home, Settings, User, Download } from "lucide-react-native";
import { useLanguage } from "./contexts/LanguageContext";
import { useTheme } from "./contexts/ThemeContext";
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

// Data detail tanaman hidroponik
export const tanamanDetailData: { [key: string]: any } = {
    Kangkung: {
        nama: "Kangkung",
        varietas: "Kangkung Bangkok",
        foto: null,
        deskripsi: {
            id: "Kangkung hidroponik adalah jenis sayuran yang dibudidayakan tanpa tanah menggunakan nutrisi terlarut dalam air. Teknik ini menghasilkan tanaman yang lebih bersih, segar, bebas pestisida.",
            en: "Hydroponic water spinach is a type of vegetable cultivated without soil using dissolved nutrients in water. This technique produces cleaner, fresher, pesticide-free plants."
        },
        keunggulan: {
            id: [
                "Bebas pestisida",
                "Pertumbuhan lebih cepat",
                "Daun lebih segar & renyah",
                "Dapat ditanam sepanjang tahun",
                "Hemat lahan & ramah lingkungan",
            ],
            en: [
                "Pesticide-free",
                "Faster growth",
                "Fresher & crispier leaves",
                "Can be grown year-round",
                "Space-saving & environmentally friendly",
            ]
        },
        syaratTumbuh: {
            ph: "5.5 – 6.5",
            ec: "1.0 – 1.8 mS/cm",
            suhuIdeal: "25–30°C",
            cahaya: "6–8 jam/hari",
            kelembapan: "60–80%",
        },
        caraPenanaman: {
            id: [
                {
                    title: "Penyemaian",
                    desc: "Rendam benih 2–4 jam, semai di rockwool basah. Benih tumbuh 2–3 hari.",
                },
                {
                    title: "Pindah Tanam",
                    desc: "Pindahkan saat bibit 7–10 hari ke sistem hidroponik (NFT/DFT).",
                },
                {
                    title: "Perawatan",
                    desc: "Cek nutrisi berkala, pastikan aliran air lancar & suhu stabil.",
                },
                {
                    title: "Panen",
                    desc: "Siap panen umur 25–30 hari.",
                },
            ],
            en: [
                {
                    title: "Seeding",
                    desc: "Soak seeds for 2-4 hours, sow in moist rockwool. Seeds germinate in 2-3 days.",
                },
                {
                    title: "Transplanting",
                    desc: "Transfer seedlings at 7-10 days to hydroponic system (NFT/DFT).",
                },
                {
                    title: "Maintenance",
                    desc: "Check nutrients regularly, ensure smooth water flow & stable temperature.",
                },
                {
                    title: "Harvest",
                    desc: "Ready to harvest at 25-30 days.",
                },
            ]
        },
        lamaPanen: "25–30 Hari",
    },
    "Bayam Hijau": {
        nama: "Bayam Hijau",
        varietas: "Bayam Hijau Lokal",
        foto: null,
        deskripsi: {
            id: "Bayam hijau hidroponik adalah sayuran kaya zat besi yang tumbuh tanpa tanah. Cocok untuk sistem NFT atau rakit apung, menghasilkan daun yang lebih tebal dan nutrisi tinggi.",
            en: "Hydroponic green spinach is an iron-rich vegetable that grows without soil. Suitable for NFT or floating raft systems, producing thicker leaves and high nutrients."
        },
        keunggulan: {
            id: [
                "Kaya zat besi & vitamin A",
                "Pertumbuhan cepat",
                "Bebas pestisida",
                "Daun lebih tebal",
                "Cocok untuk sistem NFT",
            ],
            en: [
                "Rich in iron & vitamin A",
                "Fast growth",
                "Pesticide-free",
                "Thicker leaves",
                "Suitable for NFT systems",
            ]
        },
        syaratTumbuh: {
            ph: "6.0 – 7.0",
            ec: "1.8 – 2.3 mS/cm",
            suhuIdeal: "20–25°C",
            cahaya: "6–8 jam/hari",
            kelembapan: "60–70%",
        },
        caraPenanaman: {
            id: [
                {
                    title: "Penyemaian",
                    desc: "Rendam benih 3–6 jam, semai di rockwool. Benih berkecambah 3–5 hari.",
                },
                {
                    title: "Pindah Tanam",
                    desc: "Pindahkan setelah bibit berumur 10–14 hari.",
                },
                {
                    title: "Perawatan",
                    desc: "Jaga pH dan EC stabil, pastikan sirkulasi air baik.",
                },
                {
                    title: "Panen",
                    desc: "Panen pada umur 25–30 hari setelah tanam.",
                },
            ],
            en: [
                {
                    title: "Seeding",
                    desc: "Soak seeds for 3-6 hours, sow in rockwool. Seeds germinate in 3-5 days.",
                },
                {
                    title: "Transplanting",
                    desc: "Transfer after seedlings are 10-14 days old.",
                },
                {
                    title: "Maintenance",
                    desc: "Maintain stable pH and EC, ensure good water circulation.",
                },
                {
                    title: "Harvest",
                    desc: "Harvest at 25-30 days after planting.",
                },
            ]
        },
        lamaPanen: "25–30 Hari",
    },
    Selada: {
        nama: "Selada",
        varietas: "Selada Keriting Hijau",
        foto: null,
        deskripsi: {
            id: "Selada hidroponik adalah jenis selada yang dibudidayakan tanpa tanah menggunakan nutrisi terlarut dalam air. Teknik ini menghasilkan tanaman yang lebih bersih, segar, bebas pestisida.",
            en: "Hydroponic lettuce is a type of lettuce cultivated without soil using dissolved nutrients in water. This technique produces cleaner, fresher, pesticide-free plants."
        },
        keunggulan: {
            id: [
                "Bebas pestisida",
                "Pertumbuhan lebih cepat",
                "Daun lebih segar & renyah",
                "Dapat ditanam sepanjang tahun",
                "Hemat lahan & ramah lingkungan",
            ],
            en: [
                "Pesticide-free",
                "Faster growth",
                "Fresher & crispier leaves",
                "Can be grown year-round",
                "Space-saving & environmentally friendly",
            ]
        },
        syaratTumbuh: {
            ph: "5.5 – 6.5",
            ec: "800 – 1200 ppm",
            suhuIdeal: "18–24°C",
            cahaya: "8 jam/hari",
            kelembapan: "50–70%",
        },
        caraPenanaman: {
            id: [
                {
                    title: "Penyemaian",
                    desc: "Gunakan rockwool, jaga tetap lembap. Benih tumbuh 2–3 hari.",
                },
                {
                    title: "Pindah Tanam",
                    desc: "Pindahkan saat bibit 2–3 daun sejati.",
                },
                {
                    title: "Perawatan",
                    desc: "Cek nutrisi berkala, pastikan aliran air lancar & suhu stabil.",
                },
                {
                    title: "Panen",
                    desc: "Siap panen umur 30–40 hari.",
                },
            ],
            en: [
                {
                    title: "Seeding",
                    desc: "Use rockwool, keep moist. Seeds germinate in 2-3 days.",
                },
                {
                    title: "Transplanting",
                    desc: "Transfer when seedlings have 2-3 true leaves.",
                },
                {
                    title: "Maintenance",
                    desc: "Check nutrients regularly, ensure smooth water flow & stable temperature.",
                },
                {
                    title: "Harvest",
                    desc: "Ready to harvest at 30-40 days.",
                },
            ]
        },
        lamaPanen: "35–45 Hari",
    },
};

export default function DetailTanamanScreen() {
    const router = useRouter();
    const { nama } = useLocalSearchParams();
    const { t, language } = useLanguage();
    const { colors, isDark } = useTheme();
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

    // Get detail data based on nama
    const detailData = tanamanDetailData[nama as string] || tanamanDetailData["Kangkung"];

    const generateHTML = () => {
        const isIndonesian = language === 'id';

        return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { 
              font-family: Arial, sans-serif; 
              padding: 20px; 
              line-height: 1.6; 
              color: #333;
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px; 
              border-bottom: 3px solid #4CAF50; 
              padding-bottom: 20px; 
            }
            .title { 
              color: #4CAF50; 
              font-size: 28px; 
              margin-bottom: 10px; 
              font-weight: bold;
            }
            .subtitle {
              color: #666;
              font-size: 14px;
            }
            .section { 
              margin-bottom: 25px; 
              page-break-inside: avoid;
            }
            .section-title { 
              color: #333; 
              font-size: 20px; 
              font-weight: bold; 
              margin-bottom: 12px; 
              border-left: 4px solid #4CAF50; 
              padding-left: 12px; 
            }
            .card { 
              background: #f9f9f9; 
              padding: 15px; 
              border-radius: 8px; 
              margin-bottom: 15px; 
            }
            .bullet-item { 
              margin-bottom: 10px;
              display: flex;
            }
            .bullet { 
              color: #4CAF50;
              margin-right: 8px;
              font-weight: bold;
            }
            .step-item { 
              margin-bottom: 15px; 
            }
            .step-title { 
              font-weight: bold; 
              color: #333; 
              margin-bottom: 5px; 
            }
            .step-desc { 
              color: #666; 
              margin-left: 20px;
            }
            .bold { 
              font-weight: bold; 
              color: #333;
            }
            .footer { 
              text-align: center; 
              margin-top: 40px; 
              padding-top: 20px;
              border-top: 2px solid #eee;
              color: #888; 
              font-size: 12px; 
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="title">${detailData.nama}</h1>
            <p class="subtitle">${isIndonesian ? 'Laporan Detail Tanaman Hidroponik' : 'Hydroponic Plant Detail Report'}</p>
          </div>

          <div class="section">
            <h2 class="section-title">${isIndonesian ? 'Deskripsi' : 'Description'}</h2>
            <div class="card">
              <p>${detailData.deskripsi[language]}</p>
            </div>
          </div>

          <div class="section">
            <h2 class="section-title">${isIndonesian ? 'Keunggulan' : 'Advantages'}</h2>
            <div class="card">
              ${detailData.keunggulan[language].map((item: string) => `
                <div class="bullet-item">
                  <span class="bullet">✓</span> <span>${item}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="section">
            <h2 class="section-title">${isIndonesian ? 'Syarat Tumbuh' : 'Growth Requirements'}</h2>
            <div class="card">
              <div class="bullet-item">
                <span class="bullet">•</span> 
                <span>pH: <span class="bold">${detailData.syaratTumbuh.ph}</span></span>
              </div>
              <div class="bullet-item">
                <span class="bullet">•</span> 
                <span>EC/TDS: <span class="bold">${detailData.syaratTumbuh.ec}</span></span>
              </div>
              <div class="bullet-item">
                <span class="bullet">•</span> 
                <span>${isIndonesian ? 'Suhu Ideal' : 'Ideal Temperature'}: <span class="bold">${detailData.syaratTumbuh.suhuIdeal}</span></span>
              </div>
              <div class="bullet-item">
                <span class="bullet">•</span> 
                <span>${isIndonesian ? 'Cahaya' : 'Light'}: <span class="bold">${detailData.syaratTumbuh.cahaya}</span></span>
              </div>
              <div class="bullet-item">
                <span class="bullet">•</span> 
                <span>${isIndonesian ? 'Kelembapan' : 'Humidity'}: <span class="bold">${detailData.syaratTumbuh.kelembapan}</span></span>
              </div>
            </div>
          </div>

          <div class="section">
            <h2 class="section-title">${isIndonesian ? 'Cara Penanaman' : 'Planting Method'}</h2>
            <div class="card">
              ${detailData.caraPenanaman[language].map((step: any, index: number) => `
                <div class="step-item">
                  <div class="step-title">${index + 1}. ${step.title}</div>
                  <div class="step-desc">${step.desc}</div>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="section">
            <h2 class="section-title">${isIndonesian ? 'Informasi Panen' : 'Harvest Information'}</h2>
            <div class="card">
              <div class="bullet-item">
                <span class="bullet">⏱</span> 
                <span>${isIndonesian ? 'Lama Panen' : 'Harvest Period'}: <span class="bold">${detailData.lamaPanen}</span></span>
              </div>
            </div>
          </div>

          <div class="footer">
            <p>${isIndonesian ? 'Dibuat pada' : 'Generated on'} ${new Date().toLocaleDateString(isIndonesian ? 'id-ID' : 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })}</p>
            <p>AetherApp - Hydroponic Management System</p>
          </div>
        </body>
        </html>
      `;
    };

    const handleDownloadPDF = async () => {
        try {
            setIsGeneratingPDF(true);

            const html = generateHTML();
            const { uri } = await Print.printToFileAsync({ html });

            const isAvailable = await Sharing.isAvailableAsync();
            if (isAvailable) {
                await Sharing.shareAsync(uri, {
                    UTI: '.pdf',
                    mimeType: 'application/pdf',
                    dialogTitle: language === 'id' ? 'Bagikan PDF' : 'Share PDF'
                });
            } else {
                Alert.alert(
                    language === 'id' ? 'Berhasil' : 'Success',
                    language === 'id' ? 'PDF berhasil dibuat!' : 'PDF successfully created!',
                    [{ text: 'OK' }]
                );
            }
        } catch (error) {
            console.error('Error generating PDF:', error);
            Alert.alert(
                language === 'id' ? 'Error' : 'Error',
                language === 'id' ? 'Gagal membuat PDF' : 'Failed to generate PDF',
                [{ text: 'OK' }]
            );
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    const styles = createStyles(colors, isDark);

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{detailData.nama} {t("detail")}</Text>
                <TouchableOpacity
                    onPress={handleDownloadPDF}
                    style={styles.downloadButton}
                    disabled={isGeneratingPDF}
                >
                    {isGeneratingPDF ? (
                        <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                        <Download size={24} color={colors.primary} />
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Image */}
                <View style={styles.imageContainer}>
                    {detailData.foto ? (
                        <Image
                            source={{ uri: detailData.foto }}
                            style={styles.image}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={styles.imagePlaceholder}>
                            <Image
                                source={{
                                    uri: "https://images.unsplash.com/photo-1622383563227-04401ab4e5ea?w=800",
                                }}
                                style={styles.image}
                                resizeMode="cover"
                            />
                        </View>
                    )}
                </View>

                {/* Description Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t("description")}</Text>
                    <View style={styles.card}>
                        <Text style={styles.descriptionText}>
                            {detailData.deskripsi[language]}
                        </Text>
                    </View>
                </View>

                {/* Keunggulan Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t("keunggulan")}</Text>
                    <View style={styles.card}>
                        {detailData.keunggulan[language].map((item: string, index: number) => (
                            <View key={index} style={styles.bulletItem}>
                                <Text style={styles.bullet}>•</Text>
                                <Text style={styles.bulletText}>{item}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Syarat Tumbuh Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t("syaratTumbuh")}</Text>
                    <View style={styles.card}>
                        <View style={styles.bulletItem}>
                            <Text style={styles.bullet}>•</Text>
                            <Text style={styles.bulletText}>
                                pH: <Text style={styles.boldText}>{detailData.syaratTumbuh.ph}</Text>
                            </Text>
                        </View>
                        <View style={styles.bulletItem}>
                            <Text style={styles.bullet}>•</Text>
                            <Text style={styles.bulletText}>
                                EC/TDS: <Text style={styles.boldText}>{detailData.syaratTumbuh.ec}</Text>
                            </Text>
                        </View>
                        <View style={styles.bulletItem}>
                            <Text style={styles.bullet}>•</Text>
                            <Text style={styles.bulletText}>
                                {language === "id" ? "Suhu Ideal" : "Ideal Temperature"}:{" "}
                                <Text style={styles.boldText}>{detailData.syaratTumbuh.suhuIdeal}</Text>
                            </Text>
                        </View>
                        <View style={styles.bulletItem}>
                            <Text style={styles.bullet}>•</Text>
                            <Text style={styles.bulletText}>
                                {language === "id" ? "Cahaya" : "Light"}:{" "}
                                <Text style={styles.boldText}>{detailData.syaratTumbuh.cahaya}</Text>
                            </Text>
                        </View>
                        <View style={styles.bulletItem}>
                            <Text style={styles.bullet}>•</Text>
                            <Text style={styles.bulletText}>
                                {language === "id" ? "Kelembapan" : "Humidity"}:{" "}
                                <Text style={styles.boldText}>{detailData.syaratTumbuh.kelembapan}</Text>
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Cara Penanaman Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t("caraPenanaman")}</Text>
                    <View style={styles.card}>
                        {detailData.caraPenanaman[language].map((item: any, index: number) => (
                            <View key={index} style={styles.stepItem}>
                                <Text style={styles.bullet}>•</Text>
                                <View style={styles.stepContent}>
                                    <Text style={styles.stepTitle}>{item.title}</Text>
                                    <Text style={styles.stepDesc}>{item.desc}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

                <View style={{ height: 40 }} />
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
                    onPress={() => router.push("/user/profile")}
                >
                    <User size={24} color="#fff" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 15,
        backgroundColor: colors.background,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: colors.text,
        flex: 1,
        textAlign: "center",
    },
    downloadButton: {
        padding: 5,
        width: 34,
        height: 34,
        justifyContent: "center",
        alignItems: "center",
    },
    scrollView: {
        flex: 1,
        backgroundColor: colors.background,
    },
    imageContainer: {
        width: "100%",
        height: 250,
        backgroundColor: isDark ? colors.border : "#f5f5f5",
    },
    image: {
        width: "100%",
        height: "100%",
    },
    imagePlaceholder: {
        width: "100%",
        height: "100%",
        backgroundColor: isDark ? colors.card : "#e0e0e0",
    },
    section: {
        marginTop: 20,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: colors.text,
        marginBottom: 12,
    },
    card: {
        backgroundColor: colors.card,
        borderWidth: 2,
        borderColor: colors.border,
        borderRadius: 12,
        padding: 16,
    },
    descriptionText: {
        fontSize: 14,
        color: colors.textSecondary,
        lineHeight: 22,
    },
    bulletItem: {
        flexDirection: "row",
        marginBottom: 8,
    },
    bullet: {
        fontSize: 16,
        color: colors.text,
        marginRight: 8,
        marginTop: 2,
    },
    bulletText: {
        flex: 1,
        fontSize: 14,
        color: colors.textSecondary,
        lineHeight: 22,
    },
    boldText: {
        fontWeight: "700",
        color: colors.text,
    },
    stepItem: {
        flexDirection: "row",
        marginBottom: 12,
    },
    stepContent: {
        flex: 1,
    },
    stepTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: colors.text,
        marginBottom: 4,
    },
    stepDesc: {
        fontSize: 13,
        color: colors.textSecondary,
        lineHeight: 20,
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