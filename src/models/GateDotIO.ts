import { DateTime } from 'luxon'
import { ConvertibleCsv, CsvRow } from './ConvertibleCsv'
import { VALID_EXCHANGE } from '../types'
import { CoinTrackerTransaction } from './CoinTrackerTransaction'

export interface GateDotIOCsvRow extends CsvRow {
  // 10/17/2020
  date: string
  // 15:34:56 GMT +00:00
  time: string
  type: 'sent' | 'received'
  amount: string
  token: string
}

export class GateDotIOCsv extends ConvertibleCsv {
  static exchangeName: VALID_EXCHANGE = 'gate.io'

  constructor(sourceFileName: string, timezone: string) {
    super(sourceFileName, GateDotIOCsv.exchangeName, timezone)
  }

  getDate(row: GateDotIOCsvRow): string {
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

  processRow(row: GateDotIOCsvRow): CoinTrackerTransaction {
    const trx: CoinTrackerTransaction = {
      date: this.getDate(row)
    }

    const type = row.type
    if (type === 'sent') {
      trx.sentCurrency = row.token
      trx.sentQuantity = this.parseAbsoluteValueOrZero(row.amount)
    } else if (type === 'received') {
      trx.receivedCurrency = row.token
      trx.receivedQuantity = this.parseAbsoluteValueOrZero(row.amount)
    } else {
      console.log(trx)
      throw new Error(`Unexpected transaction type: ${type}`)
    }

    return trx
  }
}
