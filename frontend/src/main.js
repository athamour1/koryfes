import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { Quasar, Notify } from 'quasar'
import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/src/css/index.sass'
import './css/app.css'
import App from './App.vue'
import router from './router'

const myApp = createApp(App)

myApp.use(createPinia())
myApp.use(router)
myApp.use(Quasar, {
    plugins: {
        Notify
    },
})

myApp.mount('#app')
