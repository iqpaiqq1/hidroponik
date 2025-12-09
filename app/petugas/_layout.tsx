import { Stack } from "expo-router";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";

export default function PetugasLayout() {
    return (
        <ThemeProvider>
            <LanguageProvider>
                <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="dashboardPetugas" />
                    <Stack.Screen name="settings" />
                    <Stack.Screen name="profile" />
                </Stack>
            </LanguageProvider>
        </ThemeProvider>
    );
}