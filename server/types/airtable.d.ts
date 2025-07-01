export interface AirtableRecord<T = any> {
    id: string
    fields: T
    createdTime: string
  }
  
  export interface AirtableResponse<T = any> {
    records: AirtableRecord<T>[]
    offset?: string
  }
  