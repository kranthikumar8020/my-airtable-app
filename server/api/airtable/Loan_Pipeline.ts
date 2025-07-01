import type { H3Event } from 'h3'

import { AirtableRecord, AirtableResponse } from '../../types/airtable'


export default defineEventHandler(async (event: H3Event): Promise<AirtableRecord[]> => {
  const config = useRuntimeConfig()
  const all: AirtableRecord[] = []
  let offset: string | undefined = undefined

  do {
    const url = new URL(`https://api.airtable.com/v0/${config.AIRTABLE_BASE_ID}/Loan%20Pipeline`)
    if (offset) url.searchParams.set('offset', offset)

    const resp = await $fetch<AirtableResponse>(url.toString(), {
      headers: { Authorization: `Bearer ${config.AIRTABLE_API_KEY}` }
    })

    all.push(...resp.records)
    offset = resp.offset
  } while (offset)

  return all
})