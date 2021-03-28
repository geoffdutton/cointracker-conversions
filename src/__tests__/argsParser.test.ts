import argsParser, { CliArguments, CliArgumentsRaw } from '../argsParser'

describe('Main CLI Arguments Parser', () => {
  let args: CliArgumentsRaw
  beforeEach(() => {
    args = {
      _: []
    }
  })

  test('throws error if missing file', () => {
    expect(() => argsParser(args)).toThrowError('Missing file to convert')
  })

  test('returns with resolved file path', () => {
    const fileName = 'some/file/toConvert.csv'
    args._.push(fileName)
    expect<CliArguments>(argsParser(args)).toEqual({
      fileToConvert: fileName
    })
  })
})
