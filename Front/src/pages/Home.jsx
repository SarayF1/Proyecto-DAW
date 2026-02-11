// src/pages/Home.jsx
import { Box, Typography, Grid, Button, Paper } from "@mui/material";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import AnunciosDinamicos from "../components/AnunciosDinamicos";
import { useEffect, useState } from "react";
import { getZonas } from "../services/api";

// Icono personalizado para parkings
const parkingIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/854/854878.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

export default function Home() {
  const navigate = useNavigate();
  const [zonas, setZonas] = useState([]);
  const [setLoading] = useState(true);

  useEffect(() => {
    const loadZonas = async () => {
      try {
        const data = await getZonas();
        setZonas(data);
      } catch (error) {
        console.error("Error cargando zonas:", error);
      } finally {
        setLoading(false);
      }
    };

    loadZonas();
  }, []);

  const buttons = [
    { label: "Parquímetro", path: "/parquimetro" },
    { label: "Parkings", path: null },
    { label: "Recargas", path: "/wallet" },
    { label: "Guardar ubicación", path: null },
  ];

  return (
    <Box p={3}>
      <Typography variant="h4" mb={2}>
        Mapa de Parkings
      </Typography>

      {/* Botones */}
      <Grid container spacing={2} mb={3}>
        {buttons.map((btn) => (
          <Grid item xs={12} sm={6} md={3} key={btn.label}>
            <Button
              fullWidth
              variant="contained"
              sx={{ p: 2 }}
              onClick={() => {
                if (btn.path) {
                  navigate(btn.path);
                } else {
                  alert("Este botón no tiene funcionalidad actualmente.");
                }
              }}
            >
              {btn.label}
            </Button>
          </Grid>
        ))}
      </Grid>

      {/* Mapa */}
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

          {/* Marcadores de ZONAS (parkings) */}
          {zonas
            .filter((z) => z.lat && z.lng) // seguridad
            .map((z) => (
              <Marker
                key={z.idZona}
                position={[Number(z.lat), Number(z.lng)]}
                icon={parkingIcon}
              >
                <Popup>
                  <Typography fontWeight={600}>{z.nombre}</Typography>

                  <Typography>Tarifa: {z.Tarifa} € / hora</Typography>

                  <Typography>
                    Horario: {z.Horario_inicio} – {z.Horario_fin}
                  </Typography>

                  <Typography>
                    Plazas libres: {z.plazasLibres} / {z.totalPlazas}
                  </Typography>

                  {z.plazasLibres > 0 ? (
                    <Button
                      size="small"
                      sx={{ mt: 1 }}
                      variant="contained"
                      onClick={() => navigate(`/parquimetro?idZona=${z.idZona}`)}
                    >
                      Reservar
                    </Button>
                  ) : (
                    <Typography sx={{ mt: 1 }} color="error">
                      Parking completo
                    </Typography>
                  )}
                </Popup>
              </Marker>
            ))}
        </MapContainer>
      </Paper>

      <AnunciosDinamicos />
    </Box>
  );
}
