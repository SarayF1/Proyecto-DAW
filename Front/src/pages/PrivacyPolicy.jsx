import {
  Box,
  Typography,
  Paper,
  Stack,
  Divider,
  Button,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import {
  ArrowBack,
  Security,
  Person,
  Storage,
  Share,
  Gavel,
  Cookie,
  ContactMail,
  CheckCircleOutline,
  LocationOn,
  CreditCard,
  ChildCare,
  Update,
  VerifiedUser,
  Lock,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const SectionHeader = ({ icon, title, index }) => (
  <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
    <Box
      sx={{
        bgcolor: "primary.main",
        borderRadius: "50%",
        width: 36,
        height: 36,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {icon}
    </Box>
    <Typography variant="h6" fontWeight="bold">
      {index}. {title}
    </Typography>
  </Stack>
);

export function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <Box p={3} sx={{ maxWidth: 960, mx: "auto" }}>
      {/* CABECERA */}
      <Stack direction="row" alignItems="center" spacing={2} mb={3}>
        <Button
          startIcon={<ArrowBack />}
          variant="outlined"
          onClick={() => navigate(-1)}
          size="small"
        >
          Volver
        </Button>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Política de Privacidad
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Última actualización: 8 de abril de 2026 · Versión 2.1
          </Typography>
        </Box>
      </Stack>

      {/* AVISO INTRODUCTORIO */}
      <Alert
        icon={<VerifiedUser />}
        severity="info"
        sx={{
          mb: 3,
          borderRadius: 2,
          bgcolor: "rgba(0,230,118,0.08)",
          border: "1px solid rgba(0,230,118,0.3)",
          color: "text.primary",
        }}
      >
        <Typography variant="body2">
          En <strong>ParkApp</strong> nos comprometemos a proteger tu privacidad. Este documento
          explica de forma clara y transparente cómo recopilamos, usamos y protegemos tu información
          personal, de acuerdo con el{" "}
          <strong>Reglamento General de Protección de Datos (RGPD)</strong> de la Unión Europea y la
          Ley Orgánica 3/2018 de Protección de Datos Personales (LOPDGDD) de España.
        </Typography>
      </Alert>

      <Stack spacing={3}>
        {/* ─── 1. RESPONSABLE DEL TRATAMIENTO ─── */}
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <SectionHeader
            icon={<Person sx={{ fontSize: 18, color: "#111" }} />}
            title="Responsable del tratamiento"
            index="1"
          />
          <Typography color="text.secondary" mb={2}>
            El responsable del tratamiento de tus datos personales es:
          </Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
            <Table size="small">
              <TableBody>
                {[
                  ["Denominación social", "ParkApp Technologies S.L."],
                  ["NIF", "B-87654321"],
                  ["Domicilio", "Calle Gran Vía 28, 4º planta, 28013 Madrid, España"],
                  ["Correo de contacto", "privacidad@parkapp.es"],
                  ["Delegado de Protección de Datos (DPD)", "dpo@parkapp.es"],
                  ["Registro Mercantil", "Madrid, Tomo 12345, Folio 67, Sección 8, Hoja M-123456"],
                ].map(([campo, valor]) => (
                  <TableRow key={campo}>
                    <TableCell
                      sx={{ fontWeight: "bold", width: "42%", color: "text.secondary", fontSize: "0.82rem" }}
                    >
                      {campo}
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.85rem" }}>{valor}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* ─── 2. DATOS QUE RECOPILAMOS ─── */}
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <SectionHeader
            icon={<Storage sx={{ fontSize: 18, color: "#111" }} />}
            title="Datos que recopilamos"
            index="2"
          />
          <Typography color="text.secondary" mb={2}>
            Recopilamos distintos tipos de información según la funcionalidad utilizada:
          </Typography>

          <Stack spacing={2.5}>
            <Box>
              <Typography fontWeight="bold" mb={1}>
                2.1 Datos de registro e identificación
              </Typography>
              <List dense disablePadding>
                {[
                  "Nombre completo y apellidos",
                  "Dirección de correo electrónico",
                  "Número de teléfono (opcional)",
                  "Contraseña cifrada mediante bcrypt",
                  "Fecha y hora de registro",
                  "Fotografía de perfil (si la proporcionas voluntariamente)",
                ].map((item) => (
                  <ListItem key={item} sx={{ py: 0.25, px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      <CheckCircleOutline sx={{ fontSize: 16, color: "primary.main" }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="body2" color="text.secondary">
                          {item}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Box>

            <Divider />

            <Box>
              <Typography fontWeight="bold" mb={1}>
                2.2 Datos de vehículos
              </Typography>
              <List dense disablePadding>
                {[
                  "Matrícula del vehículo",
                  "Marca, modelo y color (opcional)",
                  "Tipo de vehículo (turismo, moto, furgoneta, eléctrico…)",
                  "Fecha de registro del vehículo en la plataforma",
                ].map((item) => (
                  <ListItem key={item} sx={{ py: 0.25, px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      <CheckCircleOutline sx={{ fontSize: 16, color: "primary.main" }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="body2" color="text.secondary">
                          {item}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Box>

            <Divider />

            <Box>
              <Typography fontWeight="bold" mb={1}>
                2.3 Datos de reservas y uso del servicio
              </Typography>
              <List dense disablePadding>
                {[
                  "Historial de reservas realizadas (fechas, horas, duraciones)",
                  "Plaza y zona de aparcamiento seleccionadas",
                  "Estado de las reservas (activa, completada, cancelada)",
                  "Incidencias reportadas",
                ].map((item) => (
                  <ListItem key={item} sx={{ py: 0.25, px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      <CheckCircleOutline sx={{ fontSize: 16, color: "primary.main" }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="body2" color="text.secondary">
                          {item}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Box>

            <Divider />

            <Box>
              <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                <CreditCard sx={{ fontSize: 16 }} />
                <Typography fontWeight="bold">2.4 Datos del monedero y transacciones</Typography>
              </Stack>
              <List dense disablePadding>
                {[
                  "Saldo del monedero virtual (almacenado de forma cifrada)",
                  "Historial de recargas y consumos",
                  "Identificador de transacción (nunca datos completos de tarjeta)",
                  "Método de pago utilizado (tipo genérico: tarjeta, transferencia…)",
                ].map((item) => (
                  <ListItem key={item} sx={{ py: 0.25, px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      <CheckCircleOutline sx={{ fontSize: 16, color: "primary.main" }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="body2" color="text.secondary">
                          {item}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
              <Alert severity="warning" sx={{ mt: 1.5, borderRadius: 2 }}>
                <Typography variant="body2">
                  Los datos sensibles de pago son procesados exclusivamente por nuestra pasarela
                  certificada PCI-DSS. ParkApp <strong>nunca almacena</strong> el número completo de
                  tu tarjeta de crédito o débito.
                </Typography>
              </Alert>
            </Box>

            <Divider />

            <Box>
              <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                <LocationOn sx={{ fontSize: 16 }} />
                <Typography fontWeight="bold">2.5 Datos de ubicación</Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                Si otorgas permiso, recopilamos tu ubicación aproximada para mostrarte parkings
                cercanos. La ubicación exacta{" "}
                <strong>nunca se almacena de forma permanente</strong>; solo se utiliza en tiempo real
                para la búsqueda. Puedes revocar este permiso en cualquier momento desde la
                configuración de tu dispositivo.
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography fontWeight="bold" mb={1}>
                2.6 Datos técnicos y de diagnóstico
              </Typography>
              <List dense disablePadding>
                {[
                  "Dirección IP (anonimizada tras 24 horas)",
                  "Tipo de dispositivo y sistema operativo",
                  "Versión de la aplicación utilizada",
                  "Registros de errores y crashes (sin datos personales identificables)",
                  "Métricas de rendimiento y tiempos de carga (telemetría anónima si lo consientes)",
                ].map((item) => (
                  <ListItem key={item} sx={{ py: 0.25, px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      <CheckCircleOutline sx={{ fontSize: 16, color: "primary.main" }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="body2" color="text.secondary">
                          {item}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Stack>
        </Paper>

        {/* ─── 3. FINALIDADES Y BASE LEGAL ─── */}
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <SectionHeader
            icon={<Gavel sx={{ fontSize: 18, color: "#111" }} />}
            title="Finalidades del tratamiento y base legal"
            index="3"
          />
          <Typography color="text.secondary" mb={2}>
            De acuerdo con el RGPD, cada tratamiento requiere una base jurídica válida:
          </Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>Finalidad</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Base jurídica</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {[
                  ["Gestión de cuenta y autenticación", "Ejecución de contrato (Art. 6.1.b RGPD)"],
                  ["Procesamiento de reservas y pagos", "Ejecución de contrato (Art. 6.1.b RGPD)"],
                  ["Envío de notificaciones sobre reserva", "Ejecución de contrato (Art. 6.1.b RGPD)"],
                  ["Mejora del servicio mediante telemetría", "Consentimiento (Art. 6.1.a RGPD)"],
                  ["Envío de comunicaciones comerciales", "Consentimiento (Art. 6.1.a RGPD)"],
                  ["Cumplimiento de obligaciones fiscales", "Obligación legal (Art. 6.1.c RGPD)"],
                  ["Detección de fraude y seguridad", "Interés legítimo (Art. 6.1.f RGPD)"],
                  ["Estadísticas de uso anónimas", "Interés legítimo (Art. 6.1.f RGPD)"],
                ].map(([fin, base]) => (
                  <TableRow key={fin}>
                    <TableCell sx={{ fontSize: "0.85rem" }}>{fin}</TableCell>
                    <TableCell sx={{ color: "primary.main", fontSize: "0.8rem" }}>{base}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* ─── 4. COMPARTICIÓN CON TERCEROS ─── */}
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <SectionHeader
            icon={<Share sx={{ fontSize: 18, color: "#111" }} />}
            title="Compartición de datos con terceros"
            index="4"
          />
          <Typography color="text.secondary" mb={2}>
            <strong>ParkApp no vende ni alquila tus datos personales a terceros</strong> bajo ningún
            concepto. Sin embargo, para prestar el servicio trabajamos con proveedores técnicos que
            actúan como encargados del tratamiento y están contractualmente obligados a respetar tu
            privacidad:
          </Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, mb: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>Proveedor / Servicio</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Finalidad</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>País</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {[
                  ["Pasarela de pago (certificada PCI-DSS)", "Procesamiento de pagos", "UE"],
                  ["Servicio de mapas y geolocalización", "Mostrar parkings cercanos", "UE"],
                  ["Plataforma de notificaciones push", "Envío de alertas al dispositivo", "UE"],
                  ["Proveedor de hosting cloud", "Almacenamiento seguro de datos", "UE"],
                  ["Servicio de correo transaccional", "Confirmaciones y facturas", "UE"],
                  ["Herramienta de análisis de errores", "Diagnóstico técnico anónimo", "UE"],
                ].map(([prov, fin, pais]) => (
                  <TableRow key={prov}>
                    <TableCell sx={{ fontSize: "0.85rem" }}>{prov}</TableCell>
                    <TableCell sx={{ fontSize: "0.85rem" }}>{fin}</TableCell>
                    <TableCell>
                      <Chip label={pais} size="small" color="success" variant="outlined" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Typography variant="body2" color="text.secondary">
            Todos los proveedores están ubicados en el Espacio Económico Europeo (EEE) o cuentan con
            las garantías adecuadas de transferencia internacional según el Art. 46 RGPD.
          </Typography>
        </Paper>

        {/* ─── 5. DERECHOS DEL USUARIO ─── */}
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <SectionHeader
            icon={<Lock sx={{ fontSize: 18, color: "#111" }} />}
            title="Tus derechos"
            index="5"
          />
          <Typography color="text.secondary" mb={2}>
            Bajo el RGPD, tienes los siguientes derechos sobre tus datos personales. Puedes ejercerlos
            en cualquier momento a través de <strong>privacidad@parkapp.es</strong> o desde la sección
            de configuración:
          </Typography>
          <Stack spacing={1.5}>
            {[
              {
                titulo: "Derecho de acceso (Art. 15 RGPD)",
                desc: "Obtener confirmación de si tratamos tus datos y una copia de los mismos.",
              },
              {
                titulo: "Derecho de rectificación (Art. 16 RGPD)",
                desc: "Corregir datos inexactos o incompletos que te conciernan.",
              },
              {
                titulo: "Derecho de supresión o 'al olvido' (Art. 17 RGPD)",
                desc: "Solicitar la eliminación de tus datos cuando ya no sean necesarios para la finalidad para la que fueron recogidos, entre otros supuestos.",
              },
              {
                titulo: "Derecho de limitación del tratamiento (Art. 18 RGPD)",
                desc: "Solicitar que pausemos el uso de tus datos mientras verificamos una reclamación.",
              },
              {
                titulo: "Derecho a la portabilidad (Art. 20 RGPD)",
                desc: "Recibir tus datos en formato estructurado y de lectura mecánica, o solicitar que se transmitan a otro responsable.",
              },
              {
                titulo: "Derecho de oposición (Art. 21 RGPD)",
                desc: "Oponerte al tratamiento basado en interés legítimo o para fines de marketing directo.",
              },
              {
                titulo: "Derechos frente a decisiones automatizadas (Art. 22 RGPD)",
                desc: "No ser objeto de decisiones basadas exclusivamente en tratamiento automatizado que produzcan efectos jurídicos significativos.",
              },
              {
                titulo: "Derecho a retirar el consentimiento",
                desc: "Retirar en cualquier momento el consentimiento otorgado, sin que ello afecte a la licitud del tratamiento previo.",
              },
            ].map(({ titulo, desc }) => (
              <Box
                key={titulo}
                sx={{
                  p: 2,
                  bgcolor: "rgba(255,255,255,0.04)",
                  borderRadius: 2,
                  borderLeft: "3px solid",
                  borderColor: "primary.main",
                }}
              >
                <Typography fontWeight="bold" fontSize="0.88rem">
                  {titulo}
                </Typography>
                <Typography variant="body2" color="text.secondary" mt={0.5}>
                  {desc}
                </Typography>
              </Box>
            ))}
          </Stack>
          <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
            <Typography variant="body2">
              Si consideras que el tratamiento de tus datos vulnera la normativa, puedes presentar una
              reclamación ante la <strong>Agencia Española de Protección de Datos (AEPD)</strong> en{" "}
              <strong>www.aepd.es</strong>.
            </Typography>
          </Alert>
        </Paper>

        {/* ─── 6. SEGURIDAD ─── */}
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <SectionHeader
            icon={<Security sx={{ fontSize: 18, color: "#111" }} />}
            title="Seguridad de los datos"
            index="6"
          />
          <Typography color="text.secondary" mb={2}>
            Aplicamos medidas técnicas y organizativas apropiadas para proteger tus datos frente a
            accesos no autorizados, pérdida, destrucción o alteración:
          </Typography>
          <Stack spacing={1}>
            {[
              "Cifrado de contraseñas con bcrypt (coste adaptativo)",
              "Comunicaciones protegidas mediante TLS 1.3 (HTTPS obligatorio)",
              "Autenticación mediante tokens JWT con expiración configurable",
              "Acceso a la base de datos restringido por roles y listas de control (RBAC)",
              "Auditorías de seguridad periódicas y pruebas de penetración anuales",
              "Plan de respuesta ante incidentes con notificación en menos de 72 horas (Art. 33 RGPD)",
              "Copias de seguridad cifradas con retención de 30 días",
              "Separación estricta de entornos de desarrollo, staging y producción",
              "Revisión de código orientada a seguridad (OWASP Top 10)",
            ].map((item) => (
              <Stack key={item} direction="row" spacing={1} alignItems="flex-start">
                <CheckCircleOutline
                  sx={{ fontSize: 16, color: "primary.main", mt: 0.3, flexShrink: 0 }}
                />
                <Typography variant="body2" color="text.secondary">
                  {item}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Paper>

        {/* ─── 7. CONSERVACIÓN ─── */}
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <SectionHeader
            icon={<Storage sx={{ fontSize: 18, color: "#111" }} />}
            title="Conservación de los datos"
            index="7"
          />
          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>Tipo de dato</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Período de conservación</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {[
                  ["Datos de cuenta activa", "Mientras la cuenta esté activa"],
                  ["Datos de cuenta eliminada", "3 años (obligación fiscal y legal)"],
                  ["Historial de reservas completadas", "5 años (Ley General Tributaria)"],
                  ["Facturas y registros de pago", "5 años (Código de Comercio)"],
                  ["Registros de acceso (logs)", "12 meses (Ley 34/2002 LSSI)"],
                  ["Datos de telemetría y análisis", "24 meses (anonimizados tras 30 días)"],
                  ["Comunicaciones con soporte", "3 años"],
                ].map(([tipo, periodo]) => (
                  <TableRow key={tipo}>
                    <TableCell sx={{ fontSize: "0.85rem" }}>{tipo}</TableCell>
                    <TableCell sx={{ color: "text.secondary", fontSize: "0.82rem" }}>
                      {periodo}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* ─── 8. COOKIES ─── */}
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <SectionHeader
            icon={<Cookie sx={{ fontSize: 18, color: "#111" }} />}
            title="Cookies y tecnologías de rastreo"
            index="8"
          />
          <Typography color="text.secondary" mb={2}>
            La aplicación web de ParkApp utiliza las siguientes cookies:
          </Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>Cookie</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Tipo</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Finalidad</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Duración</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {[
                  ["auth_token", "Esencial", "Mantener la sesión iniciada", "Sesión"],
                  ["csrf_token", "Esencial", "Protección contra CSRF", "Sesión"],
                  ["user_prefs", "Funcional", "Preferencias de interfaz", "1 año"],
                  ["_analytics_id", "Analítica (con consentimiento)", "Estadísticas de uso anónimas", "24 meses"],
                ].map(([name, tipo, fin, dur]) => (
                  <TableRow key={name}>
                    <TableCell
                      sx={{ fontFamily: "monospace", fontSize: "0.8rem", color: "primary.main" }}
                    >
                      {name}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={tipo}
                        size="small"
                        color={
                          tipo === "Esencial"
                            ? "error"
                            : tipo === "Funcional"
                            ? "warning"
                            : "default"
                        }
                        variant="outlined"
                        sx={{ fontSize: "0.68rem" }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.82rem" }}>{fin}</TableCell>
                    <TableCell sx={{ fontSize: "0.82rem", color: "text.secondary" }}>{dur}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Typography variant="body2" color="text.secondary" mt={1.5}>
            Puedes gestionar o eliminar las cookies desde la configuración de tu navegador. Deshabilitar
            las cookies esenciales puede afectar al funcionamiento de la aplicación.
          </Typography>
        </Paper>

        {/* ─── 9. MENORES ─── */}
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <SectionHeader
            icon={<ChildCare sx={{ fontSize: 18, color: "#111" }} />}
            title="Menores de edad"
            index="9"
          />
          <Typography color="text.secondary">
            ParkApp no está dirigida a menores de <strong>14 años</strong>. No recopilamos
            intencionadamente datos personales de menores de esa edad. Si eres padre, madre o tutor
            legal y tienes conocimiento de que un menor nos ha proporcionado datos sin tu consentimiento,
            contáctanos en <strong>privacidad@parkapp.es</strong> y procederemos a eliminar dicha
            información de forma inmediata. Para usuarios de entre 14 y 18 años, puede ser necesario el
            consentimiento del representante legal para determinados tratamientos.
          </Typography>
        </Paper>

        {/* ─── 10. ACTUALIZACIONES ─── */}
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <SectionHeader
            icon={<Update sx={{ fontSize: 18, color: "#111" }} />}
            title="Actualizaciones de esta política"
            index="10"
          />
          <Typography color="text.secondary" mb={2}>
            Podemos actualizar esta Política de Privacidad para reflejar cambios en nuestra práctica de
            datos, en la legislación aplicable o en los servicios ofrecidos. Cuando lo hagamos:
          </Typography>
          <Stack spacing={1}>
            {[
              "Actualizaremos la fecha de revisión visible al inicio del documento.",
              "Si los cambios son significativos, te lo notificaremos mediante un aviso en la app o por correo electrónico con al menos 30 días de antelación.",
              "En caso de cambios que requieran nuevo consentimiento, te lo solicitaremos expresamente.",
              "Mantendremos un historial de versiones accesible bajo petición.",
            ].map((item) => (
              <Stack key={item} direction="row" spacing={1} alignItems="flex-start">
                <CheckCircleOutline
                  sx={{ fontSize: 16, color: "primary.main", mt: 0.3, flexShrink: 0 }}
                />
                <Typography variant="body2" color="text.secondary">
                  {item}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Paper>

        {/* ─── 11. CONTACTO ─── */}
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <SectionHeader
            icon={<ContactMail sx={{ fontSize: 18, color: "#111" }} />}
            title="Contacto y ejercicio de derechos"
            index="11"
          />
          <Typography color="text.secondary" mb={2}>
            Para cualquier consulta sobre esta política o para ejercer tus derechos, contáctanos:
          </Typography>
          <Stack spacing={1.5}>
            {[
              { label: "Correo del Delegado de Protección de Datos", value: "dpo@parkapp.es" },
              { label: "Correo de privacidad general", value: "privacidad@parkapp.es" },
              {
                label: "Dirección postal",
                value:
                  "ParkApp Technologies S.L. — A/A DPD, Calle Gran Vía 28, 4º, 28013 Madrid",
              },
              {
                label: "Plazo de respuesta",
                value: "Máximo 30 días hábiles desde la recepción de la solicitud (Art. 12 RGPD)",
              },
            ].map(({ label, value }) => (
              <Box
                key={label}
                sx={{ p: 1.5, bgcolor: "rgba(255,255,255,0.04)", borderRadius: 2 }}
              >
                <Typography
                  variant="caption"
                  color="primary.main"
                  fontWeight="bold"
                  display="block"
                >
                  {label}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {value}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Paper>
      </Stack>

      {/* BOTONES INFERIORES */}
      <Stack direction="row" spacing={2} mt={4} mb={2} flexWrap="wrap">
        <Button startIcon={<ArrowBack />} variant="outlined" onClick={() => navigate(-1)}>
          Volver a Configuración
        </Button>
        <Button
          variant="text"
          color="inherit"
          onClick={() => navigate("/terms")}
          sx={{ color: "text.secondary" }}
        >
          Ver Términos y condiciones →
        </Button>
      </Stack>
    </Box>
  );
}