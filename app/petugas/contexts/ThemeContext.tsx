import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "react-native";

type Theme = "light" | "dark";

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
    colors: {
        primary: string;
        secondary: string;
        background: string;
        card: string;
        text: string;
        textSecondary: string;
        border: string;
        success: string;
        warning: string;
        error: string;
        info: string;
    };
    isDark: boolean;
}

const lightColors = {
    primary: "#7CB342",
    secondary: "#FFA726",
    background: "#F5F5F5",
    card: "#FFFFFF",
    text: "#333333",
    textSecondary: "#666666",
    border: "#E0E0E0",
    success: "#4CAF50",
    warning: "#FF9800",
    error: "#F44336",
    info: "#2196F3",
};

const darkColors = {
    primary: "#8BC34A",
    secondary: "#FFB74D",
    background: "#121212",
    card: "#1E1E1E",
    text: "#FFFFFF",
    textSecondary: "#B0B0B0",
    border: "#333333",
    success: "#66BB6A",
    warning: "#FFA726",
    error: "#EF5350",
    info: "#42A5F5",
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const systemColorScheme = useColorScheme();
    const [theme, setThemeState] = useState<Theme>("light");

    useEffect(() => {
        loadTheme();
    }, []);

    const loadTheme = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem("theme");
            if (savedTheme) {
                setThemeState(savedTheme as Theme);
            } else {
                // Jika tidak ada theme yang disimpan, gunakan system theme
                setThemeState(systemColorScheme === "dark" ? "dark" : "light");
            }
        } catch (error) {
            console.error("Error loading theme:", error);
        }
    };

    const setTheme = async (newTheme: Theme) => {
        try {
            await AsyncStorage.setItem("theme", newTheme);
            setThemeState(newTheme);
        } catch (error) {
            console.error("Error saving theme:", error);
        }
    };

    const toggleTheme = () => {
        setTheme(theme === "light" ? "dark" : "light");
    };

    const colors = theme === "light" ? lightColors : darkColors;
    const isDark = theme === "dark";

    return (
        <ThemeContext.Provider value={{
            theme,
            setTheme,
            toggleTheme,
            colors,
            isDark
        }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
};