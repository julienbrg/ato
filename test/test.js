const { expect } = require("chai");
// const Big = require("big.mjs");

describe("Āto", function () {

  let DAI;
  let Lottery;
  let NFT;
  let Auction;
  let Shares;
  let Clerk;
  let creator;
  let buyer;
  let team;

  beforeEach(async function () {

    [creator, buyer, team, ...addrs] = await ethers.getSigners();

    DAI = await ethers.getContractFactory("DAI");
    dai = await DAI.deploy();
    await dai.deployed();

    Clerk = await ethers.getContractFactory("Clerk");
    clerk = await Clerk.deploy();
    await clerk.deployed();

    Lottery = await ethers.getContractFactory("Lottery");
    lottery = await Lottery.deploy();
    await lottery.deployed();

    NFT = await ethers.getContractFactory("NFT");
    nft = await NFT.deploy("z", "z", "https://strat.cc/nft.json", lottery.address);
    await nft.deployed();

    Auction = await ethers.getContractFactory("Auction");
    auction = await Auction.deploy(dai.address);
    await auction.deployed();

    Shares = await ethers.getContractFactory("Shares");
    shares = await Shares.deploy("z", "z", auction.address);
    await shares.deployed();

  });

  describe("Deployments", function () {

    it("DAI.sol is deployed", async function () {
      const res1 = await dai.balanceOf(creator.address);
      const res2 = res1._hex;
      expect(res2).to.equal("0x021e19e0c9bab2400000");
    });

    it("Clerk.sol is deployed", async function () {
      const creatorOwner = await clerk.numCreators;
      expect(await creatorOwner()).to.equal(1);
    });

    it("Lottery.sol is deployed", async function () {
      const res3 = await lottery.addNFT("0x0000000000000000000000000000000000000000");
      expect(await lottery.nft()).to.equal("0x0000000000000000000000000000000000000000");
    });

    it("NFT.sol is deployed", async function () {
      const res4 = await nft.ownerOf(1);
      expect(res4).to.equal(lottery.address);
    });

    it("Auction.sol is deployed", async function () {
      expect(await auction.dai()).to.equal(dai.address);
    });

    it("Shares.sol is deployed", async function () {
      const res5 = await shares.balanceOf(auction.address);
      const res6 = res5._hex;
      expect(res6).to.equal("0x010f0cf064dd59200000");
    });
 });

  describe("Interactions", function () {

    it("Creator should register 1 artwork", async function () {
      await clerk.registerArtwork(shares.address,nft.address,auction.address);
      const art = await clerk.howManyArtworksDoIHave();
      expect(art).to.equal(1);
    });

    // it("Buyer should buy", async function () {
    //   console.log("      Buyer can't buy because I can't manage these 'big numbers' yet.");
    //   await clerk.registerArtwork(shares.address, nft.address, auction.address);
    //   // const approve = 4000000000000000000;
    //   await dai.approve(auction.address, approve);
    //   const buy = await auction.bid();
    //   // auctionEnd
    //   // withdraw
    //   expect(await auction.highestBidder).to.equal(buyer.address);
    // });

  });
});
