import { defineStore } from 'pinia';

export const useAirtableStore = defineStore('airtable', {
  state: () => ({
    loans: [] as any[],
    testLoans: [] as any[],
    conditions: [] as any[],
    responses: [] as any[],
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchAll() {
      this.loading = true;
      this.error = null;
      try {
        const [loansRes, testLoansRes, conditionsRes, responsesRes] = await Promise.all([
          $fetch<any[]>('/api/airtable/Loan_Pipeline'),
          $fetch<any[]>('/api/airtable/Loan_Pipeline_Test').catch((err) => {
            console.error('Failed to fetch Loan Pipeline Test:', err);
            return [];
          }),
          $fetch<any[]>('/api/airtable/Deal_Conditions'),
          $fetch<any[]>('/api/airtable/Response_Submissions'),
        ]);

        this.loans = loansRes;
        this.testLoans = testLoansRes;
        this.conditions = conditionsRes;
        this.responses = responsesRes;

        console.log('Fetched testLoans:', this.testLoans.length);
      } catch (err: any) {
        this.error = err.message || 'Failed to fetch data';
        console.error('Store fetch error:', err);
      } finally {
        this.loading = false;
      }
    },
  },
  getters: {
    getConditionsByLoanId: (state) => (loanId: string) => {
      const isTestLoan = state.testLoans.some(loan => loan.id === loanId);
      if (isTestLoan) {
        return [];
      }
      return state.conditions.filter((cond) =>
        cond.fields['Loan Pipeline']?.includes(loanId)
      );
    },
    getResponsesByConditionId: (state) => (conditionId: string) => {
      return state.responses.filter((resp) =>
        resp.dealConditions?.some((cond: any) => cond['Record ID'] === conditionId)
      );
    },
    getResponsesByLoanId: (state) => (loanId: string) => {
      const isTestLoan = state.testLoans.some(loan => loan.id === loanId);
      if (isTestLoan) {
        return [];
      }
      const conditionIds = state.conditions
        .filter(cond => cond.fields['Loan Pipeline']?.includes(loanId))
        .map(cond => cond.fields['Record ID']);
      return state.responses.filter(resp =>
        resp.dealConditions?.some((cond: any) => conditionIds.includes(cond['Record ID']))
      );
    },
  },
});