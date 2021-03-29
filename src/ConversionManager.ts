import fs from 'fs'
import createCliQuestionnaire, {
  CliQuestionnaire
} from './models/CliQuestionnaire'
import { BlockchainDotComCsv } from './models/BlockchainDotComCsv'
import { ConvertibleCsv } from './models/ConvertibleCsv'
import { BlockFiCsv } from './models/BlockFiCsv'

export interface ConversionManagerOptions {
  fileToConvert: string
  outputDir: string
}

const TIMEZONE = 'America/Chicago'
export class ConversionManager {
  private readonly questionnaire: CliQuestionnaire
  constructor(private fileToConvert: string, private outputDir: string) {
    this.questionnaire = createCliQuestionnaire()
  }

  async start(): Promise<void> {
    if (!fs.existsSync(this.outputDir)) {
      await fs.promises.mkdir(this.outputDir)
    }
    await this.questionnaire.askWhatExchange()
    const exchange = this.questionnaire.getSourceExchange()
    console.log('Selected exchange:', exchange)
    console.log('Source CSV:', this.fileToConvert)
    let csvConverter: ConvertibleCsv | null = null

    switch (exchange) {
      case 'blockchain.com':
        csvConverter = new BlockchainDotComCsv(this.fileToConvert, TIMEZONE)
        break
      case 'BlockFi':
        csvConverter = new BlockFiCsv(this.fileToConvert, TIMEZONE)
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
  return new ConversionManager(opts.fileToConvert, opts.outputDir)
}
