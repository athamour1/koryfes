import { createI18n } from 'vue-i18n'
import en from '@/i18n/locales/en.json'
import el from '@/i18n/locales/el.json'

export default ({ app }) => {
    const i18n = createI18n({
        locale: 'el',
        fallbackLocale: 'en',
        legacy: false,
        globalInjection: true,
        messages: {
            en,
            el
        }
    })

    app.use(i18n)
}
