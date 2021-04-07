import { GateDotIOCsv } from '../GateDotIO'
import path from 'path'
import { OUTPUT_DIR } from '../../constants'
import { PassThrough } from 'stream'
import fs from 'fs'
const exchange = 'gate.io'

describe(exchange, () => {
  const timezone = 'America/Chicago'
  let testee: GateDotIOCsv
  let chunksWritten: string[]
  let mockFsCreateWriteStream: jest.Mock

  beforeEach(() => {
    chunksWritten = []
    const writeStream = new PassThrough()
    fs.createWriteStream = jest.fn()
    mockFsCreateWriteStream = fs.createWriteStream as jest.Mock
    mockFsCreateWriteStream.mockImplementation(() => {
      writeStream.write = jest.fn((chunk?, cb?) => {
        chunksWritten.push(Buffer.from(chunk).toString('utf8').trim())
        cb && cb(null)
      }) as jest.Mock
      return writeStream
    })
  })

  test('deposits', async () => {
    const sourceFile = path.resolve(
      __dirname,
      'fixtures',
      'mydeposits_gate.io.csv'
    )
    testee = new GateDotIOCsv(sourceFile, timezone)
    await testee.convert()
    expect(mockFsCreateWriteStream).toHaveBeenCalledWith(
      path.resolve(OUTPUT_DIR, 'mydeposits_gate.io_contrackered.csv')
    )
    expect(chunksWritten.length).toBe(5)
    expect(chunksWritten).toMatchInlineSnapshot(`
      Array [
        "Date,Received Quantity,Received Currency,Sent Quantity,Sent Currency,Fee Amount,Fee Currency,Tag",
        "04/05/2021 06:28:03,34.79281332,LTC,,,,,",
        "03/25/2021 16:27:02,0.1901648,BTC,,,,,",
        "02/28/2021 04:24:09,0.03502687,BTC,,,,,",
        "02/25/2021 00:58:09,0.01057229,BTC,,,,,",
      ]
    `)
  })

  test('trades', async () => {
    const sourceFile = path.resolve(
      __dirname,
      'fixtures',
      'mytradehistory_gate.io.csv'
    )
    testee = new GateDotIOCsv(sourceFile, timezone)
    await testee.convert()
    expect(mockFsCreateWriteStream).toHaveBeenCalledWith(
      path.resolve(OUTPUT_DIR, 'mytradehistory_gate.io_contrackered.csv')
    )
    expect(chunksWritten.length).toBe(7)
    expect(chunksWritten).toMatchInlineSnapshot(`
      Array [
        "Date,Received Quantity,Received Currency,Sent Quantity,Sent Currency,Fee Amount,Fee Currency,Tag",
        "04/05/2021 06:32:54,2128,ADA,1.011,USDT,,,",
        "04/05/2021 06:32:54,152714.762,KIN,72.234,USDT,,,",
        "04/05/2021 06:30:59,986.119,USDT,4.793,LTC,,,",
        "03/25/2021 16:31:08,5.12,USDT,0,BTC,,,",
        "02/28/2021 04:38:48,67200.466,KIN,6.09,USDT,,,",
        "02/25/2021 01:02:02,513.002,USDT,0.011,BTC,,,",
      ]
    `)
  })

  test('withdrawals', async () => {
    const sourceFile = path.resolve(
      __dirname,
      'fixtures',
      'mywithdrawals_gate.io.csv'
    )
    testee = new GateDotIOCsv(sourceFile, timezone)
    await testee.convert()
    expect(mockFsCreateWriteStream).toHaveBeenCalledWith(
      path.resolve(OUTPUT_DIR, 'mywithdrawals_gate.io_contrackered.csv')
    )
    expect(chunksWritten.length).toBe(5)
    expect(chunksWritten).toMatchInlineSnapshot(`
      Array [
        "Date,Received Quantity,Received Currency,Sent Quantity,Sent Currency,Fee Amount,Fee Currency,Tag",
        "04/05/2021 06:40:59,,,333.9964,DOT,,,",
        "03/25/2021 16:35:49,,,44444.87717229,KIN,,,",
        "02/28/2021 09:39:50,,,22,KIN,,,",
        "02/28/2021 09:36:57,,,33,KIN,,,",
      ]
    `)
  })
})
