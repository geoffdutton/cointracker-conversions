import fs from 'fs'
import path from 'path'
import { VALID_EXCHANGE } from '../../../types'
import { PassThrough } from 'stream'

const origFs = {
  createReadStream: fs.createReadStream,
  createWriteStream: fs.createWriteStream
}

const fixtureMap: { [key in VALID_EXCHANGE]: string } = {
  BlockFi: 'blockFi.csv',
  'blockchain.com': 'blockchain.com.csv'
}

const loadFixture = (exchange: VALID_EXCHANGE): string => {
  return fs.readFileSync(path.resolve(__dirname, fixtureMap[exchange]), 'utf8')
}

export interface FixtureMockStreams {
  chunksWritten: string[]
  mockFsCreateReadStream: jest.Mock
  mockFsCreateWriteStream: jest.Mock
  restore: () => void
}

const setupMockStreams = (
  sourceCsv: string,
  errorSourceFile?: string
): FixtureMockStreams => {
  const chunksWritten: string[] = []
  fs.createReadStream = jest.fn()
  const mockFsCreateReadStream = fs.createReadStream as jest.Mock
  mockFsCreateReadStream.mockImplementation((fileName: string) => {
    const stream = new PassThrough()
    stream.push(Buffer.from(sourceCsv.trim()))
    if (fileName === errorSourceFile) {
      // Unexpected Error: column header mismatch
      stream.push(Buffer.from(sourceCsv.trim()))
    }
    stream.push(null)
    return stream
  })

  const writeStream = new PassThrough()
  fs.createWriteStream = jest.fn()
  const mockFsCreateWriteStream = fs.createWriteStream as jest.Mock
  mockFsCreateWriteStream.mockImplementation(() => {
    writeStream.write = jest.fn((chunk?, cb?) => {
      chunksWritten.push(Buffer.from(chunk).toString('utf8').trim())
      cb && cb(null)
    }) as jest.Mock
    return writeStream
  })

  return {
    chunksWritten,
    mockFsCreateReadStream,
    mockFsCreateWriteStream,
    restore() {
      fs.createReadStream = origFs.createReadStream
      fs.createWriteStream = origFs.createWriteStream
    }
  }
}

export default {
  loadFixture,
  setupMockStreams
}
