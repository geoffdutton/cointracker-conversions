import { DateTime } from 'luxon'
import { ConvertibleCsv, CsvRow } from './ConvertibleCsv'
import { VALID_EXCHANGE } from '../types'
import ConvertibleCsvStream from './ConvertibleCsvStream'
import { CoinTrackerTransaction } from './CoinTrackerTransaction'

interface BlockchainDotComCsvRow extends CsvRow {
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

  convert(): Promise<void> {
    return new Promise((resolve, reject) => {
      const stream = new ConvertibleCsvStream(this.sourceFileName)
      stream
        .on('data', async (row) => {
          try {
            const trx = await this.processRow(row)
            this.writeTransactionRow(trx)
          } catch (e) {
            reject(e)
          }
        })
        .on('error', (err) => reject(err))
        .on('end', () => {
          this.outputStream.end(() => resolve())
        })

      stream.init()
    })
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

  async processRow(
    row: BlockchainDotComCsvRow
  ): Promise<CoinTrackerTransaction> {
    const trx: CoinTrackerTransaction = {
      date: this.getDate(row)
    }

    const type = row.type
    if (type === 'sent') {
      trx.sentCurrency = row.token
      trx.sentQuantity = Math.abs(this.parseNumber(row.amount) ?? 0)
    } else if (type === 'received') {
      trx.receivedCurrency = row.token
      trx.receivedQuantity = this.parseNumber(row.amount) ?? 0
    }

    console.log(trx)
    return trx
  }
}
