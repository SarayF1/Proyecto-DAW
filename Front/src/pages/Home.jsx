// src/pages/Home.jsx
import { Box, Typography, Grid, Button, Paper } from "@mui/material";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import AnunciosDinamicos from "../components/AnunciosDinamicos";
import { useEffect, useState } from "react";
import { getZonas } from "../services/api";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  Snackbar,
} from "@mui/material";

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
  const [loading, setLoading] = useState(true);
  const [openParkingModal, setOpenParkingModal] = useState(false);
  const [ubicacionGuardada, setUbicacionGuardada] = useState(false);

  const handleOpenParkings = async () => {
  try {
    const res = await fetch(
      "https://myparking-backend.onrender.com/api/zonas"
    );

    const data = await res.json();

    setZonas(data);
    setOpenParkingModal(true);
  } catch (error) {
    console.error("Error cargando parkings:", error);
    alert("No se pudieron cargar los parkings");
  }
};

const handleGuardarUbicacion = () => {
  if (!navigator.geolocation) {
    alert("Tu navegador no soporta geolocalización");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const ubicacion = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };

      localStorage.setItem(
        "ubicacionUsuario",
        JSON.stringify(ubicacion)
      );

      setUbicacionGuardada(true);
    },
    (error) => {
      console.error(error);
      alert("No se pudo obtener la ubicación");
    }
  );
};

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
                } else if(btn.label == "Parkings") {
                handleOpenParkings();
                } else if(btn.label == "Guardar ubicación") {
                  handleGuardarUbicacion();
                }else{
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
<Dialog
  open={openParkingModal}
  onClose={() => setOpenParkingModal(false)}
  fullWidth
  maxWidth="sm"
>
  <DialogTitle>Parkings disponibles</DialogTitle>

  <DialogContent>
   <List>
  {zonas.map((zona) => (
    <ListItem
      key={zona.idZona}
      button
      onClick={() => {
        setOpenParkingModal(false);
        navigate(`/parquimetro?idZona=${zona.idZona}`);
      }}
      sx={{
        cursor: "pointer",
        borderRadius: 1,
        "&:hover": {
          color: "#ffff",
          backgroundColor: "#2a2cbe",
        },
      }}
    >
      <ListItemText
        primary={zona.nombre}
        secondary={`Localidad: ${zona.Localidad} | Tarifa: ${zona.Tarifa} €/h`}
      />
    </ListItem>
  ))}
</List>
  </DialogContent>
</Dialog>
      <Snackbar
        open={ubicacionGuardada}
        autoHideDuration={3000}
        onClose={() => setUbicacionGuardada(false)}
        message="Ubicación guardada correctamente"
      />
      <AnunciosDinamicos />
    </Box>
  );
}
