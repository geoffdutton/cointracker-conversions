import chalk from 'chalk'
const version = require('../package.json').version

const HELP_MESSAGE = `
${chalk.underline('cointrackerize - v' + version)}

Convert your crypto exchange exports into CoinTracker.io format.

Usage:

  cointrackerize path/to/exchange_export.csv
  
`

export interface CliArguments {
  fileToConvert: string
}

export interface CliArgumentsRaw {
  _: string[]
  h?: boolean
  help?: boolean
}

export default function (rawArgs: CliArgumentsRaw): CliArguments | null {
  if (rawArgs.help || rawArgs.h) {
    console.log(HELP_MESSAGE)
    return null
  }

  const fileName = rawArgs._[0]
  if (!fileName) {
    console.log(HELP_MESSAGE)
    return null
  }

  return {
    fileToConvert: fileName
  }
}
