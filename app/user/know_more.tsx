import React from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Dimensions,
    StatusBar,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useLanguage } from "./contexts/LanguageContext";
import { useTheme } from "./contexts/ThemeContext";

const { width, height } = Dimensions.get("window");

export default function KnowMoreScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { t } = useLanguage();
    const { colors, isDark } = useTheme();

    const styles = createStyles(colors, isDark);

    return (
        <View style={styles.container}>
           

            {/* Header Orange */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.backButton}
                >
                    <ChevronLeft size={24} color={colors.text} strokeWidth={2.5} />
                </TouchableOpacity>

                <View style={styles.placeholder} />
            </View>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
            >
                {/* Background Section with Curved Green */}
                <View style={styles.topSection}>
                
                    <View style={styles.greenCurvedSection} />

                    {/* Images Overlay */}
                    <View style={styles.imagesOverlay}>
                        {/* Large Image */}
                        <View style={styles.largeImageContainer}>
                            <Image
                                source={require("../../assets/images/hydroponic-farm.png")}
                                style={styles.image}
                                resizeMode="cover"
                            />
                        </View>

                        {/* Small Images Row */}
                        <View style={styles.smallImagesContainer}>
                            <View style={styles.smallImageBox}>
                                <Image
                                    source={require("../../assets/images/farmer-woman.png")}
                                    style={styles.image}
                                    resizeMode="cover"
                                />
                            </View>
                            <View style={styles.smallImageBox}>
                                <Image
                                    source={require("../../assets/images/chicken-farm.png")}
                                    style={styles.image}
                                    resizeMode="cover"
                                />
                            </View>
                        </View>
                    </View>
                </View>

                {/* Green Cards Section */}
                <View style={styles.cardsSection}>
                    {/* Card 1 */}
                    <View style={[styles.card, styles.cardLight]}>
                        <Text style={styles.cardText}>
                            {t("hydroponicInfo")}
                        </Text>
                    </View>

                    {/* Card 2 */}
                    <View style={[styles.card, styles.cardDark]}>
                        <Text style={styles.cardText}>
                            {t("agrotechInspiration")}
                        </Text>
                    </View>

                    {/* Card 3 */}
                    <View style={[styles.card, styles.cardLight]}>
                        <Text style={styles.cardText}>
                            {t("agriyaponikMission")}
                        </Text>
                    </View>
                </View>

                <View style={{ height: 30 }} />
            </ScrollView>
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
        paddingHorizontal: 16,
        backgroundColor: colors.background,
    },
    backButton: {
        width: 20,
        height: 70,
        justifyContent: "center",
        alignItems: "center",
    },
    
    placeholder: {
        width: 40,
    },
    scrollView: {
        flex: 1,
    },
    topSection: {
        height: 380,
        position: "relative",
    },

    greenCurvedSection: {
        position: "absolute",
        top: 0,
        right: 0,
        width: width * 0.45,
        height: "100%",
        backgroundColor: "#5a8c36",
        borderBottomLeftRadius: 250,
        borderTopLeftRadius: 250,
        transform: [{ scaleX: 1.3 }], // bikin melengkung dinamis
    },

    imagesOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        paddingLeft: 25,
        paddingTop: -10,
    },
    largeImageContainer: {
        width: width * 0.62,
        height: 200,
        borderRadius: 25,
        overflow: "hidden",
        backgroundColor: "#FFF",
        elevation: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
        marginBottom: 18,
    },
    smallImagesContainer: {
        flexDirection: "row",
        justifyContent: "flex-start",
        gap: 18,
        paddingRight: 25,
    },
    smallImageBox: {
        width: width * 0.38,
        height: 140,
        borderRadius: 22,
        overflow: "hidden",
        backgroundColor: "#FFF",
        elevation: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
    },
    image: {
        width: "100%",
        height: "100%",
    },
    cardsSection: {
        paddingHorizontal: 20,
        paddingTop: 20,
        gap: 15,
    },
    card: {
        borderRadius: 22,
        padding: 22,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
    },
    cardLight: {
        backgroundColor: colors.primary,
    },
    cardDark: {
        backgroundColor: colors.secondary,
    },
    cardText: {
        color: colors.text,
        fontSize: 13,
        lineHeight: 20,
        textAlign: "justify",
        fontWeight: "400",
        letterSpacing: 0.2,
    },
});