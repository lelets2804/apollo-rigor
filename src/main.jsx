import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import Root from './Root'
import { ThemeProvider } from './ThemeContext'
import { seedPedidosDemo } from './store/pedidos'

// Popula "Meus pedidos" do cliente exemplo na primeira visita (sem sobrescrever
// nada depois). Ver src/store/pedidos.js.
seedPedidosDemo()

ReactDOM.createRoot(document.getElementById('root')).render(
  <ThemeProvider>
    <Root />
  </ThemeProvider>
)
