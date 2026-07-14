import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { CartProvider } from './context/CartContext.tsx'
import { PartnerProvider } from './context/PartnerContext.tsx'
import { AdminProvider } from './context/AdminContext.tsx'
import { UserAuthProvider } from './context/UserAuthContext.tsx'
import ErrorBoundary from './components/ErrorBoundary.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AdminProvider>
          <UserAuthProvider>
            <CartProvider>
              <PartnerProvider>
                <App />
              </PartnerProvider>
            </CartProvider>
          </UserAuthProvider>
        </AdminProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
)
