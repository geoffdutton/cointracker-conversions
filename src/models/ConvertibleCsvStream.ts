import fs from 'fs'
import { EventEmitter } from 'events'
import { parse } from '@fast-csv/parse'

export default class ConvertibleCsvStream extends EventEmitter {
  constructor(private filePath: string) {
    super()
  }

  init(): void {
    const stream = fs.createReadStream(this.filePath)
    stream
      .pipe(parse({ headers: true }))
      .on('error', (err) => this.emit('error', err))
      .on('data', (row) => this.emit('data', row))
      .on('end', (rowCount: number) => this.emit('end', rowCount))
  }
}
