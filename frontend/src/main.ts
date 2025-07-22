import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './styles/tailwind.css';
import './styles/scss/base.scss'
import '@fortawesome/fontawesome-pro/css/all.css'
import App from './App.vue'
import router from './router'
import authPlugin from './plugins/auth'
import familyPlugin from './plugins/family'

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(authPlugin)
app.use(familyPlugin)

app.mount('#app')
