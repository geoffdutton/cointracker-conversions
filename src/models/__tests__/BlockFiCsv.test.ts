import fs from 'fs'
import { PassThrough } from 'stream'
import { BlockFiCsv } from '../BlockFiCsv'
import path from 'path'
import { OUTPUT_DIR } from '../../constants'

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
  let testee: BlockFiCsv

  const sourceCsv = `Cryptocurrency,Amount,Transaction Type,Confirmed At
LINK,60.51863375,Deposit,2021-03-04 13:27:35
ETH,0.06321840,Interest Payment,2021-02-28 23:59:59
USDC,136.62968829,Interest Payment,2021-02-28 23:59:59
USDC,-0.25000000,Withdrawal Fee,2021-02-25 19:38:10
USDC,-4499.75000000,Withdrawal,2021-02-25 19:38:10`

  let mockFsCreateReadStream: jest.Mock
  let mockFsCreateWriteStream: jest.Mock
  let chunksWritten: string[]

  beforeEach(() => {
    chunksWritten = []
    mockFsCreateReadStream = fs.createReadStream as jest.Mock
    mockFsCreateReadStream.mockImplementationOnce(() => {
      const stream = new PassThrough()
      stream.push(Buffer.from(sourceCsv))
      stream.push(null)
      return stream
    })

    const writeStream = new PassThrough()
    mockFsCreateWriteStream = fs.createWriteStream as jest.Mock
    mockFsCreateWriteStream.mockImplementationOnce(() => {
      writeStream.write = jest.fn((chunk?, cb?) => {
        chunksWritten.push(Buffer.from(chunk).toString('utf8').trim())
        cb && cb(null)
      }) as jest.Mock
      return writeStream
    })
  })

  beforeEach(() => {
    testee = new BlockFiCsv(sourceFile, timezone)
  })

  test('success', async () => {
    await testee.convert()
    expect(mockFsCreateReadStream).toHaveBeenCalledWith(sourceFile)
    expect(mockFsCreateWriteStream).toHaveBeenCalledWith(
      path.resolve(OUTPUT_DIR, 'file_contrackered.csv')
    )
    expect(chunksWritten.length).toBe(5)
    expect(chunksWritten).toMatchInlineSnapshot(`
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
