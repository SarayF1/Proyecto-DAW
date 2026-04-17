// src/components/EcoModal.jsx
// Post-reservation upsell modal — +1€ to plant trees with TeamTrees
// Pure front-end: no real payment, just UI flow

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import styles from './EcoModal.module.css'

// Animated tree SVG illustration
function TreeIllustration({ grown }) {
  return (
    <svg viewBox="0 0 240 180" className={styles.treesvg} aria-hidden="true">
      {/* Sky */}
      <rect x="0" y="0" width="240" height="180" fill="#e8f5e0" rx="12"/>
      {/* Sun */}
      <circle cx="200" cy="30" r="18" fill="#FFD166" opacity="0.9"/>
      {/* Sun rays */}
      {[0,45,90,135,180,225,270,315].map(a => (
        <line key={a}
          x1={200 + Math.cos(a*Math.PI/180)*22}
          y1={30 + Math.sin(a*Math.PI/180)*22}
          x2={200 + Math.cos(a*Math.PI/180)*29}
          y2={30 + Math.sin(a*Math.PI/180)*29}
          stroke="#FFD166" strokeWidth="2.5" strokeLinecap="round" opacity="0.7"
        />
      ))}
      {/* Ground */}
      <ellipse cx="120" cy="162" rx="110" ry="14" fill="#c5ddb0"/>
      <rect x="10" y="158" width="220" height="22" fill="#c5ddb0" rx="4"/>

      {/* Background trees (small) */}
      <g opacity="0.5">
        <rect x="28" y="128" width="6" height="30" fill="#8B6914"/>
        <ellipse cx="31" cy="118" rx="14" ry="18" fill="#4a9e52"/>
        <rect x="195" y="132" width="5" height="26" fill="#8B6914"/>
        <ellipse cx="197" cy="124" rx="11" ry="14" fill="#3d8a44"/>
      </g>

      {/* Main trunk */}
      <motion.rect
        x="111" y="120" width="18" height="42" rx="4"
        fill="#8B6914"
        initial={{ scaleY: 0, originY: 1 }}
        animate={{ scaleY: grown ? 1 : 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{ transformOrigin: '120px 162px' }}
      />

      {/* Main canopy layers */}
      <motion.ellipse cx="120" cy="105" rx="38" ry="30"
        fill="#2d7d3a"
        initial={{ scale: 0 }} animate={{ scale: grown ? 1 : 0 }}
        transition={{ duration: 0.5, delay: 0.3, ease: 'backOut' }}
        style={{ transformOrigin: '120px 105px' }}
      />
      <motion.ellipse cx="120" cy="90" rx="30" ry="26"
        fill="#3a9a44"
        initial={{ scale: 0 }} animate={{ scale: grown ? 1 : 0 }}
        transition={{ duration: 0.5, delay: 0.45, ease: 'backOut' }}
        style={{ transformOrigin: '120px 90px' }}
      />
      <motion.ellipse cx="120" cy="77" rx="22" ry="20"
        fill="#4db85a"
        initial={{ scale: 0 }} animate={{ scale: grown ? 1 : 0 }}
        transition={{ duration: 0.5, delay: 0.6, ease: 'backOut' }}
        style={{ transformOrigin: '120px 77px' }}
      />
      {/* Top highlight */}
      <motion.ellipse cx="116" cy="69" rx="10" ry="8"
        fill="#62d070" opacity="0.5"
        initial={{ scale: 0 }} animate={{ scale: grown ? 1 : 0 }}
        transition={{ duration: 0.4, delay: 0.75 }}
        style={{ transformOrigin: '116px 69px' }}
      />

      {/* CO₂ bubbles floating up */}
      {grown && [
        { x: 100, delay: 0.9,  size: 6 },
        { x: 132, delay: 1.1,  size: 4 },
        { x: 115, delay: 1.35, size: 5 },
      ].map((b, i) => (
        <motion.g key={i}>
          <motion.circle
            cx={b.x} cy={55} r={b.size}
            fill="none" stroke="#2F5D5B" strokeWidth="1.5" opacity="0.5"
            initial={{ y: 0, opacity: 0.5 }}
            animate={{ y: -30, opacity: 0 }}
            transition={{ duration: 2, delay: b.delay, repeat: Infinity, repeatDelay: 1.5 }}
          />
          <motion.text x={b.x - 7} y={56} fontSize="7" fill="#2F5D5B" opacity="0.45"
            initial={{ y: 0, opacity: 0.45 }}
            animate={{ y: -30, opacity: 0 }}
            transition={{ duration: 2, delay: b.delay, repeat: Infinity, repeatDelay: 1.5 }}
          >CO₂</motion.text>
        </motion.g>
      ))}

      {/* Leaf accent on ground */}
      {grown && (
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
          <ellipse cx="90"  cy="157" rx="8"  ry="4" fill="#4db85a" opacity="0.6" transform="rotate(-20 90 157)"/>
          <ellipse cx="152" cy="159" rx="6"  ry="3" fill="#3a9a44" opacity="0.5" transform="rotate(15 152 159)"/>
        </motion.g>
      )}

      {/* Bird */}
      {grown && (
        <motion.g
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          <path d="M60 42 Q65 38 70 42" stroke="#2F5D5B" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
          <path d="M70 42 Q75 38 80 42" stroke="#2F5D5B" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        </motion.g>
      )}
    </svg>
  )
}

// Animated counter going up to a number
function AnimatedCount({ to, duration = 1.8 }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let start = null
    const step = (ts) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / (duration * 1000), 1)
      setVal(Math.floor(progress * to))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [to, duration])
  return <>{val.toLocaleString('es-ES')}</>
}

