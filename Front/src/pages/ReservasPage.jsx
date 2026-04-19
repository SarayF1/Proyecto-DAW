// src/pages/ReservasPage.jsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import toast from "react-hot-toast";
import { reservasApi } from "../api/client";
import { useAuth } from "../context/AuthContext";
import styles from "./ReservasPage.module.css";

async function downloadReciboReserva(reserva, user) {
  try {
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");
    const doc = new jsPDF({ unit: "mm", format: "a4" });

    // ── Paleta ──
    const TEAL_DARK = [47, 93, 91];
    const TEAL_DARKER = [39, 76, 74];
    const GREEN_LIGHT = [214, 222, 199];
    const SURFACE = [239, 243, 232];
    const GREY = [110, 110, 110];
    const GREY_LIGHT = [170, 170, 170];

    // ── Datos calculados ──
    const inicio = new Date(reserva.Fecha_inicio);
    const fin = new Date(reserva.Fecha_fin);
    const mins = Math.round((fin - inicio) / 60000);
    const horas = mins / 60;

    const tarifa = Number(reserva.tarifa ?? 0);
    const pagado = Number(reserva.pagado ?? tarifa * horas);
    const reembolsado = Number(reserva.reembolsado ?? 0);
    const neto = Math.max(0, pagado - reembolsado);

    // IVA 21% aplicado sobre el neto (IVA general de parking en España)
    const IVA_RATE = 0.21;
    const base = neto / (1 + IVA_RATE);
    const iva = neto - base;

    const facturaNum = `${format(new Date(), "yyyy")}-${String(reserva.idReserva).padStart(5, "0")}`;

    // ── Banda header ──
    doc.setFillColor(...TEAL_DARK);
    doc.rect(0, 0, 210, 40, "F");
    doc.setTextColor(...GREEN_LIGHT);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("MYPARKING", 20, 18);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Gestión inteligente de aparcamientos", 20, 26);
    doc.text("Puerto del Rosario · Fuerteventura", 20, 31);
    doc.text("myparking-frontend.onrender.com", 20, 36);

    // ── Título + nº factura ──
    doc.setTextColor(...TEAL_DARKER);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("FACTURA", 20, 55);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...GREY);
    doc.text(`Nº factura: ${facturaNum}`, 190, 50, { align: "right" });
    doc.text(
      `Fecha de emisión: ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: es })}`,
      190,
      56,
      { align: "right" },
    );

    // ── Línea separadora ──
    doc.setDrawColor(...GREEN_LIGHT);
    doc.setLineWidth(0.5);
    doc.line(20, 62, 190, 62);

    // ── Sección cliente ──
    doc.setTextColor(...TEAL_DARKER);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("CLIENTE", 20, 70);
    autoTable(doc, {
      startY: 73,
      body: [
        [
          "Nombre",
          `${user?.Nombre || ""} ${user?.Apellido1 || ""}`.trim() || "–",
        ],
        ["Email", user?.Email || "–"],
      ],
      theme: "plain",
      styles: {
        fontSize: 10,
        cellPadding: { top: 1.5, right: 3, bottom: 1.5, left: 0 },
      },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 35, textColor: GREY },
      },
    });

    // ── Sección reserva ──
    const yReserva = doc.lastAutoTable.finalY + 6;
    doc.setTextColor(...TEAL_DARKER);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("DETALLE DE LA RESERVA", 20, yReserva);
    autoTable(doc, {
      startY: yReserva + 3,
      body: [
        ["Zona", reserva.zona || "–"],
        ["Localidad", reserva.Localidad || "Puerto del Rosario"],
        ["Plaza", `#${reserva.idPlaza}`],
        ["Fecha inicio", format(inicio, "dd/MM/yyyy HH:mm", { locale: es })],
        ["Fecha fin", format(fin, "dd/MM/yyyy HH:mm", { locale: es })],
        ["Duración", `${mins} min (${horas.toFixed(2)} h)`],
        ["Estado", reserva.Estado || "–"],
      ],
      theme: "plain",
      styles: {
        fontSize: 10,
        cellPadding: { top: 1.5, right: 3, bottom: 1.5, left: 0 },
      },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 35, textColor: GREY },
      },
    });

    // ── Desglose ──
    const yDesglose = doc.lastAutoTable.finalY + 6;
    doc.setTextColor(...TEAL_DARKER);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("DESGLOSE", 20, yDesglose);
    autoTable(doc, {
      startY: yDesglose + 3,
      head: [["Concepto", "Cantidad", "Precio unitario", "Importe"]],
      body: [
        [
          `Aparcamiento ${reserva.zona || ""}`.trim(),
          `${horas.toFixed(2)} h`,
          `${tarifa.toFixed(2)} €/h`,
          `${(tarifa * horas).toFixed(2)} €`,
        ],
      ],
      headStyles: {
        fillColor: TEAL_DARK,
        textColor: GREEN_LIGHT,
        fontStyle: "bold",
        fontSize: 9,
      },
      alternateRowStyles: { fillColor: SURFACE },
      styles: { fontSize: 10, cellPadding: 3 },
      columnStyles: {
        1: { halign: "right", cellWidth: 28 },
        2: { halign: "right", cellWidth: 34 },
        3: { halign: "right", cellWidth: 28 },
      },
    });

    // ── Totales (caja derecha) ──
    let yTot = doc.lastAutoTable.finalY + 4;
    const totX = 115,
      totW = 75;
    const row = (label, value, opts = {}) => {
      doc.setFontSize(opts.big ? 11 : 9);
      doc.setFont("helvetica", opts.bold ? "bold" : "normal");
      doc.setTextColor(...(opts.color || GREY));
      doc.text(label, totX + 3, yTot + 5);
      doc.text(value, totX + totW - 3, yTot + 5, { align: "right" });
      yTot += opts.big ? 8 : 6;
    };
    row("Base imponible", `${base.toFixed(2)} €`);
    row("IVA (21 %)", `${iva.toFixed(2)} €`);
    if (reembolsado > 0) {
      row("Reembolsos aplicados", `- ${reembolsado.toFixed(2)} €`, {
        color: [153, 60, 29],
      });
    }
    // Línea + total grande
    doc.setDrawColor(...TEAL_DARK);
    doc.setLineWidth(0.4);
    doc.line(totX, yTot + 1, totX + totW, yTot + 1);
    yTot += 3;
    doc.setFillColor(...TEAL_DARKER);
    doc.roundedRect(totX, yTot, totW, 12, 2, 2, "F");
    doc.setTextColor(...GREEN_LIGHT);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("TOTAL", totX + 3, yTot + 8);
    doc.setFontSize(13);
    doc.text(`${neto.toFixed(2)} €`, totX + totW - 3, yTot + 8, {
      align: "right",
    });

    // ── Nota sobre estado ──
    if (reserva.Estado === "EN CURSO") {
      doc.setTextColor(...GREY);
      doc.setFontSize(8);
      doc.setFont("helvetica", "italic");
      doc.text(
        "Este documento corresponde a una reserva aún EN CURSO. El importe facturado es el total cobrado en el momento de la reserva.",
        20,
        yTot + 22,
        { maxWidth: 90 },
      );
    }

    // ── Footer ──
    doc.setDrawColor(...GREEN_LIGHT);
    doc.setLineWidth(0.3);
    doc.line(20, 272, 190, 272);
    doc.setTextColor(...GREY_LIGHT);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.text(
      "Este documento es un comprobante generado automáticamente por Myparking.",
      20,
      278,
    );
    doc.text(
      "Tarifa conforme a la zona seleccionada. IVA aplicado al tipo general (21 %).",
      20,
      282,
    );
    doc.text(
      "© 2025 Myparking · Puerto del Rosario · myparking-frontend.onrender.com",
      20,
      286,
    );

    doc.save(`myparking-factura-${facturaNum}.pdf`);
    toast.success("Factura descargada");
  } catch (err) {
    toast.error("Error al generar la factura");
    console.error(err);
  }
}

