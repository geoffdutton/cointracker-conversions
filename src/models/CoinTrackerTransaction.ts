export interface CoinTrackerTransaction {
  date: string
  receivedQuantity?: number
  receivedCurrency?: string
  sentQuantity?: number
  sentCurrency?: string
  feeAmount?: number
  feeCurrency?: string
  tag?: string
}

export interface CoinTrackerTransactionOutput {
  Date: string
  'Received Quantity'?: number
  'Received Currency'?: string
  'Sent Quantity'?: number
  'Sent Currency'?: string
  'Fee Amount'?: number
  'Fee Currency'?: string
  Tag?: string
}
