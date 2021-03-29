import fixtures, { FixtureMockStreams } from './fixtures/fixtures'
import {
  BlockchainDotComCsv,
  BlockchainDotComCsvRow
} from '../BlockchainDotComCsv'
import { CoinTrackerTransaction } from '../CoinTrackerTransaction'
import { OUTPUT_DIR } from '../../constants'
import path from 'path'
import createConvertibleCsv from '../ConvertibleCsv'

describe('blockchain.com', () => {
  const sourceFile = 'some/source/file.csv'
  const timezone = 'America/Chicago'
  let testee: BlockchainDotComCsv

  beforeEach(() => {
    testee = new BlockchainDotComCsv(sourceFile, timezone)
  })

  test('combines date and time fields', () => {
    const trx = testee.processRow({
      date: '10/17/2020',
      time: '15:34:56 GMT +00:00',
      token: 'BTC',
      amount: '-0.03897608',
      type: 'sent'
    })

    expect<CoinTrackerTransaction>(trx).toEqual({
      date: '10/17/2020 10:34:56',
      sentCurrency: 'BTC',
      sentQuantity: 0.03897608
    })
  })

  test('received transaction', () => {
    const trx = testee.processRow({
      date: '12/31/2020',
      time: '02:11:01 GMT +00:00',
      token: 'BTC',
      amount: '1',
      type: 'received'
    })

    expect<CoinTrackerTransaction>(trx).toEqual({
      date: '12/30/2020 20:11:01',
      receivedCurrency: 'BTC',
      receivedQuantity: 1
    })
  })

  test('received transaction amount defaults to 0', () => {
    const trx = testee.processRow({
      date: '12/31/2020',
      time: '02:11:01 GMT +00:00',
      token: 'BTC',
      amount: '',
      type: 'received'
    })

    expect<CoinTrackerTransaction>(trx).toEqual({
      date: '12/30/2020 20:11:01',
      receivedCurrency: 'BTC',
      receivedQuantity: 0
    })
  })

  test('rejects unexpected row.type', () => {
    expect(() =>
      testee.processRow(({
        date: '12/31/2020',
        time: '02:11:01 GMT +00:00',
        token: 'BTC',
        amount: '0.054545',
        type: 'wrong'
      } as unknown) as BlockchainDotComCsvRow)
    ).toThrowError('Unexpected transaction type: wrong')
  })

  describe('convert()', () => {
    const sourceFileError = 'some/file/bad.csv'
    const sourceCsv = fixtures.loadFixture('blockchain.com')

    let mocks: FixtureMockStreams

    beforeEach(() => {
      mocks = fixtures.setupMockStreams(sourceCsv, sourceFileError)
    })

    afterEach(() => {
      mocks.restore()
    })

    test('success', async () => {
      testee = createConvertibleCsv<BlockchainDotComCsv>(
        BlockchainDotComCsv,
        sourceFile,
        timezone
      )

      await testee.convert()
      expect(mocks.mockFsCreateReadStream).toHaveBeenCalledWith(sourceFile)
      expect(mocks.mockFsCreateWriteStream).toHaveBeenCalledWith(
        path.resolve(OUTPUT_DIR, 'file_contrackered.csv')
      )
      expect(mocks.chunksWritten.length).toBe(5)
      expect(mocks.chunksWritten[0]).toEqual(
        [
          'Date',
          'Received Quantity',
          'Received Currency',
          'Sent Quantity',
          'Sent Currency',
          'Fee Amount',
          'Fee Currency',
          'Tag'
        ].join(',')
      )
      expect(mocks.chunksWritten).toMatchInlineSnapshot(`
      Array [
        "Date,Received Quantity,Received Currency,Sent Quantity,Sent Currency,Fee Amount,Fee Currency,Tag",
        "10/17/2020 10:34:56,,,0.03897608,BTC,,,",
        "10/17/2020 09:25:37,0.01385318,BTC,,,,,",
        "10/17/2020 09:25:37,0.01770809,BTC,,,,,",
        "10/13/2020 23:25:04,0.00741481,BTC,,,,,",
      ]
    `)
    })

    test('csv error', async () => {
      testee = new BlockchainDotComCsv(sourceFileError, timezone)
      await expect(testee.convert()).rejects.toThrowError(
        'Unexpected Error: column header mismatch expected: 10 columns got: 19'
      )
    })

    test('processRow() error', async () => {
      testee = new BlockchainDotComCsv(sourceFile, timezone)
      testee.processRow = jest.fn().mockImplementationOnce(() => {
        throw new Error('Cannot read property blah of undefined')
      })

      await expect(testee.convert()).rejects.toThrowError(
        'Cannot read property blah of undefined'
      )
    })
  })
})
