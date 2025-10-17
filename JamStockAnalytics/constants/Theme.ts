import { MD3LightTheme, configureFonts } from "react-native-paper";

const fontConfig = configureFonts({
  config: {
    fontFamily: "System",
  },
});

export const AppTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#2563eb", // Blue primary color
    secondary: "#64748b", // Slate secondary color
    surface: "#ffffff",
    background: "#ffffff", // White background
    error: "#e74c3c",
    onSurface: "#333333",
    onSurfaceVariant: "#666666",
    outline: "#e1e5e9",
    // Additional colors for white theme
    gradientStart: "#ffffff",
    gradientEnd: "#ffffff",
    // Form styling colors
    inputBackground: "#f8f9fa",
    inputBorder: "#e1e5e9",
    inputFocus: "#2563eb",
    // Social button colors
    socialBorder: "#e1e5e9",
    socialHover: "#2563eb",
  },
  fonts: fontConfig,
};


