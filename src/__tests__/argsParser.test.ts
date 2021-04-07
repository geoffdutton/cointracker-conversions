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

  test('shows help with -h', () => {
    args.h = true
    expect(argsParser(args)).toBe(null)
    args.help = true
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
