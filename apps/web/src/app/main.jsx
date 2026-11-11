import { createRoot } from 'react-dom/client'
import '@/styles/index.css'
import '@/stores/themeStore.js'
import App from '@/app/App.jsx'

createRoot(document.getElementById('root')).render(
  <App />
)
