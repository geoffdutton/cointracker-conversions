import fs from 'fs'
import { PassThrough } from 'stream'
import {
  BlockchainDotComCsv,
  BlockchainDotComCsvRow
} from '../BlockchainDotComCsv'
import { CoinTrackerTransaction } from '../CoinTrackerTransaction'
import { OUTPUT_DIR } from '../../constants'
import path from 'path'
import createConvertibleCsv from '../ConvertibleCsv'

interface MockFs {
  createReadStream: jest.Mock<PassThrough>
  createWriteStream: jest.Mock<PassThrough>
}

jest.mock(
  'fs',
  (): MockFs => {
    return {
      createReadStream: jest.fn(() => new PassThrough()),
      createWriteStream: jest.fn(() => new PassThrough())
    }
  }
)

describe('blockchain.com', () => {
  const sourceFile = 'some/source/file.csv'
  const timezone = 'America/Chicago'
  let testee: BlockchainDotComCsv
  beforeEach(() => {
    testee = new BlockchainDotComCsv(sourceFile, timezone)
  })

  test('combines date and time fields', async () => {
    const trx = await testee.processRow({
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

  test('received transaction', async () => {
    const trx = await testee.processRow({
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

  test('received transaction amount defaults to 0', async () => {
    const trx = await testee.processRow({
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

  test('rejects unexpected row.type', async () => {
    await expect(
      testee.processRow(({
        date: '12/31/2020',
        time: '02:11:01 GMT +00:00',
        token: 'BTC',
        amount: '0.054545',
        type: 'wrong'
      } as unknown) as BlockchainDotComCsvRow)
    ).rejects.toThrowError('Unexpected transaction type: wrong')
  })

  describe('convert()', () => {
    const sourceFileError = 'some/file/bad.csv'
    const sourceCsv = `"date","time","token","type","amount","value_then","value_now","exchange_rate_then","tx","note"
"2020-10-17","15:34:56 GMT +00:00","BTC","sent","-0.03897608","$ -442.50","$ -2,179.89","$ 11,353.18","ajifoeji",""
"2020-10-17","14:25:37 GMT +00:00","BTC","received","0.01385318","$ 157.10","$ 774.79","$ 11,340.00","aiojfiowe",""
"2020-10-17","14:25:37 GMT +00:00","BTC","received","0.01770809","$ 200.81","$ 990.40","$ 11,340.00","aifjoiew",""
"2020-10-14","04:25:04 GMT +00:00","BTC","received","0.00741481","$ 84.67","$ 414.70","$ 11,418.95","aifojew",""`

    let mockFsCreateReadStream: jest.Mock
    let mockFsCreateWriteStream: jest.Mock
    let chunksWritten: string[]

    beforeEach(() => {
      chunksWritten = []
      mockFsCreateReadStream = fs.createReadStream as jest.Mock
      mockFsCreateReadStream.mockImplementationOnce((fileName: string) => {
        const stream = new PassThrough()
        stream.push(Buffer.from(sourceCsv))
        if (fileName === sourceFileError) {
          // Unexpected Error: column header mismatch
          stream.push(Buffer.from(sourceCsv))
        }
        stream.push(null)
        return stream
      })

      const writeStream = new PassThrough()
      mockFsCreateWriteStream = fs.createWriteStream as jest.Mock
      mockFsCreateWriteStream.mockImplementationOnce(() => {
        writeStream.write = jest.fn((chunk?, cb?) => {
          chunksWritten.push(Buffer.from(chunk).toString('utf8'))
          cb && cb(null)
        }) as jest.Mock
        return writeStream
      })
    })

    test('success', async () => {
      testee = createConvertibleCsv<BlockchainDotComCsv>(
        BlockchainDotComCsv,
        sourceFile,
        timezone
      )

      await testee.convert()
      expect(mockFsCreateReadStream).toHaveBeenCalledWith(sourceFile)
      expect(mockFsCreateWriteStream).toHaveBeenCalledWith(
        path.resolve(OUTPUT_DIR, 'file_contrackered.csv')
      )
      expect(chunksWritten.length).toBe(5)
      expect(chunksWritten[0]).toEqual(
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
      expect(chunksWritten).toMatchInlineSnapshot(`
      Array [
        "Date,Received Quantity,Received Currency,Sent Quantity,Sent Currency,Fee Amount,Fee Currency,Tag",
        "
      10/17/2020 10:34:56,,,0.03897608,BTC,,,",
        "
      10/17/2020 09:25:37,0.01385318,BTC,,,,,",
        "
      10/17/2020 09:25:37,0.01770809,BTC,,,,,",
        "
      10/13/2020 23:25:04,0.00741481,BTC,,,,,",
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
      testee.processRow = jest
        .fn()
        .mockRejectedValue(new Error('Cannot read property blah of undefined'))

      await expect(testee.convert()).rejects.toThrowError(
        'Cannot read property blah of undefined'
      )
    })
  })
})
