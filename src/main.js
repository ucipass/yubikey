import { createApp } from 'vue'
import store from "./store.js"
import { loadSettings } from "./components/helpers.js"
import App from './App.vue'
import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap"

loadSettings()
const app = createApp(App)
app.use(store)
app.mount('#app')