export default function ReservasPage() {
  const { user } = useAuth();
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    reservasApi
      .getMisReservas()
      .then((data) => setReservas(Array.isArray(data) ? data : []))
      .catch(() => toast.error("Error cargando reservas"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = reservas.filter((r) =>
    filter === "ALL" ? true : r.Estado === filter,
  );

  const enCurso = reservas.filter((r) => r.Estado === "EN CURSO").length;
  const finalizadas = reservas.filter((r) => r.Estado === "FINALIZADA").length;

  if (loading)
    return (
      <div className={styles.loading}>
        <span className={styles.spinner} /> Cargando reservas...
      </div>
    );

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className={styles.pageTitle}>Mis reservas</h1>
          <p className={styles.pageSub}>
            {reservas.length} reserva{reservas.length !== 1 ? "s" : ""} en total
          </p>
        </motion.div>

        <motion.div
          className={styles.statsRow}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.06 }}
        >
          {[
            { label: "Total", value: reservas.length, color: "" },
            { label: "En curso", value: enCurso, color: styles.statCurso },
            {
              label: "Finalizadas",
              value: finalizadas,
              color: styles.statFinal,
            },
          ].map((s) => (
            <div key={s.label} className={`${styles.statCard} ${s.color}`}>
              <div className={styles.statNum}>{s.value}</div>
              <div className={styles.statLbl}>{s.label}</div>
            </div>
          ))}
        </motion.div>

        <div
          className={styles.filters}
          role="group"
          aria-label="Filtros de reservas"
        >
          {["ALL", "EN CURSO", "FINALIZADA"].map((f) => (
            <button
              key={f}
              className={`${styles.filterBtn} ${filter === f ? styles.filterActive : ""}`}
              onClick={() => setFilter(f)}
              aria-pressed={filter === f}
            >
              {f === "ALL"
                ? "Todas"
                : f === "EN CURSO"
                  ? "En curso"
                  : "Finalizadas"}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className={styles.empty} aria-live="polite">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              width="48"
              height="48"
              aria-hidden="true"
            >
              <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
            </svg>
            <p>No hay reservas en esta categoría</p>
          </div>
        ) : (
          <div className={styles.list}>
            {filtered.map((r, i) => {
              const inicio = new Date(r.Fecha_inicio);
              const fin = new Date(r.Fecha_fin);
              const mins = Math.round((fin - inicio) / 60000);
              const horas = Math.floor(mins / 60);
              const minRest = mins % 60;
              const durStr =
                horas > 0 ? `${horas}h ${minRest}m` : `${minRest}m`;
              const isEnCurso = r.Estado === "EN CURSO";
              return (
                <motion.div
                  key={r.idReserva}
                  className={styles.resCard}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <div className={styles.resLeft}>
                    <div
                      className={`${styles.resStatus} ${isEnCurso ? styles.statusCurso : styles.statusFinal}`}
                    >
                      <span
                        className={`${styles.statusDot} ${isEnCurso ? styles.dotCurso : styles.dotFinal}`}
                        aria-hidden="true"
                      />
                      {isEnCurso ? "En curso" : "Finalizada"}
                    </div>
                    <div className={styles.resZona}>{r.zona}</div>
                    <div className={styles.resLoc}>{r.Localidad}</div>
                  </div>

                  <div className={styles.resMid}>
                    <div className={styles.resTimeRow}>
                      <div className={styles.resTimeBlock}>
                        <span className={styles.resTimeLabel}>Inicio</span>
                        <span className={styles.resTimeVal}>
                          {format(inicio, "d MMM · HH:mm", { locale: es })}
                        </span>
                      </div>
                      <div className={styles.resArrow} aria-hidden="true">
                        →
                      </div>
                      <div className={styles.resTimeBlock}>
                        <span className={styles.resTimeLabel}>Fin</span>
                        <span className={styles.resTimeVal}>
                          {format(fin, "d MMM · HH:mm", { locale: es })}
                        </span>
                      </div>
                    </div>
                    <div className={styles.resDur}>
                      {durStr} · Plaza #{r.idPlaza}
                    </div>
                  </div>

                  <div className={styles.resRight}>
                    {isEnCurso && (
                      <div className={styles.countdown}>
                        Finaliza{" "}
                        {formatDistanceToNow(fin, {
                          addSuffix: true,
                          locale: es,
                        })}
                      </div>
                    )}
                    <div className={styles.resId}>#{r.idReserva}</div>
                    <button
                      className={styles.pdfBtn}
                      onClick={() => downloadReciboReserva(r, user)}
                      aria-label={`Descargar factura de reserva #${r.idReserva}`}
                      title="Descargar factura PDF"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        width="13"
                        height="13"
                        aria-hidden="true"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      Factura
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
