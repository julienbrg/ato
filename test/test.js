const { expect } = require("chai");

describe("Minter", function () {
  let Minter;
  let registered;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  beforeEach(async function () {
    Minter = await ethers.getContractFactory("Minter");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    minter = await Minter.deploy();
    await minter.deployed();
  });

  describe("Deployment", function () {

    it("Should set the right owner", async function () {
      expect(await minter.owner()).to.equal(owner.address);
    });

    it("The number of registered contracts should be equal to 0", async function () {
      const ownerMinter = await minter.getArtworkData();
      expect(await minter.getArtworkData()).to.equal(0);
    });
  });

  describe("Transactions", function () {
    it("The number of registered contracts should be equal to 1", async function () {

      await minter.registerArtwork("0xb2103FB4cea21dB228f2cce5c5304eD061954caE");
      const addr1Minter = await minter.getArtworkData();
      expect(addr1Minter).to.equal(1);
    });

    it("addr1's number of registered contracts should be equal to 8", async function () {
      await minter.registerArtwork("0xb2103FB4cea21dB228f2cce5c5304eD061954caE");
      const addr1Minter = await minter.getArtworkData();
      expect(addr1Minter).to.equal(1);
    });
  });
});
