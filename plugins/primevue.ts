// plugins/primevue.ts
import PrimeVue from 'primevue/config'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Toast from 'primevue/toast'
import ToastService from 'primevue/toastservice'

export default defineNuxtPlugin(nuxtApp => {
  nuxtApp.vueApp.use(PrimeVue)
  nuxtApp.vueApp.use(ToastService)
  nuxtApp.vueApp.component('DataTable', DataTable)
  nuxtApp.vueApp.component('Column', Column)
  nuxtApp.vueApp.component('Button', Button)
  nuxtApp.vueApp.component('InputText', InputText)
  nuxtApp.vueApp.component('Toast', Toast)
})
