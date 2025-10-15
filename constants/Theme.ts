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
    primary: "#667eea", // Beautiful gradient start color
    secondary: "#764ba2", // Beautiful gradient end color
    surface: "#ffffff",
    background: "#667eea", // Gradient background
    error: "#e74c3c",
    onSurface: "#333333",
    onSurfaceVariant: "#666666",
    outline: "#e1e5e9",
    // Additional gradient colors
    gradientStart: "#667eea",
    gradientEnd: "#764ba2",
    // Form styling colors
    inputBackground: "#f8f9fa",
    inputBorder: "#e1e5e9",
    inputFocus: "#667eea",
    // Social button colors
    socialBorder: "#e1e5e9",
    socialHover: "#667eea",
  },
  fonts: fontConfig,
};


