export interface CliArguments {
  fileToConvert: string
}

export interface CliArgumentsRaw {
  _: string[]
}

export default function (rawArgs: CliArgumentsRaw): CliArguments {
  const fileName = rawArgs._[0]
  if (!fileName) {
    throw new Error('Missing file to convert')
  }

  return {
    fileToConvert: fileName
  }
}
