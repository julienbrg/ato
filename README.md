# Minter

This project was bootstrapped with [Hardhat](https://github.com/nomiclabs/hardhat) and  [Create React App](https://github.com/facebook/create-react-app).

## Motivation

I needed to test the deployment of an ERC20 from a UI.

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

## Deploy to Ropsten

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
