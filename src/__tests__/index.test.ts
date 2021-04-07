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

describe('main', () => {
  const mockedCreate = createConversionManager as MockCreateConversionManager

  afterEach(() => mockedCreate.__mockStart.mockClear())

  test('returns 0 on help', async () => {
    expect(await main({ _: [] })).toBe(0)
  })

  test('returns 1 on error', async () => {
    mockedCreate.__mockStart.mockRejectedValueOnce(new Error('bad csv :('))
    expect(await main({ _: ['some/file.csv'] })).toBe(1)
  })

  test('starts new conversion manager', async () => {
    expect(await main({ _: ['some/file.csv'] })).toBe(0)
    expect(mockedCreate).toHaveBeenCalledWith({
      fileToConvert: 'some/file.csv',
      outputDir: OUTPUT_DIR
    })
    expect(mockedCreate.__mockStart).toHaveBeenCalledTimes(1)
  })
})
