# ĀTO

ĀTO allows anyone to register both physical and digital artworks on Ethereum. The shares are then for sale and holders of these shares can win the NFT.

It deploys `Auction.sol`, `Shares.sol`, `NFT.sol`, `Lottery.sol` and register these new instances in `Clerk.sol`.
A demo is available at [https://ato.works/app](https://ato.works/app).

## Install

```
git clone https://github.com/julienbrg/ato.git
cd ato
npm install
```

## Test

```
npx hardhat test
```

## Deploy

Add your own private key in `hardhat.config.js`.

```
npx hardhat run scripts/deployer.js --network goerli
```

## Run

```
cd frontend
npm install
npm start
```
## Usage

Make sure you have some [Görli ETH](https://goerli-faucet.slock.it/).

Choose a name, symbol, price (in DAI), and a URI (a JSON file that looks like [this](https://gateway.pinata.cloud/ipfs/QmUPPWFhbD8xQsLfTeytAAHpWof6YVVgrazoLpXm2dgPyf)), then click on 'Proceed'.

Click on the GET DAI button to be able to buy shares.
## Contact

Feel free to [contact me](https://strat.eth.link/contact.html) if you need anything.

## License

[GPL 3.0](https://github.com/julienbrg/ato/blob/main/LICENSE.md)
