import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  FlatList
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import MenuSidebar from "../sidebar";
import { API_URLS } from "../../api/apiConfig";

// Define TypeScript interfaces
interface Pengiriman {
  id_pengiriman: number;
  id_supply: number | null;
  id_panen: number | null;
  tgl_pengiriman: string;
  tujuan: string;
  jumlah_dikirim: number;
  status_pengiriman: "pending" | "selesai";
  id_kurir: number | null;
  keterangan: string;
  supply?: Supply;
  panen?: Panen;
  kurir?: User;
}

interface Supply {
  id_supply: number;
  nm_supply: string;
  jenis_supply: string;
  stok: number;
}

interface Panen {
  id_panen: number;
  tgl_panen: string;
  jenis_panen: string;
  jumlah: number;
  kualitas: string;
  id_tumbuhan: number;
}

interface User {
  id: number;
  nama: string;
  email: string;
  role: string;
}

export default function PengirimanDashboard() {
  const params = useLocalSearchParams();
  const gmail = (params.gmail as string) || "";
  const nama = (params.nama as string) || "";

  // State untuk data
  const [pengirimanData, setPengirimanData] = useState<Pengiriman[]>([]);
  const [supplyData, setSupplyData] = useState<Supply[]>([]);
  const [panenData, setPanenData] = useState<Panen[]>([]);
  const [kurirData, setKurirData] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  
  // State untuk form
  const [selectedJenis, setSelectedJenis] = useState<"supply" | "panen">("supply");
  const [selectedProduk, setSelectedProduk] = useState("");
  const [jumlahDikirim, setJumlahDikirim] = useState("");
  const [tujuan, setTujuan] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [statusPengiriman, setStatusPengiriman] = useState<"pending" | "selesai">("pending");
  const [selectedKurir, setSelectedKurir] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Fetch data dari API
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch data dengan error handling
      const pengirimanPromise = fetch(API_URLS.PENGIRIMAN).then(res => res.ok ? res.json() : []);
      const supplyPromise = fetch(API_URLS.SUPPLY).then(res => res.ok ? res.json() : []);
      const panenPromise = fetch(API_URLS.PANEN).then(res => res.ok ? res.json() : []);
      const userPromise = fetch(API_URLS.USER).then(res => res.ok ? res.json() : []);

      const [pengirimanRes, supplyRes, panenRes, userRes] = await Promise.all([
        pengirimanPromise, supplyPromise, panenPromise, userPromise
      ]);

      setPengirimanData(pengirimanRes || []);
      setSupplyData(supplyRes || []);
      setPanenData(panenRes || []);
      
      // Filter user dengan role kurir - handle case sensitive
      const filteredKurir = (userRes || []).filter((user: User) => 
        user.role && user.role.toLowerCase().includes('kurir')
      );
      setKurirData(filteredKurir);

    } catch (error) {
      console.error("Error fetching data:", error);
      Alert.alert("Error", "Gagal mengambil data dari server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter data berdasarkan periode
  const [selectedPeriode, setSelectedPeriode] = useState("Semua");
  const periodeOptions = ["Semua", "Hari ini", "Minggu ini", "Bulan ini"];

  const filteredData = pengirimanData.filter((item) => {
    if (selectedPeriode === "Semua") return true;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const itemDate = new Date(item.tgl_pengiriman);
    itemDate.setHours(0, 0, 0, 0);

    switch (selectedPeriode) {
      case "Hari ini":
        return itemDate.getTime() === today.getTime();
      case "Minggu ini":
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        return itemDate >= startOfWeek;
      case "Bulan ini":
        return (
          itemDate.getMonth() === today.getMonth() &&
          itemDate.getFullYear() === today.getFullYear()
        );
      default:
        return true;
    }
  });

  // Calculate analytics
  const totalPengiriman = filteredData.length;
  const totalJumlahDikirim = filteredData.reduce((sum, item) => sum + (item.jumlah_dikirim || 0), 0);
  const statusPending = filteredData.filter(i => i.status_pengiriman === "pending").length;
  const statusSelesai = filteredData.filter(i => i.status_pengiriman === "selesai").length;

  // Handle CRUD Operations
  const handleSave = async () => {
    // Validasi form
    if (!selectedProduk || !jumlahDikirim || !tujuan) {
      Alert.alert("Error", "Harap isi semua field yang wajib");
      return;
    }

    try {
      const payload: any = {
        tgl_pengiriman: new Date().toISOString().split('T')[0], // Format YYYY-MM-DD
        tujuan: tujuan,
        jumlah_dikirim: parseInt(jumlahDikirim) || 0,
        status_pengiriman: statusPengiriman,
        keterangan: keterangan,
        id_kurir: selectedKurir ? parseInt(selectedKurir) : null
      };

      // Set id_supply atau id_panen berdasarkan jenis
      if (selectedJenis === "supply") {
        payload.id_supply = parseInt(selectedProduk);
        payload.id_panen = null;
      } else {
        payload.id_panen = parseInt(selectedProduk);
        payload.id_supply = null;
      }

      const method = selectedId ? "PUT" : "POST";
      const url = selectedId ? `${API_URLS.PENGIRIMAN}/${selectedId}` : API_URLS.PENGIRIMAN;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        Alert.alert("Sukses", selectedId ? "Data berhasil diupdate" : "Data berhasil ditambahkan");
        resetForm();
        fetchData();
      } else {
        Alert.alert("Error", "Gagal menyimpan data");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Terjadi kesalahan saat menyimpan data");
    }
  };

  const handleEdit = (item: Pengiriman) => {
    setSelectedId(item.id_pengiriman);
    
    // Tentukan jenis berdasarkan data yang ada
    if (item.id_supply) {
      setSelectedJenis("supply");
      setSelectedProduk(item.id_supply.toString());
    } else if (item.id_panen) {
      setSelectedJenis("panen");
      setSelectedProduk(item.id_panen.toString());
    }
    
    setJumlahDikirim(item.jumlah_dikirim?.toString() || "");
    setTujuan(item.tujuan || "");
    setKeterangan(item.keterangan || "");
    setStatusPengiriman(item.status_pengiriman || "pending");
    setSelectedKurir(item.id_kurir?.toString() || "");
    setModalVisible(true);
  };

  const handleDelete = async (id_pengiriman: number) => {
    Alert.alert(
      "Konfirmasi Hapus",
      "Apakah Anda yakin ingin menghapus data pengiriman ini?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await fetch(`${API_URLS.PENGIRIMAN}/${id_pengiriman}`, {
                method: "DELETE",
              });

              if (response.ok) {
                Alert.alert("Sukses", "Data pengiriman berhasil dihapus");
                fetchData();
              } else {
                Alert.alert("Error", "Gagal menghapus data");
              }
            } catch (error) {
              console.error(error);
              Alert.alert("Error", "Gagal menghapus data");
            }
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setSelectedJenis("supply");
    setSelectedProduk("");
    setJumlahDikirim("");
    setTujuan("");
    setKeterangan("");
    setStatusPengiriman("pending");
    setSelectedKurir("");
    setSelectedId(null);
    setModalVisible(false);
  };

  // Get available products based on selected type
  const getAvailableProducts = () => {
    if (selectedJenis === "supply") {
      return supplyData.map(s => ({
        id: s.id_supply,
        name: `${s.nm_supply} (${s.jenis_supply})`,
        stok: s.stok || 0
      }));
    } else {
      return panenData.map(p => ({
        id: p.id_panen,
        name: `${p.jenis_panen} (${p.kualitas})`,
        stok: p.jumlah || 0
      }));
    }
  };

  const getStatusColor = (status: "pending" | "selesai") => {
    switch (status) {
      case "selesai":
        return { backgroundColor: '#dcfce7', color: '#166534' };
      case "pending":
        return { backgroundColor: '#ffedd5', color: '#9a3412' };
      default:
        return { backgroundColor: '#f3f4f6', color: '#374151' };
    }
  };

  const getNamaProduk = (item: Pengiriman) => {
    if (item.supply) {
      return `${item.supply.nm_supply} (Supply)`;
    } else if (item.panen) {
      return `${item.panen.jenis_panen} (Panen)`;
    }
    return "Produk";
  };

  const getNamaKurir = (item: Pengiriman) => {
    if (item.kurir) {
      return item.kurir.nama;
    }
    
    // Cari kurir dari kurirData
    const kurir = kurirData.find(k => k.id === item.id_kurir);
    return kurir ? kurir.nama : "Belum ada kurir";
  };

  const renderPengirimanItem = ({ item }: { item: Pengiriman }) => (
    <View style={styles.dataCard}>
      <View style={styles.dataHeader}>
        <Text style={styles.dataId}>PGR{item.id_pengiriman.toString().padStart(3, '0')}</Text>
        <View style={[
          styles.statusBadge,
          { backgroundColor: getStatusColor(item.status_pengiriman).backgroundColor }
        ]}>
          <Text style={[
            styles.statusText,
            { color: getStatusColor(item.status_pengiriman).color }
          ]}>
            {item.status_pengiriman === "selesai" ? "✅ Selesai" : "⏳ Pending"}
          </Text>
        </View>
      </View>
      
      <Text style={styles.dataDate}>
        {new Date(item.tgl_pengiriman).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}
      </Text>
      
      <View style={styles.dataRow}>
        <Text style={styles.dataLabel}>Produk:</Text>
        <Text style={styles.dataValue}>{getNamaProduk(item)}</Text>
      </View>

      <View style={styles.dataRow}>
        <Text style={styles.dataLabel}>Jenis:</Text>
        <Text style={styles.dataValue}>
          {item.id_supply ? "📦 Supply" : "🌱 Hasil Panen"}
        </Text>
      </View>
      
      <View style={styles.dataDetails}>
        <View style={styles.dataDetail}>
          <Text style={styles.dataDetailLabel}>Jumlah:</Text>
          <Text style={styles.dataDetailValue}>{item.jumlah_dikirim || 0} unit</Text>
        </View>
      </View>
      
      <View style={styles.dataRow}>
        <Text style={styles.dataLabel}>Tujuan:</Text>
        <Text style={styles.dataValue}>{item.tujuan}</Text>
      </View>

      <View style={styles.dataRow}>
        <Text style={styles.dataLabel}>Kurir:</Text>
        <Text style={styles.dataValue}>{getNamaKurir(item)}</Text>
      </View>
      
      {item.keterangan && (
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Keterangan:</Text>
          <Text style={styles.dataValue}>{item.keterangan}</Text>
        </View>
      )}

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => handleDelete(item.id_pengiriman)}
        >
          <Text style={styles.btnIcon}>🗑️</Text>
          <Text style={styles.btnText}>Hapus</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => handleEdit(item)}
        >
          <Text style={styles.btnIcon}>✏️</Text>
          <Text style={styles.btnText}>Edit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.mainContainer}>
        <MenuSidebar activeMenu="Pengiriman" gmail={gmail} nama={nama} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1E3A3A" />
          <Text style={styles.loadingText}>Memuat data...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <MenuSidebar activeMenu="Pengiriman" gmail={gmail} nama={nama} />

      <View style={styles.container}>
        <ScrollView style={styles.scrollContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>📦 Dashboard Pengiriman</Text>
            <Text style={styles.subtitle}>Kelola pengiriman supply dan hasil panen</Text>
          </View>

          {/* Add Button */}
          <View style={styles.addButtonContainer}>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.addButtonText}>+ Tambah Pengiriman</Text>
            </TouchableOpacity>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { borderLeftColor: '#3b82f6' }]}>
              <Text style={styles.statLabel}>Total Pengiriman</Text>
              <Text style={styles.statValue}>{totalPengiriman}</Text>
            </View>
            <View style={[styles.statCard, { borderLeftColor: '#10b981' }]}>
              <Text style={styles.statLabel}>Total Dikirim</Text>
              <Text style={styles.statValue}>{totalJumlahDikirim}</Text>
            </View>
            <View style={[styles.statCard, { borderLeftColor: '#8b5cf6' }]}>
              <Text style={styles.statLabel}>Selesai</Text>
              <Text style={styles.statValue}>{statusSelesai}</Text>
            </View>
            <View style={[styles.statCard, { borderLeftColor: '#f97316' }]}>
              <Text style={styles.statLabel}>Pending</Text>
              <Text style={styles.statValue}>{statusPending}</Text>
            </View>
          </View>

          {/* Filter Periode */}
          <View style={styles.filterContainer}>
            <Text style={styles.filterLabel}>Filter Periode</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              {periodeOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.filterOption,
                    selectedPeriode === option && styles.filterOptionActive
                  ]}
                  onPress={() => setSelectedPeriode(option)}
                >
                  <Text style={[
                    styles.filterOptionText,
                    selectedPeriode === option && styles.filterOptionTextActive
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text style={styles.filterInfo}>
              Menampilkan {filteredData.length} dari {pengirimanData.length} data
            </Text>
          </View>

          {/* Data List */}
          <View style={styles.dataContainer}>
            <Text style={styles.sectionTitle}>Data Pengiriman</Text>
            {filteredData.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>📦</Text>
                <Text style={styles.emptyText}>Tidak ada data pengiriman</Text>
                <TouchableOpacity
                  style={styles.addButtonSmall}
                  onPress={() => setModalVisible(true)}
                >
                  <Text style={styles.addButtonSmallText}>+ Tambah Data</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                data={filteredData}
                keyExtractor={(item) => item.id_pengiriman.toString()}
                renderItem={renderPengirimanItem}
                scrollEnabled={false}
              />
            )}
          </View>
        </ScrollView>
      </View>

      {/* Modal Form */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={resetForm}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <ScrollView 
              style={styles.modalScrollView}
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={true}
            >
              <Text style={styles.modalTitle}>
                {selectedId ? "Edit Pengiriman" : "Tambah Pengiriman"}
              </Text>

              {/* Jenis Produk */}
              <Text style={styles.inputLabel}>Jenis Produk</Text>
              <View style={styles.radioContainer}>
                <TouchableOpacity
                  style={[
                    styles.radioButton,
                    selectedJenis === "supply" && styles.radioButtonActive
                  ]}
                  onPress={() => setSelectedJenis("supply")}
                >
                  <Text style={[
                    styles.radioText,
                    selectedJenis === "supply" && styles.radioTextActive
                  ]}>
                    📦 Supply
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.radioButton,
                    selectedJenis === "panen" && styles.radioButtonActive
                  ]}
                  onPress={() => setSelectedJenis("panen")}
                >
                  <Text style={[
                    styles.radioText,
                    selectedJenis === "panen" && styles.radioTextActive
                  ]}>
                    🌱 Hasil Panen
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Pilih Produk */}
              <Text style={styles.inputLabel}>Pilih Produk *</Text>
              <View style={styles.productListContainer}>
                {getAvailableProducts().map((product) => (
                  <TouchableOpacity
                    key={product.id}
                    style={[
                      styles.productOption,
                      selectedProduk === product.id.toString() && styles.productOptionActive
                    ]}
                    onPress={() => setSelectedProduk(product.id.toString())}
                  >
                    <Text style={[
                      styles.productText,
                      selectedProduk === product.id.toString() && styles.productTextActive
                    ]}>
                      {product.name}
                    </Text>
                    <Text style={styles.stokText}>Stok: {product.stok}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                placeholder="Jumlah Dikirim *"
                style={styles.input}
                value={jumlahDikirim}
                keyboardType="numeric"
                onChangeText={setJumlahDikirim}
              />

              <TextInput
                placeholder="Tujuan Pengiriman *"
                style={styles.input}
                value={tujuan}
                onChangeText={setTujuan}
              />

              {/* Pilih Kurir */}
              <Text style={styles.inputLabel}>Pilih Kurir</Text>
              <View style={styles.productListContainer}>
                {kurirData.map((kurir) => (
                  <TouchableOpacity
                    key={kurir.id}
                    style={[
                      styles.productOption,
                      selectedKurir === kurir.id.toString() && styles.productOptionActive
                    ]}
                    onPress={() => setSelectedKurir(kurir.id.toString())}
                  >
                    <Text style={[
                      styles.productText,
                      selectedKurir === kurir.id.toString() && styles.productTextActive
                    ]}>
                      {kurir.nama}
                    </Text>
                    <Text style={styles.stokText}>{kurir.email}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                placeholder="Keterangan (opsional)"
                style={[styles.input, styles.textArea]}
                value={keterangan}
                onChangeText={setKeterangan}
                multiline
                numberOfLines={3}
              />

              {/* Status */}
              <Text style={styles.inputLabel}>Status Pengiriman</Text>
              <View style={styles.radioContainer}>
                <TouchableOpacity
                  style={[
                    styles.radioButton,
                    statusPengiriman === "pending" && styles.radioButtonActive
                  ]}
                  onPress={() => setStatusPengiriman("pending")}
                >
                  <Text style={[
                    styles.radioText,
                    statusPengiriman === "pending" && styles.radioTextActive
                  ]}>
                    ⏳ Pending
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.radioButton,
                    statusPengiriman === "selesai" && styles.radioButtonActive
                  ]}
                  onPress={() => setStatusPengiriman("selesai")}
                >
                  <Text style={[
                    styles.radioText,
                    statusPengiriman === "selesai" && styles.radioTextActive
                  ]}>
                    ✅ Selesai
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.cancelBtn]}
                  onPress={resetForm}
                >
                  <Text style={styles.cancelBtnText}>Batal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.saveBtn]}
                  onPress={handleSave}
                >
                  <Text style={styles.saveBtnText}>Simpan</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ==================== STYLES ====================
