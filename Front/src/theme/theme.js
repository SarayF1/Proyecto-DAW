// src/theme/theme.js
import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
    palette: {
        mode: "dark",
        primary: {
            main: "#00e676",
        },
        secondary: {
            main: "#7c4dff",
        },
        background: {
            default: "#0f172a",
            paper: "#111827",
        },
    },
    typography: {
        fontFamily: "Inter, Roboto, sans-serif",
    },
});
