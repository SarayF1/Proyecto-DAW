// src/components/AnunciosDinamicos.jsx
import { useState, useEffect } from "react";
import { Box, Paper, Typography } from "@mui/material";

export default function AnunciosDinamicos() {
    const anuncios = [
        "🎉 Oferta 10% en recargas",
        "🚗 Nuevos parkings disponibles",
        "💰 Código PRUEBA10: +10€"
    ];

    const [anuncioActual, setAnuncioActual] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setAnuncioActual((prev) => (prev + 1) % anuncios.length);
        }, 5000); // cambia cada 5 segundos
        return () => clearInterval(interval);
    }, []);

    return (
        <Box mt={3}>
            <Paper 
                sx={{ 
                    p: 2, 
                    backgroundColor: "#f5f5f5",  // gris neutro
                    color: "#000000",             // texto negro
                    borderRadius: 1,
                    boxShadow: 1
                }}
            >
                <Typography>{anuncios[anuncioActual]}</Typography>
            </Paper>
        </Box>
    );
}
