
import { Stack } from "expo-router";
import { LanguageProvider } from "./contexts/LanguageContext";
import { ThemeProvider } from "./contexts/ThemeContext";

export default function UserLayout() {
    return (
        <ThemeProvider>
            <LanguageProvider>
                <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="dashboardUser" />
                    <Stack.Screen name="settings" />
                    <Stack.Screen name="profile" />
                    <Stack.Screen name="detail" />
                    <Stack.Screen name="know_more" />
                </Stack>
            </LanguageProvider>
        </ThemeProvider>
    );
}