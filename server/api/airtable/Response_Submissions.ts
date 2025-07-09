import type { H3Event } from 'h3'
import { AirtableRecord, AirtableResponse } from '../../types/airtable'

export default defineEventHandler(async (event: H3Event) => {
  const config = useRuntimeConfig()

  const allResponseRecords: AirtableRecord[] = []
  let offset: string | undefined

  //  Step 1: Fetch all Response Submissions (with pagination)
  do {
    const url = new URL(`https://api.airtable.com/v0/${config.AIRTABLE_BASE_ID}/Response%20Submissions`)
    if (offset) url.searchParams.set('offset', offset)

    const responseData = await $fetch<AirtableResponse>(url.toString(), {
      headers: {
        Authorization: `Bearer ${config.AIRTABLE_API_KEY}`,
      },
    })

    allResponseRecords.push(...responseData.records)
    offset = responseData.offset
  } while (offset)

  // Step 2: Extract unique Deal Condition IDs from all responses
  const dealConditionIDs = new Set<string>()
  allResponseRecords.forEach(record => {
    const ids = record.fields['Deal Conditions'] || []
    ids.forEach((id: string) => dealConditionIDs.add(id))
  })

  // If no linked conditions, skip fetch
  let dealConditionsData: AirtableRecord[] = []
  if (dealConditionIDs.size > 0) {
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
          pageSize: 100,
        },
      }
    )

    dealConditionsData = dealConditionsResponse.records
  }

  const dealConditionMap = new Map<string, Record<string, any>>()
  dealConditionsData.forEach(dc => {
    dealConditionMap.set(dc.id, dc.fields)
  })

  // Step 3: Return enriched responses
  return allResponseRecords.map(record => ({
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
