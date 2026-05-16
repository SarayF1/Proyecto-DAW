// src/pages/AdminPage.jsx
//
// Backend endpoints used (all live):
//   Dashboard
//     GET    /admin/estadisticas
//     GET    /admin/reservas-activas
//     GET    /admin/reservas-por-zona
//     GET    /admin/ingresos-diarios
//   Usuarios
//     GET    /admin/usuarios
//     PUT    /admin/usuarios/:id
//     DELETE /admin/usuarios/:id
//   Plazas
//     GET    /admin/plazas
//     PUT    /admin/plazas/:id
//   Reservas
//     GET    /admin/reservas
//     PUT    /admin/reservas/:id/finalizar
//     POST   /admin/reservas/:id/reembolsar
//     DELETE /admin/reservas/:id
//
import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import toast from "react-hot-toast";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { adminApi } from "../api/client";
import styles from "./AdminPage.module.css";

const TABS = ["Dashboard", "Usuarios", "Plazas", "Reservas"];

const normalise = (r) => ({
  idReserva: r.idReserva,
  Estado: r.Estado,
  Fecha_inicio: r.Fecha_inicio,
  Fecha_fin: r.Fecha_fin,
  idPlaza: r.idPlaza,
  Nombre: r.usuario_nombre ?? r.Nombre ?? "–",
  Apellido1: r.usuario_apellido1 ?? r.Apellido1 ?? "",
  Email: r.usuario_email ?? "",
  Zona: r.zona_nombre ?? r.Zona ?? "–",
  Localidad: r.zona_localidad ?? "",
  Tarifa: r.zona_tarifa,
  pagado: Number(r.pagado ?? 0),
  reembolsado: Number(r.reembolsado ?? 0),
});

// ── Helpers ────────────────────────────────────────────────────────────────
function buildDailyData(raw) {
  // Parseamos cada entrada como Date y comparamos día/mes/año en LOCAL.
  // Evita el bug de .toISOString().slice(0,10) cuando server y cliente
  // están en zonas horarias distintas (o cuando mysql2 serializa DATE
  // a medianoche local del servidor).
  const entries = (raw || []).map(r => ({
    date: new Date(r.fecha),
    total: Number(r.total),
  }))
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const hit = entries.find(e =>
      e.date.getFullYear() === d.getFullYear() &&
      e.date.getMonth()    === d.getMonth() &&
      e.date.getDate()     === d.getDate()
    )
    days.push({
      fecha: format(d, 'yyyy-MM-dd'),
      label: format(d, 'EEE dd', { locale: es }),
      total: hit ? hit.total : 0,
    })
  }
  return days
}

// Reembolso proporcional al tiempo NO usado, dado un momento real de salida.
function calcProportionalRefund(r, salidaReal) {
  if (!r.Fecha_inicio || !r.Fecha_fin) return 0;
  const inicio = new Date(r.Fecha_inicio).getTime();
  const fin = new Date(r.Fecha_fin).getTime();
  const eff = new Date(salidaReal).getTime();
  if (!isFinite(inicio) || !isFinite(fin) || !isFinite(eff)) return 0;
  if (fin <= inicio) return 0;
  // Si el admin introduce salida antes de inicio → clampa a inicio (no usó nada).
  // Si la introduce después de fin → clampa a fin (usó todo, 0 reembolso).
  const clampedEff = Math.max(inicio, Math.min(fin, eff));
  const total = fin - inicio;
  const notUsed = fin - clampedEff;
  return r.pagado * (notUsed / total);
}

