# CodeTracker.io Conversion Utility

> Unofficial [cointracker.io](https://www.cointracker.io/) transaction and trade history converter.

[![Node.js CI](https://github.com/geoffdutton/cointracker-conversions/actions/workflows/node.js.yml/badge.svg)](https://github.com/geoffdutton/cointracker-conversions/actions/workflows/node.js.yml)

## Getting started

```bash
npm i
node run build
node cli/bin.hjs ~/Desktop/file_from_exchange.csv
```

That will output to `output/file_from_exchange_contrackered.csv`

## Supported Exchanges

- [x] BlockFi
- [x] Blockchain.com
- [x] Gate.io
