import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet,
  Alert,
  ActivityIndicator,
  FlatList
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import MenuSidebar from "../sidebar";
import { API_URLS } from "../../api/apiConfig";
import FormModal, { User } from "./formModal";

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

// Interface User sudah diimport dari formModal

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
  const [selectedPengiriman, setSelectedPengiriman] = useState<Pengiriman | null>(null);
  
  // Fetch data dari API
  const fetchData = async () => {
    try {
      setLoading(true);
      
      console.log("🚀 [DASHBOARD] Fetching data from API...");
      
      // Fetch data dengan Promise.all untuk paralel fetching
      const [pengirimanRes, supplyRes, panenRes, userRes] = await Promise.all([
        fetch(API_URLS.PENGIRIMAN).then(res => {
          if (!res.ok) {
            throw new Error(`Pengiriman API error: ${res.status}`);
          }
          return res.json();
        }).catch(error => {
          console.error("Error fetching pengiriman:", error);
          return [];
        }),
        
        fetch(API_URLS.SUPPLY).then(res => {
          if (!res.ok) {
            throw new Error(`Supply API error: ${res.status}`);
          }
          return res.json();
        }).catch(error => {
          console.error("Error fetching supply:", error);
          return [];
        }),
        
        fetch(API_URLS.PANEN).then(res => {
          if (!res.ok) {
            throw new Error(`Panen API error: ${res.status}`);
          }
          return res.json();
        }).catch(error => {
          console.error("Error fetching panen:", error);
          return [];
        }),
        
        fetch(API_URLS.USER).then(res => {
          if (!res.ok) {
            throw new Error(`User API error: ${res.status}`);
          }
          return res.json();
        }).catch(error => {
          console.error("Error fetching user:", error);
          return [];
        })
      ]);

      // Handle pengiriman data
      setPengirimanData(Array.isArray(pengirimanRes) ? pengirimanRes : []);
      setSupplyData(Array.isArray(supplyRes) ? supplyRes : []);
      setPanenData(Array.isArray(panenRes) ? panenRes : []);
      
      // Transform dan filter user dengan role kurir
      const transformedUsers: User[] = Array.isArray(userRes) 
        ? userRes.map((user: any) => ({
            id_user: user.id_user || user.id || 0,
            name: user.name || user.nama || '',
            username: user.username || '',
            gmail: user.gmail || user.email || '',
            role: user.role || '',
            password: user.password || '',
            profile_picture: user.profile_picture || null,
            
            // Untuk kompatibilitas
            id: user.id_user || user.id || 0,
            nama: user.name || user.nama || '',
            email: user.gmail || user.email || '',
          }))
        : [];
      
      // Filter hanya user dengan role kurir
      const filteredKurir = transformedUsers.filter((user: User) => {
        const userRole = (user.role || '').toString().toLowerCase().trim();
        const isKurir = userRole === 'kurir';
        
        console.log(`🎯 [DASHBOARD] User ${user.name} role: "${userRole}", isKurir: ${isKurir}`);
        return isKurir;
      });
      
      setKurirData(filteredKurir);

      console.log("✅ [DASHBOARD] Data loaded successfully:");
      console.log("- Pengiriman:", pengirimanRes?.length || 0);
      console.log("- Supply:", supplyRes?.length || 0);
      console.log("- Panen:", panenRes?.length || 0);
      console.log("- Kurir:", filteredKurir.length);

    } catch (error) {
      console.error("❌ [DASHBOARD] Error in fetchData:", error);
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
    if (!item || !item.tgl_pengiriman) return false;
    if (selectedPeriode === "Semua") return true;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Parse tanggal dari string
    let itemDate;
    try {
      if (item.tgl_pengiriman.includes('-')) {
        // Format: YYYY-MM-DD
        const [year, month, day] = item.tgl_pengiriman.split('-').map(Number);
        itemDate = new Date(year, month - 1, day);
      } else if (item.tgl_pengiriman.includes('/')) {
        // Format: DD/MM/YYYY
        const [day, month, year] = item.tgl_pengiriman.split('/').map(Number);
        itemDate = new Date(year, month - 1, day);
      } else {
        itemDate = new Date(item.tgl_pengiriman);
      }
      
      itemDate.setHours(0, 0, 0, 0);
      
      if (isNaN(itemDate.getTime())) {
        return false;
      }

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
    } catch (error) {
      console.error("Error parsing date:", item.tgl_pengiriman, error);
      return false;
    }
  });

  // Calculate analytics
  const totalPengiriman = filteredData.length;
  const totalJumlahDikirim = filteredData.reduce((sum, item) => sum + (item?.jumlah_dikirim || 0), 0);
  const statusPending = filteredData.filter(i => i?.status_pengiriman === "pending").length;
  const statusSelesai = filteredData.filter(i => i?.status_pengiriman === "selesai").length;

  // Handle CRUD Operations
  const handleAdd = () => {
    setSelectedPengiriman(null);
    setModalVisible(true);
  };

  const handleEdit = (item: Pengiriman) => {
    if (!item) return;
    
    setSelectedPengiriman(item);
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
    if (item?.supply && item.supply.nm_supply) {
      return `${item.supply.nm_supply} (Supply)`;
    } else if (item?.panen && item.panen.jenis_panen) {
      return `${item.panen.jenis_panen} (Panen)`;
    }
    
    // Fallback: cari dari supplyData atau panenData
    if (item?.id_supply) {
      const supply = supplyData.find(s => s.id_supply === item.id_supply);
      if (supply) return `${supply.nm_supply || 'Supply'} (Supply)`;
    }
    
    if (item?.id_panen) {
      const panen = panenData.find(p => p.id_panen === item.id_panen);
      if (panen) return `${panen.jenis_panen || 'Panen'} (Panen)`;
    }
    
    return "Produk Tidak Diketahui";
  };

  const getNamaKurir = (item: Pengiriman) => {
    if (item?.kurir && item.kurir.name) {
      return item.kurir.name;
    }
    
    // Cari kurir dari kurirData - PERHATIAN: id_kurir harus dicocokkan dengan id_user
    if (item?.id_kurir) {
      const kurir = kurirData.find(k => k.id_user === item.id_kurir);
      return kurir ? kurir.name : "Belum ada kurir";
    }
    
    return "Belum ada kurir";
  };

  const formatDateDisplay = (dateString: string) => {
    if (!dateString) return 'Tanggal tidak tersedia';
    
    try {
      let date;
      if (dateString.includes('-')) {
        // Format: YYYY-MM-DD
        const [year, month, day] = dateString.split('-').map(Number);
        date = new Date(year, month - 1, day);
      } else if (dateString.includes('/')) {
        // Format: DD/MM/YYYY
        const [day, month, year] = dateString.split('/').map(Number);
        date = new Date(year, month - 1, day);
      } else {
        date = new Date(dateString);
      }
      
      if (isNaN(date.getTime())) {
        return dateString;
      }
      
      return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch (error) {
      return dateString;
    }
  };

  const renderPengirimanItem = ({ item }: { item: Pengiriman }) => {
    if (!item) return null;
    
    return (
      <View style={styles.dataCard}>
        <View style={styles.dataHeader}>
          <Text style={styles.dataId}>PGR{item.id_pengiriman?.toString().padStart(3, '0') || '000'}</Text>
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
          {formatDateDisplay(item.tgl_pengiriman)}
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
          <Text style={styles.dataValue}>{item.tujuan || 'Tidak ditentukan'}</Text>
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
  };

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
              onPress={handleAdd}
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
                  onPress={handleAdd}
                >
                  <Text style={styles.addButtonSmallText}>+ Tambah Data</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                data={filteredData}
                keyExtractor={(item) => item?.id_pengiriman?.toString() || Math.random().toString()}
                renderItem={renderPengirimanItem}
                scrollEnabled={false}
              />
            )}
          </View>
        </ScrollView>
      </View>

      {/* Form Modal */}
      <FormModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setSelectedPengiriman(null);
        }}
        onSubmit={() => {
          fetchData();
          setModalVisible(false);
          setSelectedPengiriman(null);
        }}
        selectedItem={selectedPengiriman}
        supplyData={supplyData}
        panenData={panenData}
        kurirData={kurirData}
      />
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
});