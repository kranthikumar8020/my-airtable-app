<script setup lang="ts">
import { onMounted } from 'vue'
import { useAirtableStore } from '@/stores/useAirtableStore'

const airtable = useAirtableStore()

onMounted(() => {
  if (!airtable.loans.length) {
    airtable.fetchAll()
  }
})
</script>

<template>
  <div>
    <h1>Loan Pipeline ({{ airtable.loans.length }})</h1>

    <div v-if="airtable.error" class="error">{{ airtable.error }}</div>
    <div v-else-if="airtable.loading">Loading loans...</div>

    <ul v-else>
      <li
        v-for="loan in airtable.loans"
        :key="loan.id"
        class="loan-item"
        style="margin-bottom: 2rem;"
      >
        <strong>{{ loan.fields['⚡️ Deal Name'] || 'Unnamed Deal' }}</strong>
        <div>Loan ID: {{ loan.fields['⚡️ Loan ID'] || 'N/A' }}</div>
        <div>Loan Amount (Max): ${{ loan.fields['⚡️ Loan Amount (Max)']?.toLocaleString() || 'N/A' }}</div>
        <div>Loan Amount (Day 1): ${{ loan.fields['⚡️ Loan Amount (Day 1)']?.toLocaleString() || 'N/A' }}</div>
        <div>Loan Amount (Rehab): ${{ loan.fields['⚡️ Loan Amount (Rehab)']?.toLocaleString() || 'N/A' }}</div>
        <div>Product Type: {{ loan.fields['⚡️ Product Type'] || 'N/A' }}</div>
        <div>Stage: {{ loan.fields['⚡️ Deal Stage'] || 'N/A' }}</div>
        <div>Lending Partner: {{ loan.fields['⚡️ Lending Partner'] || 'N/A' }}</div>
        <div>Lending Entity: {{ loan.fields['⚡️ Lending Entity'] || 'N/A' }}</div>
        <div>Loan Purpose: {{ loan.fields['⚡️ Loan Purpose'] || 'N/A' }}</div>
        <div>Closing Date: {{ loan.fields['⚡️ Closing Date'] || 'N/A' }}</div>
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
