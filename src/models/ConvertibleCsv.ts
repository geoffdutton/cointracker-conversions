import path from 'path'
import fs from 'fs'
import { format } from '@fast-csv/format'
import { VALID_EXCHANGE } from '../types'
import {
  CoinTrackerTransaction,
  CoinTrackerTransactionOutput
} from './CoinTrackerTransaction'
import { OUTPUT_DIR } from '../constants'
import { Stream } from 'stream'
import ConvertibleCsvStream from './ConvertibleCsvStream'

export interface ConvertibleCsvOptions {
  sourceFileName: string
  sourceExchange: VALID_EXCHANGE
}

export interface CsvRow {
  [key: string]: string
}

interface OutputStream extends Stream {
  write: (row: CoinTrackerTransactionOutput) => void
  end: (cb: () => void) => void
}

export abstract class ConvertibleCsv {
  protected outputStream: OutputStream
  protected constructor(
    protected sourceFileName: string,
    protected sourceExchange: VALID_EXCHANGE,
    protected timezone: string
  ) {
    const baseFilename = path.basename(this.sourceFileName)
    const outputFileName = path.resolve(
      process.env.NODE_ENV === 'test'
        ? OUTPUT_DIR
        : path.dirname(this.sourceFileName),
      baseFilename.replace('.csv', '_contrackered.csv')
    )
    const writeStream = fs.createWriteStream(outputFileName)
    this.outputStream = format({ headers: true })
    this.outputStream.pipe(writeStream)
  }

  abstract processRow(row: CsvRow): CoinTrackerTransaction | null

  convert(): Promise<void> {
    return new Promise((resolve, reject) => {
      const stream = new ConvertibleCsvStream(this.sourceFileName)
      stream
        .on('data', async (row) => {
          try {
            const camelCasedRow = Object.keys(row).reduce(
              (camelCased: CsvRow, key) => {
                camelCased[this.toCamelCase(key)] = row[key]
                return camelCased
              },
              {}
            )
            const trx = this.processRow(camelCasedRow)
            trx && this.writeTransactionRow(trx)
          } catch (e) {
            reject(e)
          }
        })
        .on('error', (err) => reject(err))
        .on('end', () => {
          this.outputStream.end(() => resolve())
        })

      stream.init(this.sourceExchange)
    })
  }

  protected writeTransactionRow(row: CoinTrackerTransaction): void {
    this.outputStream.write({
      Date: row.date,
      'Received Quantity': row.receivedQuantity,
      'Received Currency': row.receivedCurrency,
      'Sent Quantity': row.sentQuantity,
      'Sent Currency': row.sentCurrency,
      'Fee Amount': row.feeAmount,
      'Fee Currency': row.feeCurrency,
      Tag: row.tag
    })
  }

  protected toCamelCase(key: string): string {
    return key
      .replace(/\s(.)/g, function ($1) {
        return $1.toUpperCase()
      })
      .replace(/\s/g, '')
      .replace(/^(.)/, function ($1) {
        return $1.toLowerCase()
      })
  }

  protected parseNumber(numberLike: string): number | null {
    if (numberLike === '') {
      return null
    }

    let returnNumber: number | undefined
    if (numberLike.includes('.')) {
      returnNumber = parseFloat(numberLike)
    } else {
      returnNumber = parseInt(numberLike, 10)
    }

    return isNaN(returnNumber) ? null : returnNumber
  }

  protected parseAbsoluteValueOrZero(numberLike: string): number {
    return Math.abs(this.parseNumber(numberLike) ?? 0)
  }
}

export default function createConvertibleCsv<T extends ConvertibleCsv>(
  csvType: new (sourceFileName: string, timezone: string) => T,
  sourceFileName: string,
  timezone: string
): T {
  return new csvType(sourceFileName, timezone)
}