const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#E8F4F8",
  },
  container: {
    flex: 1,
    backgroundColor: "#E8F4F8",
  },
  scrollContainer: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#1E3A3A',
    fontSize: 16,
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 10,
    borderRadius: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  addButtonContainer: {
    marginBottom: 15,
  },
  addButton: {
    backgroundColor: '#1E3A3A',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  addButtonSmall: {
    backgroundColor: '#1E3A3A',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
  },
  addButtonSmallText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  filterContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  filterScroll: {
    marginBottom: 12,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    marginRight: 8,
  },
  filterOptionActive: {
    backgroundColor: '#3b82f6',
  },
  filterOptionText: {
    color: '#6b7280',
    fontWeight: '500',
  },
  filterOptionTextActive: {
    color: 'white',
  },
  filterInfo: {
    fontSize: 14,
    color: '#6b7280',
  },
  dataContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  dataCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  dataHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dataId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dataDate: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  dataRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  dataLabel: {
    fontSize: 14,
    color: '#6b7280',
    width: 80,
  },
  dataValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
    flex: 1,
  },
  dataDetails: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dataDetail: {
    flexDirection: 'row',
    marginRight: 16,
  },
  dataDetailLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginRight: 4,
  },
  dataDetailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 12,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dc2626',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E3A3A',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  btnIcon: {
    marginRight: 4,
    fontSize: 14,
  },
  btnText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '90%',
    maxHeight: '85%',
  },
  modalScrollView: {
    flex: 1,
  },
  modalScrollContent: {
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E3A3A',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 14,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  radioContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  radioButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    alignItems: 'center',
  },
  radioButtonActive: {
    backgroundColor: '#1E3A3A',
  },
  radioText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  radioTextActive: {
    color: 'white',
  },
  productListContainer: {
    marginBottom: 12,
  },
  productOption: {
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  productOptionActive: {
    backgroundColor: '#1E3A3A',
    borderColor: '#1E3A3A',
  },
  productText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
  },
  productTextActive: {
    color: 'white',
  },
  stokText: {
    fontSize: 12,
    color: '#6b7280',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  modalBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: '#F5F5F5',
  },
  cancelBtnText: {
    color: '#757575',
    fontWeight: '600',
    fontSize: 15,
  },
  saveBtn: {
    backgroundColor: '#1E3A3A',
  },
  saveBtnText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 15,
  },
});