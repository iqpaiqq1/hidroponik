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
        // Dashboard Petugas
        welcomeOfficer: "Selamat datang petugas,",
        statistics: "Statistik Sistem:",
        sensor: "Sensor",
        livestock: "Ternak",
        plants: "Tanaman",
        plantTab: "Tanaman",
        livestockTab: "Ternak",
        sensorTab: "Sensor",

        // Plant/Livestock Cards
        planted: "Ditanam:",
        productionStarted: "Produksi Dimulai:",
        daysLeft: "Hari Lagi",
        harvestTarget: "Target Panen:",
        harvestNow: "Panen Sekarang",
        harvestProduction: "Panen Produksi",

        // Status
        newlyPlanted: "Baru Ditanam",
        readySoon: "Segera Panen",
        readyToHarvest: "Sudah Waktunya Panen",
        lateHarvest: "Terlambat Panen",

        // Sensor Info
        location: "Lokasi:",
        plantId: "ID Tanaman:",
        cageId: "ID Kandang:",
        population: "Populasi:",
        temperature: "Suhu",
        humidity: "Kelembapan",
        productivity: "Produktivitas",

        // Edit Modal
        edit: "Edit",
        editData: "Edit Data",
        editPlantData: "Edit Data Tanaman",
        editCageData: "Edit Data Kandang",
        editSensorData: "Edit Data Sensor",
        plantName: "Nama Tanaman",
        variety: "Varietas",
        quantity: "Jumlah",
        cageName: "Nama Kandang",
        animalType: "Jenis Hewan",
        capacity: "Kapasitas",
        animalCount: "Jumlah Hewan",
        productionResult: "Hasil Produksi",
        productionAmount: "Jumlah Produksi",
        notes: "Keterangan",
        harvestDays: "Lama Panen (hari)",
        cancel: "Batal",
        save: "Simpan",
        success: "Berhasil",
        dataUpdated: "Data berhasil diperbarui!",
        failed: "Gagal",
        saveFailed: "Terjadi kesalahan saat menyimpan data.",

        // Harvest Modal
        confirmHarvest: "Konfirmasi Panen",
        confirmProduction: "Konfirmasi Panen Produksi",
        plant: "Tanaman:",
        cage: "Kandang:",
        type: "Jenis:",
        production: "Produksi:",
        harvestAmount: "Jumlah Panen:",
        productionQty: "Jumlah Produksi:",
        quality: "Kualitas:",
        qualityPlaceholder: "Contoh: Baik, Sangat Baik, Sedang",
        enterAmount: "Masukkan jumlah panen",
        enterProduction: "Masukkan jumlah produksi",
        dataKeptInfo: "ℹ️ Data kandang tetap tersimpan setelah panen",
        confirmHarvestBtn: "Konfirmasi Panen",
        harvestSuccess: "Tanaman berhasil dipanen dan dipindahkan ke data panen",
        productionSuccess: "Produksi kandang berhasil dipanen! Siklus produksi baru telah dimulai.",
        error: "Error",
        fillQuality: "Mohon isi kualitas panen",
        fillQualityProduction: "Mohon isi kualitas produksi",
        amountMustBePositive: "Jumlah panen harus lebih dari 0",
        productionMustBePositive: "Jumlah produksi harus lebih dari 0",
        harvestFailed: "Gagal memproses panen",
        productionFailed: "Gagal memproses panen kandang",
        harvestError: "Terjadi kesalahan saat memproses panen",
        productionError: "Terjadi kesalahan saat memproses panen kandang",

        // Empty State
        noPlantData: "Belum ada data tanaman",
        noLivestockData: "Belum ada data ternak",
        noSensorData: "Belum ada data sensor",
        checkApi: "Pastikan API sensor berjalan dengan baik",

        // Settings
        settings: "Pengaturan",
        help: "Bantuan",
        about: "Tentang",
        darkMode: "Mode Gelap",
        language: "Bahasa",
        logout: "Keluar",
        helpTitle: "Bantuan",
        helpMessage: "Untuk bantuan lebih lanjut, silakan hubungi:\n\nEmail: support@agrotech.com\nTelepon: +62 812-3456-7890",
        aboutTitle: "Tentang AgroTech",
        aboutMessage: "AgroTech Dashboard v1.0.0\n\nAplikasi manajemen pertanian hidroponik modern untuk meningkatkan produktivitas dan efisiensi pertanian Anda.\n\n© 2024 AgroTech Indonesia",
        logoutTitle: "Keluar",
        logoutMessage: "Apakah Anda yakin ingin keluar?",
        ok: "OK",
        selectLanguage: "Pilih Bahasa",
        currentLanguage: "Bahasa Saat Ini",
        indonesia: "Bahasa Indonesia",
        english: "English",

        // Profile
        myProfile: "Profil Saya",
        fullName: "Nama Lengkap",
        email: "Email",
        role: "Peran",
        editProfile: "Edit Profile",
        uploadPhoto: "Upload Foto",
        loading: "Memuat...",
    },
    en: {
        // Dashboard Petugas
        welcomeOfficer: "Welcome officer,",
        statistics: "System Statistics:",
        sensor: "Sensor",
        livestock: "Livestock",
        plants: "Plants",
        plantTab: "Plants",
        livestockTab: "Livestock",
        sensorTab: "Sensor",

        // Plant/Livestock Cards
        planted: "Planted:",
        productionStarted: "Production Started:",
        daysLeft: "Days Left",
        harvestTarget: "Harvest Target:",
        harvestNow: "Harvest Now",
        harvestProduction: "Harvest Production",

        // Status
        newlyPlanted: "Newly Planted",
        readySoon: "Ready Soon",
        readyToHarvest: "Ready to Harvest",
        lateHarvest: "Late Harvest",

        // Sensor Info
        location: "Location:",
        plantId: "Plant ID:",
        cageId: "Cage ID:",
        population: "Population:",
        temperature: "Temperature",
        humidity: "Humidity",
        productivity: "Productivity",

        // Edit Modal
        edit: "Edit",
        editData: "Edit Data",
        editPlantData: "Edit Plant Data",
        editCageData: "Edit Cage Data",
        editSensorData: "Edit Sensor Data",
        plantName: "Plant Name",
        variety: "Variety",
        quantity: "Quantity",
        cageName: "Cage Name",
        animalType: "Animal Type",
        capacity: "Capacity",
        animalCount: "Animal Count",
        productionResult: "Production Result",
        productionAmount: "Production Amount",
        notes: "Notes",
        harvestDays: "Harvest Days",
        cancel: "Cancel",
        save: "Save",
        success: "Success",
        dataUpdated: "Data updated successfully!",
        failed: "Failed",
        saveFailed: "An error occurred while saving data.",

        // Harvest Modal
        confirmHarvest: "Confirm Harvest",
        confirmProduction: "Confirm Production Harvest",
        plant: "Plant:",
        cage: "Cage:",
        type: "Type:",
        production: "Production:",
        harvestAmount: "Harvest Amount:",
        productionQty: "Production Quantity:",
        quality: "Quality:",
        qualityPlaceholder: "Example: Good, Very Good, Fair",
        enterAmount: "Enter harvest amount",
        enterProduction: "Enter production amount",
        dataKeptInfo: "ℹ️ Cage data will be kept after harvest",
        confirmHarvestBtn: "Confirm Harvest",
        harvestSuccess: "Plant harvested successfully and moved to harvest data",
        productionSuccess: "Cage production harvested successfully! New production cycle has started.",
        error: "Error",
        fillQuality: "Please fill in harvest quality",
        fillQualityProduction: "Please fill in production quality",
        amountMustBePositive: "Harvest amount must be greater than 0",
        productionMustBePositive: "Production amount must be greater than 0",
        harvestFailed: "Failed to process harvest",
        productionFailed: "Failed to process cage harvest",
        harvestError: "An error occurred while processing harvest",
        productionError: "An error occurred while processing cage harvest",

        // Empty State
        noPlantData: "No plant data available",
        noLivestockData: "No livestock data available",
        noSensorData: "No sensor data available",
        checkApi: "Make sure the sensor API is running properly",

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
        ok: "OK",
        selectLanguage: "Select Language",
        currentLanguage: "Current Language",
        indonesia: "Indonesian",
        english: "English",

        // Profile
        myProfile: "My Profile",
        fullName: "Full Name",
        email: "Email",
        role: "Role",
        editProfile: "Edit Profile",
        uploadPhoto: "Upload Photo",
        loading: "Loading...",
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
            console.log("Loaded language from storage:", savedLanguage);
            if (savedLanguage) {
                setLanguageState(savedLanguage as Language);
            }
        } catch (error) {
            console.error("Error loading language:", error);
        }
    };

    const setLanguage = async (lang: Language) => {
        try {
            console.log("Setting language to:", lang);
            await AsyncStorage.setItem("language", lang);
            setLanguageState(lang);
            console.log("Language set successfully");
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