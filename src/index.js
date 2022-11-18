import { createRoot } from 'react-dom/client'
import './styles.css'
// 3d plane
import App from './App'
// 2d plane, like shadertoy
import OtherApp from './OtherApp'

createRoot(document.getElementById('root')).render(<App />)
