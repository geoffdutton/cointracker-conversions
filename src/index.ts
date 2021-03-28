import argsParser, { CliArgumentsRaw } from './argsParser'
import createConversionManager from './ConversionManager'
import { OUTPUT_DIR } from './constants'

export default async (rawArgs: CliArgumentsRaw): Promise<number> => {
  try {
    const args = argsParser(rawArgs)

    console.log({ args })
    const manager = createConversionManager({
      fileToConvert: args.fileToConvert,
      sourceExchange: 'blockchain.com',
      outputDir: OUTPUT_DIR
    })
    await manager.start()
  } catch (e) {
    console.error(e)
    return 1
  }

  return 0
}