// ── Main Modal ─────────────────────────────────────────────────────────────────
export default function EcoModal({ isOpen, onDonate, onSkip, zoneName }) {
  const [donated,  setDonated]  = useState(false)
  const [grown,    setGrown]    = useState(false)
  const [treesNum] = useState(() => 24_672_800 + Math.floor(Math.random() * 500))

  useEffect(() => {
    if (isOpen) {
      setDonated(false)
      // delay tree grow for dramatic effect
      const t = setTimeout(() => setGrown(true), 300)
      return () => clearTimeout(t)
    } else {
      setGrown(false)
    }
  }, [isOpen])

  const handleDonate = () => {
    setDonated(true)
  }

  const handleClose = () => {
    setDonated(false)
    onSkip()
  }

  const handleDonateAndGo = () => {
    onDonate()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label="Donación para plantar árboles"
        >
          <motion.div
            className={styles.modal}
            initial={{ opacity: 0, y: 32, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {/* Skip button — subtle, top right */}
            {!donated && (
              <button className={styles.skipBtn} onClick={handleClose} aria-label="Saltar donación">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            )}

            <AnimatePresence mode="wait">
              {!donated ? (
                /* ── Upsell screen ── */
                <motion.div
                  key="upsell"
                  className={styles.upsellScreen}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Illustration */}
                  <div className={styles.illustrationWrap}>
                    <TreeIllustration grown={grown} />
                    {/* Live counter badge */}
                    <motion.div
                      className={styles.counterBadge}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.8 }}
                    >
                      <span className={styles.counterNum}>
                        <AnimatedCount to={treesNum} duration={1.8} />
                      </span>
                      <span className={styles.counterLabel}>árboles plantados</span>
                    </motion.div>
                  </div>

                  {/* Copy */}
                  <div className={styles.copy}>
                    <div className={styles.tagLine}>
                      <span className={styles.leafIcon} aria-hidden="true">🌱</span>
                      Myparking × TeamTrees
                    </div>

                    <h2 className={styles.headline}>
                      Tu aparcamiento puede<br />
                      <em>salvar un árbol</em>
                    </h2>

                    <p className={styles.body}>
                      Por solo <strong>+1 €</strong> extra en tu reserva en <strong>{zoneName}</strong>, plantaremos un árbol real junto a{' '}
                      <a href="https://teamtrees.org" target="_blank" rel="noreferrer" className={styles.teamLink}>
                        #TeamTrees
                      </a>
                      {' '}— la iniciativa que ya ha plantado más de 24 millones de árboles en todo el mundo.
                    </p>

                    <div className={styles.statsRow}>
                      {[
                        { icon: '🌍', val: '24M+', label: 'árboles plantados' },
                        { icon: '💨', val: '48 kg', label: 'CO₂ absorbido/árbol' },
                        { icon: '🐦', val: '1€',    label: '= 1 árbol real' },
                      ].map(s => (
                        <div key={s.val} className={styles.statItem}>
                          <span className={styles.statIcon} aria-hidden="true">{s.icon}</span>
                          <strong className={styles.statVal}>{s.val}</strong>
                          <span className={styles.statLabel}>{s.label}</span>
                        </div>
                      ))}
                    </div>

                    <p className={styles.subText}>
                      El 100% de la donación va directamente a la Arbor Day Foundation, certificada por TeamTrees. Tu árbol se planta en zonas de reforestación prioritarias a nivel mundial.
                    </p>
                  </div>

                  {/* CTA buttons */}
                  <div className={styles.ctaGroup}>
                    <motion.button
                      className={styles.donateBtn}
                      onClick={handleDonate}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className={styles.donateBtnIcon} aria-hidden="true">🌳</span>
                      Sí, planto un árbol por +1 €
                    </motion.button>

                    <button className={styles.skipLink} onClick={handleClose}>
                      No gracias, continuar sin donar
                    </button>
                  </div>

                  {/* Trust badges */}
                  <div className={styles.trustRow}>
                    <div className={styles.trustBadge}>
                      <span aria-hidden="true">🔒</span> Pago seguro
                    </div>
                    <div className={styles.trustBadge}>
                      <span aria-hidden="true">✅</span> Arbor Day Foundation
                    </div>
                    <div className={styles.trustBadge}>
                      <span aria-hidden="true">🌿</span> Certificado
                    </div>
                  </div>
                </motion.div>

              ) : (
                /* ── Thank-you / success screen ── */
                <motion.div
                  key="thanks"
                  className={styles.thanksScreen}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.35, ease: 'backOut' }}
                >
                  <motion.div
                    className={styles.thanksTreeWrap}
                    animate={{ rotate: [0, -3, 3, -2, 2, 0] }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    <TreeIllustration grown={true} />
                  </motion.div>

                  <motion.div
                    className={styles.thanksConfetti}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {['🌿','🍃','🌱','💚','🌍','✨'].map((e, i) => (
                      <motion.span
                        key={i}
                        className={styles.confettiPiece}
                        initial={{ y: 0, x: 0, opacity: 1 }}
                        animate={{ y: -60 - i * 12, x: (i - 3) * 18, opacity: 0 }}
                        transition={{ duration: 1.2, delay: 0.3 + i * 0.08 }}
                        aria-hidden="true"
                      >
                        {e}
                      </motion.span>
                    ))}
                  </motion.div>

                  <h2 className={styles.thanksTitle}>¡Gracias por el planeta! 🌍</h2>
                  <p className={styles.thanksBody}>
                    Tu árbol ya está en camino. Con tu donación de <strong>1 €</strong>, has contribuido a que #TeamTrees alcance los{' '}
                    <strong>25 millones</strong> de árboles plantados.
                  </p>

                  <div className={styles.thanksCard}>
                    <div className={styles.thanksCardRow}>
                      <span>🌳 Tu árbol</span>
                      <strong>1 árbol plantado</strong>
                    </div>
                    <div className={styles.thanksCardRow}>
                      <span>📍 Zona</span>
                      <strong>{zoneName}</strong>
                    </div>
                    <div className={styles.thanksCardRow}>
                      <span>💚 Donación</span>
                      <strong>1,00 €</strong>
                    </div>
                    <div className={styles.thanksCardRow}>
                      <span>🌐 Organización</span>
                      <a href="https://teamtrees.org" target="_blank" rel="noreferrer" className={styles.thanksLink}>
                        TeamTrees.org
                      </a>
                    </div>
                  </div>

                  <motion.button
                    className={styles.goNavBtn}
                    onClick={handleDonateAndGo}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" aria-hidden="true">
                      <polygon points="3 11 22 2 13 21 11 13 3 11"/>
                    </svg>
                    Navegar al parking
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
