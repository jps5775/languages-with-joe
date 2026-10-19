import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router'
import './index.css'
import App from './App.tsx'
import Layout from './Layout.tsx'
import ProtectedThanks from './ProtectedThanks.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/thanks" element={<ProtectedThanks />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  </StrictMode>,
)
