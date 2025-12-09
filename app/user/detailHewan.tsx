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

// Data detail hewan ternak
export const hewanDetailData: { [key: string]: any } = {
    "Ayam Petelur": {
        nama: "Ayam Petelur",
        varietas: "Ayam Ras Petelur",
        foto: null,
        deskripsi: {
            id: "Ayam petelur adalah jenis ayam yang dipelihara khusus untuk produksi telur konsumsi. Ayam ras petelur memiliki produktivitas tinggi dengan kemampuan bertelur hingga 300 butir per tahun.",
            en: "Layer chicken is a type of chicken raised specifically for egg production. Layer breeds have high productivity with the ability to produce up to 300 eggs per year."
        },
        keunggulan: {
            id: [
                "Produksi telur tinggi dan konsisten",
                "Efisiensi pakan yang baik",
                "Masa produktif panjang (1-2 tahun)",
                "Telur berkualitas dengan ukuran seragam",
                "Mudah dalam perawatan dan manajemen",
            ],
            en: [
                "High and consistent egg production",
                "Good feed efficiency",
                "Long productive period (1-2 years)",
                "Quality eggs with uniform size",
                "Easy care and management",
            ]
        },
        syaratPemeliharaan: {
            suhu: "20-27°C",
            kelembapan: "60-70%",
            pakanPerHari: "110-120 gram/ekor",
            minumPerHari: "250-300 ml/ekor",
            kepadatan: "4-5 ekor/m²",
        },
        caraPemeliharaan: {
            id: [
                {
                    title: "Persiapan Kandang",
                    desc: "Siapkan kandang battery atau postal dengan ventilasi baik, sistem pemanas untuk DOC, dan tempat pakan/minum yang cukup.",
                },
                {
                    title: "Pemeliharaan DOC (0-8 minggu)",
                    desc: "Berikan pakan starter, jaga suhu 32-35°C minggu pertama, turunkan 3°C setiap minggu. Lakukan vaksinasi sesuai jadwal.",
                },
                {
                    title: "Masa Grower (9-18 minggu)",
                    desc: "Pindah ke kandang grower, berikan pakan grower, mulai program pencahayaan 8-10 jam/hari.",
                },
                {
                    title: "Masa Produksi (18 minggu+)",
                    desc: "Pindah ke kandang layer, berikan pakan layer tinggi kalsium, program pencahayaan 16 jam/hari, collecting telur 2-3x sehari.",
                },
            ],
            en: [
                {
                    title: "Cage Preparation",
                    desc: "Prepare battery or postal cages with good ventilation, heating system for DOC, and adequate feed/water containers.",
                },
                {
                    title: "DOC Rearing (0-8 weeks)",
                    desc: "Provide starter feed, maintain temperature 32-35°C first week, decrease 3°C weekly. Conduct vaccination according to schedule.",
                },
                {
                    title: "Grower Period (9-18 weeks)",
                    desc: "Move to grower cage, provide grower feed, start lighting program 8-10 hours/day.",
                },
                {
                    title: "Production Period (18 weeks+)",
                    desc: "Move to layer cage, provide high-calcium layer feed, 16-hour lighting program, collect eggs 2-3x daily.",
                },
            ]
        },
        lamaProduksi: "21 hari/siklus",
        estimasiProduksi: "85-95% (50-200 butir/hari)",
    },
    "Ayam Pedaging": {
        nama: "Ayam Pedaging",
        varietas: "Ayam Broiler",
        foto: null,
        deskripsi: {
            id: "Ayam pedaging atau broiler adalah jenis ayam yang dipelihara khusus untuk produksi daging. Ayam broiler memiliki pertumbuhan cepat dan dapat dipanen dalam waktu 30-35 hari.",
            en: "Broiler chicken is a type of chicken raised specifically for meat production. Broilers have fast growth and can be harvested in 30-35 days."
        },
        keunggulan: {
            id: [
                "Pertumbuhan sangat cepat",
                "Konversi pakan efisien (1.6-1.8)",
                "Daging berkualitas tinggi",
                "ROI cepat (35 hari)",
                "Permintaan pasar tinggi dan stabil",
            ],
            en: [
                "Very fast growth",
                "Efficient feed conversion (1.6-1.8)",
                "High quality meat",
                "Quick ROI (35 days)",
                "High and stable market demand",
            ]
        },
        syaratPemeliharaan: {
            suhu: "20-26°C",
            kelembapan: "60-70%",
            pakanPerHari: "150-180 gram/ekor (dewasa)",
            minumPerHari: "300-400 ml/ekor",
            kepadatan: "8-10 ekor/m²",
        },
        caraPemeliharaan: {
            id: [
                {
                    title: "Persiapan Kandang",
                    desc: "Bersihkan dan desinfeksi kandang, siapkan pemanas, sekam/litter 10cm, tempat pakan dan minum.",
                },
                {
                    title: "Pemeliharaan Starter (0-14 hari)",
                    desc: "Suhu 32-35°C, pakan starter protein tinggi (21-23%), pencahayaan 24 jam, vaksinasi ND/IB.",
                },
                {
                    title: "Pemeliharaan Finisher (15-35 hari)",
                    desc: "Suhu 20-26°C, pakan finisher protein 19-20%, pencahayaan 18-20 jam, monitoring kesehatan rutin.",
                },
                {
                    title: "Panen",
                    desc: "Panen saat bobot 1.8-2.5 kg (30-35 hari), puasakan 8-12 jam sebelum panen.",
                },
            ],
            en: [
                {
                    title: "Cage Preparation",
                    desc: "Clean and disinfect cage, prepare heater, 10cm husk/litter, feed and water containers.",
                },
                {
                    title: "Starter Phase (0-14 days)",
                    desc: "Temperature 32-35°C, high protein starter feed (21-23%), 24-hour lighting, ND/IB vaccination.",
                },
                {
                    title: "Finisher Phase (15-35 days)",
                    desc: "Temperature 20-26°C, finisher feed protein 19-20%, 18-20 hour lighting, routine health monitoring.",
                },
                {
                    title: "Harvest",
                    desc: "Harvest at 1.8-2.5 kg weight (30-35 days), fast 8-12 hours before harvest.",
                },
            ]
        },
        lamaProduksi: "35 hari/siklus",
        estimasiProduksi: "2-3 kg/ekor",
    },
    "Lele": {
        nama: "Lele",
        varietas: "Lele Sangkuriang",
        foto: null,
        deskripsi: {
            id: "Lele Sangkuriang adalah hasil persilangan dan seleksi genetik yang menghasilkan ikan dengan pertumbuhan cepat, tahan penyakit, dan tingkat survival rate tinggi hingga 90%.",
            en: "Sangkuriang catfish is the result of crossbreeding and genetic selection producing fish with fast growth, disease resistance, and high survival rate up to 90%."
        },
        keunggulan: {
            id: [
                "Pertumbuhan sangat cepat",
                "Tahan terhadap penyakit",
                "Tingkat kelangsungan hidup tinggi (80-90%)",
                "Dapat dipelihara dengan kepadatan tinggi",
                "Permintaan pasar sangat tinggi",
            ],
            en: [
                "Very fast growth",
                "Disease resistant",
                "High survival rate (80-90%)",
                "Can be raised at high density",
                "Very high market demand",
            ]
        },
        syaratPemeliharaan: {
            suhu: "26-30°C",
            ph: "6.5-8.5",
            oksigen: ">3 mg/L",
            pakanPerHari: "3-5% biomass",
            kepadatan: "200-400 ekor/m³",
        },
        caraPemeliharaan: {
            id: [
                {
                    title: "Persiapan Kolam",
                    desc: "Keringkan kolam 3-5 hari, kapur dolomit 100g/m², pupuk kandang, isi air 80-100cm, tambahkan probiotik.",
                },
                {
                    title: "Penebaran Benih",
                    desc: "Tebar benih ukuran 5-7cm dengan kepadatan 200-300 ekor/m², lakukan aklimatisasi 15-30 menit.",
                },
                {
                    title: "Pemberian Pakan",
                    desc: "Pakan apung 3-5% biomass, 3x sehari (pagi, siang, sore), tambahkan probiotik seminggu sekali.",
                },
                {
                    title: "Pemeliharaan & Panen",
                    desc: "Ganti air 10-20% setiap 3 hari, monitoring kualitas air rutin, panen saat ukuran 8-12 ekor/kg (70-90 hari).",
                },
            ],
            en: [
                {
                    title: "Pond Preparation",
                    desc: "Dry pond 3-5 days, dolomite lime 100g/m², manure, fill water 80-100cm, add probiotics.",
                },
                {
                    title: "Stocking",
                    desc: "Stock 5-7cm sized seeds at 200-300 fish/m³ density, acclimatize for 15-30 minutes.",
                },
                {
                    title: "Feeding",
                    desc: "Floating feed 3-5% biomass, 3x daily (morning, noon, evening), add probiotics weekly.",
                },
                {
                    title: "Maintenance & Harvest",
                    desc: "Change 10-20% water every 3 days, routine water quality monitoring, harvest at 8-12 fish/kg (70-90 days).",
                },
            ]
        },
        lamaProduksi: "70 hari/siklus",
        estimasiProduksi: "100-500 ekor (80-90% survival)",
    },
    "Bebek Petelur": {
        nama: "Bebek Petelur",
        varietas: "Bebek Mojosari",
        foto: null,
        deskripsi: {
            id: "Bebek Mojosari adalah bebek lokal unggul Indonesia yang memiliki produktivitas telur tinggi. Bebek ini adaptif terhadap lingkungan tropis dan tahan terhadap penyakit.",
            en: "Mojosari duck is an Indonesian superior local duck with high egg productivity. This duck is adaptive to tropical environments and disease resistant."
        },
        keunggulan: {
            id: [
                "Produksi telur tinggi (280-300 butir/tahun)",
                "Telur berukuran besar (65-70 gram)",
                "Tahan terhadap penyakit",
                "Adaptif lingkungan tropis",
                "Harga telur bebek lebih tinggi",
            ],
            en: [
                "High egg production (280-300 eggs/year)",
                "Large egg size (65-70 grams)",
                "Disease resistant",
                "Tropical environment adaptive",
                "Higher duck egg price",
            ]
        },
        syaratPemeliharaan: {
            suhu: "20-30°C",
            kelembapan: "60-70%",
            pakanPerHari: "140-160 gram/ekor",
            minumPerHari: "400-600 ml/ekor",
            kepadatan: "4-5 ekor/m²",
        },
        caraPemeliharaan: {
            id: [
                {
                    title: "Persiapan Kandang",
                    desc: "Kandang sistem postal atau battery, lantai tanah/semen, sediakan kolam kecil untuk mandi, ventilasi baik.",
                },
                {
                    title: "Pemeliharaan Starter (0-8 minggu)",
                    desc: "Pakan starter protein 18-20%, suhu 28-30°C, vaksinasi duck cholera dan duck plague.",
                },
                {
                    title: "Masa Grower (9-20 minggu)",
                    desc: "Pakan grower protein 15-17%, mulai program pencahayaan, latihan berenang rutin.",
                },
                {
                    title: "Masa Produksi (20 minggu+)",
                    desc: "Pakan layer protein 16-18% tinggi kalsium, collecting telur pagi hari, pencahayaan 16 jam/hari.",
                },
            ],
            en: [
                {
                    title: "Cage Preparation",
                    desc: "Postal or battery system cage, soil/cement floor, provide small bathing pool, good ventilation.",
                },
                {
                    title: "Starter Phase (0-8 weeks)",
                    desc: "Starter feed protein 18-20%, temperature 28-30°C, duck cholera and duck plague vaccination.",
                },
                {
                    title: "Grower Period (9-20 weeks)",
                    desc: "Grower feed protein 15-17%, start lighting program, routine swimming practice.",
                },
                {
                    title: "Production Period (20 weeks+)",
                    desc: "Layer feed protein 16-18% high calcium, morning egg collection, 16-hour lighting.",
                },
            ]
        },
        lamaProduksi: "22 hari/siklus",
        estimasiProduksi: "70-85% (30-100 butir/hari)",
    },
    "Puyuh": {
        nama: "Puyuh",
        varietas: "Puyuh Lokal",
        foto: null,
        deskripsi: {
            id: "Puyuh adalah burung kecil yang produktif untuk produksi telur dan daging. Puyuh memiliki siklus produksi cepat, modal relatif kecil, dan permintaan pasar yang stabil.",
            en: "Quail is a small productive bird for egg and meat production. Quail has a fast production cycle, relatively small capital, and stable market demand."
        },
        keunggulan: {
            id: [
                "Modal relatif kecil",
                "Siklus produksi sangat cepat (40 hari)",
                "Produktivitas tinggi (250-300 telur/tahun)",
                "Tidak butuh lahan luas",
                "Telur bernilai gizi tinggi",
            ],
            en: [
                "Relatively small capital",
                "Very fast production cycle (40 days)",
                "High productivity (250-300 eggs/year)",
                "Doesn't need large land",
                "High nutritional value eggs",
            ]
        },
        syaratPemeliharaan: {
            suhu: "20-25°C",
            kelembapan: "60-70%",
            pakanPerHari: "20-25 gram/ekor",
            minumPerHari: "40-60 ml/ekor",
            kepadatan: "80-100 ekor/m²",
        },
        caraPemeliharaan: {
            id: [
                {
                    title: "Persiapan Kandang",
                    desc: "Kandang battery bertingkat, ukuran 120x60x40cm untuk 90 ekor, tempat pakan/minum otomatis, penampung kotoran.",
                },
                {
                    title: "Pemeliharaan Starter (0-3 minggu)",
                    desc: "Pakan starter protein 24-27%, suhu 32-35°C minggu pertama, pencahayaan 24 jam.",
                },
                {
                    title: "Masa Grower (4-6 minggu)",
                    desc: "Pakan grower protein 20-22%, suhu normal 20-25°C, pisahkan jantan dan betina.",
                },
                {
                    title: "Masa Produksi (6 minggu+)",
                    desc: "Pakan layer protein 18-20%, pencahayaan 16-18 jam, collecting telur 2x sehari (pagi & sore).",
                },
            ],
            en: [
                {
                    title: "Cage Preparation",
                    desc: "Multi-tier battery cage, 120x60x40cm for 90 birds, automatic feed/water, manure collector.",
                },
                {
                    title: "Starter Phase (0-3 weeks)",
                    desc: "Starter feed protein 24-27%, temperature 32-35°C first week, 24-hour lighting.",
                },
                {
                    title: "Grower Period (4-6 weeks)",
                    desc: "Grower feed protein 20-22%, normal temperature 20-25°C, separate male and female.",
                },
                {
                    title: "Production Period (6 weeks+)",
                    desc: "Layer feed protein 18-20%, 16-18 hour lighting, collect eggs 2x daily (morning & evening).",
                },
            ]
        },
        lamaProduksi: "40 hari/siklus",
        estimasiProduksi: "75-90% (80-150 butir/hari)",
    },
    "Kambing": {
        nama: "Kambing",
        varietas: "Kambing Peranakan Etawa",
        foto: null,
        deskripsi: {
            id: "Kambing Peranakan Etawa (PE) adalah kambing dwiguna yang dapat dimanfaatkan untuk produksi susu dan daging. Kambing PE merupakan persilangan kambing Etawa dengan kambing lokal Indonesia.",
            en: "Etawa Crossbreed Goat (PE) is a dual-purpose goat that can be utilized for milk and meat production. PE goat is a cross between Etawa goat and Indonesian local goat."
        },
        keunggulan: {
            id: [
                "Produksi susu 1-2 liter/hari",
                "Pertumbuhan cepat untuk daging",
                "Tahan terhadap penyakit",
                "Mudah beradaptasi",
                "Nilai jual tinggi",
            ],
            en: [
                "Milk production 1-2 liters/day",
                "Fast growth for meat",
                "Disease resistant",
                "Easy to adapt",
                "High selling value",
            ]
        },
        syaratPemeliharaan: {
            suhu: "20-30°C",
            kelembapan: "60-80%",
            pakanHijau: "10-15% berat badan",
            pakanKonsentrat: "1-2% berat badan",
            minumPerHari: "1.5-3 liter/ekor",
        },
        caraPemeliharaan: {
            id: [
                {
                    title: "Persiapan Kandang",
                    desc: "Kandang panggung tinggi 1-1.5m, ukuran 1x1.5m/ekor, lantai slat kayu/bambu, sekat antar kambing, tempat pakan terpisah.",
                },
                {
                    title: "Pemberian Pakan",
                    desc: "Hijauan 2x sehari (pagi/sore) rumput gajah/daun nangka, konsentrat 300-500g/ekor 2x sehari, air minum ad libitum.",
                },
                {
                    title: "Perawatan & Kesehatan",
                    desc: "Vaksinasi anthrax & orf 6 bulan sekali, vitamin B-complex, obat cacing 3 bulan sekali, potong kuku rutin.",
                },
                {
                    title: "Pemerahan Susu",
                    desc: "Perah 2x sehari (pagi jam 6 dan sore jam 5), bersihkan ambing sebelum perah, pisahkan anak kambing saat pemerahan.",
                },
            ],
            en: [
                {
                    title: "Cage Preparation",
                    desc: "Stage cage 1-1.5m high, 1x1.5m size/goat, wood/bamboo slat floor, partition between goats, separate feeding place.",
                },
                {
                    title: "Feeding",
                    desc: "Forage 2x daily (morning/evening) elephant grass/jackfruit leaves, 300-500g concentrate/goat 2x daily, ad libitum water.",
                },
                {
                    title: "Care & Health",
                    desc: "Anthrax & orf vaccination every 6 months, B-complex vitamins, deworming every 3 months, routine hoof trimming.",
                },
                {
                    title: "Milking",
                    desc: "Milk 2x daily (6 AM and 5 PM), clean udder before milking, separate kids during milking.",
                },
            ]
        },
        lamaProduksi: "180 hari/siklus laktasi",
        estimasiProduksi: "1-2 liter/hari",
    },
    "Sapi Perah": {
        nama: "Sapi Perah",
        varietas: "Friesian Holstein",
        foto: null,
        deskripsi: {
            id: "Sapi Friesian Holstein adalah sapi perah terbaik di dunia dengan produksi susu tertinggi. Sapi ini berasal dari Belanda dan telah beradaptasi baik dengan iklim Indonesia.",
            en: "Friesian Holstein cattle is the best dairy cattle in the world with the highest milk production. This cattle originates from the Netherlands and has adapted well to Indonesian climate."
        },
        keunggulan: {
            id: [
                "Produksi susu sangat tinggi (15-25 liter/hari)",
                "Kualitas susu excellent (3.5% lemak)",
                "Periode laktasi panjang (305 hari)",
                "Tubuh besar dan sehat",
                "ROI menguntungkan untuk usaha susu",
            ],
            en: [
                "Very high milk production (15-25 liters/day)",
                "Excellent milk quality (3.5% fat)",
                "Long lactation period (305 days)",
                "Large and healthy body",
                "Profitable ROI for dairy business",
            ]
        },
        syaratPemeliharaan: {
            suhu: "18-24°C",
            kelembapan: "60-80%",
            pakanHijau: "40-50 kg/hari",
            pakanKonsentrat: "8-10 kg/hari",
            minumPerHari: "60-100 liter/ekor",
        },
        caraPemeliharaan: {
            id: [
                {
                    title: "Persiapan Kandang",
                    desc: "Kandang individual 2.5x4m/ekor, lantai beton miring, got pembuangan, atap tinggi 3-4m, ventilasi baik, tempat pakan beton.",
                },
                {
                    title: "Pemberian Pakan",
                    desc: "Hijauan 40-50kg/hari (rumput gajah, leguminosa), konsentrat 8-10kg dibagi 3x sehari, mineral & vitamin, air ad libitum.",
                },
                {
                    title: "Perawatan & Kesehatan",
                    desc: "Mandikan 2x sehari, vaksinasi anthrax & BEF tahunan, inseminasi buatan saat birahi, periksa bunting 60 hari post IB.",
                },
                {
                    title: "Pemerahan Susu",
                    desc: "Perah 3x sehari (jam 4 pagi, 12 siang, 8 malam), bersihkan ambing dengan air hangat, teat dipping setelah perah, pencatatan produksi.",
                },
            ],
            en: [
                {
                    title: "Cage Preparation",
                    desc: "Individual cage 2.5x4m/cattle, sloped concrete floor, drainage ditch, 3-4m high roof, good ventilation, concrete feeding place.",
                },
                {
                    title: "Feeding",
                    desc: "Forage 40-50kg/day (elephant grass, legumes), 8-10kg concentrate divided 3x daily, minerals & vitamins, ad libitum water.",
                },
                {
                    title: "Care & Health",
                    desc: "Bath 2x daily, annual anthrax & BEF vaccination, artificial insemination during estrus, pregnancy check 60 days post AI.",
                },
                {
                    title: "Milking",
                    desc: "Milk 3x daily (4 AM, 12 PM, 8 PM), clean udder with warm water, teat dipping after milking, production recording.",
                },
            ]
        },
        lamaProduksi: "240 hari/siklus laktasi",
        estimasiProduksi: "15-20 liter/hari",
    },
    "Itik Pedaging": {
        nama: "Itik Pedaging",
        varietas: "Itik Mojosari",
        foto: null,
        deskripsi: {
            id: "Itik Mojosari pedaging adalah itik lokal yang dipelihara khusus untuk produksi daging. Itik ini memiliki pertumbuhan cepat dan daging berkualitas baik dengan permintaan pasar yang tinggi.",
            en: "Mojosari meat duck is a local duck raised specifically for meat production. This duck has fast growth and good quality meat with high market demand."
        },
        keunggulan: {
            id: [
                "Pertumbuhan cepat (2-4 kg dalam 35 hari)",
                "Daging berkualitas dan gurih",
                "Tahan penyakit",
                "Dapat dipelihara dengan sistem ekstensif",
                "Harga jual daging itik tinggi",
            ],
            en: [
                "Fast growth (2-4 kg in 35 days)",
                "Quality and savory meat",
                "Disease resistant",
                "Can be raised extensively",
                "High duck meat selling price",
            ]
        },
        syaratPemeliharaan: {
            suhu: "20-28°C",
            kelembapan: "60-75%",
            pakanPerHari: "150-200 gram/ekor (dewasa)",
            minumPerHari: "500-800 ml/ekor",
            kepadatan: "6-8 ekor/m²",
        },
        caraPemeliharaan: {
            id: [
                {
                    title: "Persiapan Kandang",
                    desc: "Kandang postal dengan litter sekam 10cm, sediakan kolam kecil/bak air, tempat pakan dan minum cukup, kandang teduh.",
                },
                {
                    title: "Pemeliharaan Starter (0-14 hari)",
                    desc: "Pakan starter protein 21-23%, suhu 30-32°C dengan pemanas, vaksinasi duck plague hari ke-7, air minum + vitamin.",
                },
                {
                    title: "Pemeliharaan Grower (15-28 hari)",
                    desc: "Pakan grower protein 18-20%, suhu normal, latihan berenang mulai minggu ke-3, monitoring kesehatan.",
                },
                {
                    title: "Pemeliharaan Finisher & Panen",
                    desc: "Pakan finisher protein 16-18%, panen umur 35-42 hari bobot 2-4kg, puasa 8-10 jam sebelum panen.",
                },
            ],
            en: [
                {
                    title: "Cage Preparation",
                    desc: "Postal cage with 10cm husk litter, provide small pool/water tub, adequate feed and water containers, shaded cage.",
                },
                {
                    title: "Starter Phase (0-14 days)",
                    desc: "Starter feed protein 21-23%, temperature 30-32°C with heater, duck plague vaccination day 7, water + vitamins.",
                },
                {
                    title: "Grower Phase (15-28 days)",
                    desc: "Grower feed protein 18-20%, normal temperature, swimming training starts week 3, health monitoring.",
                },
                {
                    title: "Finisher & Harvest",
                    desc: "Finisher feed protein 16-18%, harvest at 35-42 days 2-4kg weight, fast 8-10 hours before harvest.",
                },
            ]
        },
        lamaProduksi: "35 hari/siklus",
        estimasiProduksi: "2-4 kg/ekor",
    },
};

