import { createTheme } from "@mui/material/styles";

export const appTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1976d2",
      dark: "#115293",
      light: "#e3f2fd",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#d36f62",
      dark: "#a84d43",
      light: "#ffe5df",
      contrastText: "#ffffff",
    },
    background: {
      default: "#f5fbff",
      paper: "#ffffff",
    },
    text: {
      primary: "#132238",
      secondary: "#607089",
    },
  },
  shape: {
    borderRadius: 18,
  },
  typography: {
    fontFamily: "var(--font-geist-sans), Arial, Helvetica, sans-serif",
    h1: { fontWeight: 800, letterSpacing: 0 },
    h2: { fontWeight: 800, letterSpacing: 0 },
    h3: { fontWeight: 800, letterSpacing: 0 },
    h4: { fontWeight: 800, letterSpacing: 0 },
    h5: { fontWeight: 800, letterSpacing: 0 },
    h6: { fontWeight: 800, letterSpacing: 0 },
    button: { textTransform: "none", fontWeight: 700, letterSpacing: 0 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          boxShadow: "0 12px 24px rgba(25, 118, 210, 0.18)",
          paddingInline: 22,
        },
      },
      defaultProps: {
        disableElevation: true,
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 18,
          boxShadow: "0 18px 50px rgba(25, 90, 150, 0.12)",
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
      },
    },
  },
});
