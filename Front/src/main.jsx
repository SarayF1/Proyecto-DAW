import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { GoogleOAuthProvider } from '@react-oauth/google'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import './styles/index.css'

const GOOGLE_CLIENT_ID = '798420012132-75ftcllpv2hje8lokrmhmgp85i58o760.apps.googleusercontent.com'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <AuthProvider>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#2F5D5B',
                color: '#D6DEC7',
                borderRadius: '12px',
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '0.9rem',
              },
              success: { iconTheme: { primary: '#7FC9A8', secondary: '#2F5D5B' } },
              error: { iconTheme: { primary: '#F0997B', secondary: '#2F5D5B' } },
            }}
          />
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>
)