export default function DetailHewanScreen() {
    const router = useRouter();
    const { nama } = useLocalSearchParams();
    const { t, language } = useLanguage();
    const { colors, isDark } = useTheme();
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

    // Get detail data based on nama
    const detailData = hewanDetailData[nama as string] || hewanDetailData["Ayam Petelur"];

    const generateHTML = async () => {
        const isIndonesian = language === 'id';
        const imageUrl = detailData.foto || "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=800";

        // Convert image to base64
        let base64Image = '';
        try {
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
    .page {
      page-break-after: always;
      width: 100%;
    }
    .header {
      text-align: center;
      margin-bottom: 25px;
    }
    .title {
      font-size: 38px;
      font-weight: bold;
      color: #D2691E;
    }
    .subtitle {
      font-size: 18px;
      color: #666;
      margin-top: 6px;
    }
    .divider {
      width: 100%;
      height: 4px;
      background: #D2691E;
      margin: 18px auto 25px auto;
      border-radius: 6px;
    }
    .image-wrapper {
      display: flex;
      justify-content: center;
      margin: 0 auto 18px auto;
      width: 100%;
    }
    .animal-image {
      width: 100%;
      max-height: 420px;
      object-fit: cover;
      border-radius: 20px;
      box-shadow: 0 10px 18px rgba(0,0,0,0.25);
    }
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
      background: #D2691E;
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
    .bullet-item {
      display: flex;
      align-items: flex-start;
      margin-bottom: 10px;
    }
    .bullet {
      color: #D2691E;
      font-size: 20px;
      margin-right: 10px;
      margin-top: -2px;
    }
    .bullet-text {
      font-size: 16px;
      color: #444;
    }
    .step-item {
      display: flex;
      margin-bottom: 18px;
    }
    .step-number {
      font-size: 18px;
      font-weight: bold;
      color: #D2691E;
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
  <div class="page">
    <div class="header">
      <div class="title">${detailData.nama}</div>
      <div class="subtitle">
        ${isIndonesian ? "Laporan Detail Ternak" : "Livestock Detail Report"}
      </div>
      <div class="divider"></div>
    </div>
    <div class="image-wrapper">
      <img src="${base64Image}" class="animal-image" />
    </div>
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

  <div class="page">
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

    <div class="section">
      <div class="section-title">
        <div class="bar"></div>
        ${isIndonesian ? "Syarat Pemeliharaan" : "Rearing Requirements"}
      </div>
      <div class="card">
        <div class="bullet-item"><b>${isIndonesian ? "Suhu" : "Temperature"}:</b>&nbsp; ${detailData.syaratPemeliharaan.suhu}</div>
        <div class="bullet-item"><b>${isIndonesian ? "Kelembapan" : "Humidity"}:</b>&nbsp; ${detailData.syaratPemeliharaan.kelembapan}</div>
        <div class="bullet-item"><b>${isIndonesian ? "Pakan/Hari" : "Feed/Day"}:</b>&nbsp; ${detailData.syaratPemeliharaan.pakanPerHari || detailData.syaratPemeliharaan.pakanHijau}</div>
        <div class="bullet-item"><b>${isIndonesian ? "Minum/Hari" : "Water/Day"}:</b>&nbsp; ${detailData.syaratPemeliharaan.minumPerHari}</div>
        <div class="bullet-item"><b>${isIndonesian ? "Kepadatan" : "Density"}:</b>&nbsp; ${detailData.syaratPemeliharaan.kepadatan}</div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">
        <div class="bar"></div>
        ${isIndonesian ? "Cara Pemeliharaan" : "Rearing Method"}
      </div>
      <div class="card">
        ${detailData.caraPemeliharaan[language].map((step: any, index: number) => `
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

    const handleDownloadPDF = async () => {
        try {
            setIsGeneratingPDF(true);
            const html = await generateHTML();
            const { uri } = await Print.printToFileAsync({
                html,
                width: 612,
                height: 792,
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
                <View style={styles.imageContainer}>
                    {detailData.foto ? (
                        <Image source={{ uri: detailData.foto }} style={styles.image} resizeMode="cover" />
                    ) : (
                        <View style={styles.imagePlaceholder}>
                            <Image
                                    source={{ uri: "https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=800" }}
                                style={styles.image}
                                resizeMode="cover"
                            />
                        </View>
                    )}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t("description")}</Text>
                    <View style={styles.card}>
                        <Text style={styles.descriptionText}>
                            {detailData.deskripsi[language]}
                        </Text>
                    </View>
                </View>

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

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        {language === "id" ? "Syarat Pemeliharaan" : "Rearing Requirements"}
                    </Text>
                    <View style={styles.card}>
                        <View style={styles.bulletItem}>
                            <Text style={styles.bullet}>•</Text>
                            <Text style={styles.bulletText}>
                                {language === "id" ? "Suhu" : "Temperature"}:{" "}
                                <Text style={styles.boldText}>{detailData.syaratPemeliharaan.suhu}</Text>
                            </Text>
                        </View>
                        <View style={styles.bulletItem}>
                            <Text style={styles.bullet}>•</Text>
                            <Text style={styles.bulletText}>
                                {language === "id" ? "Kelembapan" : "Humidity"}:{" "}
                                <Text style={styles.boldText}>{detailData.syaratPemeliharaan.kelembapan}</Text>
                            </Text>
                        </View>
                        {detailData.syaratPemeliharaan.pakanPerHari && (
                            <View style={styles.bulletItem}>
                                <Text style={styles.bullet}>•</Text>
                                <Text style={styles.bulletText}>
                                    {language === "id" ? "Pakan/Hari" : "Feed/Day"}:{" "}
                                    <Text style={styles.boldText}>{detailData.syaratPemeliharaan.pakanPerHari}</Text>
                                </Text>
                            </View>
                        )}
                        {detailData.syaratPemeliharaan.pakanHijau && (
                            <View style={styles.bulletItem}>
                                <Text style={styles.bullet}>•</Text>
                                <Text style={styles.bulletText}>
                                    {language === "id" ? "Pakan Hijau" : "Forage"}:{" "}
                                    <Text style={styles.boldText}>{detailData.syaratPemeliharaan.pakanHijau}</Text>
                                </Text>
                            </View>
                        )}
                        {detailData.syaratPemeliharaan.pakanKonsentrat && (
                            <View style={styles.bulletItem}>
                                <Text style={styles.bullet}>•</Text>
                                <Text style={styles.bulletText}>
                                    {language === "id" ? "Konsentrat" : "Concentrate"}:{" "}
                                    <Text style={styles.boldText}>{detailData.syaratPemeliharaan.pakanKonsentrat}</Text>
                                </Text>
                            </View>
                        )}
                        {detailData.syaratPemeliharaan.ph && (
                            <View style={styles.bulletItem}>
                                <Text style={styles.bullet}>•</Text>
                                <Text style={styles.bulletText}>
                                    pH: <Text style={styles.boldText}>{detailData.syaratPemeliharaan.ph}</Text>
                                </Text>
                            </View>
                        )}
                        {detailData.syaratPemeliharaan.oksigen && (
                            <View style={styles.bulletItem}>
                                <Text style={styles.bullet}>•</Text>
                                <Text style={styles.bulletText}>
                                    {language === "id" ? "Oksigen" : "Oxygen"}:{" "}
                                    <Text style={styles.boldText}>{detailData.syaratPemeliharaan.oksigen}</Text>
                                </Text>
                            </View>
                        )}
                        <View style={styles.bulletItem}>
                            <Text style={styles.bullet}>•</Text>
                            <Text style={styles.bulletText}>
                                {language === "id" ? "Minum/Hari" : "Water/Day"}:{" "}
                                <Text style={styles.boldText}>{detailData.syaratPemeliharaan.minumPerHari}</Text>
                            </Text>
                        </View>
                        <View style={styles.bulletItem}>
                            <Text style={styles.bullet}>•</Text>
                            <Text style={styles.bulletText}>
                                {language === "id" ? "Kepadatan" : "Density"}:{" "}
                                <Text style={styles.boldText}>{detailData.syaratPemeliharaan.kepadatan}</Text>
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        {language === "id" ? "Cara Pemeliharaan" : "Rearing Method"}
                    </Text>
                    <View style={styles.card}>
                        {detailData.caraPemeliharaan[language].map((item: any, index: number) => (
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

            <View style={styles.bottomNav}>
                <TouchableOpacity style={styles.navItem} onPress={() => router.push("/user/settings")}>
                    <Settings size={24} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.navItem, styles.navItemActive]} onPress={() => router.push("/user/dashboardUser")}>
                    <Home size={28} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => router.push("/user/profile")}>
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