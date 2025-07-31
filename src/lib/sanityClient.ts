import { createClient } from '@sanity/client'

export const sanityClient = createClient({
  projectId: 'jrlt8k3v',
  dataset: 'production',
  apiVersion: '2023-07-31',
  useCdn: true,
})

export default sanityClient 