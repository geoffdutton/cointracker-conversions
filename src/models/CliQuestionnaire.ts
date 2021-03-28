import prompts from 'prompts'
import { VALID_EXCHANGE } from '../types'
import { VALID_EXCHANGES } from '../constants'

export class CliQuestionnaire {
  private exchange?: VALID_EXCHANGE

  async askWhatExchange(): Promise<void> {
    const response = (await prompts({
      type: 'select',
      name: 'exchange',
      choices: VALID_EXCHANGES.map((validExchange) => {
        return {
          title: validExchange,
          value: validExchange
        }
      }),
      message: 'What exchange is the input CSV from?'
    })) as { exchange: VALID_EXCHANGE }

    this.exchange = response.exchange
  }

  getSourceExchange(): string | undefined {
    return this.exchange
  }
}

export default function createCliQuestionnaire(): CliQuestionnaire {
  return new CliQuestionnaire()
}
