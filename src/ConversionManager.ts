import { VALID_EXCHANGE } from './types'
import fs from 'fs'
import createCliQuestionnaire, {
  CliQuestionnaire
} from './models/CliQuestionnaire'
import { BlockchainDotComCsv } from './models/BlockchainDotComCsv'
import { ConvertibleCsv } from './models/ConvertibleCsv'

export interface ConversionManagerOptions {
  fileToConvert: string
  sourceExchange: VALID_EXCHANGE
  outputDir: string
}

const TIMEZONE = 'America/Chicago'
export class ConversionManager {
  private readonly questionnaire: CliQuestionnaire
  constructor(
    private fileToConvert: string,
    private sourceExchange: string,
    private outputDir: string
  ) {
    this.questionnaire = createCliQuestionnaire()
  }

  async start(): Promise<void> {
    if (!fs.existsSync(this.outputDir)) {
      await fs.promises.mkdir(this.outputDir)
    }
    console.log(this.fileToConvert, this.sourceExchange)
    await this.questionnaire.askWhatExchange()
    const exchange = this.questionnaire.getSourceExchange()
    console.log('Selected exchange:', exchange)

    let csvConverter: ConvertibleCsv | null = null

    switch (exchange) {
      case 'blockchain.com':
        csvConverter = new BlockchainDotComCsv(this.fileToConvert, TIMEZONE)
        break
    }

    if (!csvConverter) {
      throw new Error(`Invalid exchange: ${exchange}`)
    }
    await csvConverter.convert()
  }
}

export default function createConversionManager(
  opts: ConversionManagerOptions
): ConversionManager {
  return new ConversionManager(
    opts.fileToConvert,
    opts.sourceExchange,
    opts.outputDir
  )
}
