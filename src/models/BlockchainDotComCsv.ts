import { DateTime } from 'luxon'
import { ConvertibleCsv, CsvRow } from './ConvertibleCsv'
import { VALID_EXCHANGE } from '../types'
import { CoinTrackerTransaction } from './CoinTrackerTransaction'

export interface BlockchainDotComCsvRow extends CsvRow {
  // 10/17/2020
  date: string
  // 15:34:56 GMT +00:00
  time: string
  type: 'sent' | 'received'
  amount: string
  token: string
}

export class BlockchainDotComCsv extends ConvertibleCsv {
  static exchangeName: VALID_EXCHANGE = 'blockchain.com'

  constructor(sourceFileName: string, timezone: string) {
    super(sourceFileName, BlockchainDotComCsv.exchangeName, timezone)
  }

  getDate(row: BlockchainDotComCsvRow): string {
    const jsDate = new Date(`${row.date} ${row.time}`)
    const d = DateTime.utc(
      jsDate.getUTCFullYear(),
      jsDate.getUTCMonth() + 1,
      jsDate.getUTCDate(),
      jsDate.getUTCHours(),
      jsDate.getUTCMinutes(),
      jsDate.getUTCSeconds()
    ).setZone(this.timezone)
    return d.toFormat('LL/dd/yyyy HH:mm:ss')
  }

  protected parseNumber(numberLike: string): number {
    const number = super.parseNumber(numberLike)
    if (!number) {
      return 0
    }

    return Math.abs(number)
  }

  processRow(row: BlockchainDotComCsvRow): CoinTrackerTransaction {
    const trx: CoinTrackerTransaction = {
      date: this.getDate(row)
    }

    const type = row.type
    if (type === 'sent') {
      trx.sentCurrency = row.token
      trx.sentQuantity = this.parseNumber(row.amount)
    } else if (type === 'received') {
      trx.receivedCurrency = row.token
      trx.receivedQuantity = this.parseNumber(row.amount)
    } else {
      console.log(trx)
      throw new Error(`Unexpected transaction type: ${type}`)
    }
    console.log(trx)
    return trx
  }
}
