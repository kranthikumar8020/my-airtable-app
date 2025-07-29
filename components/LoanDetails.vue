<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAirtableStore } from '@/stores/useAirtableStore'

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import ToggleButton from 'primevue/togglebutton'
import InputText from 'primevue/inputtext'

const props = defineProps<{ loanId: string }>()

const airtable = useAirtableStore()
const expandedRows = ref([])
const showOnlyWithResponses = ref(false)
const searchTerm = ref('')

const loan = computed(() =>
  airtable.loans.find((l) => l.id === props.loanId)
)

const loanConditions = computed(() =>
  airtable.getConditionsByLoanId(props.loanId)
)
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

const filteredConditions = computed(() => {
  let conditions = loanConditions.value
 
  if (showOnlyWithResponses.value) {
    conditions = conditions.filter(cond =>
      getResponsesByCondition(cond.fields['Record ID']).length > 0
    )
  }

  if (searchTerm.value.trim()) {
    const search = searchTerm.value.toLowerCase()
    conditions = conditions.filter(cond => {
      const displayName = cond.fields.DisplayName?.toLowerCase() || ''
      const status = cond.fields.Status?.toLowerCase() || ''
      const category = cond.fields.Category?.toLowerCase() || ''
      return displayName.includes(search) || status.includes(search) || category.includes(search)
    })
  }
  
  return conditions
})
const getStatusClass = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'cleared':
      return 'status-badge status-cleared'
    case 'waived':
      return 'status-badge status-waived'
    case 'omitted':
      return 'status-badge status-omitted'
    case 'partially fulfilled':
      return 'status-badge status-partial'
    case 'response received':
      return 'status-badge status-received'
    case 'review in progress':
      return 'status-badge status-review'
    case 'revision required':
      return 'status-badge status-revision'
    case 'awaiting response':
      return 'status-badge status-awaiting'
    default:
      return 'status-badge status-default'
  }
}
</script>

