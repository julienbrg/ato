async function main() {

  if (network.name === "hardhat") {
    console.log("network: ", network.name);
    console.warn(
      "You are trying to deploy a contract to the Hardhat Network, which" +
        "gets automatically created and destroyed every time. Use the Hardhat" +
        " option '--network localhost'"
    );
  }

  // // Deploy DAI.sol
  const DAI = await ethers.getContractFactory("DAI");
  const dai = await DAI.deploy();
  await dai.deployed();
  console.log("DAI.sol deployed at", dai.address);

  // Deploy Auction.sol
  const [deployer] = await ethers.getSigners();
  const Auction = await ethers.getContractFactory("Auction");
  const auction = await Auction.deploy("0x0000000000000000000000000000000000000000",30000000000000);
  await auction.deployed();
  console.log("Auction.sol deployed at", auction.address);

  // Deploy Lottery.solidity
  const Lottery = await ethers.getContractFactory("Lottery");
  const lottery = await Lottery.deploy();
  await lottery.deployed();
  console.log("Lottery.sol deployed at", lottery.address);

  // Deploy NFT.sol
  const NFT = await ethers.getContractFactory("NFT");
  const _name = "Coucou";
  const _symbol = "CC";
  const _tokenURI = "https://strat.cc/nft.json";
  const nft = await NFT.deploy(_name,_symbol,_tokenURI,"0x70997970c51812dc3a010c7d01b50e0d17dc79c8");
  await nft.deployed();
  console.log("NFT.sol deployed at", nft.address);

  // Deploy Shares.sol
  const Shares = await ethers.getContractFactory("Shares");
  const shares = await Shares.deploy(_name, _symbol, auction.address);
  await shares.deployed();
  console.log("Shares.sol deployed at", shares.address);

  // Deploy Clerk.sol
  const Clerk = await ethers.getContractFactory("Clerk");
  const clerk = await Clerk.deploy();
  await clerk.deployed();
  console.log("Clerk.sol deployed at", clerk.address);

  saveFrontendFiles(auction);
  saveFrontendFiles(lottery);
  saveFrontendFiles(nft);
  saveFrontendFiles(shares);
  saveFrontendFiles(clerk);
}

function saveFrontendFiles(auction) {

  const AuctionArtifact = artifacts.readArtifactSync("Auction");
  fs.writeFileSync(
    contractsDir + "/Auction.json",
    JSON.stringify(AuctionArtifact, null, 2)
  );
}

function saveFrontendFiles(lottery) {
  const LotteryArtifact = artifacts.readArtifactSync("Lottery");
  fs.writeFileSync(
    contractsDir + "/Lottery.json",
    JSON.stringify(LotteryArtifact, null, 2)
  );
}

function saveFrontendFiles(nft) {
  const AuctionArtifact = artifacts.readArtifactSync("NFT");
  fs.writeFileSync(
    contractsDir + "/NFT.json",
    JSON.stringify(NFTArtifact, null, 2)
  );
}

function saveFrontendFiles(shares) {
  const SharesArtifact = artifacts.readArtifactSync("Shares");
  fs.writeFileSync(
    contractsDir + "/Shares.json",
    JSON.stringify(SharesArtifact, null, 2)
  );
}

function saveFrontendFiles(clerk) {
  const fs = require("fs");
  const contractsDir = __dirname + "/../frontend/src/contracts";

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    contractsDir + "/contract-address.json",
    JSON.stringify({ Clerk: clerk.address }, undefined, 2)
  );

  const ClerkArtifact = artifacts.readArtifactSync("Clerk");

  fs.writeFileSync(
    contractsDir + "/Clerk.json",
    JSON.stringify(ClerkArtifact, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
