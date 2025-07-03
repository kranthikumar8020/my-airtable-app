<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAirtableStore } from '@/stores/useAirtableStore'
import LoanDetails from '@/components/LoanDetails.vue'

const airtable = useAirtableStore()
const expandedLoanId = ref<string | null>(null)

// Load all data (loans, conditions, responses) once
onMounted(() => {
  if (!airtable.loans.length) {
    airtable.fetchAll()
  }
})
const loanHasResponses = (loanId: string) => {
  return airtable.getResponsesByLoanId(loanId).length > 0
}
const toggleLoan = (loanId: string) => {
  expandedLoanId.value = expandedLoanId.value === loanId ? null : loanId
}
</script>

<template>
  <div>
    <h1>Loan Conditions & Responses 
      <span v-if="!airtable.loading && airtable.loans.length">
    ({{ airtable.loans.length }})
      </span>
    </h1>

    <div v-if="airtable.loading">Loading data...</div>
    <div v-else-if="airtable.error" class="error">{{ airtable.error }}</div>

    <ul v-else>
      <li
        v-for="loan in airtable.loans"
        :key="loan.id"
        style="margin-bottom: 1rem; border-bottom: 1px solid #ddd; padding-bottom: 1rem;"
      >
        <strong>{{ loan.fields['⚡️ Deal Name'] || 'Unnamed Deal' }}</strong><br />
        <small>Loan ID: {{ loan.fields['⚡️ Loan ID'] || 'N/A' }}</small><br />

        <button @click="toggleLoan(loan.id)" style="margin-top: 0.5rem;">
          {{ expandedLoanId === loan.id ? 'Hide Details' : 'View Details' }}
        </button>
        <div v-if="expandedLoanId === loan.id" style="margin-top: 1rem;">
          <LoanDetails :loan-id="loan.id" />
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.error {
  color: red;
  margin-bottom: 1rem;
}
</style>