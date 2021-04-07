# CodeTracker.io Conversion Utility

![npm](https://img.shields.io/npm/v/cointracker-conversions)
[![Node.js CI](https://github.com/geoffdutton/cointracker-conversions/actions/workflows/node.js.yml/badge.svg)](https://github.com/geoffdutton/cointracker-conversions/actions/workflows/node.js.yml)
[![codecov](https://codecov.io/gh/geoffdutton/cointracker-conversions/branch/main/graph/badge.svg?token=rlMwZAN5TP)](https://codecov.io/gh/geoffdutton/cointracker-conversions)

An unofficial [cointracker.io](https://www.cointracker.io/) transaction and trade history converter.

## Supported Exchanges

- [x] BlockFi
- [x] Blockchain.com
- [x] Gate.io
- [ ] next ??

## Getting started

```bash
npm i -g cointracker-conversions
cointrackerize ~/Desktop/file_from_exchange.csv
```

That will output to `~/Desktop/file_from_exchange_contrackered.csv` which is ready to be imported to CoinTracker.io!
