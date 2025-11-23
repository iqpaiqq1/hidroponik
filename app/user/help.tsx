import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Linking,
    TextInput,
    Alert,
} from "react-native";
import { useRouter } from "expo-router";
import {
    ChevronLeft,
    ChevronDown,
    ChevronUp,
    Mail,
    Phone,
    MessageCircle,
    BookOpen,
    HelpCircle,
    FileText,
    Video,
    Send,
} from "lucide-react-native";
import { useLanguage } from "./contexts/LanguageContext";
import { useTheme } from "./contexts/ThemeContext";

interface FAQItem {
    id: number;
    question: string;
    answer: string;
}

export default function HelpScreen() {
    const router = useRouter();
    const { t, language } = useLanguage();
    const { colors, isDark } = useTheme();
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [message, setMessage] = useState("");

    const styles = createStyles(colors, isDark);

    const faqsID: FAQItem[] = [
        {
            id: 1,
            question: "Bagaimana cara memulai menggunakan AgroTech?",
            answer: "Untuk memulai, cukup daftar akun baru, lengkapi profil Anda, dan melihat tanaman hidorponik kami",
        },
        {
            id: 2,
            question: "Apakah AgroTech gratis?",
            answer: "Ya, AgroTech dapat digunakan secara gratis",
        },
        {
            id: 3,
            question: "Apakah data saya aman?",
            answer: "Keamanan data Anda adalah prioritas kami. Semua data dienkripsi dan disimpan dengan standar keamanan tinggi. Kami tidak akan membagikan data Anda kepada pihak ketiga.",
        },
        {
            id: 4,
            question: "Bagaimana cara melaporkan bug atau masalah?",
            answer: "Anda bisa menghubungi kami melalui email Agriyaponik@gmail.com atau gunakan form bantuan di bawah. Tim kami akan merespons dalam 1x24 jam.",
        },
    ];

    const faqsEN: FAQItem[] = [
        {
            id: 1,
            question: "How do I get started with AgroTech?",
            answer: "To get started, simply register a new account, complete your profile, and view our hydroponic plants.",
        },
        {
            id: 2,
            question: "Is AgroTech free?",
            answer: "Yes, AgroTech can be used for free.",
        },
        {
            id: 3,
            question: "Is my data safe?",
            answer: "Your data security is our priority. All data is encrypted and stored with high-level security standards. We will not share your data with third parties.",
        },
        {
            id: 4,
            question: "How do I report bugs or issues?",
            answer: "You can contact us via email at Agriyaponik@gmail.com or use the help form below. Our team will respond within 24 hours.",
        },
    ];
    const dummyQuestions: FAQItem[] = [
        {
            id: 1,
            question: "Kenapa tanaman bisa tumbuh tanpa tanah?",
            answer: "Karena akar mendapat nutrisi dari larutan kaya mineral pada sistem hidroponik.",
        },
        {
            id: 2,
            question: "Berapa lama waktu panen sayur hidroponik?",
            answer: "Rata-rata 25–40 hari tergantung jenis tanamannya.",
        },
        {
            id: 3,
            question: "Apakah hidroponik membutuhkan sinar matahari?",
            answer: "Ya, tanaman tetap membutuhkan cahaya untuk fotosintesis.",
        },
        {
            id: 4,
            question: "Apakah sistem hidroponik boros air?",
            answer: "Justru lebih hemat hingga 90% dibanding pertanian konvensional.",
        },
    ];

    const faqRef = React.useRef<ScrollView>(null);
    const faqs = dummyQuestions;

    const toggleFAQ = (id: number) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const handleLinkPress = (url: string) => {
        Linking.openURL(url).catch((err) =>
            console.error("Failed to open URL:", err)
        );
    };

    const handleSendMessage = () => {
        if (!message.trim()) {
            Alert.alert(
                language === "id" ? "Pesan Kosong" : "Empty Message",
                language === "id"
                    ? "Silakan tulis pesan Anda terlebih dahulu."
                    : "Please write your message first."
            );
            return;
        }

        Alert.alert(
            language === "id" ? "Pesan Terkirim" : "Message Sent",
            language === "id"
                ? "Terima kasih! Pesan Anda telah dikirim. Tim kami akan segera merespons."
                : "Thank you! Your message has been sent. Our team will respond shortly.",
            [
                {
                    text: "OK",
                    onPress: () => setMessage(""),
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar
                barStyle={isDark ? "light-content" : "dark-content"}
                backgroundColor={colors.background}
            />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.backButton}
                >
                    <ChevronLeft size={26} color={colors.text} strokeWidth={2.5} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>
                    {language === "id" ? "Bantuan" : "Help"}
                </Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView
                ref={faqRef}
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
            >

                <View style={styles.heroSection}>
                    <View style={styles.heroIconContainer}>
                        <HelpCircle size={40} color="#5a8c36" strokeWidth={2} />
                    </View>
                    <Text style={styles.heroTitle}>
                        {language === "id"
                            ? "Bagaimana kami bisa membantu?"
                            : "How can we help you?"}
                    </Text>
                    <Text style={styles.heroSubtitle}>
                        {language === "id"
                            ? "Temukan jawaban atau hubungi tim support kami"
                            : "Find answers or contact our support team"}
                    </Text>
                </View>


                <View style={styles.quickActionsContainer}>
                    <Text style={styles.sectionTitle}>
                        {language === "id" ? "Akses Cepat" : "Quick Access"}
                    </Text>

                    <View style={styles.quickActionsGrid}>
                        <TouchableOpacity
                            style={styles.quickActionCard}
                            onPress={() => handleLinkPress("https://share.google/bLYMbzmLuHmutJrcp")}
                        >
                            <BookOpen size={28} color="#5a8c36" strokeWidth={2} />
                            <Text style={styles.quickActionText}>
                                {language === "id" ? "Dokumentasi" : "Documentation"}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.quickActionCard}
                            onPress={() => {
                                faqRef.current?.scrollTo({ y: 300, animated: true });
                            }}
                        >
                            <MessageCircle size={28} color="#5a8c36" strokeWidth={2} />
                            <Text style={styles.quickActionText}>Pertanyaan</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* FAQ Section */}
                <View style={styles.faqSection}>
                    <Text style={styles.sectionTitle}>
                        {language === "id"
                            ? "Pertanyaan yang Sering Diajukan"
                            : "Frequently Asked Questions"}
                    </Text>

                    {faqs.map((faq) => (
                        <View key={faq.id} style={styles.faqItem}>
                            <TouchableOpacity
                                style={styles.faqQuestion}
                                onPress={() => toggleFAQ(faq.id)}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.faqQuestionText}>
                                    {faq.question}
                                </Text>
                                {expandedId === faq.id ? (
                                    <ChevronUp size={20} color={colors.text} />
                                ) : (
                                    <ChevronDown size={20} color={colors.text} />
                                )}
                            </TouchableOpacity>
                            {expandedId === faq.id && (
                                <View style={styles.faqAnswer}>
                                    <Text style={styles.faqAnswerText}>
                                        {faq.answer}
                                    </Text>
                                </View>
                            )}
                        </View>
                    ))}
                </View>

                {/* Contact Support */}
                <View style={styles.contactSection}>
                    <Text style={styles.sectionTitle}>
                        {language === "id" ? "Hubungi Support" : "Contact Support"}
                    </Text>

                    <TouchableOpacity
                        style={styles.contactItem}
                        onPress={() =>
                            handleLinkPress("mailto:support@agrotech.com")
                        }
                    >
                        <View style={styles.contactIconBg}>
                            <Mail size={22} color="#5a8c36" strokeWidth={2} />
                        </View>
                        <View style={styles.contactContent}>
                            <Text style={styles.contactTitle}>Email</Text>
                            <Text style={styles.contactText}>
                                support@agrotech.com
                            </Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.contactItem}
                        onPress={() => handleLinkPress("tel:+6281234567890")}
                    >
                        <View style={styles.contactIconBg}>
                            <Phone size={22} color="#5a8c36" strokeWidth={2} />
                        </View>
                        <View style={styles.contactContent}>
                            <Text style={styles.contactTitle}>
                                {language === "id" ? "Telepon" : "Phone"}
                            </Text>
                            <Text style={styles.contactText}>+62 812-3456-7890</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.contactItem}
                        onPress={() =>
                            handleLinkPress("https://wa.me/6281234567890")
                        }
                    >
                        <View style={styles.contactIconBg}>
                            <MessageCircle size={22} color="#5a8c36" strokeWidth={2} />
                        </View>
                        <View style={styles.contactContent}>
                            <Text style={styles.contactTitle}>WhatsApp</Text>
                            <Text style={styles.contactText}>+62 812-3456-7890</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Send Message Form */}
                <View style={styles.messageSection}>
                    <Text style={styles.sectionTitle}>
                        {language === "id" ? "Kirim Pesan" : "Send Message"}
                    </Text>

                    <View style={styles.messageCard}>
                        <TextInput
                            style={styles.messageInput}
                            placeholder={
                                language === "id"
                                    ? "Tulis pesan Anda di sini..."
                                    : "Write your message here..."
                            }
                            placeholderTextColor={colors.textSecondary}
                            multiline
                            numberOfLines={6}
                            value={message}
                            onChangeText={setMessage}
                            textAlignVertical="top"
                        />

                        <TouchableOpacity
                            style={styles.sendButton}
                            onPress={handleSendMessage}
                        >
                            <Send size={20} color="#fff" strokeWidth={2} />
                            <Text style={styles.sendButtonText}>
                                {language === "id" ? "Kirim" : "Send"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Help Info */}
                <View style={styles.infoSection}>
                    <Text style={styles.infoText}>
                        {language === "id"
                            ? "Tim support kami tersedia 24/7 untuk membantu Anda. Waktu respons rata-rata: 1-2 jam."
                            : "Our support team is available 24/7 to help you. Average response time: 1-2 hours."}
                    </Text>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const createStyles = (colors: any, isDark: boolean) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        header: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 16,
            paddingTop: 50,
            paddingBottom: 15,
            backgroundColor: colors.background,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        backButton: {
            width: 40,
            height: 40,
            justifyContent: "center",
            alignItems: "flex-start",
        },
        headerTitle: {
            fontSize: 20,
            fontWeight: "700",
            color: colors.text,
            flex: 1,
            textAlign: "center",
        },
        placeholder: {
            width: 40,
        },
        scrollView: {
            flex: 1,
        },
        heroSection: {
            alignItems: "center",
            paddingVertical: 30,
            paddingHorizontal: 20,
        },
        heroIconContainer: {
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: isDark ? "#2a4a1a" : "#e8f5e9",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 15,
        },
        heroTitle: {
            fontSize: 24,
            fontWeight: "700",
            color: colors.text,
            marginBottom: 10,
            textAlign: "center",
        },
        heroSubtitle: {
            fontSize: 15,
            color: colors.textSecondary,
            textAlign: "center",
        },
        quickActionsContainer: {
            paddingHorizontal: 20,
            marginBottom: 30,
        },
        sectionTitle: {
            fontSize: 18,
            fontWeight: "700",
            color: colors.text,
            marginBottom: 15,
        },
        quickActionsGrid: {
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 12,
        },
        quickActionCard: {
            width: "48%",
            backgroundColor: colors.card,
            borderRadius: 15,
            padding: 20,
            alignItems: "center",
            elevation: 2,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: isDark ? 0 : 0.1,
            shadowRadius: 3,
        },
        quickActionText: {
            fontSize: 13,
            fontWeight: "600",
            color: colors.text,
            marginTop: 10,
        },
        faqSection: {
            paddingHorizontal: 20,
            marginBottom: 30,
        },
        faqItem: {
            backgroundColor: colors.card,
            borderRadius: 12,
            marginBottom: 12,
            overflow: "hidden",
            elevation: 2,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: isDark ? 0 : 0.08,
            shadowRadius: 3,
        },
        faqQuestion: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            padding: 16,
        },
        faqQuestionText: {
            fontSize: 15,
            fontWeight: "600",
            color: colors.text,
            flex: 1,
            marginRight: 10,
        },
        faqAnswer: {
            paddingHorizontal: 16,
            paddingBottom: 16,
            paddingTop: 0,
        },
        faqAnswerText: {
            fontSize: 14,
            color: colors.textSecondary,
            lineHeight: 22,
        },
        contactSection: {
            paddingHorizontal: 20,
            marginBottom: 30,
        },
        contactItem: {
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.card,
            padding: 16,
            borderRadius: 12,
            marginBottom: 12,
            elevation: 2,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: isDark ? 0 : 0.08,
            shadowRadius: 3,
        },
        contactIconBg: {
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: isDark ? "#2a4a1a" : "#e8f5e9",
            justifyContent: "center",
            alignItems: "center",
            marginRight: 15,
        },
        contactContent: {
            flex: 1,
        },
        contactTitle: {
            fontSize: 13,
            color: colors.textSecondary,
            marginBottom: 3,
        },
        contactText: {
            fontSize: 15,
            fontWeight: "600",
            color: colors.text,
        },
        messageSection: {
            paddingHorizontal: 20,
            marginBottom: 30,
        },
        messageCard: {
            backgroundColor: colors.card,
            borderRadius: 15,
            padding: 16,
            elevation: 2,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: isDark ? 0 : 0.08,
            shadowRadius: 3,
        },
        messageInput: {
            backgroundColor: isDark ? colors.border : "#f5f5f5",
            borderRadius: 12,
            padding: 15,
            fontSize: 14,
            color: colors.text,
            minHeight: 120,
            marginBottom: 15,
        },
        sendButton: {
            flexDirection: "row",
            backgroundColor: "#5a8c36",
            paddingVertical: 14,
            borderRadius: 12,
            justifyContent: "center",
            alignItems: "center",
            gap: 8,
        },
        sendButtonText: {
            color: "#fff",
            fontSize: 16,
            fontWeight: "600",
        },
        infoSection: {
            paddingHorizontal: 20,
            paddingVertical: 20,
            backgroundColor: isDark ? colors.card : "#f9f9f9",
            marginHorizontal: 20,
            borderRadius: 12,
            marginBottom: 20,
        },
        infoText: {
            fontSize: 13,
            color: colors.textSecondary,
            lineHeight: 20,
            textAlign: "center",
        },
    });