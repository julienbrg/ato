const { expect } = require("chai");

describe("Clerk", function () {
  let Clerk;
  let registered;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  beforeEach(async function () {
    Clerk = await ethers.getContractFactory("Clerk");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    clerk = await Clerk.deploy();
    await clerk.deployed();
  });

  describe("Deployment", function () {

    it("Should set the right owner", async function () {
      expect(await clerk.owner()).to.equal(owner.address);
    });

    it("Onwner can renounce ownership", async function () {
      const renounce = await clerk.renounceOwnership();
      expect(await clerk.owner()).to.equal("0x0000000000000000000000000000000000000000");
    });

    it("Owner can transfer ownership", async function () {
      const clerkOwner = await clerk.transferOwnership("0x0f336102366b969c1eA3716CccD898Ca8779D521");
      expect(await clerk.owner()).to.equal("0x0f336102366b969c1eA3716CccD898Ca8779D521");
    });

    it("Number of creators is set to 0", async function () {
      const clerkOwner = await clerk.numCreators();
      expect(await clerk.numCreators()).to.equal(1);
    });
  });

  describe("Transactions", function () {

    it("should register 1 artwork", async function () {
      await clerk.registerArtwork("0x0f336102366b969c1eA3716CccD898Ca8779D521","0x0f336102366b969c1eA3716CccD898Ca8779D521");
      const art = await clerk.getArtworkAddr(1,0);
      expect(art).to.equal("0x0f336102366b969c1eA3716CccD898Ca8779D521");
    });

    it("should register with NFT instance", async function () {
      await clerk.registerArtwork("0x0000000000000000000000000000000000000000","0x0f336102366b969c1eA3716CccD898Ca8779D521");
      const art = await clerk.getNFTAddr(1,0);
      expect(art).to.equal("0x0f336102366b969c1eA3716CccD898Ca8779D521");
    });

  });
});
