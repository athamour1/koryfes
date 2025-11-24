import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { Quasar, Notify, Dialog } from 'quasar'
import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/src/css/index.sass'
import './css/app.css'
import './css/admin-pages.css'
import App from './App.vue'
import router from './router'

import i18n from './i18n'

const myApp = createApp(App)

myApp.use(createPinia())
myApp.use(router)
myApp.use(i18n)
myApp.use(Quasar, {
    plugins: {
        Notify,
        Dialog
    },
})

myApp.mount('#app')
