import path from 'path'
import { DateTime } from 'luxon'
import { ConvertibleCsv, CsvRow } from './ConvertibleCsv'
import { VALID_EXCHANGE } from '../types'
import { CoinTrackerTransaction } from './CoinTrackerTransaction'

export interface GateDotIOCsvRow extends CsvRow {
  // 10/17/2020
  time: string
  // 15:34:56 GMT +00:00
  currency: string
  changeAmount: string
  status: string
  // for trades
  tradeType: string
  pair: string
  total: string
  amount: string
}

export class GateDotIOCsv extends ConvertibleCsv {
  static exchangeName: VALID_EXCHANGE = 'gate.io'

  private readonly transactionType: 'deposit' | 'withdrawal' | 'trade'

  constructor(sourceFileName: string, timezone: string) {
    super(sourceFileName, GateDotIOCsv.exchangeName, timezone)
    this.transactionType = 'trade'
    const fn = path.basename(this.sourceFileName)
    if (fn.startsWith('mywithdrawals')) {
      this.transactionType = 'withdrawal'
    } else if (fn.startsWith('mydeposits')) {
      this.transactionType = 'deposit'
    }
  }

  getDate(row: GateDotIOCsvRow): string {
    const jsDate = new Date(`${row.time} UTC`)
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

  processRow(row: GateDotIOCsvRow): CoinTrackerTransaction | null {
    if (row.currency === 'USDTEST') {
      return null
    }
    const trx: CoinTrackerTransaction = {
      date: this.getDate(row)
    }

    const type = this.transactionType
    if (type === 'trade') {
      const [coin, tradeCoin] = row.pair.split('/')
      if (row.tradeType === 'Sell') {
        trx.sentCurrency = coin
        trx.sentQuantity = this.parseAbsoluteValueOrZero(row.amount)
        trx.receivedCurrency = tradeCoin
        trx.receivedQuantity = this.parseAbsoluteValueOrZero(row.total)
      } else {
        // tradeType === 'Buy'
        trx.sentCurrency = tradeCoin
        trx.sentQuantity = this.parseAbsoluteValueOrZero(row.total)
        trx.receivedCurrency = coin
        trx.receivedQuantity = this.parseAbsoluteValueOrZero(row.amount)
      }
    } else if (['withdrawal', 'deposit'].includes(type)) {
      const changeAmount = this.parseAbsoluteValueOrZero(row.changeAmount)
      if (type === 'withdrawal') {
        if (!row.status.includes('Done')) {
          return null
        }
        trx.sentCurrency = row.currency
        trx.sentQuantity = changeAmount
      } else if (type === 'deposit') {
        trx.receivedCurrency = row.currency
        trx.receivedQuantity = changeAmount
      }
    } else {
      console.log(trx)
      throw new Error(`Unexpected transaction type: ${type}`)
    }

    return trx
  }
}
