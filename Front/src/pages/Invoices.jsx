// src/pages/Invoices.jsx
import { useEffect, useState } from "react";
import {
  Typography,
  Paper,
  Stack,
  Alert,
  CircularProgress,
  Box,
  Button,
} from "@mui/material";
import jsPDF from "jspdf";
import logo from "../assets/logo.png";
import QRCode from "qrcode";

const API_URL = "https://myparking-backend.onrender.com/api";

export default function Invoices() {
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const getBase64ImageFromUrl = async (url) => {
  const data = await fetch(url);
  const blob = await data.blob();

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => resolve(reader.result);
  });
};

const generarQR = async (texto) => {
  return await QRCode.toDataURL(texto);
};
  
 const descargarFactura = async (factura) => {
  const doc = new jsPDF();

  const subtotal = Number(factura.cantidad);
  const iva = subtotal * 0.21;
  const total = subtotal + iva;

  const logoBase64 = await getBase64ImageFromUrl(logo);

const nombreUsuario = `${factura.Nombre} ${factura.Apellido1} ${factura.Apellido2 || ""}`;

const matricula = factura.matricula || "No disponible";

const zona = factura.zona || "No disponible";

const tiempoReserva = factura.tiempoMinutos
  ? `${Math.floor(factura.tiempoMinutos / 60)}h ${factura.tiempoMinutos % 60}min`
  : "No disponible";

  const qrText = `
Factura: ${factura.idMovimiento}
Cliente: ${nombreUsuario}
Matrícula: ${matricula}
Zona: ${zona}
Fecha: ${new Date(factura.fecha).toLocaleString()}
Importe: ${total.toFixed(2)} €
`;

  const qrImage = await generarQR(qrText);

  // LOGO
  doc.addImage(logoBase64, "PNG", 15, 10, 50, 30);
  
  // CABECERA
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("FACTURA", 160, 20);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Factura Nº: ${factura.idMovimiento}`, 145, 30);
  doc.text(
    `Fecha: ${new Date(factura.fecha).toLocaleString()}`,
    145,
    37
  );

  // EMPRESA
  doc.setFont("helvetica", "bold");
  doc.text("MyParking S.L.", 20, 50);

  doc.setFont("helvetica", "normal");
  doc.text("CIF: B12345678", 20, 57);
  doc.text("Gran Vía 25, Madrid", 20, 64);
  doc.text("soporte@myparking.com", 20, 71);

  doc.line(15, 80, 195, 80);

  // CLIENTE
  doc.setFont("helvetica", "bold");
  doc.text("DATOS DEL CLIENTE", 20, 92);

  doc.setFont("helvetica", "normal");
  doc.text(`Nombre: ${nombreUsuario}`, 20, 100);
  doc.text(`Matrícula: ${matricula}`, 20, 108);
  doc.text(`Zona: ${zona}`, 20, 116);
  doc.text(`Tiempo: ${tiempoReserva}`, 20, 124);

  // TABLA
  doc.rect(15, 135, 180, 12);
  doc.text("Servicio", 20, 143);
  doc.text("Precio", 170, 143);

  doc.rect(15, 147, 180, 20);
  doc.text(factura.descripcion, 20, 158);
  doc.text(`${subtotal.toFixed(2)} €`, 170, 158);

  // TOTALES
  doc.text(`Base: ${subtotal.toFixed(2)} €`, 140, 180);
  doc.text(`IVA 21%: ${iva.toFixed(2)} €`, 140, 188);

  doc.setFont("helvetica", "bold");
  doc.text(`TOTAL: ${total.toFixed(2)} €`, 140, 198);

  // QR
  doc.addImage(qrImage, "PNG", 20, 210, 40, 40);

  // FIRMA DIGITAL VISUAL
  doc.setFontSize(10);
  doc.setFont("helvetica", "italic");
  doc.text(
    "Firmado digitalmente por MyParking",
    120,
    245
  );

  doc.line(120, 248, 180, 248);

  // PIE
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(
    "Gracias por confiar en MyParking",
    20,
    275
  );

  doc.save(`factura_${factura.idMovimiento}.pdf`);
};
  useEffect(() => {
    if (!token) {
      setError("Debes iniciar sesión para ver tus facturas.");
      setLoading(false);
      return;
    }



    const fetchFacturas = async () => {
      try {
        const res = await fetch(
          `${API_URL}/me/monedero/movimientos`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          throw new Error("No se pudieron cargar las facturas");
        }

        const data = await res.json();

        // Solo gastos → facturas
        const gastos = (Array.isArray(data) ? data : [])
          .filter((m) => m.tipo === "GASTO")
          .sort(
            (a, b) => new Date(b.fecha) - new Date(a.fecha)
          );

        setFacturas(gastos);
      } catch (err) {
        console.error(err);
        setError("Error al cargar las facturas.");
      } finally {
        setLoading(false);
      }
    };

    fetchFacturas();
  }, [token]);

  return (
    <Box p={3}>
      <Typography variant="h4" mb={2} fontWeight="bold">
        Facturas
      </Typography>

      {loading && (
        <Box display="flex" justifyContent="center" mt={3}>
          <CircularProgress />
        </Box>
      )}

      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && facturas.length === 0 && (
        <Typography color="text.secondary" fontWeight="bold">
          No hay facturas todavía
        </Typography>
      )}

      <Stack spacing={2} mt={2}>
        {facturas.map((f) => (
          <Paper key={f.idMovimiento} sx={{ p: 2 }}>
            <Typography fontWeight={600}>
              {f.descripcion}
            </Typography>

            <Typography variant="body2">
              Fecha:{" "}
              {new Date(f.fecha).toLocaleString()}
            </Typography>

            <Typography
              fontWeight={600}
              color="error.main"
              mt={1}
            >
              -{Number(f.cantidad).toFixed(2)} €
            </Typography>
            <Button
            variant="outlined"
            sx={{ mt: 2 }}
            onClick={() => descargarFactura(f)}
            >
            Descargar PDF
            </Button>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
}