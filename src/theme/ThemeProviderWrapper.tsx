// src/theme/ThemeProviderWrapper.tsx
import React, { useState, useMemo, createContext, useContext } from "react";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";

type ColorModeContextType = {
  toggleColorMode: () => void;
};

const ColorModeContext = createContext<ColorModeContextType>({
  toggleColorMode: () => {},
});

export const useColorMode = () => useContext(ColorModeContext);

export const ThemeProviderWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<"light" | "dark">("light");

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prev) => (prev === "light" ? "dark" : "light"));
      },
    }),
    []
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === "dark"
            ? {
                background: {
                  default: "#121212",
                  paper: "#1e1e1e",
                },
                text: {
                  primary: "#fff",
                  secondary: "#aaa",
                },
              }
            : {
                background: {
                  default: "#f5f5f5",
                  paper: "#fff",
                },
                text: {
                  primary: "#000",
                  secondary: "#555",
                },
              }),
        },
      }),
    [mode]
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};
