import createConversionManager, {
  ConversionManager
} from '../ConversionManager'
import main from '../'
import { OUTPUT_DIR } from '../constants'

interface MockCreateConversionManager {
  (): ConversionManager
  __mockStart: jest.Mock
}

jest.mock('../ConversionManager')

test('returns 1 to indicate error', async () => {
  expect(await main({ _: [] })).toBe(1)
})

test('starts new conversion manager', async () => {
  const _convMgr = createConversionManager as MockCreateConversionManager
  expect(await main({ _: ['some/file.csv'] })).toBe(0)
  expect(_convMgr).toHaveBeenCalledWith({
    fileToConvert: 'some/file.csv',
    sourceExchange: 'blockchain.com',
    outputDir: OUTPUT_DIR
  })
  expect(_convMgr.__mockStart).toHaveBeenCalledTimes(1)
})
