import fs from 'fs'
import { EventEmitter } from 'events'
import { parse, ParserOptionsArgs } from '@fast-csv/parse'
import { VALID_EXCHANGE } from '../types'

const SOURCE_EXCHANGE_CSV_PARSER_ARGS: { [key: string]: ParserOptionsArgs } = {
  'gate.io': { delimiter: '\t', encoding: 'utf16le' }
}

export default class ConvertibleCsvStream extends EventEmitter {
  constructor(private filePath: string) {
    super()
  }

  init(sourceExchange: VALID_EXCHANGE): void {
    const stream = fs.createReadStream(this.filePath)
    const parseArgs: ParserOptionsArgs = { headers: true }
    if (sourceExchange in SOURCE_EXCHANGE_CSV_PARSER_ARGS) {
      Object.assign(parseArgs, SOURCE_EXCHANGE_CSV_PARSER_ARGS[sourceExchange])
    }
    stream
      .pipe(parse(parseArgs))
      .on('error', (err) => this.emit('error', err))
      .on('data', (row) => this.emit('data', row))
      .on('end', (rowCount: number) => this.emit('end', rowCount))
  }
}
