import fixtures, { FixtureMockStreams } from './fixtures/fixtures'
import { BlockFiCsv } from '../BlockFiCsv'
import path from 'path'
import { OUTPUT_DIR } from '../../constants'
const sourceCsv = fixtures.loadFixture('BlockFi')

describe('BlockFi', () => {
  const sourceFile = 'some/source/file.csv'
  const timezone = 'America/Chicago'
  let testee: BlockFiCsv

  let mocks: FixtureMockStreams

  beforeEach(() => {
    mocks = fixtures.setupMockStreams(sourceCsv)
    testee = new BlockFiCsv(sourceFile, timezone)
  })

  afterEach(() => {
    mocks.restore()
  })

  test('success', async () => {
    await testee.convert()
    expect(mocks.mockFsCreateReadStream).toHaveBeenCalledWith(sourceFile)
    expect(mocks.mockFsCreateWriteStream).toHaveBeenCalledWith(
      path.resolve(OUTPUT_DIR, 'file_contrackered.csv')
    )
    expect(mocks.chunksWritten.length).toBe(5)
    expect(mocks.chunksWritten).toMatchInlineSnapshot(`
      Array [
        "Date,Received Quantity,Received Currency,Sent Quantity,Sent Currency,Fee Amount,Fee Currency,Tag",
        "03/04/2021 07:27:35,60.51863375,LINK,,,,,",
        "02/28/2021 17:59:59,0.0632184,ETH,,,,,Interest",
        "02/28/2021 17:59:59,136.62968829,USDC,,,,,Interest",
        "02/25/2021 13:38:10,,,4500,USDC,0.25,USDC,",
      ]
    `)
  })
})
