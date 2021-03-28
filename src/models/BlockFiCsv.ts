import { DateTime } from 'luxon'
import { ConvertibleCsv, CsvRow } from './ConvertibleCsv'
import { VALID_EXCHANGE } from '../types'
import { CoinTrackerTransaction } from './CoinTrackerTransaction'

export interface BlockFiCsvRow extends CsvRow {
  // 2021-03-27 15:57:51 (in UTC)
  confirmedAt: string
  transactionType:
    | 'Deposit'
    | 'Interest Payment'
    | 'Withdrawal'
    | 'Withdrawal Fee'
  amount: string
  cryptocurrency: string
}

export class BlockFiCsv extends ConvertibleCsv {
  static exchangeName: VALID_EXCHANGE = 'BlockFi'

  private pendingFees: Record<string, CoinTrackerTransaction>
  constructor(sourceFileName: string, timezone: string) {
    super(sourceFileName, BlockFiCsv.exchangeName, timezone)
    this.pendingFees = {}
  }

  getDate(row: BlockFiCsvRow): string {
    const jsDate = new Date(`${row.confirmedAt} UTC`)
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

  processRow(row: BlockFiCsvRow): CoinTrackerTransaction | null {
    const trx: CoinTrackerTransaction = {
      date: this.getDate(row)
    }

    const type = row.transactionType
    if (type === 'Withdrawal Fee') {
      trx.feeCurrency = row.cryptocurrency
      trx.feeAmount = this.parseNumber(row.amount)
      this.pendingFees[trx.date] = trx
      return null
    }

    const matchingFeeTrx = this.pendingFees[trx.date]

    if (type === 'Withdrawal') {
      trx.sentCurrency = row.cryptocurrency
      trx.sentQuantity = this.parseNumber(row.amount)
      if (matchingFeeTrx) {
        if (typeof matchingFeeTrx.feeAmount === 'number') {
          trx.sentQuantity += matchingFeeTrx.feeAmount
        }
        trx.feeAmount = matchingFeeTrx.feeAmount
        trx.feeCurrency = matchingFeeTrx.feeCurrency
      }
    } else if (['Deposit', 'Interest Payment'].includes(type)) {
      trx.receivedCurrency = row.cryptocurrency
      trx.receivedQuantity = this.parseNumber(row.amount)
      if (type === 'Interest Payment') {
        trx.tag = 'Interest'
      }
    }
    console.log(trx)
    return trx
  }
}
