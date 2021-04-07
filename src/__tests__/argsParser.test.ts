import argsParser, { CliArguments, CliArgumentsRaw } from '../argsParser'

describe('Main CLI Arguments Parser', () => {
  let args: CliArgumentsRaw
  beforeEach(() => {
    args = {
      _: []
    }
  })

  test('shows help', () => {
    expect(argsParser(args)).toBe(null)
  })

  test('returns with resolved file path', () => {
    const fileName = 'some/file/toConvert.csv'
    args._.push(fileName)
    expect<CliArguments | null>(argsParser(args)).toEqual({
      fileToConvert: fileName
    })
  })
})
