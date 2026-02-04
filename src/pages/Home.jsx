// src/pages/Home.jsx
import { Box, Typography, Grid, Button, Paper } from "@mui/material";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import 'leaflet/dist/leaflet.css';
import L from "leaflet";
import AnunciosDinamicos from "../components/AnunciosDinamicos";

// Icono personalizado para parkings
const parkingIcon = new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/854/854878.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
});

// Lista ampliada de parkings en Puerto del Rosario (~20)
const parkings = [
    { id: 1, name: "Parking Centro 1", lat: 28.5025, lng: -13.8595, available: 12 },
    { id: 2, name: "Parking Centro 2", lat: 28.5030, lng: -13.8580, available: 5 },
    { id: 3, name: "Parking Playa Blanca", lat: 28.5040, lng: -13.8610, available: 8 },
    { id: 4, name: "Parking Puerto 1", lat: 28.5000, lng: -13.8570, available: 20 },
    { id: 5, name: "Parking Puerto 2", lat: 28.5010, lng: -13.8560, available: 14 },
    { id: 6, name: "Parking Parque", lat: 28.5030, lng: -13.8620, available: 7 },
    { id: 7, name: "Parking Avenida Marítima", lat: 28.5050, lng: -13.8600, available: 10 },
    { id: 8, name: "Parking Mercado", lat: 28.4995, lng: -13.8585, available: 3 },
    { id: 9, name: "Parking Hospital", lat: 28.5060, lng: -13.8630, available: 15 },
    { id: 10, name: "Parking Estadio", lat: 28.5070, lng: -13.8575, available: 6 },
    { id: 11, name: "Parking Centro Comercial", lat: 28.5045, lng: -13.8555, available: 9 },
    { id: 12, name: "Parking Escuela", lat: 28.5020, lng: -13.8640, available: 11 },
    { id: 13, name: "Parking Biblioteca", lat: 28.5035, lng: -13.8570, available: 4 },
    { id: 14, name: "Parking Ayuntamiento", lat: 28.5005, lng: -13.8590, available: 2 },
    { id: 15, name: "Parking Plaza", lat: 28.5015, lng: -13.8615, available: 12 },
    { id: 16, name: "Parking Museo", lat: 28.5038, lng: -13.8605, available: 8 },
    { id: 17, name: "Parking Parque Infantil", lat: 28.5028, lng: -13.8625, available: 10 },
    { id: 18, name: "Parking Gasolinera", lat: 28.5048, lng: -13.8590, available: 5 },
    { id: 19, name: "Parking Polideportivo", lat: 28.5065, lng: -13.8580, available: 7 },
    { id: 20, name: "Parking Puerto 3", lat: 28.5008, lng: -13.8565, available: 6 },
];

export default function Home() {
    const navigate = useNavigate();

    const buttons = [
        { label: "Parquímetro", path: "/parquimetro" },
        { label: "Parkings", path: "/parkings" },
        { label: "Recargas", path: "/wallet" },
        { label: "Guardar ubicación", path: "/home" },
    ];

    return (
        <Box p={3}>
            <Typography variant="h4" mb={2}>Mapa de Parkings</Typography>

            {/* Botones arriba */}
            <Grid container spacing={2} mb={3}>
                {buttons.map((btn) => (
                    <Grid item xs={12} sm={6} md={3} key={btn.label}>
                        <Button
                            fullWidth
                            variant="contained"
                            sx={{ p: 2 }}
                            onClick={() => navigate(btn.path)}
                        >
                            {btn.label}
                        </Button>
                    </Grid>
                ))}
            </Grid>

            {/* Mapa con parkings */}
            <Paper
                sx={{
                    height: { xs: 300, sm: 400, md: 450 },
                    maxHeight: 500,
                    borderRadius: 2,
                    overflow: "hidden",
                    boxShadow: 3,
                    display: "flex",
                }}
            >
                <MapContainer
                    center={[28.5023, -13.8590]} // Puerto del Rosario
                    zoom={14}
                    style={{ flex: 1, width: "100%" }}
                >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                    {/* Marcadores de parkings */}
                    {parkings.map((p) => (
                        <Marker key={p.id} position={[p.lat, p.lng]} icon={parkingIcon}>
                            <Popup>
                                <Typography fontWeight={600}>{p.name}</Typography>
                                <Typography>Plazas disponibles: {p.available}</Typography>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </Paper>

            {/* Banner de anuncios dinámicos */}
            <AnunciosDinamicos />
        </Box>
    );
}
