<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAirtableStore } from '@/stores/useAirtableStore'
import LoanDetails from '@/components/LoanDetails.vue'

const airtable = useAirtableStore()
const expandedLoanId = ref<string | null>(null)
const searchTerm = ref('')

// Load data on mount
onMounted(() => {
  if (!airtable.loans.length) {
    airtable.fetchAll()
  }
})

// Toggle loan detail expansion
const toggleLoan = (loanId: string) => {
  expandedLoanId.value = expandedLoanId.value === loanId ? null : loanId
}

// Filter loans based on search term
const filteredLoans = computed(() => {
  if (!searchTerm.value.trim()) return airtable.loans

  return airtable.loans.filter(loan => {
    const dealName = loan.fields['⚡️ Deal Name'] || ''
    const loanId = loan.fields['⚡️ Loan ID'] || ''
    return (
      dealName.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      loanId.toLowerCase().includes(searchTerm.value.toLowerCase())
    )
  })
})
</script>

<template>
  <div>
    <div class="header-bar">
      <h1 class="title">
        Loan Conditions & Responses
        <span v-if="!airtable.loading && airtable.loans.length">
          ({{ filteredLoans.length }} of {{ airtable.loans.length }})
        </span>
      </h1>
      <input
        v-model="searchTerm"
        type="text"
        placeholder="Search by Deal Name or Loan ID"
        class="search-input"
      />
    </div>

    <div v-if="airtable.loading">Loading data...</div>
    <div v-else-if="airtable.error" class="error">{{ airtable.error }}</div>

    <ul v-else>
      <li
        v-for="loan in filteredLoans"
        :key="loan.id"
        class="loan-item"
      >
        <strong>{{ loan.fields['⚡️ Deal Name'] || 'Unnamed Deal' }}</strong><br />
        <small>Loan ID: {{ loan.fields['⚡️ Loan ID'] || 'N/A' }}</small><br />

        <button @click="toggleLoan(loan.id)" class="details-button">
          {{ expandedLoanId === loan.id ? 'Hide Details' : 'View Details' }}
        </button>

        <div v-if="expandedLoanId === loan.id" class="loan-details">
          <LoanDetails :loan-id="loan.id" />
        </div>
      </li>
    </ul>
  </div>
</template>


<style scoped>
.header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.title {
  font-size: 1.5rem;
  font-weight: bold;
}

.search-input {
  padding: 0.5rem 1rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
  max-width: 300px;
  width: 100%;
  transition: border-color 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: #007bff;
}

.loan-item {
  margin-bottom: 1rem;
  border-bottom: 1px solid #ddd;
  padding-bottom: 1rem;
}

.details-button {
  margin-top: 0.5rem;
  padding: 0.4rem 0.8rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.details-button:hover {
  background-color: #0056b3;
}

.loan-details {
  margin-top: 1rem;
}

.error {
  color: red;
  margin-bottom: 1rem;
}

</style>
