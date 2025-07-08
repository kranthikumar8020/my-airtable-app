// plugins/primevue.ts
import PrimeVue from 'primevue/config'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import 'primevue/resources/themes/aura-light-blue/theme.css' // <- change theme file here

export default defineNuxtPlugin(nuxtApp => {
  nuxtApp.vueApp.use(PrimeVue)
  nuxtApp.vueApp.component('DataTable', DataTable)
  nuxtApp.vueApp.component('Column', Column)
  nuxtApp.vueApp.component('Button', Button)
})
