// src/pages/PrivacyPage.jsx
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import styles from './LegalPage.module.css'

export default function PrivacyPage() {
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
            <div className={styles.badge}>Política de privacidad</div>
            <h1 className={styles.title}>Política de Privacidad</h1>
            <p className={styles.meta}>Última actualización: 1 de enero de 2025 · Versión 1.0</p>
          </div>

          <div className={styles.content}>
            <section className={styles.section}>
              <h2>1. Responsable del tratamiento</h2>
              <p>
                En cumplimiento del <strong>Reglamento (UE) 2016/679 (RGPD)</strong> y la <strong>Ley Orgánica 3/2018 de Protección de Datos Personales y garantía de los derechos digitales (LOPDGDD)</strong>, le informamos que el responsable del tratamiento de sus datos personales es:
              </p>
              <div className={styles.infoBox}>
                <div className={styles.infoRow}><span>Denominación</span><span>Myparking (Proyecto DAW)</span></div>
                <div className={styles.infoRow}><span>Centro</span><span>IES Puerto del Rosario, Fuerteventura</span></div>
                <div className={styles.infoRow}><span>Contacto</span><span>admin@myparking.com</span></div>
                <div className={styles.infoRow}><span>Ámbito</span><span>Puerto del Rosario, Las Palmas, España</span></div>
              </div>
            </section>

            <section className={styles.section}>
              <h2>2. Datos que recopilamos</h2>
              <p>Recopilamos los siguientes datos personales cuando utiliza Myparking:</p>
              <ul>
                <li><strong>Datos de registro:</strong> nombre, apellidos, dirección de correo electrónico y contraseña (almacenada con cifrado bcrypt).</li>
                <li><strong>Datos del vehículo:</strong> matrícula, marca, modelo y año de fabricación.</li>
                <li><strong>Datos de uso:</strong> reservas realizadas, fechas, zonas de aparcamiento y duración de estancias.</li>
                <li><strong>Datos financieros:</strong> saldo del monedero virtual y movimientos de recarga y gasto. <em>No almacenamos datos de tarjetas de crédito</em>; los pagos son procesados por Stripe.</li>
                <li><strong>Datos técnicos:</strong> dirección IP, tipo de navegador y datos de sesión mediante tokens JWT.</li>
              </ul>
            </section>

            <section className={styles.section}>
              <h2>3. Finalidad y base jurídica del tratamiento</h2>
              <table className={styles.table}>
                <thead>
                  <tr><th>Finalidad</th><th>Base jurídica</th></tr>
                </thead>
                <tbody>
                  <tr><td>Gestión de la cuenta de usuario y autenticación</td><td>Ejecución de contrato (art. 6.1.b RGPD)</td></tr>
                  <tr><td>Gestión de reservas y plazas de aparcamiento</td><td>Ejecución de contrato (art. 6.1.b RGPD)</td></tr>
                  <tr><td>Procesamiento de pagos y gestión del monedero</td><td>Ejecución de contrato (art. 6.1.b RGPD)</td></tr>
                  <tr><td>Comunicaciones de servicio (confirmaciones)</td><td>Interés legítimo (art. 6.1.f RGPD)</td></tr>
                  <tr><td>Cumplimiento de obligaciones legales</td><td>Obligación legal (art. 6.1.c RGPD)</td></tr>
                  <tr><td>Mejora del servicio mediante análisis de uso</td><td>Consentimiento (art. 6.1.a RGPD)</td></tr>
                </tbody>
              </table>
            </section>

            <section className={styles.section}>
              <h2>4. Conservación de los datos</h2>
              <p>Los datos personales se conservarán durante el tiempo necesario para cumplir con la finalidad para la que fueron recogidos:</p>
              <ul>
                <li>Datos de cuenta: mientras mantenga una cuenta activa en Myparking y durante <strong>3 años</strong> tras su cancelación.</li>
                <li>Historial de reservas: <strong>5 años</strong> por obligaciones contables y fiscales.</li>
                <li>Datos de pago: <strong>5 años</strong> de conformidad con la legislación fiscal española.</li>
                <li>Datos de acceso y seguridad: <strong>12 meses</strong>.</li>
              </ul>
            </section>

            <section className={styles.section}>
              <h2>5. Destinatarios y transferencias internacionales</h2>
              <p>Sus datos podrán ser comunicados a los siguientes destinatarios:</p>
              <ul>
                <li><strong>Stripe, Inc.</strong> — procesador de pagos, con sede en EE.UU. sujeto a las Cláusulas Contractuales Tipo de la UE y certificado bajo el Marco de Privacidad UE-EE.UU.</li>
                <li><strong>Railway</strong> — proveedor de base de datos en la nube, bajo contrato de encargado del tratamiento.</li>
                <li><strong>Render</strong> — proveedor de infraestructura de alojamiento, bajo contrato de encargado del tratamiento.</li>
                <li><strong>Google LLC</strong> — para autenticación OAuth 2.0, cuando el usuario elige "Iniciar sesión con Google".</li>
              </ul>
              <p>No realizamos transferencias internacionales fuera del marco legal aplicable.</p>
            </section>

            <section className={styles.section}>
              <h2>6. Sus derechos</h2>
              <p>De acuerdo con el RGPD, usted tiene derecho a:</p>
              <div className={styles.rightsGrid}>
                {[
                  { icon: '👁️', right: 'Acceso', desc: 'Obtener confirmación de si tratamos sus datos y acceder a ellos.' },
                  { icon: '✏️', right: 'Rectificación', desc: 'Solicitar la corrección de datos inexactos o incompletos.' },
                  { icon: '🗑️', right: 'Supresión', desc: 'Solicitar la eliminación de sus datos ("derecho al olvido").' },
                  { icon: '⏸️', right: 'Limitación', desc: 'Solicitar la restricción del tratamiento en determinados supuestos.' },
                  { icon: '📦', right: 'Portabilidad', desc: 'Recibir sus datos en formato estructurado y legible por máquina.' },
                  { icon: '🚫', right: 'Oposición', desc: 'Oponerse al tratamiento basado en interés legítimo.' },
                ].map(r => (
                  <div key={r.right} className={styles.rightCard}>
                    <span className={styles.rightIcon} aria-hidden="true">{r.icon}</span>
                    <strong>{r.right}</strong>
                    <p>{r.desc}</p>
                  </div>
                ))}
              </div>
              <p>Para ejercer sus derechos, envíe un correo a <strong>admin@myparking.com</strong> indicando el derecho que desea ejercer y adjuntando una copia de su documento de identidad. Responderemos en el plazo máximo de <strong>un mes</strong>.</p>
              <p>Si considera que el tratamiento de sus datos no es conforme a la normativa, puede presentar una reclamación ante la <strong>Agencia Española de Protección de Datos (AEPD)</strong> en <a href="https://www.aepd.es" target="_blank" rel="noreferrer">www.aepd.es</a>.</p>
            </section>

            <section className={styles.section}>
              <h2>7. Seguridad</h2>
              <p>Myparking aplica las siguientes medidas técnicas y organizativas para proteger sus datos:</p>
              <ul>
                <li>Cifrado de contraseñas con <strong>bcrypt</strong> (10 salt rounds).</li>
                <li>Autenticación mediante <strong>tokens JWT</strong> con expiración de 8 horas.</li>
                <li>Comunicaciones cifradas mediante <strong>HTTPS/TLS</strong>.</li>
                <li>Transacciones de base de datos con <strong>control de concurrencia (FOR UPDATE)</strong>.</li>
                <li>Validación y sanitización de todas las entradas mediante <strong>express-validator</strong>.</li>
                <li>Los datos de tarjetas de crédito <strong>nunca se almacenan</strong> en nuestros servidores; son procesados directamente por Stripe.</li>
              </ul>
            </section>

            <section className={styles.section}>
              <h2>8. Cookies</h2>
              <p>Myparking utiliza exclusivamente cookies de sesión técnicas necesarias para el funcionamiento del servicio (token de autenticación almacenado en <code>localStorage</code>). No utilizamos cookies de seguimiento, analítica ni publicidad de terceros.</p>
            </section>

            <section className={styles.section}>
              <h2>9. Cambios en esta política</h2>
              <p>Nos reservamos el derecho de actualizar esta Política de Privacidad. En caso de cambios sustanciales, le notificaremos mediante un aviso destacado en la aplicación o por correo electrónico. Le recomendamos revisar esta política periódicamente.</p>
            </section>

            <div className={styles.contactBox}>
              <h3>¿Preguntas sobre privacidad?</h3>
              <p>Puede contactarnos en cualquier momento en <strong>admin@myparking.com</strong></p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
