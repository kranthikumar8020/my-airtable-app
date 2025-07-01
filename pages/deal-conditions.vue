<script setup lang="ts">
import { onMounted } from 'vue'
import { useAirtableStore } from '@/stores/useAirtableStore'

const airtable = useAirtableStore()

onMounted(() => {
  if (!airtable.conditions.length) {
    airtable.fetchAll()
  }
})
</script>

<template>
  <div>
    <h1>Deal Conditions ({{ airtable.conditions.length }})</h1>

    <div v-if="airtable.error" class="error">{{ airtable.error }}</div>
    <div v-else-if="airtable.loading">Loading...</div>

    <ul v-else>
      <li
        v-for="condition in airtable.conditions"
        :key="condition.id"
        class="condition-item"
        style="margin-bottom: 1.5rem;"
      >
        <strong>{{ condition.fields.DisplayName || condition.fields.ConditionTitle || 'Unnamed Condition' }}</strong>
        <div>ConditionTitle: {{ condition.fields.ConditionTitle || 'N/A' }}</div>
        <div>Category: {{ condition.fields.Category || 'N/A' }}</div>
        <div>Deal Stage: {{ condition.fields['⚡️ Deal Stage (from Loan Pipeline)']?.[0] || 'N/A' }}</div>
        <div>Status: {{ condition.fields.Status || 'N/A' }}</div>
        <div>Funding Door Comments: {{ condition.fields['Funding Door Comments'] || 'N/A' }}</div>
        <div>Record ID: {{ condition.fields['Record ID'] || 'N/A' }}</div>
        <div>Source: {{ condition.fields.ConditionSource || 'N/A' }}</div>
        <div>Visibility: {{ condition.fields.Visibility || 'N/A' }}</div>
        <div>FD Loan ID: {{ condition.fields['FD Loan ID']?.[0] || 'N/A' }}</div>
        <div>Deal Name: {{ condition.fields['Deal Name']?.[0] || 'N/A' }}</div>
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