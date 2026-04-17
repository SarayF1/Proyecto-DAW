// src/components/LoadingScreen.jsx
import styles from './LoadingScreen.module.css'

export default function LoadingScreen() {
  return (
    <div className={styles.screen}>
      <div className={styles.logo}>
        <svg width="44" height="44" viewBox="0 0 32 32" fill="none">
          <path d="M6 10C6 7.79 7.79 6 10 6h12c2.21 0 4 1.79 4 4v8l-4 8H10l-4-8V10z" fill="#2F5D5B"/>
          <text x="16" y="22" textAnchor="middle" fontFamily="DM Serif Display, serif" fontSize="13" fill="#D6DEC7" fontWeight="bold">M</text>
        </svg>
        <span>Myparking</span>
      </div>
      <div className={styles.spinner} />
    </div>
  )
}
