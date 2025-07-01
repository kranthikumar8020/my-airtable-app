import type { H3Event } from 'h3'

import { AirtableRecord, AirtableResponse } from '../../types/airtable'


export default defineEventHandler(async (event: H3Event) => {
  const config = useRuntimeConfig()

  // 1. Fetch Response Submissions
  const responseData = await $fetch<AirtableResponse>(
    `https://api.airtable.com/v0/${config.AIRTABLE_BASE_ID}/Response%20Submissions`,
    {
      headers: {
        Authorization: `Bearer ${config.AIRTABLE_API_KEY}`,
      },
    }
  )

  // Extract all unique Deal Condition IDs from all responses
  const dealConditionIDs = new Set<string>()
  responseData.records.forEach(record => {
    const ids = record.fields['Deal Conditions'] || []
    ids.forEach((id: string) => dealConditionIDs.add(id))
  })

  // If no linked deal condition IDs, skip fetching deal conditions
  let dealConditionsData: AirtableRecord[] = []
  if (dealConditionIDs.size > 0) {
    // 2. Fetch Deal Conditions records by IDs using filterByFormula with OR()
    const filterFormula = `OR(${Array.from(dealConditionIDs)
      .map(id => `RECORD_ID()="${id}"`)
      .join(',')})`

    const dealConditionsResponse = await $fetch<AirtableResponse>(
      `https://api.airtable.com/v0/${config.AIRTABLE_BASE_ID}/Deal%20Conditions`,
      {
        headers: {
          Authorization: `Bearer ${config.AIRTABLE_API_KEY}`,
        },
        params: {
          filterByFormula: filterFormula,
          pageSize: 100, // optional: set page size if you have many records
        },
      }
    )
    dealConditionsData = dealConditionsResponse.records
  }

  // Map deal condition ID → full deal condition record fields
  const dealConditionMap = new Map<string, Record<string, any>>()
  dealConditionsData.forEach(dc => {
    dealConditionMap.set(dc.id, dc.fields)
  })

  // 3. Return cleaned Response Submissions with full Deal Conditions data
  return responseData.records.map(record => ({
    id: record.id,
    name: record.fields.Name || 'Unnamed',
    sortOrder: record.fields['Sort Order'] || 0,
    reviewStatus: record.fields['Review Status'] || 'Not Reviewed',
    responseText: record.fields['Response Text'] || '',
    responseType: record.fields['Response Type'] || '',
    dealStage: record.fields['⚡️ Deal Stage (from Deal Conditions)'] || [],
    dealConditions: (record.fields['Deal Conditions'] || []).map(
      (id: string) => dealConditionMap.get(id) || { id, missing: true }
    ),
  }))  
})
