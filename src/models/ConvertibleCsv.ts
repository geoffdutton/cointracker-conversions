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
      OUTPUT_DIR,
      baseFilename.replace('.csv', '_contrackered.csv')
    )
    const writeStream = fs.createWriteStream(outputFileName)
    this.outputStream = format({ headers: true })
    this.outputStream.pipe(writeStream)
  }

  abstract convert(): Promise<void>
  abstract processRow(row: CsvRow): Promise<CoinTrackerTransaction>

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
}

export default function createConvertibleCsv<T extends ConvertibleCsv>(
  csvType: new (sourceFileName: string, timezone: string) => T,
  sourceFileName: string,
  timezone: string
): T {
  return new csvType(sourceFileName, timezone)
}
