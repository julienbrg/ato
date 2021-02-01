const {expect} = require("chai");

describe("Āto", function () {

//CONTRACT
    let DAI;
    let Lottery;
    let NFT;
    let Auction;
    let Shares;
    let Clerk;

//ROLE
    let owner;
    let artist;
    let buyer;

//CONTRACT deploy
    let dai;
    let clerk;
    let lottery
    let nft;
    let auction;
    let shares;


    beforeEach(async function () {

        [owner, artist, buyer, buyer1] = await ethers.getSigners();

        Clerk = await ethers.getContractFactory("Clerk");
        clerk = await Clerk.deploy();
        await clerk.deployed();

        DAI = await ethers.getContractFactory("DAI");
        dai = await DAI.connect(buyer).deploy();
        await dai.deployed();

        Lottery = await ethers.getContractFactory("Lottery");
        lottery = await Lottery.deploy();
        await lottery.deployed();

        NFT = await ethers.getContractFactory("NFT");
        nft = await NFT.deploy("z", "z", "https://strat.cc/nft.json", lottery.address);
        await nft.deployed();

        Auction = await ethers.getContractFactory("Auction");
        auction = await Auction.deploy(dai.address, lottery.address, ethers.utils.parseEther('1'), lottery.end());
        await auction.deployed();

        await lottery.addAuction(auction.address);
        await lottery.addNFT(nft.address);

        Shares = await ethers.getContractFactory("Shares");
        shares = await Shares.connect(artist).deploy("z", "z", auction.address);
        await shares.deployed();

        await auction.addShares(shares.address);

    });

    describe("Deployments", function () {

        it("Clerk.sol should be deployed", async function () {

            console.log(" ");
            console.log("Owner's address: ", owner.address);
            console.log("Artist's address: ", artist.address);
            console.log("Buyer's address: ", buyer.address);
            console.log(" ");

            const creatorOwner = await clerk.numCreators;
            expect(await creatorOwner()).to.equal(1);
        });

        it("Clerk.sol deployer should be the owner", async function () {
            expect(await clerk.owner()).to.equal(owner.address);
        });

    });

    describe("Try Magic DAI for testnet", function () {
        it("Magic DAI give 50 DAI token", async function () {
            await dai.connect(buyer).withdraw();
            let balanceB1 = await dai.balanceOf(buyer.address);
            balanceB1 = balanceB1.toString();
            expect(balanceB1).to.equal('50000000000000000000');
        });
    });

    describe("Artwork registration", function () {

        it("An artwork should be registered", async function () {
            await clerk.connect(artist).registerArtwork(shares.address, nft.address, auction.address, lottery.address);
            const art = await clerk.connect(artist).howManyArtworksDoIHave();
            expect(art).to.equal(1);
        });

        it("The owner should be able to verify the artwork", async function () {
            await clerk.verify(1, 0);
            const verified = await clerk.isThisArtworkVerified(1, 0);
            expect(verified).to.equal(true);
        });

        it("Auction.sol should accept DAI", async function () {
            const adressContract = await auction.dai();
            expect(adressContract).to.equal(dai.address);
        });

        it("The artist should own 5,000 shares of his artwork", async function () {
            let artistBalance = await shares.balanceOf(artist.address);
            let artistBalanceHex = artistBalance.toString();
            expect(artistBalanceHex).to.equal('5000000000000000000000');
        });

        it("Auction.sol should hold 5,000 shares", async function () {
            let auctionBalance = await shares.balanceOf(auction.address);
            let auctionBalanceHex = auctionBalance.toString();
            expect(auctionBalanceHex).to.equal('5000000000000000000000');
        });

        it("Lottery.sol holds the NFT", async function () {
            let addressNFT = await nft.ownerOf(1);
            expect(addressNFT).to.equal(lottery.address);
        });

    });

    describe("Auction", function () {

        it("Buyer should be able to buy 1 share", async function () {
            await auction.start();
            await auction.connect(buyer).buy(1, 12);
            let buyerBalance = await shares.balanceOf(buyer.address);
            let buyerBalanceHex = buyerBalance.toString();
            expect(buyerBalanceHex).to.equal('1');
        });

    });

    describe("NFT Lottery", function () {

        it("No one should be able to run the lottery before the auction ended", async function () {
            await expect(lottery.run()).to.be.revertedWith("The auction is not over yet.");
        });

        it("Anyone should be able to run the lottery and the winner of the NFT should hold his NFT", async function () {
            let volume = ethers.utils.parseEther('49');//MAX 4059
            await dai.connect(buyer).withdraw();
            await auction.start();
            await dai.connect(buyer).approve(auction.address, volume);
            await auction.connect(buyer).buy(volume, 12); //gasLimit MAX 9500000
            await lottery.hardStop();
            await lottery.run();
            await lottery.connect(buyer).withdraw();
            expect(await nft.ownerOf(1)).to.equal(await buyer.address);
        });

    });

});
