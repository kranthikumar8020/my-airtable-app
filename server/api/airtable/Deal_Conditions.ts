import type { H3Event } from 'h3'

import { AirtableRecord, AirtableResponse } from '../../types/airtable'


export default defineEventHandler(async (event: H3Event): Promise<AirtableRecord[]> => {
  const config = useRuntimeConfig()

  const allRecords: AirtableRecord[] = []
  let offset: string | undefined = undefined

  do {
    const url = new URL(`https://api.airtable.com/v0/${config.AIRTABLE_BASE_ID}/Deal%20Conditions`)
    if (offset) {
      url.searchParams.set('offset', offset)
    }

    const response = await $fetch<AirtableResponse>(url.toString(), {
      headers: {
        Authorization: `Bearer ${config.AIRTABLE_API_KEY}`,
      },
    })

    allRecords.push(...response.records)
    offset = response.offset
  } while (offset)

  return allRecords
})
