import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { CartProvider } from './context/CartContext.tsx'
import { PartnerProvider } from './context/PartnerContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <CartProvider>
        <PartnerProvider>
          <App />
        </PartnerProvider>
      </CartProvider>
    </BrowserRouter>
  </StrictMode>,
)
