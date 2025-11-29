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

   
    const generateHTML = async () => {
        const isIndonesian = language === 'id';
        const imageUrl = detailData.foto || "https://images.unsplash.com/photo-1622383563227-04401ab4e5ea?w=800";

        // Convert image to base64
        let base64Image = '';
        try {
            // Fetch image and convert to base64
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const reader = new FileReader();

            base64Image = await new Promise((resolve, reject) => {
                reader.onloadend = () => {
                    resolve(reader.result as string);
                };
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.error('Error loading image:', error);
            // Use placeholder if image fails to load
            base64Image = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBOb3QgQXZhaWxhYmxlPC90ZXh0Pjwvc3ZnPg==';
        }

        return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">

  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: "Helvetica", Arial, sans-serif;
      padding: 45px 55px;
      color: #222;
      background: white;
    }

    /* LAYOUT HALAMAN */
    .page {
      page-break-after: always;
      width: 100%;
    }

    /* HEADER */
    .header {
      text-align: center;
      margin-bottom: 25px;
    }
    .title {
      font-size: 38px;
      font-weight: bold;
      color: #2E8B57;
    }
    .subtitle {
      font-size: 18px;
      color: #666;
      margin-top: 6px;
    }

    .divider {
      width: 100%;
      height: 4px;
      background: #2E8B57;
      margin: 18px auto 25px auto;
      border-radius: 6px;
    }

    /* IMAGE FULL WIDTH */
    .image-wrapper {
      display: flex;
      justify-content: center;
      margin: 0 auto 18px auto;
      width: 100%;
    }

    .plant-image {
      width: 100%;
      max-height: 420px;
      object-fit: cover;
      border-radius: 20px;
      box-shadow: 0 10px 18px rgba(0,0,0,0.25);
    }

    /* SECTION */
    .section {
      margin-bottom: 28px;
      page-break-inside: avoid;
    }

    .section-title {
      font-size: 20px;
      font-weight: 700;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      color: #222;
    }
    .bar {
      width: 6px;
      height: 20px;
      background: #2E8B57;
      border-radius: 4px;
      margin-right: 12px;
    }

    .card {
      background: #f8f8f8;
      border-radius: 12px;
      padding: 18px 20px;
      border: 1px solid #e0e0e0;
    }

    .description-text {
      font-size: 16px;
      line-height: 1.75;
      color: #444;
    }

    /* Bullet list */
    .bullet-item {
      display: flex;
      align-items: flex-start;
      margin-bottom: 10px;
    }
    .bullet {
      color: #2E8B57;
      font-size: 20px;
      margin-right: 10px;
      margin-top: -2px;
    }
    .bullet-text {
      font-size: 16px;
      color: #444;
    }

    /* Steps */
    .step-item {
      display: flex;
      margin-bottom: 18px;
    }
    .step-number {
      font-size: 18px;
      font-weight: bold;
      color: #2E8B57;
      margin-right: 12px;
    }
    .step-desc {
      font-size: 15px;
      color: #555;
      line-height: 1.6;
    }

  </style>
</head>

<body>

  <!-- PAGE 1 → otomatis penuh, tidak ada space kosong -->
  <div class="page">

    <div class="header">
      <div class="title">${detailData.nama}</div>
      <div class="subtitle">
        ${isIndonesian ? "Laporan Detail Tanaman Hidroponik" : "Hydroponic Plant Detail Report"}
      </div>
      <div class="divider"></div>
    </div>

    <div class="image-wrapper">
      <img src="${base64Image}" class="plant-image" />
    </div>

    <!-- Jika masih ada space kosong → deskripsi naik ke halaman ini -->
    <div class="section">
      <div class="section-title">
        <div class="bar"></div>
        ${isIndonesian ? "Deskripsi" : "Description"}
      </div>
      <div class="card">
        <div class="description-text">${detailData.deskripsi[language]}</div>
      </div>
    </div>

  </div>

  <!-- PAGE 2 -->
  <div class="page">

    <!-- KEUNGGULAN -->
    <div class="section">
      <div class="section-title">
        <div class="bar"></div>
        ${isIndonesian ? "Keunggulan" : "Advantages"}
      </div>
      <div class="card">
        ${detailData.keunggulan[language].map((i: any) => `
          <div class="bullet-item">
            <div class="bullet">✓</div>
            <div class="bullet-text">${i}</div>
          </div>
        `).join("")}
      </div>
    </div>

    <!-- SYARAT TUMBUH -->
    <div class="section">
      <div class="section-title">
        <div class="bar"></div>
        ${isIndonesian ? "Syarat Tumbuh" : "Growth Conditions"}
      </div>
      <div class="card">
        <div class="bullet-item"><b>pH:</b>&nbsp; ${detailData.syaratTumbuh.ph}</div>
        <div class="bullet-item"><b>EC/TDS:</b>&nbsp; ${detailData.syaratTumbuh.ec}</div>
        <div class="bullet-item"><b>Suhu:</b>&nbsp; ${detailData.syaratTumbuh.suhuIdeal}</div>
        <div class="bullet-item"><b>Cahaya:</b>&nbsp; ${detailData.syaratTumbuh.cahaya}</div>
        <div class="bullet-item"><b>Kelembapan:</b>&nbsp; ${detailData.syaratTumbuh.kelembapan}</div>
      </div>
    </div>

    <!-- CARA PENANAMAN -->
    <div class="section">
      <div class="section-title">
        <div class="bar"></div>
        ${isIndonesian ? "Cara Penanaman" : "Planting Method"}
      </div>
      <div class="card">
        ${detailData.caraPenanaman[language].map((step: any, index: number) => `
          <div class="step-item">
            <div class="step-number">${index + 1}.</div>
            <div class="step-desc">
              <b>${step.title}</b><br/>
              ${step.desc}
            </div>
          </div>
        `).join('')}
      </div>
    </div>

  </div>

</body>
</html>
`;



    };

    // Update fungsi handleDownloadPDF:
    const handleDownloadPDF = async () => {
        try {
            setIsGeneratingPDF(true);

            // Generate HTML with embedded image
            const html = await generateHTML();

            const { uri } = await Print.printToFileAsync({
                html,
                width: 612, // Letter size width in points
                height: 792, // Letter size height in points
            });

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