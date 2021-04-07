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

  test('success transactions', async () => {
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
        "02/28/2021 17:59:59,0.0632184,ETH,,,,,staked",
        "02/28/2021 17:59:59,136.62968829,USDC,,,,,staked",
        "02/25/2021 13:38:10,,,4500,USDC,0.25,USDC,",
      ]
    `)
  })

  test('success trade history', async () => {
    mocks.restore()
    const _sourceFile = path.resolve(
      __dirname,
      'fixtures',
      'blockFi_trades.csv'
    )
    const writeMocks = fixtures.setupMockWriteStream()
    testee = new BlockFiCsv(_sourceFile, timezone)
    await testee.convert()

    expect(writeMocks.mockFsCreateWriteStream).toHaveBeenCalledWith(
      path.resolve(OUTPUT_DIR, 'blockFi_trades_contrackered.csv')
    )
    expect(writeMocks.chunksWritten.length).toBe(2)
    expect(writeMocks.chunksWritten).toMatchInlineSnapshot(`
      Array [
        "Date,Received Quantity,Received Currency,Sent Quantity,Sent Currency,Fee Amount,Fee Currency,Tag",
        "04/06/2021 09:41:58,0.00171373,BTC,100,GUSD,,,",
      ]
    `)
  })
})
