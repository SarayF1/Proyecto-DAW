// src/pages/TermsPage.jsx
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import styles from './LegalPage.module.css'

export default function TermsPage() {
  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Link to="/" className={styles.backLink}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" aria-hidden="true">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            Volver al inicio
          </Link>

          <div className={styles.header}>
            <div className={styles.badge}>Legal</div>
            <h1 className={styles.title}>Términos y Condiciones de Uso</h1>
            <p className={styles.meta}>Última actualización: 1 de enero de 2025 · Versión 1.0</p>
          </div>

          <div className={styles.content}>
            <section className={styles.section}>
              <h2>1. Aceptación de los términos</h2>
              <p>
                Al acceder y utilizar la plataforma <strong>Myparking</strong> (en adelante, "el Servicio"), usted acepta quedar vinculado por estos Términos y Condiciones de Uso, nuestra <Link to="/privacidad">Política de Privacidad</Link> y cualquier política adicional que se publique en la plataforma. Si no está de acuerdo con alguna parte de estos términos, no podrá acceder al Servicio.
              </p>
              <p>
                El Servicio está operado por el equipo Myparking en el marco del proyecto de fin de ciclo del IES Puerto del Rosario, Fuerteventura, España.
              </p>
            </section>

            <section className={styles.section}>
              <h2>2. Descripción del servicio</h2>
              <p>Myparking es una plataforma web que permite a los usuarios:</p>
              <ul>
                <li>Consultar la disponibilidad de plazas de aparcamiento privado en Puerto del Rosario.</li>
                <li>Reservar plazas de aparcamiento en tiempo real.</li>
                <li>Gestionar un monedero digital para el pago de estancias.</li>
                <li>Registrar y administrar sus vehículos.</li>
                <li>Consultar el historial de reservas y movimientos económicos.</li>
              </ul>
            </section>

            <section className={styles.section}>
              <h2>3. Registro y cuenta de usuario</h2>
              <p>Para utilizar las funcionalidades principales del Servicio, es necesario crear una cuenta. Al registrarse, usted se compromete a:</p>
              <ul>
                <li>Proporcionar información <strong>veraz, exacta y actualizada</strong>.</li>
                <li>Mantener la <strong>confidencialidad de su contraseña</strong> y no compartirla con terceros.</li>
                <li>Notificarnos inmediatamente cualquier uso no autorizado de su cuenta.</li>
                <li>Ser el único responsable de todas las actividades que se realicen con su cuenta.</li>
              </ul>
              <p>Myparking se reserva el derecho de suspender o cancelar cuentas que incumplan estos términos o que realicen actividades fraudulentas.</p>
            </section>

            <section className={styles.section}>
              <h2>4. Reservas y condiciones de uso</h2>
              <h3>4.1 Realización de reservas</h3>
              <p>Las reservas se realizan en tiempo real y están sujetas a disponibilidad. Al confirmar una reserva, el importe correspondiente se <strong>descuenta inmediatamente del monedero</strong> del usuario.</p>

              <h3>4.2 Cancelaciones y devoluciones</h3>
              <p>Dada la naturaleza del servicio en tiempo real, las reservas confirmadas <strong>no son reembolsables</strong> salvo fallo técnico imputable a Myparking. En caso de incidencia técnica, contacte con nosotros en admin@myparking.com dentro de las 24 horas siguientes.</p>

              <h3>4.3 Uso correcto de las plazas</h3>
              <ul>
                <li>El usuario se compromete a <strong>utilizar únicamente la plaza reservada</strong> y a respetar el horario contratado.</li>
                <li>Está prohibido subarrendar o ceder el uso de la reserva a terceros.</li>
                <li>El usuario es responsable de cualquier daño causado en las instalaciones durante su estancia.</li>
              </ul>
            </section>

            <section className={styles.section}>
              <h2>5. Monedero digital y pagos</h2>
              <h3>5.1 Recarga del monedero</h3>
              <p>El saldo del monedero puede recargarse mediante tarjeta de crédito/débito a través de <strong>Stripe</strong>. Los pagos son procesados de forma segura y Myparking no almacena datos de tarjeta en sus servidores.</p>

              <h3>5.2 Saldo no utilizado</h3>
              <p>El saldo no utilizado del monedero <strong>no tiene fecha de caducidad</strong> mientras la cuenta esté activa. En caso de cancelación de cuenta, el saldo restante no será reembolsado salvo acuerdo expreso.</p>

              <h3>5.3 Códigos promocionales</h3>
              <p>Los códigos promocionales son de un solo uso por cuenta, no son transferibles y no tienen valor monetario fuera de la plataforma Myparking.</p>
            </section>

            <section className={styles.section}>
              <h2>6. Conducta del usuario</h2>
              <p>Queda expresamente prohibido:</p>
              <ul>
                <li>Intentar acceder de forma no autorizada a sistemas, cuentas o datos de otros usuarios.</li>
                <li>Utilizar bots, scrapers o cualquier medio automatizado para interactuar con el Servicio.</li>
                <li>Proporcionar información falsa en el registro o en los datos de vehículos.</li>
                <li>Realizar reservas especulativas sin intención real de uso.</li>
                <li>Cualquier uso que infrinja la legislación española o europea aplicable.</li>
              </ul>
            </section>

            <section className={styles.section}>
              <h2>7. Propiedad intelectual</h2>
              <p>
                Todo el contenido de Myparking, incluyendo pero no limitado a el código fuente, diseño, logotipos, textos, gráficos y funcionalidades, es propiedad del equipo Myparking y está protegido por la legislación de propiedad intelectual española y europea.
              </p>
              <p>
                Se concede al usuario una <strong>licencia limitada, no exclusiva, intransferible y revocable</strong> para acceder y usar el Servicio para uso personal y no comercial.
              </p>
              <p>El código fuente del proyecto está disponible en <a href="https://github.com/SarayF1/Proyecto-DAW" target="_blank" rel="noreferrer">GitHub</a> bajo los términos de su licencia correspondiente.</p>
            </section>

            <section className={styles.section}>
              <h2>8. Limitación de responsabilidad</h2>
              <p>Myparking no será responsable de:</p>
              <ul>
                <li>Daños derivados del uso o imposibilidad de uso del Servicio.</li>
                <li>Interrupciones del servicio causadas por mantenimiento, fallos técnicos o causas de fuerza mayor.</li>
                <li>Pérdida de vehículos, objetos o daños materiales en las instalaciones de los parkings, cuya responsabilidad recae en los operadores de cada zona.</li>
                <li>Saldo perdido por acceso no autorizado a la cuenta del usuario cuando éste no haya protegido adecuadamente sus credenciales.</li>
              </ul>
              <p>En cualquier caso, la responsabilidad máxima de Myparking no excederá del importe abonado por el usuario en los 3 meses anteriores al evento causante del daño.</p>
            </section>

            <section className={styles.section}>
              <h2>9. Modificaciones del servicio y de los términos</h2>
              <p>
                Myparking se reserva el derecho de modificar, suspender o interrumpir el Servicio, así como de actualizar estos Términos en cualquier momento. Los cambios sustanciales serán notificados mediante aviso en la plataforma o por correo electrónico con al menos <strong>15 días de antelación</strong>. El uso continuado del Servicio tras la entrada en vigor de los nuevos términos implica su aceptación.
              </p>
            </section>

            <section className={styles.section}>
              <h2>10. Legislación aplicable y jurisdicción</h2>
              <p>
                Estos Términos se rigen por la legislación española. Para la resolución de cualquier controversia derivada del uso del Servicio, las partes se someten a los <strong>Juzgados y Tribunales de Las Palmas de Gran Canaria</strong>, con renuncia a cualquier otro fuero que pudiera corresponderles.
              </p>
              <p>
                Para consumidores de la Unión Europea, existe también la posibilidad de acceder a la plataforma europea de resolución de litigios en línea: <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noreferrer">ec.europa.eu/consumers/odr</a>.
              </p>
            </section>

            <section className={styles.section}>
              <h2>11. Contacto</h2>
              <p>Para cualquier consulta relacionada con estos Términos, puede contactarnos en:</p>
              <div className={styles.infoBox}>
                <div className={styles.infoRow}><span>Email</span><span>admin@myparking.com</span></div>
                <div className={styles.infoRow}><span>Dirección</span><span>IES Puerto del Rosario, Fuerteventura, Las Palmas</span></div>
                <div className={styles.infoRow}><span>Horario de atención</span><span>Lunes a viernes, 9:00–18:00 (hora peninsular)</span></div>
              </div>
            </section>

            <div className={styles.contactBox}>
              <h3>¿Tienes preguntas sobre los términos?</h3>
              <p>Escríbenos a <strong>admin@myparking.com</strong> y te responderemos en menos de 48 horas laborables.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
