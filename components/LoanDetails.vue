<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAirtableStore } from '@/stores/useAirtableStore'

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import ToggleButton from 'primevue/togglebutton'

const props = defineProps<{ loanId: string }>()

const airtable = useAirtableStore()
const expandedRows = ref([])

const showOnlyWithResponses = ref(false)

const loan = computed(() =>
  airtable.loans.find((l) => l.id === props.loanId)
)

const loanConditions = computed(() =>
  airtable.getConditionsByLoanId(props.loanId)
)

// Build a map for quick lookup of conditionId -> responses
const conditionResponseMap = computed(() => {
  const map = new Map<string, any[]>()
  airtable.responses.forEach(response => {
    response.dealConditions?.forEach((dc: any) => {
      const condId = dc['Record ID']
      if (!map.has(condId)) map.set(condId, [])
      map.get(condId)!.push(response)
    })
  })
  return map
})

const getResponsesByCondition = (conditionId: string) => {
  return conditionResponseMap.value.get(conditionId) || []
}

// Filter conditions with responses if toggled on
const filteredConditions = computed(() => {
  if (!showOnlyWithResponses.value) return loanConditions.value
  return loanConditions.value.filter(cond =>
    getResponsesByCondition(cond.fields['Record ID']).length > 0
  )
})
</script>

<template>
  <div v-if="loan" class="surface-ground p-4 border-round shadow-2">
    <h2 class="text-2xl font-bold mb-2">Loan: {{ loan.fields['⚡️ Deal Name'] || 'Unnamed' }}</h2>
    <p><strong>Loan ID:</strong> {{ loan.fields['⚡️ Loan ID'] || 'N/A' }}</p>
    <p><strong>Amount (Max):</strong> ${{ loan.fields['⚡️ Loan Amount (Max)']?.toLocaleString() || 'N/A' }}</p>

    <hr class="my-4" />

    <h3 class="text-xl font-semibold mb-3">
      Deal Conditions ({{ filteredConditions.length }} of {{ loanConditions.length }})
    </h3>
    <div class="mb-4 flex align-items-center gap-2">
      <ToggleButton v-model="showOnlyWithResponses" onLabel="Show All" offLabel="Show Only with Responses" />
    </div>

    <DataTable
      :value="filteredConditions"
      dataKey="id"
      :expandedRows.sync="expandedRows"
      class="p-datatable-sm surface-0 border-round shadow-2"
      stripedRows
      rowHover
      showGridlines
      responsiveLayout="scroll"
      paginator
      :rows="10"
    >
      <Column expander style="width: 3em" />
      <Column field="fields.DisplayName" header="Display Name" />
      <Column field="fields.Status" header="Status" />
      <Column field="fields.Category" header="Category" />

      <template #expansion="slotProps">
        <div class="p-4 surface-50 border-1 border-round border-gray-300">
          <h4 class="text-lg font-semibold mb-3">Condition Responses</h4>

          <DataTable
            :value="getResponsesByCondition(slotProps.data.fields['Record ID'])"
            v-if="getResponsesByCondition(slotProps.data.fields['Record ID']).length"
            class="p-datatable-sm"
            stripedRows
            showGridlines
          >
            <Column field="sortOrder" header="Sort Order" />
            <Column field="reviewStatus" header="Review Status" />
            <Column field="responseText" header="Response Text" />
            <Column field="responseType" header="Response Type" />
            <Column header="Deal Stage">
              <template #body="{ data }">
                {{ data.dealStage?.join(', ') || 'N/A' }}
              </template>
            </Column>
          </DataTable>

          <div v-else class="text-gray-500">No responses for this condition.</div>
        </div>
      </template>
    </DataTable>
  </div>

  <div v-else>
    <p>Loan not found.</p>
  </div>
</template>