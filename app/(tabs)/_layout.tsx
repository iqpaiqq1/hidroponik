import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: "none" }, 
      }}
    >
      <Tabs.Screen name="dashboard" />
      <Tabs.Screen name="tanaman" />
      <Tabs.Screen name="ternak" />
      <Tabs.Screen name="sensor" />
      <Tabs.Screen name="laporan" />
      <Tabs.Screen name="pengiriman" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
