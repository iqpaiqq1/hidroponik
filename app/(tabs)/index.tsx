import React, { useState } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Dimensions,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ImageStyle
} from "react-native";

const { width } = Dimensions.get("window");
const isSmallScreen = width < 768;

interface LandingPageProps {
  navigation: any;
}

export default function LandingPage({ navigation }: LandingPageProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });
  const router = useRouter();
  const [hoveredLink, setHoveredLink] = useState<number | null>(null);

  const handleSubmit = () => {
    if (formData.name && formData.email && formData.message) {
      Alert.alert("Terima Kasih!", `Pesan Anda sudah dikirim, ${formData.name}!`);
      setFormData({ name: "", email: "", message: "" });
    } else {
      Alert.alert("Error", "Mohon lengkapi semua field!");
    }
  };

  const handleLogin = () => {
    router.push("/LoginScreen");
  };

  const NavLink = ({ text, index }: { text: string; index: number }) => {
    const isHovered = hoveredLink === index;

    return (
      <TouchableOpacity
        {...(Platform.OS === 'web' ? {
          onMouseEnter: () => setHoveredLink(index),
          onMouseLeave: () => setHoveredLink(null)
        } as any : {})}
        style={[styles.navLinkContainer, isHovered && styles.navLinkHovered]}
      >
        <Text style={styles.navLink}>{text}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#1f4d2f" />
      <ScrollView style={styles.container}>
        {/* Navbar */}
        <View style={styles.navbar}>
          <Text style={styles.logo}>Agrotech</Text>
          <View style={styles.navLinks}>
            {!isSmallScreen && (
              <>
                <NavLink text="Home" index={0} />
                <NavLink text="Service" index={1} />
                <NavLink text="About" index={2} />
                <NavLink text="Contact" index={3} />
              </>
            )}
            <TouchableOpacity style={styles.joinButton} onPress={handleLogin}>
              <Text style={styles.joinButtonText}>Join Us!</Text>
            </TouchableOpacity>
          </View>
        </View>

      
        <View style={styles.hero}>
          <Image
            source={{ uri: "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=1600" }}
            style={styles.heroImage}
          />
          <View style={styles.heroOverlay}>
            <Text style={styles.heroTitle}>
              Healty Agrifood{"\n"}Technology
            </Text>
          </View>
        </View>

        {/* Our Service Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Our Service</Text>
          </View>

          <View style={styles.servicesGrid}>
            <View style={styles.serviceCard}>
              <Text style={styles.serviceTitle}>Planting</Text>
              <Text style={styles.serviceText}>
                Experience how we grow fresh and nutritious hydroponic vegetables using eco-friendly systems that save water and increase yields.
              </Text>
            </View>

            <View style={styles.serviceCard}>
              <Text style={styles.serviceTitle}>Edu-Visit</Text>
              <Text style={styles.serviceText}>
                Join our educational tours to learn about hydroponic farming, microgreens, and sustainable food production - perfect for schools and communities!
              </Text>
            </View>

            <View style={styles.serviceCard}>
              <Text style={styles.serviceTitle}>Hydroponic Veggies</Text>
              <Text style={styles.serviceText}>
                Get premium fresh vegetables and microgreens, freshly harvested from our greenhouse.
              </Text>
            </View>

            <View style={styles.serviceCard}>
              <Text style={styles.serviceTitle}>Omega-3 Eggs</Text>
              <Text style={styles.serviceText}>
                Rich in nutrition and contains Omega-3 eggs, ensuring healthy and sustainable food sources.
              </Text>
            </View>
          </View>
        </View>

        {/* About Us Section */}
        <View style={[styles.section, styles.aboutSection]}>
          <Text style={styles.aboutTitle}>About Us</Text>
          <View style={styles.aboutContent}>
            <View style={styles.aboutText}>
              <Text style={styles.aboutParagraph}>
                Agriyaponik is a company that is focused on developing sustainable and healthy food systems through hydroponic technology and free-range chicken farming that is innovative and environmentally friendly, creating a better future for people and the planet.
              </Text>
              <Text style={styles.aboutParagraph}>
                We are committed to developing Agri science, technology, and care for nature to produce high-quality food, microgreens, and Omega-3 eggs. We're excited to strengthen local food security and create a healthier food ecosystem.
              </Text>
              <Text style={styles.aboutParagraph}>
                We bring together innovation and sustainability to grow fresh, high-quality, fresh, nutritious, and sustainable hydroponic produce.
              </Text>
            </View>
            {!isSmallScreen && (
              <Image
                source={{ uri: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800" }}
                style={styles.aboutImage}
              />
            )}
          </View>
        </View>

        {/* Location Section */}
        <View style={styles.section}>
          <Text style={styles.aboutTitle}>Location</Text>
          <Text style={styles.locationText}>
            Jl. Hutan No.54, RT.07/RW.01, Kec. Dua Wetan, Kec. Ciracas, Kota Jakarta Timur, Daerah Khusus Ibukota Jakarta 13730
          </Text>
          <View style={styles.mapPlaceholder}>
            <Text style={styles.mapText}>📍 Map Location</Text>
          </View>
        </View>

        {/* Contact Form Section */}
        <View style={styles.contactSection}>
          <View style={styles.contactHeader}>
            <Text style={styles.contactEmoji}>🌱</Text>
            <View>
              <Text style={styles.contactTitle}>Siap Memulai Pertanian Modern?</Text>
              <Text style={styles.contactSubtitle}>
                Konsultasi gratis dengan ahli kami dan dapatkan penawaran terbaik untuk sistem Hidroponik greenhouse Anda!
              </Text>
            </View>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.formRow}>
              <View style={styles.formField}>
                <Text style={styles.label}>Nama</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Masukkan nama Anda"
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                />
              </View>
              <View style={styles.formField}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="User@gmail.com"
                  keyboardType="email-address"
                  value={formData.email}
                  onChangeText={(text) => setFormData({ ...formData, email: text })}
                />
              </View>
            </View>

            <View style={styles.formFieldFull}>
              <Text style={styles.label}>Pesan</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Pernyataan kebutuhan Anda..."
                multiline
                numberOfLines={4}
                value={formData.message}
                onChangeText={(text) => setFormData({ ...formData, message: text })}
              />
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>
                Kirim untuk Agriyaponik@gmail.com
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerContent}>
            <View style={styles.footerColumn}>
              <Text style={styles.footerTitle}>Solusi pertanian</Text>
              <Text style={styles.footerText}>Sistem hidroponik</Text>
              <Text style={styles.footerText}>Greenhouse modern</Text>
              <Text style={styles.footerText}>Konsultasi pertanian</Text>
            </View>

            <View style={styles.footerColumn}>
              <Text style={styles.footerLogo}>Agrotech</Text>
            </View>

            <View style={styles.footerColumn}>
              <Text style={styles.footerTitle}>Find Us On</Text>
              <Text style={styles.footerText}>+6281112229555</Text>
              <Text style={styles.footerText}>Agriyaponik19@gmail.com</Text>
              <Text style={styles.footerText}>www.Instagram.Agriyaponik.com</Text>
              <Text style={styles.footerText}>www.Tiktok.Agriyaponik.com</Text>
            </View>
          </View>
          <Text style={styles.copyright}>
            © 2025 Agrotech. All rights reserved. Dibuat dengan cinta untuk pertanian Indonesia.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#1f4d2f",
  },
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  navbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1f4d2f",
    paddingHorizontal: isSmallScreen ? 16 : 32,
    paddingVertical: isSmallScreen ? 12 : 16,
  },
  logo: {
    fontSize: isSmallScreen ? 20 : 24,
    fontWeight: "bold",
    color: "#fff",
    fontStyle: "italic",
  },
  navLinks: {
    flexDirection: "row",
    alignItems: "center",
    gap: isSmallScreen ? 4 : 8,
    flexWrap: "wrap",
  },
  navLinkContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  navLinkHovered: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  navLink: {
    color: "#fff",
    fontSize: isSmallScreen ? 12 : 14,
    fontWeight: "500",
  },
  joinButton: {
    backgroundColor: "#4a7c2c",
    paddingHorizontal: isSmallScreen ? 12 : 16,
    paddingVertical: isSmallScreen ? 6 : 8,
    borderRadius: 8,
  },
  joinButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: isSmallScreen ? 13 : 14,
  },
  hero: {
    height: isSmallScreen ? 300 : 500,
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  heroTitle: {
    fontSize: isSmallScreen ? 32 : 56,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  section: {
    paddingHorizontal: isSmallScreen ? 16 : 32,
    paddingVertical: isSmallScreen ? 32 : 48,
  },
  sectionHeader: {
    alignItems: "center",
    marginBottom: 32,
  },
  sectionTitle: {
    backgroundColor: "#1f4d2f",
    color: "#fff",
    fontSize: isSmallScreen ? 20 : 24,
    fontWeight: "bold",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  servicesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    justifyContent: "center",
  },
  serviceCard: {
    backgroundColor: "#fff",
    padding: isSmallScreen ? 16 : 24,
    borderRadius: 16,
    width: isSmallScreen ? "100%" : "45%",
    borderWidth: 2,
    borderColor: "#e5e7eb",
  },
  serviceTitle: {
    fontSize: isSmallScreen ? 18 : 20,
    fontWeight: "bold",
    color: "#1f4d2f",
    marginBottom: 12,
  },
  serviceText: {
    fontSize: 14,
    color: "#4b5563",
    lineHeight: 20,
  },
  aboutSection: {
    backgroundColor: "#f3f4f6",
  },
  aboutTitle: {
    fontSize: isSmallScreen ? 28 : 36,
    fontWeight: "bold",
    color: "#1f4d2f",
    marginBottom: 24,
  },
  aboutContent: {
    flexDirection: isSmallScreen ? "column" : "row",
    gap: 24,
  },
  aboutText: {
    flex: 1,
  },
  aboutParagraph: {
    fontSize: 14,
    color: "#4b5563",
    lineHeight: 22,
    marginBottom: 16,
  },
  aboutImage: {
    width: isSmallScreen ? "100%" : "45%",
    height: 300,
    borderRadius: 16,
  },
  locationText: {
    fontSize: 14,
    color: "#4b5563",
    marginBottom: 16,
    lineHeight: 20,
  },
  mapPlaceholder: {
    height: 250,
    backgroundColor: "#d1d5db",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  mapText: {
    fontSize: 18,
    color: "#6b7280",
  },
  contactSection: {
    backgroundColor: "#1f4d2f",
    paddingHorizontal: isSmallScreen ? 16 : 32,
    paddingVertical: isSmallScreen ? 32 : 48,
  },
  contactHeader: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  contactEmoji: {
    fontSize: 36,
  },
  contactTitle: {
    fontSize: isSmallScreen ? 20 : 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  contactSubtitle: {
    fontSize: 14,
    color: "#86efac",
    lineHeight: 20,
  },
  formContainer: {
    backgroundColor: "#fff",
    padding: isSmallScreen ? 16 : 24,
    borderRadius: 16,
  },
  formRow: {
    flexDirection: isSmallScreen ? "column" : "row",
    gap: 16,
    marginBottom: 16,
  },
  formField: {
    flex: 1,
  },
  formFieldFull: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  submitButton: {
    backgroundColor: "#4a7c2c",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    backgroundColor: "#b45309",
    paddingHorizontal: isSmallScreen ? 16 : 32,
    paddingVertical: 32,
  },
  footerContent: {
    flexDirection: isSmallScreen ? "column" : "row",
    justifyContent: "space-between",
    gap: 24,
    marginBottom: 24,
  },
  footerColumn: {
    flex: 1,
  },
  footerTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 12,
  },
  footerText: {
    fontSize: 12,
    color: "#fff",
    marginBottom: 6,
  },
  footerLogo: {
    fontSize: isSmallScreen ? 24 : 32,
    fontWeight: "bold",
    color: "#fff",
    fontStyle: "italic",
    textAlign: "center",
  },
  copyright: {
    fontSize: 12,
    color: "#fff",
    textAlign: "center",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.3)",
    paddingTop: 16,
  },
});