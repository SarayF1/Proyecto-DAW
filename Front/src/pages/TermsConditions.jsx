// src/pages/TermsConditions.jsx
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import {
  ArrowBack,
  Gavel,
  DirectionsCar,
  EventAvailable,
  CreditCard,
  Cancel,
  Warning,
  Block,
  AccountCircle,
  SupportAgent,
  ExpandMore,
  CheckCircleOutline,
  Info,
  Policy,
  Update,
  PublicOff,
  VerifiedUser,
  MonetizationOn,
  Shield,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const SectionHeader = ({ icon, title, index }) => (
  <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
    <Box
      sx={{
        bgcolor: "secondary.main",
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

export function TermsConditions() {
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
            Términos y Condiciones
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Última actualización: 8 de abril de 2026 · Versión 3.0
          </Typography>
        </Box>
      </Stack>

      {/* AVISO INTRODUCTORIO */}
      <Alert
        icon={<Gavel />}
        severity="warning"
        sx={{
          mb: 3,
          borderRadius: 2,
          bgcolor: "rgba(124,77,255,0.08)",
          border: "1px solid rgba(124,77,255,0.3)",
          color: "text.primary",
        }}
      >
        <Typography variant="body2">
          Estos Términos y Condiciones regulan el acceso y uso de la plataforma{" "}
          <strong>ParkApp</strong> y sus servicios asociados. Al crear una cuenta o utilizar
          cualquier funcionalidad de ParkApp, aceptas íntegramente estas condiciones. Si no estás de
          acuerdo, debes abstenerte de usar el servicio. Le recomendamos leer este documento con
          atención.
        </Typography>
      </Alert>

      <Stack spacing={3}>
        {/* ─── 1. DEFINICIONES ─── */}
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <SectionHeader
            icon={<Info sx={{ fontSize: 18, color: "#fff" }} />}
            title="Definiciones"
            index="1"
          />
          <Typography color="text.secondary" mb={2}>
            A los efectos de estos Términos y Condiciones, se entenderá por:
          </Typography>
          <Stack spacing={1.5}>
            {[
              {
                term: "ParkApp / La Plataforma",
                def: "El conjunto de aplicaciones web y móviles, API y servicios ofrecidos por ParkApp Technologies S.L.",
              },
              {
                term: "Usuario",
                def: "Toda persona física mayor de 14 años que se registra y utiliza la plataforma.",
              },
              {
                term: "Administrador",
                def: "Usuario con privilegios elevados para gestionar zonas, plazas, reportes y otros usuarios.",
              },
              {
                term: "Reserva",
                def: "Solicitud formalizada por un Usuario para ocupar una plaza de aparcamiento durante un período determinado.",
              },
              {
                term: "Monedero virtual",
                def: "Saldo prepagado almacenado en la cuenta del Usuario para abonar las reservas.",
              },
              {
                term: "Plaza",
                def: "Espacio físico de aparcamiento identificado dentro de una Zona gestionada por la Plataforma.",
              },
              {
                term: "Zona",
                def: "Agrupación lógica de plazas de aparcamiento pertenecientes a un mismo recinto o área.",
              },
              {
                term: "Tarifa",
                def: "Precio por unidad de tiempo (hora o fracción) aplicable a una Plaza o Zona concreta.",
              },
            ].map(({ term, def }) => (
              <Box
                key={term}
                sx={{
                  p: 1.5,
                  bgcolor: "rgba(255,255,255,0.04)",
                  borderRadius: 2,
                  borderLeft: "3px solid",
                  borderColor: "secondary.main",
                }}
              >
                <Typography fontWeight="bold" fontSize="0.88rem" color="secondary.main">
                  {term}
                </Typography>
                <Typography variant="body2" color="text.secondary" mt={0.3}>
                  {def}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Paper>

        {/* ─── 2. ACCESO Y REGISTRO ─── */}
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <SectionHeader
            icon={<AccountCircle sx={{ fontSize: 18, color: "#fff" }} />}
            title="Acceso, registro y cuenta de usuario"
            index="2"
          />
          <Stack spacing={2}>
            <Box>
              <Typography fontWeight="bold" mb={1}>
                2.1 Requisitos para el registro
              </Typography>
              <List dense disablePadding>
                {[
                  "Ser mayor de 14 años (o contar con el consentimiento del representante legal si tienes entre 14 y 18 años).",
                  "Proporcionar una dirección de correo electrónico válida y activa.",
                  "Aceptar los presentes Términos y Condiciones y la Política de Privacidad.",
                  "No haber sido previamente suspendido o bloqueado de la plataforma.",
                ].map((item) => (
                  <ListItem key={item} sx={{ py: 0.25, px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      <CheckCircleOutline sx={{ fontSize: 16, color: "secondary.main" }} />
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
                2.2 Responsabilidad sobre la cuenta
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={1}>
                Eres el único responsable de mantener la confidencialidad de tus credenciales de
                acceso. Debes notificarnos de inmediato a través de{" "}
                <strong>soporte@parkapp.es</strong> si sospechas un acceso no autorizado a tu cuenta.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ParkApp no será responsable de los daños o perjuicios derivados del uso no autorizado
                de tu cuenta, salvo que se demuestre negligencia directa por nuestra parte en la
                protección de tus datos.
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography fontWeight="bold" mb={1}>
                2.3 Una cuenta por persona
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Cada persona física puede tener únicamente una cuenta activa en ParkApp. La creación
                de múltiples cuentas para eludir sanciones, obtener beneficios indebidos o con
                cualquier otro fin fraudulento está expresamente prohibida y dará lugar a la
                suspensión permanente de todas las cuentas implicadas.
              </Typography>
            </Box>
          </Stack>
        </Paper>

        {/* ─── 3. VEHÍCULOS ─── */}
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <SectionHeader
            icon={<DirectionsCar sx={{ fontSize: 18, color: "#fff" }} />}
            title="Registro y gestión de vehículos"
            index="3"
          />
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
              Para realizar reservas de aparcamiento es necesario registrar al menos un vehículo en
              tu cuenta. Al registrar un vehículo, declaras y garantizas que:
            </Typography>
            <List dense disablePadding>
              {[
                "La matrícula introducida es real, válida y corresponde a un vehículo legalmente matriculado.",
                "Eres el propietario del vehículo o tienes autorización expresa del propietario para usarlo.",
                "Los datos del vehículo son correctos y te comprometes a mantenerlos actualizados.",
                "El vehículo cumple los requisitos de dimensiones para las plazas reservadas.",
              ].map((item) => (
                <ListItem key={item} sx={{ py: 0.25, px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 28 }}>
                    <CheckCircleOutline sx={{ fontSize: 16, color: "secondary.main" }} />
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
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              <Typography variant="body2">
                ParkApp se reserva el derecho de verificar la validez de las matrículas registradas
                y de eliminar aquellas que sean fraudulentas o inexistentes.
              </Typography>
            </Alert>
          </Stack>
        </Paper>

        {/* ─── 4. RESERVAS ─── */}
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <SectionHeader
            icon={<EventAvailable sx={{ fontSize: 18, color: "#fff" }} />}
            title="Sistema de reservas"
            index="4"
          />
          <Stack spacing={2}>
            <Box>
              <Typography fontWeight="bold" mb={1}>
                4.1 Proceso de reserva
              </Typography>
              <Typography variant="body2" color="text.secondary">
                La reserva se formaliza en el momento en que el sistema confirma la disponibilidad
                de la plaza y se realiza el cargo correspondiente en el monedero del Usuario. Hasta
                ese momento, la disponibilidad no está garantizada.
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography fontWeight="bold" mb={1}>
                4.2 Confirmación y validez
              </Typography>
              <List dense disablePadding>
                {[
                  "Recibirás una confirmación por correo electrónico y notificación push una vez completada la reserva.",
                  "La reserva es válida exclusivamente para la plaza, zona, fecha y hora especificadas.",
                  "El acceso con un vehículo distinto al registrado en la reserva puede resultar en denegación de entrada.",
                  "ParkApp no garantiza el libre acceso en caso de incidencias técnicas en los sistemas de acceso físico al parking.",
                ].map((item) => (
                  <ListItem key={item} sx={{ py: 0.25, px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      <CheckCircleOutline sx={{ fontSize: 16, color: "secondary.main" }} />
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
                4.3 Uso excesivo del tiempo reservado
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Si el Usuario excede el tiempo de estacionamiento contratado, se aplicará un cargo
                adicional automático equivalente a la tarifa vigente por cada fracción de hora
                adicional, hasta un máximo de 24 horas. Superado ese tiempo, la incidencia se
                escalará al administrador de la zona.
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography fontWeight="bold" mb={1}>
                4.4 No presentación (no-show)
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Si el Usuario no se presenta en la plaza reservada en los primeros{" "}
                <strong>30 minutos</strong> desde el inicio de la reserva sin haber procedido a su
                cancelación, la plaza podrá ser liberada para otros usuarios. El importe abonado no
                será reembolsado salvo que se acredite causa de fuerza mayor.
              </Typography>
            </Box>
          </Stack>
        </Paper>

        {/* ─── 5. PRECIOS Y PAGOS ─── */}
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <SectionHeader
            icon={<CreditCard sx={{ fontSize: 18, color: "#fff" }} />}
            title="Precios, pagos y monedero"
            index="5"
          />
          <Stack spacing={2}>
            <Box>
              <Typography fontWeight="bold" mb={1}>
                5.1 Tarifas
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Los precios de cada plaza o zona son visibles antes de confirmar la reserva e
                incluyen todos los impuestos aplicables (IVA incluido). ParkApp se reserva el
                derecho de modificar las tarifas con un preaviso mínimo de{" "}
                <strong>15 días naturales</strong>, comunicándolo mediante notificación en la app.
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography fontWeight="bold" mb={1}>
                5.2 Monedero virtual
              </Typography>
              <List dense disablePadding>
                {[
                  "El monedero virtual es un sistema de prepago que permite recargar saldo para abonar reservas.",
                  "Las recargas son inmediatas una vez confirmado el pago por la pasarela.",
                  "El saldo del monedero no genera intereses ni tiene fecha de caducidad mientras la cuenta permanezca activa.",
                  "El saldo no es transferible a otras cuentas de usuario.",
                  "En caso de baja voluntaria, el saldo restante podrá ser devuelto previa solicitud formal a soporte@parkapp.es.",
                ].map((item) => (
                  <ListItem key={item} sx={{ py: 0.25, px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      <CheckCircleOutline sx={{ fontSize: 16, color: "secondary.main" }} />
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
                5.3 Facturación
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Por cada transacción realizada se generará una factura electrónica disponible en la
                sección <em>Facturas</em> de la aplicación. Las facturas son válidas a efectos
                fiscales conforme al Real Decreto 1619/2012 sobre obligaciones de facturación. Puedes
                descargarlas en formato PDF en cualquier momento.
              </Typography>
            </Box>
          </Stack>
        </Paper>

        {/* ─── 6. CANCELACIONES Y REEMBOLSOS ─── */}
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <SectionHeader
            icon={<Cancel sx={{ fontSize: 18, color: "#fff" }} />}
            title="Cancelaciones y política de reembolsos"
            index="6"
          />
          <Typography color="text.secondary" mb={2}>
            La política de cancelación se aplica de la siguiente forma:
          </Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, mb: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>Tiempo antes del inicio</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Reembolso al monedero</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Comisión</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {[
                  ["Más de 24 horas", "100%", "Sin comisión"],
                  ["Entre 12 y 24 horas", "75%", "25% de gestión"],
                  ["Entre 2 y 12 horas", "50%", "50% de gestión"],
                  ["Menos de 2 horas", "0%", "Sin reembolso"],
                  ["No presentación (no-show)", "0%", "Sin reembolso"],
                ].map(([tiempo, reembolso, comision]) => (
                  <TableRow key={tiempo}>
                    <TableCell sx={{ fontSize: "0.85rem" }}>{tiempo}</TableCell>
                    <TableCell>
                      <Chip
                        label={reembolso}
                        size="small"
                        color={
                          reembolso === "100%"
                            ? "success"
                            : reembolso === "0%"
                            ? "error"
                            : "warning"
                        }
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.82rem", color: "text.secondary" }}>
                      {comision}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            <Typography variant="body2">
              Los reembolsos se acreditan en el monedero virtual del Usuario en un plazo máximo de{" "}
              <strong>24 horas</strong> desde la cancelación. Para solicitar la devolución a tu
              método de pago original (en lugar del monedero), debes contactar con soporte en un
              plazo de 30 días.
            </Typography>
          </Alert>
          <Box sx={{ mt: 2 }}>
            <Typography fontWeight="bold" mb={1}>
              6.1 Cancelaciones por causa imputable a ParkApp
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Si la cancelación es consecuencia de una incidencia técnica, mantenimiento imprevisto
              u otro motivo imputable a ParkApp o al gestor del parking, el Usuario recibirá el{" "}
              <strong>reembolso íntegro del 100%</strong> en el monedero, más, si procede, una
              compensación adicional a criterio del equipo de soporte.
            </Typography>
          </Box>
        </Paper>

        {/* ─── 7. OBLIGACIONES DEL USUARIO ─── */}
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <SectionHeader
            icon={<VerifiedUser sx={{ fontSize: 18, color: "#fff" }} />}
            title="Obligaciones y conducta del usuario"
            index="7"
          />
          <Typography color="text.secondary" mb={2}>
            Al usar ParkApp te comprometes a:
          </Typography>
          <Stack spacing={1.5}>
            {[
              {
                ok: true,
                text: "Proporcionar información veraz, completa y actualizada en tu perfil y en los vehículos registrados.",
              },
              {
                ok: true,
                text: "Utilizar la plaza reservada únicamente con el vehículo especificado en la reserva.",
              },
              {
                ok: true,
                text: "Respetar las normas de circulación, señalización y convivencia dentro del recinto de aparcamiento.",
              },
              {
                ok: true,
                text: "Notificar cualquier daño o incidencia detectada en la plaza a través de la app o a soporte@parkapp.es.",
              },
              {
                ok: true,
                text: "Hacer un uso correcto y legal de todas las funcionalidades de la plataforma.",
              },
              {
                ok: false,
                text: "Subarrendar, ceder o comercializar las plazas reservadas a terceros.",
              },
              {
                ok: false,
                text: "Utilizar la plataforma para actividades ilícitas, fraudulentas o contrarias al orden público.",
              },
              {
                ok: false,
                text: "Intentar acceder a sistemas, datos o cuentas de otros usuarios sin autorización.",
              },
              {
                ok: false,
                text: "Introducir código malicioso, realizar ataques de fuerza bruta, scraping masivo o cualquier acción que comprometa la seguridad o disponibilidad del servicio.",
              },
            ].map(({ ok, text }) => (
              <Stack key={text} direction="row" spacing={1.5} alignItems="flex-start">
                <Box
                  sx={{
                    mt: 0.3,
                    flexShrink: 0,
                    color: ok ? "primary.main" : "error.main",
                  }}
                >
                  {ok ? (
                    <CheckCircleOutline sx={{ fontSize: 17 }} />
                  ) : (
                    <Block sx={{ fontSize: 17 }} />
                  )}
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {text}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Paper>

        {/* ─── 8. RESPONSABILIDAD ─── */}
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <SectionHeader
            icon={<Shield sx={{ fontSize: 18, color: "#fff" }} />}
            title="Limitación de responsabilidad"
            index="8"
          />
          <Stack spacing={2}>
            <Box>
              <Typography fontWeight="bold" mb={1}>
                8.1 Papel de intermediario
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ParkApp actúa como plataforma intermediaria que facilita la gestión de reservas entre
                el Usuario y el gestor del aparcamiento. ParkApp no es propietaria de las
                instalaciones físicas y, por tanto, no asume responsabilidad directa por las
                condiciones del recinto, daños a vehículos dentro del parking, robos u otras
                incidencias de carácter físico.
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography fontWeight="bold" mb={1}>
                8.2 Disponibilidad del servicio
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ParkApp se esfuerza por mantener el servicio disponible de forma continua, pero no
                garantiza una disponibilidad del 100%. Pueden producirse interrupciones por
                mantenimiento programado (con aviso previo), fallos técnicos imprevistos o causas
                de fuerza mayor. En estos casos, ParkApp no será responsable de los perjuicios
                ocasionados salvo dolo o culpa grave.
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography fontWeight="bold" mb={1}>
                8.3 Límite máximo de responsabilidad
              </Typography>
              <Typography variant="body2" color="text.secondary">
                En todo caso, la responsabilidad total de ParkApp frente al Usuario por cualquier
                concepto quedará limitada al importe de las transacciones realizadas por dicho
                Usuario en los <strong>12 meses anteriores</strong> al hecho que origine la
                reclamación, salvo que la legislación aplicable establezca lo contrario.
              </Typography>
            </Box>
          </Stack>
        </Paper>

        {/* ─── 9. SUSPENSIÓN Y BAJA ─── */}
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <SectionHeader
            icon={<Warning sx={{ fontSize: 18, color: "#fff" }} />}
            title="Suspensión, bloqueo y baja de cuenta"
            index="9"
          />

          <Stack spacing={2}>
            <Box>
              <Typography fontWeight="bold" mb={1}>
                9.1 Suspensión temporal
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={1}>
                ParkApp podrá suspender temporalmente una cuenta en los siguientes supuestos:
              </Typography>
              <List dense disablePadding>
                {[
                  "Saldo insuficiente reiterado o intentos de pago fallidos.",
                  "Uso anómalo que sugiera actividad automatizada o fraudulenta.",
                  "Reclamación en proceso de investigación.",
                  "Incumplimiento puntual de las normas de uso.",
                ].map((item) => (
                  <ListItem key={item} sx={{ py: 0.2, px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      <Warning sx={{ fontSize: 15, color: "warning.main" }} />
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
                9.2 Bloqueo permanente
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={1}>
                ParkApp podrá bloquear permanentemente una cuenta, sin derecho a reembolso de los
                saldos pendientes salvo obligación legal, en los siguientes casos graves:
              </Typography>
              <List dense disablePadding>
                {[
                  "Fraude acreditado (matriculas falsas, pagos revertidos de forma fraudulenta, etc.).",
                  "Acoso, amenazas o conducta abusiva hacia otros usuarios o el equipo de soporte.",
                  "Reiterado incumplimiento de los presentes Términos tras haber sido advertido.",
                  "Condena firme por delito relacionado con el uso de la plataforma.",
                  "Creación de múltiples cuentas para eludir un bloqueo previo.",
                ].map((item) => (
                  <ListItem key={item} sx={{ py: 0.2, px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      <Block sx={{ fontSize: 15, color: "error.main" }} />
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
                9.3 Baja voluntaria
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Puedes solicitar la eliminación de tu cuenta en cualquier momento desde la sección de
                configuración o enviando un correo a <strong>soporte@parkapp.es</strong>. La baja
                conlleva la cancelación de todas las reservas futuras (con reembolso según la
                política del apartado 6) y la eliminación progresiva de tus datos en los plazos
                establecidos en la Política de Privacidad.
              </Typography>
            </Box>
          </Stack>
        </Paper>

        {/* ─── 10. PROPIEDAD INTELECTUAL ─── */}
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <SectionHeader
            icon={<Policy sx={{ fontSize: 18, color: "#fff" }} />}
            title="Propiedad intelectual e industrial"
            index="10"
          />
          <Typography variant="body2" color="text.secondary" mb={2}>
            Todos los elementos de la Plataforma —incluyendo, sin carácter limitativo, el código
            fuente, diseño visual, logotipos, marcas, denominaciones, contenidos textuales, iconos,
            bases de datos y APIs— son propiedad exclusiva de ParkApp Technologies S.L. o de sus
            licenciantes y están protegidos por la legislación española e internacional sobre
            propiedad intelectual e industrial.
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            El Usuario recibe una licencia de uso limitada, no exclusiva, intransferible y revocable
            para acceder y utilizar la Plataforma conforme a estos Términos. Queda expresamente
            prohibido:
          </Typography>
          <List dense disablePadding>
            {[
              "Reproducir, distribuir, modificar o crear obras derivadas sin autorización escrita previa.",
              "Usar las marcas, logotipos o denominaciones de ParkApp con fines distintos al uso personal.",
              "Descompilar, realizar ingeniería inversa o intentar extraer el código fuente de la aplicación.",
              "Utilizar el contenido de la Plataforma con fines comerciales sin licencia expresa.",
            ].map((item) => (
              <ListItem key={item} sx={{ py: 0.25, px: 0 }}>
                <ListItemIcon sx={{ minWidth: 28 }}>
                  <Block sx={{ fontSize: 15, color: "error.main" }} />
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
        </Paper>

        {/* ─── 11. LEY APLICABLE Y JURISDICCIÓN ─── */}
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <SectionHeader
            icon={<PublicOff sx={{ fontSize: 18, color: "#fff" }} />}
            title="Ley aplicable y resolución de conflictos"
            index="11"
          />
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
              Estos Términos y Condiciones se rigen e interpretan de acuerdo con la legislación
              española, incluyendo en particular:
            </Typography>
            <List dense disablePadding>
              {[
                "Ley 34/2002, de Servicios de la Sociedad de la Información y del Comercio Electrónico (LSSI-CE)",
                "Real Decreto Legislativo 1/2007, Ley General para la Defensa de los Consumidores y Usuarios",
                "Reglamento (UE) 2016/679 (RGPD) y Ley Orgánica 3/2018 (LOPDGDD)",
                "Código Civil y Código de Comercio españoles en lo que resulte de aplicación",
              ].map((item) => (
                <ListItem key={item} sx={{ py: 0.25, px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 28 }}>
                    <CheckCircleOutline sx={{ fontSize: 16, color: "secondary.main" }} />
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
            <Typography variant="body2" color="text.secondary">
              Para la resolución de controversias, las partes se someten, con renuncia a cualquier
              otro fuero que pudiera corresponderles, a la jurisdicción de los Juzgados y Tribunales
              de <strong>Madrid capital</strong>, salvo que la normativa de consumidores establezca
              otro fuero imperativo. La Comisión Europea ofrece adicionalmente una plataforma de
              resolución de litigios en línea (ODR) accesible en{" "}
              <strong>https://ec.europa.eu/consumers/odr/</strong>.
            </Typography>
          </Stack>
        </Paper>

        {/* ─── 12. SOPORTE Y CONTACTO ─── */}
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <SectionHeader
            icon={<SupportAgent sx={{ fontSize: 18, color: "#fff" }} />}
            title="Soporte y contacto"
            index="12"
          />
          <Stack spacing={1.5}>
            {[
              { label: "Correo de soporte", value: "soporte@parkapp.es" },
              { label: "Correo de facturación", value: "facturacion@parkapp.es" },
              { label: "Correo legal / reclamaciones", value: "legal@parkapp.es" },
              { label: "Horario de atención", value: "Lunes a viernes, de 9:00 a 20:00 (CET/CEST)" },
              { label: "Tiempo de respuesta estimado", value: "Máximo 2 días hábiles para consultas generales; 5 días hábiles para reclamaciones formales" },
              { label: "Dirección postal", value: "ParkApp Technologies S.L., Calle Gran Vía 28, 4º, 28013 Madrid, España" },
            ].map(({ label, value }) => (
              <Box
                key={label}
                sx={{ p: 1.5, bgcolor: "rgba(255,255,255,0.04)", borderRadius: 2 }}
              >
                <Typography
                  variant="caption"
                  color="secondary.main"
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

        {/* ─── 13. MODIFICACIONES ─── */}
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <SectionHeader
            icon={<Update sx={{ fontSize: 18, color: "#fff" }} />}
            title="Modificaciones de los términos"
            index="13"
          />
          <Typography variant="body2" color="text.secondary" mb={2}>
            ParkApp se reserva el derecho de modificar estos Términos y Condiciones en cualquier
            momento. Las modificaciones entrarán en vigor:
          </Typography>
          <Stack spacing={1}>
            {[
              "Para cambios menores o de redacción: inmediatamente tras su publicación en la app.",
              "Para cambios sustanciales que afecten a los derechos del Usuario: tras un preaviso de 30 días mediante notificación en la app y por correo electrónico.",
              "Si el Usuario continúa usando ParkApp tras la entrada en vigor de los nuevos términos, se entenderá que los acepta. Si no está de acuerdo, debe cesar el uso y puede solicitar la baja de su cuenta.",
            ].map((item, i) => (
              <Stack key={i} direction="row" spacing={1} alignItems="flex-start">
                <MonetizationOn
                  sx={{ fontSize: 15, color: "secondary.main", mt: 0.3, flexShrink: 0 }}
                />
                <Typography variant="body2" color="text.secondary">
                  {item}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Paper>

        {/* ─── PREGUNTAS FRECUENTES ─── */}
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
            <Box
              sx={{
                bgcolor: "secondary.main",
                borderRadius: "50%",
                width: 36,
                height: 36,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Info sx={{ fontSize: 18, color: "#fff" }} />
            </Box>
            <Typography variant="h6" fontWeight="bold">
              Preguntas frecuentes sobre los Términos
            </Typography>
          </Stack>
          {[
            {
              q: "¿Puedo regalar o transferir mi saldo a otro usuario?",
              a: "No. El saldo del monedero virtual es personal e intransferible. Solo puede ser utilizado por el titular de la cuenta en reservas propias.",
            },
            {
              q: "¿Qué pasa si hay un accidente o daño en mi vehículo dentro del parking?",
              a: "ParkApp actúa como intermediario y no gestiona el recinto físico. En caso de daño, debes contactar directamente con el administrador del parking y, si procede, con tu seguro de automóvil. Podemos facilitarte los datos de contacto del gestor si lo solicitas a soporte.",
            },
            {
              q: "¿Puedo usar la app si soy menor de edad?",
              a: "El servicio está disponible a partir de 14 años, con consentimiento del representante legal para determinados tratamientos. Por debajo de esa edad, el uso está expresamente prohibido.",
            },
            {
              q: "¿Cómo puedo impugnar una factura o cargo?",
              a: "Debes ponerte en contacto con facturacion@parkapp.es en un plazo máximo de 30 días desde la emisión de la factura, adjuntando el identificador de transacción y una descripción de la discrepancia. Resolveremos la incidencia en un plazo de 5 días hábiles.",
            },
          ].map(({ q, a }) => (
            <Accordion
              key={q}
              disableGutters
              sx={{
                bgcolor: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "8px !important",
                mb: 1,
                "&:before": { display: "none" },
              }}
            >
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="body2" fontWeight="medium">
                  {q}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="text.secondary">
                  {a}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
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
          onClick={() => navigate("/privacy")}
          sx={{ color: "text.secondary" }}
        >
          Ver Política de privacidad →
        </Button>
      </Stack>
    </Box>
  );
}