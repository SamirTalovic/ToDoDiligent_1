import { createContext, useContext, useMemo, useState } from "react";
import { createTheme, ThemeProvider, CssBaseline } from "@mui/material";

interface ThemeContextType {
  toggleColorMode: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  toggleColorMode: () => {},
});

export const useThemeMode = () => useContext(ThemeContext);

export const AppThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<"light" | "dark">("light");

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          background: {
            default: mode === "light" ? "#f4f6f8" : "#121212", // not plain white
            paper: mode === "light" ? "#fff" : "#1e1e1e",
          },
          primary: {
            main: "#1976d2",
          },
          error: {
            main: "#d32f2f",
          },
        },
        typography: {
          fontFamily: "Poppins, sans-serif",
        },
      }),
    [mode]
  );

  const toggleColorMode = () => setMode(prev => (prev === "light" ? "dark" : "light"));

  return (
    <ThemeContext.Provider value={{ toggleColorMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};
