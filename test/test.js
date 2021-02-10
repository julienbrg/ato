const {expect} = require("chai");

describe("Āto", function () {

//CONTRACT
    let DAI;
    let Lottery;
    let NFT;
    let Auction;
    let Shares;
    let Clerk;
    let Ato;

//ROLE
    let owner;
    let artist;
    let buyer;
    let holder;

//CONTRACT deploy
    let dai;
    let clerk;
    let lottery
    let nft;
    let auction;
    let shares;
    let ato;


    beforeEach(async function () {

        [owner, artist, buyer, holder] = await ethers.getSigners();

        Clerk = await ethers.getContractFactory("Clerk");
        clerk = await Clerk.deploy();
        await clerk.deployed();

        DAI = await ethers.getContractFactory("DAI");
        dai = await DAI.connect(buyer).deploy();
        await dai.deployed();

        Lottery = await ethers.getContractFactory("Lottery");
        lottery = await Lottery.connect(artist).deploy();
        await lottery.deployed();

        NFT = await ethers.getContractFactory("NFT");
        nft = await NFT.connect(artist).deploy("z", "z", "https://strat.cc/nft.json", lottery.address);
        await nft.deployed();

        Ato = await ethers.getContractFactory("Ato");
        ato = await Ato.connect(holder).deploy();
        await ato.deployed();

        Auction = await ethers.getContractFactory("Auction");
        auction = await Auction.connect(artist).deploy(dai.address, lottery.address, ethers.utils.parseEther('1'), lottery.end(), ato.address);
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
            console.log("Holder's address: ", holder.address);
            console.log(" ");

            const creatorOwner = await clerk.numCreators;
            expect(await creatorOwner()).to.equal(1);
        });

        it("Clerk.sol deployer should be the owner", async function () {
            expect(await clerk.owner()).to.equal(owner.address);
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

        it("Holder should own 10,000 ATO token", async function () {
            let holdersBalance = await ato.balanceOf(holder.address);
            let holdersBalanceHex = holdersBalance.toString();
            expect(holdersBalanceHex).to.equal('10000000000000000000000');
        });

    });

    describe("Auction", function () {

        it("Should receive 5000 DAI", async function () {
            await dai.connect(buyer).withdraw();
            let balanceB1 = await dai.balanceOf(buyer.address);
            balanceB1 = balanceB1.toString();
            expect(balanceB1).to.equal('1000050000000000000000000');
        });


        it("Buyer should not be able to buy 1 share", async function () {
            await auction.start();
            await expect(auction.connect(buyer).buy(1, 12)).to.be.revertedWith("The minimum amount is 10 shares.");
        });

        it("Holder should be able to buy 50 shares", async function () {
            await auction.start();
            let volume = ethers.utils.parseEther('5');

            await dai.connect(holder).withdraw();
            await dai.connect(holder).approve(auction.address, volume);
            await auction.connect(holder).buy(volume, 12);

            let holderBalance = await shares.balanceOf(holder.address);
            let holderBalanceHex = holderBalance.toString();
            expect(holderBalanceHex).to.equal('5000000000000000000');
        });

        it("Artist should receive 25 DAI", async function () {
            await auction.start();
            let volume = ethers.utils.parseEther('5');

            await dai.connect(holder).withdraw();
            await dai.connect(holder).approve(auction.address, volume);
            await auction.connect(holder).buy(volume, 12);

            let artistBalance = await dai.balanceOf(artist.address);
            let artistBalanceHex = artistBalance.toString();
            expect(artistBalanceHex).to.equal('2500000000000000000');
        });

    });

    describe("NFT Lottery", function () {

        it("No one should be able to run the lottery before the auction ended", async function () {
            await expect(lottery.run()).to.be.revertedWith("The auction is not over yet.");
        });

        it("The winner should be able to withdraw his NFT", async function () {
            let volume = ethers.utils.parseEther('5000');
            let v1 = ethers.utils.parseEther('3500');//MAX 4059
            let v2 = ethers.utils.parseEther('1500');
            await dai.connect(buyer).withdraw();
            await auction.start();
            await dai.connect(buyer).approve(auction.address, volume);
            await auction.connect(buyer).buy(v1, 12, {gasLimit: 9500000});  //gasLimit MAX 9500000
            await auction.connect(buyer).buy(v2, 12, {gasLimit: 9500000});
            await lottery.run();
            await lottery.connect(buyer).withdraw();
            expect(await nft.ownerOf(1)).to.equal(await buyer.address);
        });

    });

});
