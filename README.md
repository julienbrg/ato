# Minter

Minter (v0.1.0) allows anyone to issue 10,000 units of an ERC-20.

A demo is available at [https://strat.cc/minter](https://strat.cc/minter).

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

Add your [Infura](https://infura.io/) project ID and your account private key in `hardhat.config.js`.

```
npx hardhat run scripts/deploy.js --network goerli
```

## Run

```
cd frontend
npm install
npm start
```
## Use

Make sure you have some [Görli ETH](https://goerli-faucet.slock.it/) and go to [https://strat.cc/minter](https://strat.cc/minter).

Choose a name and a symbol, then click on 'Proceed' to deploy Shares.sol on Goerli.  

## Contact

Feel free to [contact me](https://strat.eth.link/contact.html) if you need anything.