// Valor inicial del datetime-local input: ahora, acotado al rango de la reserva.
function defaultSalidaInput(fechaInicio, fechaFin) {
  const now = Date.now();
  const inicio = new Date(fechaInicio).getTime();
  const fin = new Date(fechaFin).getTime();
  const t = Math.max(inicio, Math.min(fin, now));
  const d = new Date(t);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Convierte un string ISO (UTC, viene del backend) al formato LOCAL que
// exige <input type="datetime-local">. Sin esto, el navegador muestra la
// hora UTC como si fuera local y falla el min/max.
function isoToLocalInput(val) {
  const d = val instanceof Date ? val : val ? new Date(val) : null;
  if (!d || !isFinite(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function computeTrend(days) {
  if (!days || days.length < 2) return null;
  const today = days[days.length - 1].total;
  const yesterday = days[days.length - 2].total;
  if (today === 0 && yesterday === 0) return null;
  if (yesterday === 0) return { dir: "up", pct: null };
  const pct = ((today - yesterday) / yesterday) * 100;
  return { dir: pct >= 0 ? "up" : "down", pct: Math.abs(pct) };
}

// ═══════════════════════════════════════════════════════════════════════════
export default function AdminPage() {
  const [tab, setTab] = useState("Dashboard");
  const [stats, setStats] = useState(null);
  const [reservasActivas, setReservasActivas] = useState([]);
  const [reservasPorZona, setReservasPorZona] = useState([]);
  const [ingresosDiarios, setIngresosDiarios] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [usuariosErr, setUsuariosErr] = useState(null);
  const [plazas, setPlazas] = useState([]);
  const [plazasErr, setPlazasErr] = useState(null);
  const [todasReservas, setTodasReservas] = useState([]);
  const [dashLoading, setDashLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [editUsuario, setEditUsuario] = useState(null);
  const [editPlaza, setEditPlaza] = useState(null);
  const [reembolso, setReembolso] = useState(null); // reserva elegida para reembolsar
  const [finalising, setFinalising] = useState(null);

  // Filtros (Block D)
  const [usuariosSearch, setUsuariosSearch] = useState("");
  const [usuariosRol, setUsuariosRol] = useState("TODOS");
  const [plazasSearch, setPlazasSearch] = useState("");
  const [plazasEstado, setPlazasEstado] = useState("TODOS");
  const [reservasSearch, setReservasSearch] = useState("");
  const [reservasEstado, setReservasEstado] = useState("TODOS");

  // ── Loaders ──────────────────────────────────────────────────────────────
  const loadDashboard = useCallback(async () => {
    setDashLoading(true);
    const [s, ra, rpz, ind] = await Promise.allSettled([
      adminApi.getEstadisticas(),
      adminApi.getReservasActivas(),
      adminApi.getReservasPorZona(),
      adminApi.getIngresosDiarios(),
    ]);
    if (s.status === "fulfilled") setStats(s.value);
    if (ra.status === "fulfilled")
      setReservasActivas(
        (Array.isArray(ra.value) ? ra.value : []).map(normalise),
      );
    if (rpz.status === "fulfilled")
      setReservasPorZona(Array.isArray(rpz.value) ? rpz.value : []);
    if (ind.status === "fulfilled")
      setIngresosDiarios(Array.isArray(ind.value) ? ind.value : []);
    setDashLoading(false);
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const loadUsuarios = useCallback(async () => {
    setTabLoading(true);
    setUsuariosErr(null);
    try {
      const d = await adminApi.getUsuarios();
      setUsuarios(Array.isArray(d) ? d : []);
    } catch (err) {
      setUsuariosErr(err.message || "Error al cargar usuarios");
    } finally {
      setTabLoading(false);
    }
  }, []);

  const loadPlazas = useCallback(async () => {
    setTabLoading(true);
    setPlazasErr(null);
    try {
      const d = await adminApi.getPlazasAdmin();
      setPlazas(Array.isArray(d) ? d : []);
    } catch (err) {
      setPlazasErr(err.message);
    } finally {
      setTabLoading(false);
    }
  }, []);

  const loadReservas = useCallback(async () => {
    setTabLoading(true);
    try {
      const d = await adminApi.getAllReservas();
      setTodasReservas((Array.isArray(d) ? d : []).map(normalise));
    } catch {
      toast.error("Error cargando reservas");
    } finally {
      setTabLoading(false);
    }
  }, []);

  const handleTabChange = (t) => {
    setTab(t);
    if (t === "Usuarios" && !usuarios.length && !usuariosErr) loadUsuarios();
    if (t === "Plazas" && !plazas.length && !plazasErr) loadPlazas();
    if (t === "Reservas" && !todasReservas.length) loadReservas();
  };

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleFinalizar = async (id) => {
    setFinalising(id);
    try {
      await adminApi.finalizarReserva(id);
      toast.success("Reserva finalizada");
      loadDashboard();
      if (tab === "Reservas") loadReservas();
    } catch (err) {
      toast.error(err.message || "Error");
    } finally {
      setFinalising(null);
    }
  };

  const handleDeleteUsuario = async (id) => {
    if (!confirm("¿Eliminar este usuario?")) return;
    try {
      await adminApi.deleteUsuario(id);
      toast.success("Usuario eliminado");
      setUsuarios((u) => u.filter((x) => x.idUsuario !== id));
    } catch (err) {
      toast.error(err.message || "Error al eliminar");
    }
  };

  const handleDeleteReserva = async (id) => {
    if (!confirm(`¿Eliminar reserva #${id}? Esta acción no se puede deshacer.`))
      return;
    try {
      await adminApi.deleteReserva(id);
      toast.success("Reserva eliminada");
      loadReservas();
      loadDashboard();
    } catch (err) {
      toast.error(err.message || "Error al eliminar");
    }
  };

  const handleSaveUsuario = async (e) => {
    e.preventDefault();
    try {
      await adminApi.updateUsuario(editUsuario.idUsuario, editUsuario);
      toast.success("Usuario actualizado");
      setEditUsuario(null);
      loadUsuarios();
    } catch (err) {
      toast.error(err.message || "Error al guardar");
    }
  };

  const handleSavePlaza = async (e) => {
    e.preventDefault();
    try {
      await adminApi.updatePlaza(editPlaza.idPlaza, {
        Estado_Plaza: editPlaza.Estado_Plaza,
      });
      toast.success("Plaza actualizada");
      setEditPlaza(null);
      loadPlazas();
      loadDashboard();
    } catch (err) {
      toast.error(err.message || "Error al guardar");
    }
  };

  const handleReembolso = async (e) => {
    e.preventDefault();
    const cantidad = Number(reembolso.cantidad);
    if (!cantidad || cantidad <= 0) {
      toast.error("Cantidad inválida");
      return;
    }
    if (!reembolso.motivo?.trim()) {
      toast.error("El motivo es obligatorio");
      return;
    }
    try {
      await adminApi.reembolsarReserva(reembolso.idReserva, {
        cantidad,
        motivo: reembolso.motivo.trim(),
      });
      toast.success(`Reembolso de ${cantidad.toFixed(2)} € realizado`);
      setReembolso(null);
      loadReservas();
      loadDashboard();
    } catch (err) {
      toast.error(err.message || "Error en el reembolso");
    }
  };

  // ── Datos derivados ──────────────────────────────────────────────────────
  const dailyData = useMemo(
    () => buildDailyData(ingresosDiarios),
    [ingresosDiarios],
  );
  const trend = useMemo(() => computeTrend(dailyData), [dailyData]);

  const filteredUsuarios = useMemo(() => {
    const q = usuariosSearch.trim().toLowerCase();
    return usuarios.filter((u) => {
      if (usuariosRol !== "TODOS" && u.Rol !== usuariosRol) return false;
      if (!q) return true;
      return (
        String(u.Nombre || "")
          .toLowerCase()
          .includes(q) ||
        String(u.Apellido1 || "")
          .toLowerCase()
          .includes(q) ||
        String(u.Email || "")
          .toLowerCase()
          .includes(q)
      );
    });
  }, [usuarios, usuariosSearch, usuariosRol]);

  const filteredPlazas = useMemo(() => {
    const q = plazasSearch.trim().toLowerCase();
    return plazas.filter((p) => {
      if (plazasEstado !== "TODOS" && p.Estado_Plaza !== plazasEstado)
        return false;
      if (!q) return true;
      return (
        String(p.zona || "")
          .toLowerCase()
          .includes(q) ||
        String(p.Localidad || "")
          .toLowerCase()
          .includes(q) ||
        String(p.idPlaza || "").includes(q)
      );
    });
  }, [plazas, plazasSearch, plazasEstado]);

  const filteredReservas = useMemo(() => {
    const q = reservasSearch.trim().toLowerCase();
    return todasReservas.filter((r) => {
      if (reservasEstado !== "TODOS" && r.Estado !== reservasEstado)
        return false;
      if (!q) return true;
      return (
        String(r.Nombre || "")
          .toLowerCase()
          .includes(q) ||
        String(r.Apellido1 || "")
          .toLowerCase()
          .includes(q) ||
        String(r.Email || "")
          .toLowerCase()
          .includes(q) ||
        String(r.Zona || "")
          .toLowerCase()
          .includes(q) ||
        String(r.idReserva || "").includes(q)
      );
    });
  }, [todasReservas, reservasSearch, reservasEstado]);

  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className={styles.pageTitle}>Panel de administración</h1>
          <p className={styles.pageSub}>Gestión del sistema Myparking</p>
        </motion.div>

        <div className={styles.tabs} role="tablist">
          {TABS.map((t) => (
            <button
              key={t}
              className={`${styles.tab} ${tab === t ? styles.tabActive : ""}`}
              onClick={() => handleTabChange(t)}
              role="tab"
              aria-selected={tab === t}
            >
              {t}
            </button>
          ))}
        </div>

        {/* ═══ DASHBOARD ═══ */}
        {tab === "Dashboard" && (
          <div role="tabpanel">
            {dashLoading ? (
              <div className={styles.loading}>
                <span className={styles.spinner} />
                Cargando…
              </div>
            ) : (
              <>
                {stats && (
                  <div className={styles.statsGrid}>
                    {[
                      {
                        label: "Reservas activas",
                        v: stats.reservas_activas,
                        cls: styles.statGreen,
                      },
                      {
                        label: "Plazas libres",
                        v: stats.plazas_libres,
                        cls: styles.statBlue,
                      },
                      {
                        label: "Plazas ocupadas",
                        v: stats.plazas_ocupadas,
                        cls: styles.statOrange,
                      },
                      { label: "Clientes", v: stats.total_clientes, cls: "" },
                      {
                        label: "Ingresos hoy",
                        v: `${Number(stats.ingresos_hoy ?? 0).toFixed(2)} €`,
                        cls: styles.statGreen,
                        trend,
                      },
                      {
                        label: "Reservas caducadas",
                        v: stats.reservas_caducadas,
                        cls: styles.statRed,
                      },
                    ].map((s) => (
                      <motion.div
                        key={s.label}
                        className={`${styles.statCard} ${s.cls}`}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <div className={styles.statVal}>{s.v ?? "–"}</div>
                        <div className={styles.statLbl}>{s.label}</div>
                        {s.trend && <TrendBadge trend={s.trend} />}
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Gráficas */}
                <div className={styles.chartsGrid}>
                  <div className={styles.chartCard}>
                    <div className={styles.chartHead}>
                      <h3 className={styles.chartTitle}>
                        Ingresos últimos 7 días
                      </h3>
                      <span className={styles.chartSub}>
                        Neto (pagos − reembolsos)
                      </span>
                    </div>
                    <div className={styles.chartBody}>
                      <ResponsiveContainer width="100%" height={220}>
                        <LineChart
                          data={dailyData}
                          margin={{ top: 8, right: 12, bottom: 0, left: -8 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="rgba(47,93,91,0.12)"
                          />
                          <XAxis
                            dataKey="label"
                            tick={{ fontSize: 11, fill: "#2F5D5B" }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis
                            tick={{ fontSize: 11, fill: "#2F5D5B" }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(v) => `${v}€`}
                          />
                          <Tooltip
                            contentStyle={{
                              border: "1px solid rgba(47,93,91,0.2)",
                              borderRadius: 8,
                              fontSize: 12,
                            }}
                            formatter={(v) => [
                              `${Number(v).toFixed(2)} €`,
                              "Ingresos",
                            ]}
                          />
                          <Line
                            type="monotone"
                            dataKey="total"
                            stroke="#0F6E56"
                            strokeWidth={2.5}
                            dot={{ r: 3, fill: "#0F6E56" }}
                            activeDot={{ r: 5 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className={styles.chartCard}>
                    <div className={styles.chartHead}>
                      <h3 className={styles.chartTitle}>Reservas por zona</h3>
                      <span className={styles.chartSub}>EN CURSO</span>
                    </div>
                    <div className={styles.chartBody}>
                      {reservasPorZona.length === 0 ? (
                        <div className={styles.chartEmpty}>Sin datos</div>
                      ) : (
                        <ResponsiveContainer width="100%" height={220}>
                          <BarChart
                            data={reservasPorZona}
                            layout="vertical"
                            margin={{ top: 8, right: 16, bottom: 0, left: 8 }}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="rgba(47,93,91,0.12)"
                              horizontal={false}
                            />
                            <XAxis
                              type="number"
                              tick={{ fontSize: 11, fill: "#2F5D5B" }}
                              axisLine={false}
                              tickLine={false}
                              allowDecimals={false}
                            />
                            <YAxis
                              type="category"
                              dataKey="zona_nombre"
                              width={130}
                              tick={{ fontSize: 11, fill: "#2F5D5B" }}
                              axisLine={false}
                              tickLine={false}
                            />
                            <Tooltip
                              contentStyle={{
                                border: "1px solid rgba(47,93,91,0.2)",
                                borderRadius: 8,
                                fontSize: 12,
                              }}
                              formatter={(v) => [v, "Reservas"]}
                            />
                            <Bar
                              dataKey="reservas_activas"
                              fill="#2F5D5B"
                              radius={[0, 4, 4, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>
                </div>

                <div className={styles.sectionHead}>
                  <h2 className={styles.sectionTitle}>Reservas en curso</h2>
                  <button className={styles.refreshBtn} onClick={loadDashboard}>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      width="13"
                      height="13"
                    >
                      <path d="M1 4v6h6" />
                      <path d="M23 20v-6h-6" />
                      <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15" />
                    </svg>
                    Actualizar
                  </button>
                </div>

                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Usuario</th>
                        <th>Zona</th>
                        <th>Plaza</th>
                        <th>Inicio</th>
                        <th>Fin</th>
                        <th>Estado</th>
                        <th>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reservasActivas.length === 0 ? (
                        <tr>
                          <td colSpan={8} className={styles.emptyCell}>
                            No hay reservas activas
                          </td>
                        </tr>
                      ) : (
                        reservasActivas.map((r) => (
                          <tr key={r.idReserva}>
                            <td>#{r.idReserva}</td>
                            <td>
                              {r.Nombre} {r.Apellido1}
                            </td>
                            <td>{r.Zona}</td>
                            <td>#{r.idPlaza}</td>
                            <td className={styles.dateCell}>
                              {r.Fecha_inicio
                                ? format(
                                    new Date(r.Fecha_inicio),
                                    "dd/MM HH:mm",
                                    { locale: es },
                                  )
                                : "–"}
                            </td>
                            <td className={styles.dateCell}>
                              {r.Fecha_fin
                                ? format(new Date(r.Fecha_fin), "dd/MM HH:mm", {
                                    locale: es,
                                  })
                                : "–"}
                            </td>
                            <td>
                              <span
                                className={`${styles.badge} ${styles.badgeGreen}`}
                              >
                                {r.Estado}
                              </span>
                            </td>
                            <td>
                              <button
                                className={styles.actionBtn}
                                onClick={() => handleFinalizar(r.idReserva)}
                                disabled={finalising === r.idReserva}
                              >
                                {finalising === r.idReserva ? (
                                  <span className={styles.spinnerSm} />
                                ) : (
                                  "Finalizar"
                                )}
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {reservasPorZona.length > 0 && (
                  <>
                    <h2
                      className={styles.sectionTitle}
                      style={{ marginTop: "2rem" }}
                    >
                      Ocupación por zona
                    </h2>
                    <div className={styles.zonasGrid}>
                      {reservasPorZona.map((z) => (
                        <div key={z.idZona} className={styles.zonaCard}>
                          <div className={styles.zonaCardName}>
                            {z.zona_nombre}
                          </div>
                          <div className={styles.zonaCardLoc}>
                            {z.Localidad}
                          </div>
                          <div className={styles.zonaCardStats}>
                            <span>{z.total_reservas ?? 0} reservas</span>
                            <span>{z.reservas_activas ?? 0} activas</span>
                            <span>{z.usuarios_unicos ?? 0} usuarios</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        )}

        {/* ═══ USUARIOS ═══ */}
        {tab === "Usuarios" && (
          <div role="tabpanel">
            {tabLoading ? (
              <div className={styles.loading}>
                <span className={styles.spinner} />
                Cargando usuarios…
              </div>
            ) : usuariosErr ? (
              <NotDeployed
                route="/api/admin/usuarios"
                error={usuariosErr}
                onRetry={loadUsuarios}
              />
            ) : (
              <>
                <div className={styles.filterBar}>
                  <input
                    className={styles.filterInput}
                    type="search"
                    placeholder="Buscar por nombre o email…"
                    value={usuariosSearch}
                    onChange={(e) => setUsuariosSearch(e.target.value)}
                  />
                  <select
                    className={styles.filterSelect}
                    value={usuariosRol}
                    onChange={(e) => setUsuariosRol(e.target.value)}
                  >
                    <option value="TODOS">Todos los roles</option>
                    <option value="CLIENTE">CLIENTE</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                  <span className={styles.filterCount}>
                    {filteredUsuarios.length} / {usuarios.length}
                  </span>
                </div>
                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Email</th>
                        <th>Rol</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsuarios.length === 0 ? (
                        <tr>
                          <td colSpan={5} className={styles.emptyCell}>
                            Sin usuarios
                          </td>
                        </tr>
                      ) : (
                        filteredUsuarios.map((u) => (
                          <tr key={u.idUsuario}>
                            <td>#{u.idUsuario}</td>
                            <td>
                              {u.Nombre} {u.Apellido1}
                            </td>
                            <td className={styles.emailCell}>{u.Email}</td>
                            <td>
                              <span
                                className={`${styles.badge} ${u.Rol === "ADMIN" ? styles.badgeOrange : styles.badgeBlue}`}
                              >
                                {u.Rol}
                              </span>
                            </td>
                            <td className={styles.actionCell}>
                              <button
                                className={styles.editBtn}
                                onClick={() => setEditUsuario({ ...u })}
                              >
                                Editar
                              </button>
                              <button
                                className={styles.deleteBtn}
                                onClick={() => handleDeleteUsuario(u.idUsuario)}
                                disabled={u.Rol === "ADMIN"}
                              >
                                Eliminar
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* ═══ PLAZAS ═══ */}
        {tab === "Plazas" && (
          <div role="tabpanel">
            {tabLoading ? (
              <div className={styles.loading}>
                <span className={styles.spinner} />
                Cargando plazas…
              </div>
            ) : plazasErr ? (
              <NotDeployed
                route="/api/admin/plazas"
                error={plazasErr}
                onRetry={loadPlazas}
              />
            ) : (
              <>
                <div className={styles.filterBar}>
                  <input
                    className={styles.filterInput}
                    type="search"
                    placeholder="Buscar por zona, localidad o ID…"
                    value={plazasSearch}
                    onChange={(e) => setPlazasSearch(e.target.value)}
                  />
                  <select
                    className={styles.filterSelect}
                    value={plazasEstado}
                    onChange={(e) => setPlazasEstado(e.target.value)}
                  >
                    <option value="TODOS">Todos los estados</option>
                    <option value="LIBRE">LIBRE</option>
                    <option value="EN USO">EN USO</option>
                  </select>
                  <span className={styles.filterCount}>
                    {filteredPlazas.length} / {plazas.length}
                  </span>
                </div>
                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Zona</th>
                        <th>Localidad</th>
                        <th>Tarifa</th>
                        <th>Estado</th>
                        <th>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPlazas.length === 0 ? (
                        <tr>
                          <td colSpan={6} className={styles.emptyCell}>
                            Sin plazas
                          </td>
                        </tr>
                      ) : (
                        filteredPlazas.map((p) => (
                          <tr key={p.idPlaza}>
                            <td>#{p.idPlaza}</td>
                            <td>{p.zona ?? "–"}</td>
                            <td>{p.Localidad ?? "–"}</td>
                            <td>
                              {p.Tarifa
                                ? `${Number(p.Tarifa).toFixed(2)} €/h`
                                : "–"}
                            </td>
                            <td>
                              <span
                                className={`${styles.badge} ${p.Estado_Plaza === "LIBRE" ? styles.badgeGreen : styles.badgeRed}`}
                              >
                                {p.Estado_Plaza}
                              </span>
                            </td>
                            <td>
                              <button
                                className={styles.editBtn}
                                onClick={() => setEditPlaza({ ...p })}
                              >
                                Cambiar
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* ═══ RESERVAS ═══ */}
        {tab === "Reservas" && (
          <div role="tabpanel">
            {tabLoading ? (
              <div className={styles.loading}>
                <span className={styles.spinner} />
                Cargando…
              </div>
            ) : (
              <>
                <div className={styles.filterBar}>
                  <input
                    className={styles.filterInput}
                    type="search"
                    placeholder="Buscar por usuario, email, zona o ID…"
                    value={reservasSearch}
                    onChange={(e) => setReservasSearch(e.target.value)}
                  />
                  <select
                    className={styles.filterSelect}
                    value={reservasEstado}
                    onChange={(e) => setReservasEstado(e.target.value)}
                  >
                    <option value="TODOS">Todos los estados</option>
                    <option value="EN CURSO">EN CURSO</option>
                    <option value="FINALIZADA">FINALIZADA</option>
                  </select>
                  <span className={styles.filterCount}>
                    {filteredReservas.length} / {todasReservas.length}
                  </span>
                </div>
                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Usuario</th>
                        <th>Zona</th>
                        <th>Plaza</th>
                        <th>Inicio</th>
                        <th>Fin</th>
                        <th>Pagado</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredReservas.length === 0 ? (
                        <tr>
                          <td colSpan={9} className={styles.emptyCell}>
                            Sin reservas
                          </td>
                        </tr>
                      ) : (
                        filteredReservas.map((r) => {
                          const maxRemb = Math.max(0, r.pagado - r.reembolsado);
                          const refundedFull = r.pagado > 0 && maxRemb === 0;
                          return (
                            <tr key={r.idReserva}>
                              <td>#{r.idReserva}</td>
                              <td title={r.Email}>
                                {r.Nombre} {r.Apellido1}
                              </td>
                              <td>{r.Zona}</td>
                              <td>#{r.idPlaza}</td>
                              <td className={styles.dateCell}>
                                {r.Fecha_inicio
                                  ? format(
                                      new Date(r.Fecha_inicio),
                                      "dd/MM HH:mm",
                                      { locale: es },
                                    )
                                  : "–"}
                              </td>
                              <td className={styles.dateCell}>
                                {r.Fecha_fin
                                  ? format(
                                      new Date(r.Fecha_fin),
                                      "dd/MM HH:mm",
                                      { locale: es },
                                    )
                                  : "–"}
                              </td>
                              <td className={styles.moneyCell}>
                                {r.pagado > 0 ? (
                                  <>
                                    {r.pagado.toFixed(2)} €
                                    {r.reembolsado > 0 && (
                                      <span className={styles.refundHint}>
                                        −{r.reembolsado.toFixed(2)} €
                                      </span>
                                    )}
                                  </>
                                ) : (
                                  <span className={styles.muted}>–</span>
                                )}
                              </td>
                              <td>
                                <span
                                  className={`${styles.badge} ${r.Estado === "EN CURSO" ? styles.badgeGreen : styles.badgeBlue}`}
                                >
                                  {r.Estado}
                                </span>
                                {refundedFull && (
                                  <span
                                    className={`${styles.badge} ${styles.badgeOrange}`}
                                    style={{ marginLeft: 4 }}
                                  >
                                    Reembolsada
                                  </span>
                                )}
                              </td>
                              <td className={styles.actionCell}>
                                {r.Estado === "EN CURSO" && (
                                  <button
                                    className={styles.actionBtn}
                                    onClick={() => handleFinalizar(r.idReserva)}
                                    disabled={finalising === r.idReserva}
                                  >
                                    {finalising === r.idReserva ? (
                                      <span className={styles.spinnerSm} />
                                    ) : (
                                      "Finalizar"
                                    )}
                                  </button>
                                )}
                                <button
                                  className={styles.refundBtn}
                                  disabled={maxRemb <= 0}
                                  title={
                                    maxRemb <= 0
                                      ? "Nada reembolsable"
                                      : `Máx. ${maxRemb.toFixed(2)} €`
                                  }
                                  onClick={() =>
                                    setReembolso({
                                      idReserva: r.idReserva,
                                      usuario: `${r.Nombre} ${r.Apellido1}`,
                                      zona: r.Zona,
                                      pagado: r.pagado,
                                      reembolsado: r.reembolsado,
                                      maxReembolsable: maxRemb,
                                      cantidad: maxRemb.toFixed(2),
                                      motivo: "",
                                      Fecha_inicio: r.Fecha_inicio,
                                      Fecha_fin: r.Fecha_fin,
                                      salidaReal: defaultSalidaInput(
                                        r.Fecha_inicio,
                                        r.Fecha_fin,
                                      ),
                                    })
                                  }
                                >
                                  Reembolsar
                                </button>
                                <button
                                  className={styles.deleteBtn}
                                  onClick={() =>
                                    handleDeleteReserva(r.idReserva)
                                  }
                                >
                                  Eliminar
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* ═══ MODALES ═══ */}

      {/* Editar usuario */}
      <AnimatePresence>
        {editUsuario && (
          <motion.div
            className={styles.modalOverlay}
            onClick={(e) =>
              e.target === e.currentTarget && setEditUsuario(null)
            }
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={styles.modal}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <button
                className={styles.modalClose}
                onClick={() => setEditUsuario(null)}
              >
                ✕
              </button>
              <h3 className={styles.modalTitle}>
                Editar usuario #{editUsuario.idUsuario}
              </h3>
              <form onSubmit={handleSaveUsuario} className={styles.editForm}>
                <div className={styles.editRow}>
                  <div className={styles.editField}>
                    <label className={styles.editLabel}>Nombre</label>
                    <input
                      className={styles.editInput}
                      value={editUsuario.Nombre || ""}
                      onChange={(e) =>
                        setEditUsuario((p) => ({
                          ...p,
                          Nombre: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className={styles.editField}>
                    <label className={styles.editLabel}>Apellido</label>
                    <input
                      className={styles.editInput}
                      value={editUsuario.Apellido1 || ""}
                      onChange={(e) =>
                        setEditUsuario((p) => ({
                          ...p,
                          Apellido1: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <div className={styles.editField}>
                  <label className={styles.editLabel}>Email</label>
                  <input
                    className={styles.editInput}
                    type="email"
                    value={editUsuario.Email || ""}
                    onChange={(e) =>
                      setEditUsuario((p) => ({ ...p, Email: e.target.value }))
                    }
                  />
                </div>
                <div className={styles.editField}>
                  <label className={styles.editLabel}>Rol</label>
                  <select
                    className={styles.editInput}
                    value={editUsuario.Rol || "CLIENTE"}
                    onChange={(e) =>
                      setEditUsuario((p) => ({ ...p, Rol: e.target.value }))
                    }
                  >
                    <option value="CLIENTE">CLIENTE</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
                <div className={styles.editActions}>
                  <button
                    type="button"
                    className={styles.cancelBtn}
                    onClick={() => setEditUsuario(null)}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className={styles.saveBtn}>
                    Guardar
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editar plaza */}
      <AnimatePresence>
        {editPlaza && (
          <motion.div
            className={styles.modalOverlay}
            onClick={(e) => e.target === e.currentTarget && setEditPlaza(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={styles.modal}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <button
                className={styles.modalClose}
                onClick={() => setEditPlaza(null)}
              >
                ✕
              </button>
              <h3 className={styles.modalTitle}>Plaza #{editPlaza.idPlaza}</h3>
              <form onSubmit={handleSavePlaza} className={styles.editForm}>
                <div className={styles.editField}>
                  <label className={styles.editLabel}>Estado</label>
                  <select
                    className={styles.editInput}
                    value={editPlaza.Estado_Plaza}
                    onChange={(e) =>
                      setEditPlaza((p) => ({
                        ...p,
                        Estado_Plaza: e.target.value,
                      }))
                    }
                  >
                    <option value="LIBRE">LIBRE</option>
                    <option value="EN USO">EN USO</option>
                  </select>
                </div>
                <div className={styles.editActions}>
                  <button
                    type="button"
                    className={styles.cancelBtn}
                    onClick={() => setEditPlaza(null)}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className={styles.saveBtn}>
                    Guardar
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reembolso */}
      <AnimatePresence>
        {reembolso && (
          <motion.div
            className={styles.modalOverlay}
            onClick={(e) => e.target === e.currentTarget && setReembolso(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={styles.modal}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <button
                className={styles.modalClose}
                onClick={() => setReembolso(null)}
              >
                ✕
              </button>
              <h3 className={styles.modalTitle}>
                Reembolsar reserva #{reembolso.idReserva}
              </h3>

              <div className={styles.refundInfo}>
                <div>
                  <span>Cliente</span>
                  <strong>{reembolso.usuario}</strong>
                </div>
                <div>
                  <span>Zona</span>
                  <strong>{reembolso.zona}</strong>
                </div>
                <div>
                  <span>Pagado</span>
                  <strong>{reembolso.pagado.toFixed(2)} €</strong>
                </div>
                <div>
                  <span>Ya reembolsado</span>
                  <strong>{reembolso.reembolsado.toFixed(2)} €</strong>
                </div>
                <div className={styles.refundInfoHighlight}>
                  <span>Máximo reembolsable</span>
                  <strong>{reembolso.maxReembolsable.toFixed(2)} €</strong>
                </div>
              </div>

              <form onSubmit={handleReembolso} className={styles.editForm}>
                <div className={styles.editField}>
                  <label className={styles.editLabel}>
                    Hora real de salida del parking
                  </label>
                  <input
                    className={styles.editInput}
                    type="datetime-local"
                    min={isoToLocalInput(reembolso.Fecha_inicio)}
                    max={isoToLocalInput(reembolso.Fecha_fin)}
                    value={reembolso.salidaReal}
                    onChange={(e) => {
                      const salidaReal = e.target.value;
                      const calc = Math.min(
                        calcProportionalRefund(reembolso, salidaReal),
                        reembolso.maxReembolsable,
                      );
                      setReembolso((p) => ({
                        ...p,
                        salidaReal,
                        cantidad: calc.toFixed(2),
                      }));
                    }}
                    required
                    autoFocus
                  />
                </div>

                <div className={styles.editField}>
                  <label className={styles.editLabel}>
                    Cantidad a reembolsar (€)
                  </label>
                  <input
                    className={styles.editInput}
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={reembolso.maxReembolsable}
                    value={reembolso.cantidad}
                    onChange={(e) =>
                      setReembolso((p) => ({ ...p, cantidad: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className={styles.editField}>
                  <label className={styles.editLabel}>
                    Motivo (obligatorio)
                  </label>
                  <textarea
                    className={styles.editInput}
                    rows={3}
                    placeholder="Ej: Error del sistema de reservas, incidencia con la plaza, etc."
                    value={reembolso.motivo}
                    onChange={(e) =>
                      setReembolso((p) => ({ ...p, motivo: e.target.value }))
                    }
                    required
                  />
                </div>
                <p className={styles.refundNote}>
                  Se añadirá el importe al monedero del cliente como movimiento
                  &laquo;INGRESO&raquo; con la descripción del motivo.
                </p>
                <div className={styles.editActions}>
                  <button
                    type="button"
                    className={styles.cancelBtn}
                    onClick={() => setReembolso(null)}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className={styles.saveBtn}>
                    Confirmar reembolso
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Subcomponentes ──────────────────────────────────────────────────────────

function TrendBadge({ trend }) {
  if (!trend) return null;
  const up = trend.dir === "up";
  return (
    <div
      className={`${styles.trend} ${up ? styles.trendUp : styles.trendDown}`}
    >
      <svg
        width="10"
        height="10"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
      >
        {up ? (
          <polyline points="18 15 12 9 6 15" />
        ) : (
          <polyline points="6 9 12 15 18 9" />
        )}
      </svg>
      {trend.pct == null ? "Nuevo" : `${trend.pct.toFixed(0)} %`}
    </div>
  );
}

function NotDeployed({ route, error, onRetry }) {
  return (
    <div className={styles.notDeployedBanner}>
      <div className={styles.ndbIcon}>⚠️</div>
      <div className={styles.ndbBody}>
        <div className={styles.ndbTitle}>Error al cargar</div>
        <div className={styles.ndbDesc}>
          No se pudo obtener <code>{route}</code>.<br />
          Revisa que el backend esté arrancado y conectado a la base de datos
          correcta.
        </div>
        {error && <div className={styles.ndbError}>{error}</div>}
      </div>
      <button className={styles.ndbRetryBtn} onClick={onRetry}>
        Reintentar
      </button>
    </div>
  );
}
