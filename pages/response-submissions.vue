<script setup lang="ts">
import { onMounted } from 'vue'
import { useAirtableStore } from '@/stores/useAirtableStore'

const airtable = useAirtableStore()

onMounted(() => {
  if (!airtable.responses.length) {
    airtable.fetchAll()
  }
})
</script>

<template>
  <div>
    <h1>Response Submissions ({{ airtable.responses.length }})</h1>

    <div v-if="airtable.error" class="error">{{ airtable.error }}</div>
    <div v-else-if="airtable.loading">Loading...</div>

    <ul v-else>
      <li
  v-for="response in airtable.responses"
  :key="response.id"
  class="response-item"
  style="margin-bottom: 2rem;"
>
  <strong>Sort Order:</strong> {{ response.sortOrder }}<br />
  <strong>Review Status:</strong> {{ response.reviewStatus }}<br />
  <strong>Response Text:</strong> {{ response.responseText || '' }}<br />
  <strong>Response Type:</strong> {{ response.responseType || '' }}<br />
  <strong>Deal Stages:</strong>
  <span v-if="response.dealStage?.length">{{ response.dealStage.join(', ') }}</span>
  <span v-else>N/A</span>

  <div
    v-if="!response.dealConditions || response.dealConditions.length === 0"
    style="margin-left: 1rem; color: #777; margin-top: 0.5rem;"
  >
    Deal Conditions: None
  </div>

  <ul
    v-else
    style="margin-left: 1rem; margin-top: 0.5rem;"
  >
    <li
      v-for="condition in response.dealConditions"
      :key="condition?.['Record ID'] || condition?.DisplayName || Math.random()"
      style="margin-bottom: 0.5rem;"
    >
      <strong>{{ condition?.DisplayName || condition?.ConditionTitle || 'Unnamed Condition' }}</strong>
      <div>Category: {{ condition?.Category || 'N/A' }}</div>
      <div>Status: {{ condition?.Status || 'N/A' }}</div>
      <div>Source: {{ condition?.ConditionSource || 'N/A' }}</div>
      <div>Visibility: {{ condition?.Visibility || 'N/A' }}</div>
      <div>Deal Name: {{ condition?.['Deal Name']?.[0] || 'N/A' }}</div>
      <div>FD Loan ID: {{ condition?.['FD Loan ID']?.[0] || 'N/A' }}</div>
    </li>
  </ul>
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
