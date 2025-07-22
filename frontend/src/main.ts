import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './styles/tailwind.css';
import './styles/scss/base.scss'
import '@fortawesome/fontawesome-pro/css/all.css'
import App from './App.vue'
import router from './router'
import authPlugin from './plugins/auth'
import familyPlugin from './plugins/family'
import websocketService from './services/websocket.service'
import webSocketUpdateService from './services/websocket-update.service'

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(authPlugin)
app.use(familyPlugin)

// Initialize WebSocket services after stores are available
app.config.globalProperties.$websocket = websocketService
app.config.globalProperties.$websocketUpdates = webSocketUpdateService

app.mount('#app')
