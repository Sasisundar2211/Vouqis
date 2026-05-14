import {VouqisSDK} from '../src/index.js'

const fakeMcpClient = {
  async callTool(name: string, params: Record<string, unknown>) {
    await new Promise(r => setTimeout(r, 50)) // simulate 50ms tool call
    return {content: [{type: 'text', text: `Result of ${name}`}]}
  },
}

const vouqis = new VouqisSDK({projectId: 'test-project-001'})
const client = vouqis.wrap(fakeMcpClient)

const result = await client.callTool('search_code', {query: 'console.log'})
console.log('Return value:', JSON.stringify(result))
console.log('Test passed: return value is correct:', (result as any).content[0].text === 'Result of search_code')
