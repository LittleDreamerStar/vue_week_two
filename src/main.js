import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import Aura from '@primevue/themes/aura'
import PrimeVue from 'primevue/config'
import 'primeicons/primeicons.css'
import 'primeflex/primeflex.css'
import ToastService from 'primevue/toastservice'

const app = createApp(App)

app.use(router)
app.use(ToastService)

app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      darkMode: false
    }
  }
})

app.mount('#app')
