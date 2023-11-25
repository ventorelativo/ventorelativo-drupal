import fetch from 'node-fetch'
import { schedule } from '@netlify/functions'

// This is a sample build hook URL
const BUILD_HOOK =
  'https://api.netlify.com/build_hooks/6561cff7af5aa319e798ddf9'

// Schedules the handler function to run at 1pm UTC every day
const handler = schedule('0 12,13,14,18,20,22 * * *', async () => {
  await fetch(BUILD_HOOK, {
    method: 'POST'
  }).then(response => {
    console.log('Build hook response:', response)
  })

  return {
    statusCode: 200
  }
})

export { handler }
