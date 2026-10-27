import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Header from './components/Header'
import PrivacyPolicy from './components/PrivacyPolicy'
import Footer from './components/Footer'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Header />
    <main>
      <PrivacyPolicy />
    </main>
    <Footer />
  </StrictMode>,
)
