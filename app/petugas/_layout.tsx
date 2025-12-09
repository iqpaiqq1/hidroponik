
import { Stack } from "expo-router";
import { ThemeProvider } from "./contexts/ThemeContext";

export default function UserLayout() {
    return (
        <ThemeProvider>
           
                <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="dashboardPetugas" />
                    <Stack.Screen name="settings copy" />
                    <Stack.Screen name="profile copy" />
                    <Stack.Screen name="detail copy" />
                </Stack>
            
        </ThemeProvider>
    );
}