# ĀTO

ĀTO v0.1.2 allows anyone to register both physical and digital artworks on Ethereum. The shares are then for sale and holders of these shares can win the NFT. 

It deploys `Auction.sol`, `Shares.sol`, `NFT.sol`, and register these new instances in `Clerk.sol`.

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
npx hardhat run scripts/deployer.js --network goerli
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
