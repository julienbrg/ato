# Minter

Minter app allows everyone to issue 10,000 units of an ERC-20.

A live demo is available at [https://strat.cc/minter](https://strat.cc/minter).

## Motivation

Testing the deployment of an ERC20 from a UI.

## Install

```
git clone https://github.com/julienbrg/minter.git
cd minter
npm install
```

## Test

```
npx hardhat test
```

## Deploy

Add your Infura `Project ID` and `private key` in `hardhat.config.js`.

```
npx hardhat run scripts/deploy.js --network ropsten
```

## Run

```
cd frontend
npm install
npm start
```
## Usage

Make sure you have some [Ropsten ETH](https://faucet.ropsten.be/) and go to [https://strat.cc/minter](https://strat.cc/minter).

## Contact

Feel free to [contact me](https://strat.eth.link/contact.html).
