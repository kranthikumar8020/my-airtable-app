<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useAirtableStore } from '@/stores/useAirtableStore';
import LoanDetails from '@/components/LoanDetails.vue';
import AddLoan from '@/components/AddLoan.vue';

const airtable = useAirtableStore();
const expandedLoanId = ref<string | null>(null);
const searchTerm = ref('');
const showTestLoans = ref(false);

onMounted(() => {
  if (!airtable.loans.length || !airtable.testLoans.length) {
    airtable.fetchAll();
  }
});

const toggleLoan = (loanId: string) => {
  expandedLoanId.value = expandedLoanId.value === loanId ? null : loanId;
};

const filteredLoans = computed(() => {
  const source = showTestLoans.value ? airtable.testLoans : airtable.loans;
  if (!searchTerm.value.trim()) return source;

  const filtered = source.filter(loan => {
    const dealName = loan.fields['⚡️ Deal Name'] || '';
    const loanId = loan.fields['⚡️ Loan ID'] || '';
    return (
      dealName.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      loanId.toLowerCase().includes(searchTerm.value.toLowerCase())
    );
  });
  console.log('Filtered Loans (showTestLoans:', showTestLoans.value, '):', filtered.length);
  return filtered;
});

watch(showTestLoans, (newValue) => {
  console.log('showTestLoans changed to:', newValue, 'testLoans length:', airtable.testLoans.length);
});
</script>

<template>
  <div>
    <div class="header-bar">
  <h1 class="title">
    Loan Conditions & Responses
    <span v-if="!airtable.loading && airtable.loans.length">
      ({{ filteredLoans.length }} of {{ (showTestLoans ? airtable.testLoans : airtable.loans).length }})
    </span>
  </h1>

  <div class="search-controls">
  <label class="checkbox-label">
    <input type="checkbox" v-model="showTestLoans" />
    Show Loan Pipeline Test
  </label>

  <input
    v-model="searchTerm"
    type="text"
    placeholder="Search by Deal Name or Loan ID"
    class="search-input"
  />
</div>

</div>
    <AddLoan />

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
        <span v-if="showTestLoans" class="product-type">
          <small>Product Type: {{ loan.fields['⚡️ Product Type'] || 'N/A' }}</small>
        </span>
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
.controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-left: auto;
}

.search-input {
  padding: 0.5rem;
  font-size: 1rem;
  min-width: 280px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
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

.product-type {
  display: block;
  margin-top: 0.25rem;
}

.details-button {
  padding: 0.4rem 0.8rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 0.25rem;
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
.search-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  width: 100%;
  flex-wrap: wrap;
}
.search-input {
  flex-shrink: 1;
  max-width: 300px;
  width: 100%;
}
</style>