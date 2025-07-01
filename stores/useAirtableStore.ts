import { defineStore } from 'pinia'

export const useAirtableStore = defineStore('airtable', {
  state: () => ({
    loans: [] as any[],
    conditions: [] as any[],
    responses: [] as any[],
    loading: false,
    error: null as string | null
  }),

  actions: {
    async fetchAll() {
      this.loading = true
      this.error = null
      try {
        const [loansRes, conditionsRes, responsesRes] = await Promise.all([
          $fetch<any[]>('/api/airtable/Loan_Pipeline'),
          $fetch<any[]>('/api/airtable/Deal_Conditions'),
          $fetch<any[]>('/api/airtable/Response_Submissions')
        ])
  
        this.loans = loansRes
        this.conditions = conditionsRes
        this.responses = responsesRes
      } catch (err: any) {
        this.error = err.message || 'Failed to fetch data'
        console.error('Store fetch error:', err)
      } finally {
        this.loading = false
      }
    }
  },
  getters: {
    // Conditions linked to a loan
    getConditionsByLoanId: (state) => (loanId: string) => {
      return state.conditions.filter((cond) =>
        cond.fields['Loan Pipeline']?.includes(loanId)
      )
    },
  
    // Responses linked to a condition
    getResponsesByConditionId: (state) => (conditionId: string) => {
      return state.responses.filter((resp) =>
        resp.dealConditions?.some((cond: any) => cond['Record ID'] === conditionId)
      )
    },
  
    // Responses indirectly linked to a loan through conditions
    getResponsesByLoanId: (state) => (loanId: string) => {
      const conditionIds = state.conditions
        .filter(cond => cond.fields['Loan Pipeline']?.includes(loanId))
        .map(cond => cond.fields['Record ID'])
  
      return state.responses.filter(resp =>
        resp.dealConditions?.some((cond: any) =>
          conditionIds.includes(cond['Record ID'])
        )
      )
    }
  }
  
})
