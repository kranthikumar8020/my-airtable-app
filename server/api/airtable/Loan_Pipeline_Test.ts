import type { H3Event } from 'h3';
import { AirtableRecord, AirtableResponse } from '/Users/macbook/my-airtable-app/server/types/airtable';

export default defineEventHandler(async (event: H3Event) => {
  const config = useRuntimeConfig();
  
  // Handle POST requests to create new records
  if (event.method === 'POST') {
    const body = await readBody(event);
    
    try {
      const response = await $fetch(`https://api.airtable.com/v0/${config.AIRTABLE_BASE_ID}/Loan%20Pipeline%20Test`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: {
          records: [
            {
              fields: {
                '⚡️ Deal Name': body.dealName,
                '⚡️ Loan Amount (Max)': body.loanAmount,
                '⚡️ Product Type': body.productType,
              }
            }
          ]
        }
      });
      
      return response;
    } catch (error) {
      console.error('Error creating record:', error);
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to create record in Airtable'
      });
    }
  }
  const all: AirtableRecord[] = [];
  let offset: string | undefined;

  do {
    const url = new URL(`https://api.airtable.com/v0/${config.AIRTABLE_BASE_ID}/Loan%20Pipeline%20Test`);
    if (offset) url.searchParams.set('offset', offset);

    const resp = await $fetch<AirtableResponse>(url.toString(), {
      headers: { Authorization: `Bearer ${config.AIRTABLE_API_KEY}` },
    });

    all.push(...resp.records);
    offset = resp.offset;
  } while (offset);

  return all;
});