<template>
  <div v-if="loan" class="loan-details-container">
    <div class="loan-header">
      <h2 class="loan-title">{{ loan.fields['⚡️ Deal Name'] || 'Unnamed' }}</h2>
      <div class="loan-info-grid">
        <div class="info-item">
          <span class="info-label">Loan ID:</span>
          <span class="info-value">{{ loan.fields['⚡️ Loan ID'] || 'N/A' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Amount (Max):</span>
          <span class="info-value">${{ loan.fields['⚡️ Loan Amount (Max)']?.toLocaleString('en-US') || 'N/A' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Lending Partner:</span>
          <span class="info-value">{{ loan.fields['⚡️ Lending Partner'] || 'N/A' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Rate Lock Expiration:</span>
          <span class="info-value">
            {{ loan.fields['⚡️ Rate Lock Expiration']
              ? new Date(loan.fields['⚡️ Rate Lock Expiration']).toLocaleDateString('en-US')
              : 'N/A' }}
          </span>
        </div>
      </div>
    </div>

    <div class="conditions-section">
      <div class="section-header">
        <h3 class="section-title">
          Deal Conditions ({{ filteredConditions.length }} of {{ loanConditions.length }})
        </h3>
        <div class="controls">
          <div class="search-box">
            <InputText
              v-model="searchTerm"
              placeholder="Search conditions..."
              class="search-input"
            />
          </div>
          <ToggleButton 
            v-model="showOnlyWithResponses" 
            onLabel="Show All" 
            offLabel="Show Only with Responses"
            class="filter-toggle"
          />
        </div>
      </div>

      <DataTable
        :value="filteredConditions"
        dataKey="id"
        :expandedRows.sync="expandedRows"
        class="modern-datatable"
        stripedRows
        rowHover
        showGridlines
        responsiveLayout="scroll"
        paginator
        :rows="10"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} conditions"
        sortMode="multiple"
        removableSort
      >
        <Column expander style="width: 3em" />
        <Column 
          field="fields.DisplayName" 
          header="Display Name" 
          sortable
          style="min-width: 200px"
        />
        <Column 
          field="fields.Status" 
          header="Status" 
          sortable
          style="min-width: 120px"
        >
          <template #body="{ data }">
            <span :class="getStatusClass(data.fields.Status)">
              {{ data.fields.Status || 'N/A' }}
            </span>
          </template>
        </Column>
        <Column 
          field="fields.Category" 
          header="Category" 
          sortable
          style="min-width: 150px"
        />

        <template #expansion="slotProps">
          <div class="expansion-content">
            <h4 class="expansion-title">Response Submissions</h4>

            <DataTable
              :value="getResponsesByCondition(slotProps.data.fields['Record ID'])"
              v-if="getResponsesByCondition(slotProps.data.fields['Record ID']).length"
              class="nested-datatable"
              stripedRows
              showGridlines
              responsiveLayout="scroll"
            >
              <Column field="sortOrder" header="Sort Order" style="min-width: 100px" />
              <Column field="reviewStatus" header="Review Status" style="min-width: 120px" />
              <Column field="responseText" header="Response Text" style="min-width: 200px" />
              <Column field="responseType" header="Response Type" style="min-width: 120px" />
              <Column header="Deal Stage" style="min-width: 150px">
                <template #body="{ data }">
                  {{ data.dealStage?.join(', ') || 'N/A' }}
                </template>
              </Column>
            </DataTable>

            <div v-else class="no-responses">
              <i class="pi pi-info-circle"></i>
              No responses for this condition.
            </div>
          </div>
        </template>
      </DataTable>
    </div>
  </div>

  <div v-else class="not-found">
    <i class="pi pi-exclamation-triangle"></i>
    <p>Loan not found.</p>
  </div>
</template>

<style scoped>
.loan-details-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  margin: 1rem 0;
}

.loan-header {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  padding: 2rem;
}

.loan-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 1.5rem 0;
  color: white;
}

.loan-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-label {
  font-size: 0.875rem;
  opacity: 0.9;
  font-weight: 500;
}

.info-value {
  font-size: 1rem;
  font-weight: 600;
}

.conditions-section {
  padding: 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
}

.search-input {
  min-width: 250px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.search-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.filter-toggle {
  border-radius: 8px;
  border: 2px solid #3b82f6;
  background: white;
  color: #3b82f6;
  font-weight: 600;
  padding: 0.5rem 1rem;
  transition: all 0.2s ease;
  min-width: 180px;
}

.filter-toggle:hover {
  background: #eff6ff;
  border-color: #2563eb;
  color: #2563eb;
}

.filter-toggle:deep(.p-button.p-highlight) {
  background: #3b82f6 !important;
  border-color: #3b82f6 !important;
  color: white !important;
}

.filter-toggle:deep(.p-button.p-highlight:hover) {
  background: #2563eb !important;
  border-color: #2563eb !important;
  color: white !important;
}

.filter-toggle:deep(.p-button) {
  border-radius: 8px !important;
  font-weight: 600 !important;
  font-size: 0.875rem !important;
  padding: 0.5rem 1rem !important;
  transition: all 0.2s ease !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
}

.filter-toggle:deep(.p-button:not(.p-highlight)) {
  background: white !important;
  border-color: #3b82f6 !important;
  color: #3b82f6 !important;
}

.filter-toggle:deep(.p-button:not(.p-highlight):hover) {
  background: #eff6ff !important;
  border-color: #2563eb !important;
  color: #2563eb !important;
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.2) !important;
}

.modern-datatable {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.modern-datatable :deep(.p-datatable-header) {
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
  padding: 1rem;
}

.modern-datatable :deep(.p-datatable-thead > tr > th) {
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
  color: #374151;
  font-weight: 600;
  padding: 1rem 0.75rem;
  font-size: 0.875rem;
}

.modern-datatable :deep(.p-datatable-tbody > tr) {
  transition: background-color 0.2s ease;
}

.modern-datatable :deep(.p-datatable-tbody > tr:hover) {
  background-color: #f0f9ff !important;
}

.modern-datatable :deep(.p-datatable-tbody > tr > td) {
  padding: 1rem 0.75rem;
  border-bottom: 1px solid #f3f4f6;
  font-size: 0.875rem;
}

.modern-datatable :deep(.p-paginator) {
  background: #f8fafc;
  border-top: 1px solid #e5e7eb;
  padding: 1rem;
}

.modern-datatable :deep(.p-paginator .p-paginator-pages .p-paginator-page) {
  border-radius: 6px;
  margin: 0 0.125rem;
}

.modern-datatable :deep(.p-paginator .p-paginator-pages .p-paginator-page.p-highlight) {
  background: #3b82f6;
  border-color: #3b82f6;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.status-cleared {
  background: #dcfce7;
  color: #166534;
}

.status-waived {
  background: #dbeafe;
  color: #1e40af;
}

.status-omitted {
  background: #f3f4f6;
  color: #6b7280;
}

.status-partial {
  background: #fef3c7;
  color: #92400e;
}

.status-received {
  background: #d1fae5;
  color: #065f46;
}

.status-review {
  background: #fef3c7;
  color: #92400e;
}

.status-revision {
  background: #fee2e2;
  color: #991b1b;
}

.status-awaiting {
  background: #f3e8ff;
  color: #7c3aed;
}

.status-default {
  background: #f3f4f6;
  color: #374151;
}

.expansion-content {
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1.5rem;
  margin: 1rem 0;
}

.expansion-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 1rem 0;
}

.nested-datatable {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
}

.nested-datatable :deep(.p-datatable-thead > tr > th) {
  background: #f1f5f9;
  border-bottom: 1px solid #e2e8f0;
  color: #475569;
  font-weight: 600;
  padding: 0.75rem;
  font-size: 0.8rem;
}

.nested-datatable :deep(.p-datatable-tbody > tr > td) {
  padding: 0.75rem;
  border-bottom: 1px solid #f1f5f9;
  font-size: 0.8rem;
}

.no-responses {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  font-style: italic;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 6px;
  border: 1px dashed #d1d5db;
}

.not-found {
  text-align: center;
  padding: 3rem;
  color: #6b7280;
}

.not-found i {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #f59e0b;
}

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-input {
    min-width: auto;
  }
  
  .loan-info-grid {
    grid-template-columns: 1fr;
  }
}
</style>