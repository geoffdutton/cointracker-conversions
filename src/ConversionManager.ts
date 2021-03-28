import { VALID_EXCHANGE } from './types'

export interface ConversionManagerOptions {
  fileToConvert: string
  sourceExchange: VALID_EXCHANGE
}
export class ConversionManager {
  constructor(private fileToConvert: string, private sourceExchange: string) {}

  async start(): Promise<void> {
    console.log(this.fileToConvert, this.sourceExchange)
  }
}

export default function createConversionManager(
  opts: ConversionManagerOptions
): ConversionManager {
  return new ConversionManager(opts.fileToConvert, opts.sourceExchange)
}
