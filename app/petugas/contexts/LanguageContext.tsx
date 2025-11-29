// app/contexts/LanguageContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Language = "id" | "en";

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const translations = {
    id: {
        // Dashboard
        welcomeTo: "Selamat Datang di AgroTech Dashboard",
        growWithoutSoil: "Bertumbuh Tanpa Tanah.",
        harvestWithoutLimits: "Panen Tanpa Batasan.",
        knowMore: "Ketahui Lebih Banyak →",
        searchPlaceholder: "Cari produk kami, di sini",
        categories: "Kategori",
        seeAll: "Lihat Semua",
        all: "Semua",
        vegetable: "Tanaman",
        chicken: "Hewan",
        seeDetail: "Lihat detail ↗",
        noProducts: "Tidak ada produk yang ditemukan",
        loading: "Memuat data...",

        // Detail Tanaman
        detail: "Detail",
        description: "Deskripsi",
        keunggulan: "Keunggulan",
        syaratTumbuh: "Syarat Tumbuh",
        caraPenanaman: "Cara Penanaman",

        // Settings
        settings: "Pengaturan",
        help: "Bantuan",
        about: "Tentang",
        darkMode: "Mode Gelap",
        language: "Bahasa",
        logout: "Keluar",

        // Alert & Modal Texts
        helpTitle: "Bantuan",
        helpMessage: "Untuk bantuan lebih lanjut, silakan hubungi:\n\nEmail: support@agrotech.com\nTelepon: +62 812-3456-7890",
        aboutTitle: "Tentang AgroTech",
        aboutMessage: "AgroTech Dashboard v1.0.0\n\nAplikasi manajemen pertanian hidroponik modern untuk meningkatkan produktivitas dan efisiensi pertanian Anda.\n\n© 2024 AgroTech Indonesia",
        logoutTitle: "Keluar",
        logoutMessage: "Apakah Anda yakin ingin keluar?",
        cancel: "Batal",
        ok: "OK",
        selectLanguage: "Pilih bahasa:",
        indonesia: "Indonesia",
        english: "English",

        // Profile
        myProfile: "Profil Saya",
        editProfile: "Edit Profile",
        profileInformation: "Informasi Profil",
        fullName: "Nama Lengkap",
        email: "Email",
        role: "Peran",
        memberSince: "Bergabung Sejak",
        activityStatistics: "Statistik Aktivitas",
        orders: "Pesanan",
        favorites: "Favorit",
        views: "Dilihat",
        editProfileMessage: "Fitur edit profile akan segera tersedia!",

        // Know More Page
        hydroponicInfo: "Pertanian hidroponik adalah metode menanam tanaman tanpa tanah, menggunakan larutan air kaya nutrisi untuk mengirimkan mineral penting langsung ke akar. Teknik ini dapat dilakukan di media inert seperti rockwool atau perlit sebagai penopang, atau dengan akar yang terendam dalam larutan itu sendiri. Hidroponik sangat ideal untuk pertanian perkotaan atau lahan terbatas dan memungkinkan produksi sepanjang tahun bahkan di daerah dengan tanah yang terbatas atau tidak ada tanah.",
        agrotechInspiration: "AgroTech terinspirasi dari Agriyaponik. Agriyaponik adalah perusahaan agritech modern yang fokus pada pengembangan sistem pangan berkelanjutan dan sehat melalui teknologi hidroponik yang inovatif. Kami percaya bahwa pertanian adalah solusi inovatif dan ramah lingkungan untuk masa depan yang lebih baik bagi manusia dan planet ini.",
        agriyaponikMission: "Di Agriyaponik, kami menggabungkan sains, teknologi, dan kepedulian terhadap alam untuk menghasilkan sayuran hidroponik, microgreens, dan telur Omega-3 berkualitas tinggi.",
    },
    en: {
        // Dashboard
        welcomeTo: "Welcome to AgroTech Dashboard",
        growWithoutSoil: "Grow Without Soil.",
        harvestWithoutLimits: "Harvest Without Limits.",
        knowMore: "Know More →",
        searchPlaceholder: "Search our products here",
        categories: "Categories",
        seeAll: "See All",
        all: "All",
        vegetable: "Vegetable",
        chicken: "Chicken",
        seeDetail: "See detail ↗",
        noProducts: "No products found",
        loading: "Loading data...",

        // Detail Tanaman
        detail: "Detail",
        description: "Description",
        keunggulan: "Advantages",
        syaratTumbuh: "Growing Requirements",
        caraPenanaman: "Planting Method",

        // Settings
        settings: "Settings",
        help: "Help",
        about: "About",
        darkMode: "Dark Mode",
        language: "Language",
        logout: "Logout",
        helpTitle: "Help",
        helpMessage: "For further assistance, please contact:\n\nEmail: support@agrotech.com\nPhone: +62 812-3456-7890",
        aboutTitle: "About AgroTech",
        aboutMessage: "AgroTech Dashboard v1.0.0\n\nModern hydroponic farming management application to improve your farm's productivity and efficiency.\n\n© 2024 AgroTech Indonesia",
        logoutTitle: "Logout",
        logoutMessage: "Are you sure you want to logout?",
        cancel: "Cancel",
        ok: "OK",
        selectLanguage: "Select Language",
        indonesia: "Indonesian",
        english: "English",
        currentLanguage: "Current Language",

        // Profile
        myProfile: "My Profile",
        editProfile: "Edit Profile",
        profileInformation: "Profile Information",
        fullName: "Full Name",
        email: "Email",
        role: "Role",
        memberSince: "Member Since",
        activityStatistics: "Activity Statistics",
        orders: "Orders",
        favorites: "Favorites",
        views: "Views",
        editProfileMessage: "Edit profile feature coming soon!",

        // Know More Page
        hydroponicInfo: "Hydroponic farming is a method of growing plants without soil, using a nutrient-rich water solution to deliver essential minerals directly to the roots. This technique can be done in inert media like rockwool or perlite for support, or with roots submerged in the solution itself. Hydroponics is ideal for urban or limited-space farming and allows for year-round production even in areas with limited or no soil.",
        agrotechInspiration: "AgroTech was inspired by Agriyaponik. Agriyaponik is a modern agritech company focused on developing sustainable and healthy food systems through innovative hydroponic technology. We believe that agriculture is an innovative and environmentally friendly solution for a better future for people and the planet.",
        agriyaponikMission: "At Agriyaponik, we combine science, technology, and care for nature to produce high-quality hydroponic vegetables, microgreens, and Omega-3 eggs.",
    },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [language, setLanguageState] = useState<Language>("id");

    useEffect(() => {
        loadLanguage();
    }, []);

    const loadLanguage = async () => {
        try {
            const savedLanguage = await AsyncStorage.getItem("language");
            console.log("Loaded language from storage:", savedLanguage); // Debug
            if (savedLanguage) {
                setLanguageState(savedLanguage as Language);
            }
        } catch (error) {
            console.error("Error loading language:", error);
        }
    };

    const setLanguage = async (lang: Language) => {
        try {
            console.log("Setting language to:", lang); // Debug
            await AsyncStorage.setItem("language", lang);
            setLanguageState(lang);
            console.log("Language set successfully"); // Debug
        } catch (error) {
            console.error("Error saving language:", error);
        }
    };

    const t = (key: string): string => {
        return translations[language][key as keyof typeof translations.id] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
};