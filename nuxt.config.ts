// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite';
export default defineNuxtConfig({
    compatibilityDate: '2025-07-15',
    devtools: { enabled: true },
    modules: ['@nuxt/ui', '@nuxt/eslint', '@nuxt/content'],
    devServer: { host: '0.0.0.0' },
    css: ['~/assets/css/main.css'],
    vite: { plugins: [tailwindcss()] },
});
