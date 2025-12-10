import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  ScrollView,
  TouchableOpacity,
  Alert
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { 
  BarChart3, 
  Package, 
  Users, 
  Truck, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Eye
} from "lucide-react-native";
import MenuSidebar from "./sidebar";

// Interface untuk data statistik
interface DashboardStats {
  totalPengiriman: number;
  totalPanen: number;
  totalKandang: number;
  pengirimanHariIni: number;
  pertumbuhanPengiriman: number;
  statusPengiriman: {
    dikirim: number;
    pending: number;
    selesai: number;
  };
}

export default function Dashboard() {
  const [userData, setUserData] = useState<{ gmail: string, nama: string, role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalPengiriman: 0,
    totalPanen: 0,
    totalKandang: 0,
    pengirimanHariIni: 0,
    pertumbuhanPengiriman: 0,
    statusPengiriman: {
      dikirim: 0,
      pending: 0,
      selesai: 0
    }
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const user = await AsyncStorage.getItem("user");
        if (user) {
          const parsed = JSON.parse(user);

          if (parsed.role?.toLowerCase() !== "admin") {
            const role = parsed.role?.toLowerCase();
            switch (role) {
              case "user":
                router.replace("/user/dashboardUser");
                break;
              case "kurir":
                router.replace("/kurir/dashboardKurir");
                break;
              case "admin":
                // Tetap di dashboard admin
                break;
              default:
                router.replace("/LoginScreen");
                break;
            }
            return;
          }

          setUserData({
            gmail: parsed.gmail || "",
            nama: parsed.nama || "",
            role: parsed.role || ""
          });

          // Load dashboard data
          await loadDashboardData();
        } else {
          router.replace("/LoginScreen");
        }
      } catch (error) {
        console.error("Error loading user data:", error);
        router.replace("/LoginScreen");
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Simulasi fetch data dari API
      const mockStats: DashboardStats = {
        totalPengiriman: 156,
        totalPanen: 89,
        totalKandang: 24,
        pengirimanHariIni: 12,
        pertumbuhanPengiriman: 15.5,
        statusPengiriman: {
          dikirim: 45,
          pending: 23,
          selesai: 88
        }
      };

      const mockActivities = [
        { id: 1, type: 'pengiriman', message: 'Pengiriman Selada Hijau ke Jakarta', time: '2 jam lalu', status: 'success' },
        { id: 2, type: 'panen', message: 'Panen Kangkung Air selesai', time: '4 jam lalu', status: 'success' },
        { id: 3, type: 'kandang', message: 'Kandang A-05 mencapai kapasitas 85%', time: '6 jam lalu', status: 'warning' },
        { id: 4, type: 'pengiriman', message: 'Pengiriman Omega 3-A ditunda', time: '8 jam lalu', status: 'error' },
        { id: 5, type: 'panen', message: 'Panen baru direncanakan besok', time: '1 hari lalu', status: 'info' }
      ];

      setStats(mockStats);
      setRecentActivities(mockActivities);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
  };

  // Komponen StatCard yang sudah dikoreksi
  const StatCard = ({ 
    title, 
    value, 
    icon, 
    change, 
    color = "#4A7C2C" 
  }: { 
    title: string; 
    value: number; 
    icon: React.ReactNode;
    change?: number;
    color?: string;
  }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statHeader}>
        <View style={[styles.iconContainer, { backgroundColor: color }]}>
          {icon}
        </View>
        <View style={styles.statValues}>
          <Text style={styles.statValue}>{value}</Text>
          {change !== undefined && (
            <View style={styles.changeContainer}>
              {change > 0 ? (
                <ArrowUpRight size={14} color="#22C55E" />
              ) : (
                <ArrowDownRight size={14} color="#EF4444" />
              )}
              <Text style={[
                styles.changeText,
                { color: change > 0 ? "#22C55E" : "#EF4444" }
              ]}>
                {Math.abs(change)}%
              </Text>
            </View>
          )}
        </View>
      </View>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );

  // Komponen QuickAction yang sudah dikoreksi
  const QuickAction = ({ 
    title, 
    icon, 
    onPress,
    color = "#4A7C2C"
  }: {
    title: string;
    icon: React.ReactNode;
    onPress: () => void;
    color?: string;
  }) => (
    <TouchableOpacity style={styles.quickAction} onPress={onPress}>
      <View style={[styles.actionIcon, { backgroundColor: color }]}>
        {icon}
      </View>
      <Text style={styles.actionText}>{title}</Text>
    </TouchableOpacity>
  );

  // Komponen ActivityItem yang sudah dikoreksi
  const ActivityItem = ({ item }: { item: any }) => (
    <View style={styles.activityItem}>
      <View style={[
        styles.activityDot,
        { backgroundColor: 
          item.status === 'success' ? '#22C55E' : 
          item.status === 'warning' ? '#F59E0B' : 
          item.status === 'error' ? '#EF4444' : '#3B82F6'
        }
      ]} />
      <View style={styles.activityContent}>
        <Text style={styles.activityMessage}>{item.message}</Text>
        <Text style={styles.activityTime}>{item.time}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4a7c2c" />
        <Text style={styles.loadingText}>Memuat data...</Text>
      </View>
    );
  }

  if (!userData) {
    return null;
  }

  return (
    <View style={styles.container}>
      <MenuSidebar activeMenu="Dashboard" gmail={userData.gmail} nama={userData.nama} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header Welcome */}
        <View style={styles.welcomeSection}>
          <View>
            <Text style={styles.welcomeText}>Selamat Datang, {userData.nama} 👋</Text>
            <Text style={styles.subText}>Berikut ringkasan aktivitas hari ini</Text>
          </View>
          <View style={styles.dateContainer}>
            <Calendar size={20} color="#6B7280" />
            <Text style={styles.dateText}>
              {new Date().toLocaleDateString('id-ID', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Text>
          </View>
        </View>

        {/* Statistics Cards */}
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Pengiriman"
            value={stats.totalPengiriman}
            change={stats.pertumbuhanPengiriman}
            icon={<Truck size={20} color="#FFF" />}
            color="#4A7C2C"
          />
          <StatCard
            title="Total Panen"
            value={stats.totalPanen}
            icon={<Package size={20} color="#FFF" />}
            color="#F59E0B"
          />
          <StatCard
            title="Kandang Aktif"
            value={stats.totalKandang}
            icon={<Users size={20} color="#FFF" />}
            color="#3B82F6"
          />
          <StatCard
            title="Pengiriman Hari Ini"
            value={stats.pengirimanHariIni}
            icon={<BarChart3 size={20} color="#FFF" />}
            color="#EF4444"
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aksi Cepat</Text>
          <View style={styles.quickActions}>
            <QuickAction
              title="Lihat Pengiriman"
              icon={<Eye size={20} color="#FFF" />}
              onPress={() => router.push({ pathname: "/(tabs)/pengiriman/pengirimanDashboard", params: { gmail: userData.gmail, nama: userData.nama } })}
              color="#4A7C2C"
            />
            <QuickAction
              title="Data Panen"
              icon={<Package size={20} color="#FFF" />}
              onPress={() => router.push({ pathname: "/(tabs)/laporan/panen", params: { gmail: userData.gmail, nama: userData.nama } })}
              color="#F59E0B"
            />
            <QuickAction
              title="Kelola Kandang"
              icon={<Users size={20} color="#FFF" />}
              onPress={() => router.push({ pathname: "/(tabs)/laporan/ternak", params: { gmail: userData.gmail, nama: userData.nama } })}
              color="#3B82F6"
            />
            <QuickAction
              title="Laporan"
              icon={<BarChart3 size={20} color="#FFF" />}
              onPress={() => Alert.alert("Info", "Menuju halaman laporan")}
              color="#8B5CF6"
            />
          </View>
        </View>

        {/* Status Pengiriman */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status Pengiriman</Text>
          <View style={styles.statusGrid}>
            <View style={styles.statusItem}>
              <View style={[styles.statusIndicator, { backgroundColor: '#3B82F6' }]} />
              <Text style={styles.statusCount}>{stats.statusPengiriman.pending}</Text>
              <Text style={styles.statusLabel}>Pending</Text>
            </View>
            <View style={styles.statusItem}>
              <View style={[styles.statusIndicator, { backgroundColor: '#F59E0B' }]} />
              <Text style={styles.statusCount}>{stats.statusPengiriman.dikirim}</Text>
              <Text style={styles.statusLabel}>Dikirim</Text>
            </View>
            <View style={styles.statusItem}>
              <View style={[styles.statusIndicator, { backgroundColor: '#22C55E' }]} />
              <Text style={styles.statusCount}>{stats.statusPengiriman.selesai}</Text>
              <Text style={styles.statusLabel}>Selesai</Text>
            </View>
          </View>
        </View>

        {/* Recent Activities */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Aktivitas Terbaru</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Lihat Semua</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.activitiesList}>
            {recentActivities.map((activity) => (
              <ActivityItem key={activity.id} item={activity} />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#fdfaf2"
  },
  content: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fdfaf2",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fdfaf2",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#5b4c3a",
  },
  welcomeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#3e2a10",
    marginBottom: 4,
  },
  subText: {
    color: "#6B7280",
    fontSize: 16,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  dateText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    borderLeftWidth: 4,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  iconContainer: {
    padding: 8,
    borderRadius: 8,
  },
  statValues: {
    alignItems: 'flex-end',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 2,
  },
  statTitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#3e2a10",
  },
  seeAllText: {
    color: '#4A7C2C',
    fontWeight: '600',
    fontSize: 14,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickAction: {
    flex: 1,
    minWidth: '48%',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  actionIcon: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  statusGrid: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  statusItem: {
    flex: 1,
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  statusCount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  statusLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  activitiesList: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    overflow: 'hidden',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityMessage: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});