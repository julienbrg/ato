import React from "react";
import { ethers } from "ethers";
import { BigNumber } from "@ethersproject/bignumber";
import { ContractFactory } from 'ethers';

import DAIArtifact from "../contracts/DAI.json";
import ClerkArtifact from "../contracts/Clerk.json";
import AuctionArtifact from "../contracts/Auction.json";
import NFTArtifact from "../contracts/NFT.json";
import LotteryArtifact from "../contracts/Lottery.json";
import SharesArtifact from "../contracts/Shares.json";

import contractAddress from "../contracts/contract-address.json";

import { NoWalletDetected } from "./NoWalletDetected";
import { ConnectWallet } from "./ConnectWallet";
import { Loading } from "./Loading";
import { Register } from "./Register";
import { Buy } from "./Buy";
import { DisplayMyEtherscanLink } from "./DisplayMyEtherscanLink";
import { SharesInfo } from "./SharesInfo";
import { TransactionErrorMessage } from "./TransactionErrorMessage";
import { WaitingForTx } from "./WaitingForTx";
import { WaitingForTx2 } from "./WaitingForTx2";

const HARDHAT_NETWORK_ID = '5';
// const HARDHAT_NETWORK_ID = '31337';

const ERROR_CODE_TX_REJECTED_BY_USER = 4001;

export class Dapp extends React.Component {
  constructor(props) {
    super(props);

    this.initialState = {

      id: undefined,

      art1: {
          name: undefined,
          symbol: undefined,
          sharesInstance: undefined,
          sharesURL: undefined,
          nftInstance: undefined,
          nftURL: undefined,
          nftImage: undefined,
          auctionIstance: undefined,
          lotteryInstance: undefined,
          lotteryURL: undefined,
          auctionURL: undefined,
          metadata: undefined,
          sharesBalance : undefined,
          price: undefined,
          auctionStatus: undefined,
          verified: undefined
        },

        forSale1: {
            name: undefined,
            author: undefined,
            authorURL: undefined,
            symbol: undefined,
            description: undefined,
            supply: undefined,
            nftImage: undefined,
            auctionInstance: undefined,
            auctionURL: undefined,
            pdf: undefined,
            sharesBalance : undefined,
            price: undefined,
            end: undefined,
          },

      selectedAddress: undefined,
      txBeingSent: undefined,
      transactionError: undefined,
      networkError: undefined,
      registered: undefined,
      cAddr: undefined,
      cAddr2: undefined,
      forSale: undefined,

    };

    this.state = this.initialState;

  }

  render() {
    if (window.ethereum === undefined) {
      return <NoWalletDetected />;
    }

    if (!this.state.selectedAddress) {
      return (
        <ConnectWallet
          connectWallet={() => this._connectWallet()}
          networkError={this.state.networkError}
          dismiss={() => this._dismissNetworkError()}
        />
      );
    }

    if (!this.state.registered) {
    return <Loading />;
    }

    return (

      <div className="container p-4">
        <div className="row">
          <div className="col-12">
            <h1>
              ĀTO
            </h1>
            <p>
              Welcome! Your wallet address is <b>{this.state.selectedAddress}</b>
            </p>

          </div>
        </div>

        <hr />

        <h2>Marketplace</h2>

        <br />

        {this.state.forSale1.name && (

          <div className="row">

            <div className="col-4">

              <img alt="nft" src = {this.state.forSale1.nftImage} className ="img-thumbnail"></img>

            </div>

            <div className="col-8">

              <h4>{this.state.forSale1.name}</h4>
              <p><small>By <a href = {this.state.forSale1.authorURL} >{this.state.forSale1.author}</a></small></p>
              <p><i>{this.state.forSale1.description}</i></p>
              <p>Available supply<b>: {this.state.forSale1.supply} shares</b> <small>(<a target="_blank" rel="noreferrer" href = {this.state.forSale1.pdf} >legal contract attached</a>)</small></p>
              <p>Price: <b>{this.state.forSale1.price} DAI</b> per share</p>
              <p>End of the sale: <b>{this.state.forSale1.end}</b></p>
              <br />

            </div>
          </div>

        )}

        {this.state.forSale1.name && (
          <div className="row">
            <div className="col-4">
            </div>
            <div className="col-8">
            {(
                <Buy
                  Buy={(volume) =>
                    this._Buy(volume)
                  }
                />
              )}
            </div>
          </div>
        )}

        {!this.state.forSale1.name && (
            <p>...</p>
        )}

        <br />

        <div className="row">
          <div className="col-12">

          {this.state.txBeingSent && (
            <WaitingForTx txHash={this.state.txBeingSent} />
          )}
          {this.state.tx2BeingSent && (
            <WaitingForTx2 txHash={this.state.tx2BeingSent} />
          )}

          {this.state.transactionError && (
            <TransactionErrorMessage
              message={this._getRpcErrorMessage(this.state.transactionError)}
              dismiss={() => this._dismissTransactionError()}
            />
          )}

          </div>
        </div>

        {this.state.txBeingSent && (
          <SharesInfo cAddr={this.state.cAddr} />
        )}
        <div className="row">
          <div className="col-12">
          {(
              <Register
                Register={(name, symbol, rate, metadata) =>
                  this._Register(name, symbol, rate, metadata)
                }
              />
            )}
          </div>
        </div>
        <br />

        <hr />

        <h2>Dashboard</h2>
        {!this.state.art1.name && (
          <div className="row">
            <div className="col-12">
            <p>You haven't registered any artwork yet.</p>
            </div>
          </div>
        )}

        {this.state.art1.name && (

          <div className="row">

          <div className="col-12">
          <br />
          <p>You have registered <b><a href = {`https://goerli.etherscan.io/address/${this.state.selectedAddress}#tokentxns`}>{this.state.registered}</a></b> artworks so far.</p>
          <br />
          </div>
          </div>
        )}

        {this.state.art1.name && (

          <div className="row">

            <div className="col-3">
              <img alt="nft" src = {this.state.art1.nftImage} className ="img-thumbnail"></img>
            </div>

            <div className="col-9">

              <h4>{this.state.art1.name}</h4>
              <p>NFT Instance: <b><a target="_blank" rel="noreferrer" href = {this.state.art1.nftURL} >{this.state.art1.nftInstance}</a></b></p>
              <p>Shares Instance: <b><a target="_blank" rel="noreferrer" href = {this.state.art1.sharesURL} >{this.state.art1.sharesInstance}</a></b></p>
              <p>Auction Instance: <b><a target="_blank" rel="noreferrer" href = {this.state.art1.auctionURL} >{this.state.art1.auctionInstance}</a></b></p>
              <p>Lottery Instance: <b><a target="_blank" rel="noreferrer" href = {this.state.art1.lotteryURL} >{this.state.art1.lotteryInstance}</a></b></p>
              <p>Metadata: <b><a target="_blank" rel="noreferrer" href = {this.state.art1.metadata} >{this.state.art1.metadata}</a></b></p>
              <p>You own: <b>{this.state.art1.sharesBalance}</b> shares</p>
              <p>Price per share: <b>{this.state.art1.price}</b> DAI</p>
              <p>Status: <b>{this.state.art1.auctionStatus}</b></p>
              <p><b>{this.state.art1.verified}</b></p>

              <br />
            </div>
          </div>
        )}

          <div className="row">
            <div className="col-12">


              <DisplayMyEtherscanLink
                userAddr={`https://goerli.etherscan.io/address/${this.state.selectedAddress}#tokentxns`}
                />

            </div>
          </div>
          <hr />


        <div className="row">
          <div className="col-12">

            <p><a target="_blank" rel="noreferrer" className="text-success" href="https://github.com/julienbrg/minter">ĀTO v0.1.2 on Github</a></p>
          </div>
        </div>
      </div>
    );
  }

  componentWillUnmount() {
    this._stopPollingData();
  }

  async _connectWallet() {
    const [selectedAddress] = await window.ethereum.enable();
    if (!this._checkNetwork()) {
      return;
    }

    this._initialize(selectedAddress);

    window.ethereum.on("accountsChanged", ([newAddress]) => {
      this._stopPollingData();
      if (newAddress === undefined) {
        return this._resetState();
      }

      this._initialize(newAddress);
    });

    window.ethereum.on("chainChanged", ([networkId]) => {
      this._stopPollingData();
      this._resetState();
    });
  }

  _initialize(userAddress) {

    this.setState({ selectedAddress: userAddress});
    this._intializeEthers();
    this._startPollingData();
  }

  async _intializeEthers() {

    this._provider = new ethers.providers.Web3Provider(window.ethereum);

    this._clerk = new ethers.Contract(

      contractAddress.Clerk,
      ClerkArtifact.abi,
      this._provider.getSigner(0)

    );
    console.log("Clerk instance:", contractAddress);

  }

  _startPollingData() {
    this._pollDataInterval = setInterval(() => this._updateRegistered(), 1000);
    this._updateRegistered();
  }

  _stopPollingData() {
    clearInterval(this._pollDataInterval);
    this._pollDataInterval = undefined;
  }

  async _updateRegistered() {

    // Load the Marketplace data

    var verif = await this._clerk.isThisArtworkVerified(1,0);

    if (verif === true) {

    var aInst = await this._clerk.getAuction(1,0);

    this._auction = new ethers.Contract(
      aInst,
      AuctionArtifact.abi,
      this._provider.getSigner(0)
    );

    var aURL = "https://goerli.etherscan.io/address/" + aInst + "";

    var rateRaw = await this._auction.rate();
    var rate = rateRaw / 1000000000000000000;

    var sInst2 = await this._clerk.getShares(1,0);

    this._shares = new ethers.Contract(
      sInst2,
      SharesArtifact.abi,
      this._provider.getSigner(0)
    );

    var sSymbol = await this._shares.symbol();

    var getBal = await this._shares.balanceOf(aInst);
    var bal = getBal / 1000000000000000000;

    var sharesBalance = await this._shares.balanceOf(this.state.selectedAddress);

    var nInst = await this._clerk.getNFT(1,0);
    this._nft = new ethers.Contract(
      nInst,
      NFTArtifact.abi,
      this._provider.getSigner(0)
    );

    var getEnd = await this._auction.end();
    var formattedEnd = getEnd ;
    var date = new Date(formattedEnd * 1000).toUTCString();

    var getMetadata = await this._nft.tokenURI(1);
    var metadataRaw = await fetch(getMetadata);
    var metadata = await metadataRaw.json();

    var authorURL = "https://etherscan.io/address/" + metadata.address ;

    this.setState({ forSale1: {
      name: metadata.name,
      author: metadata.address,
      authorURL: authorURL,
      symbol: sSymbol,
      description: metadata.description,
      supply: bal,
      nftImage: metadata.image,
      auctionInstance: aInst,
      auctionURL: aURL,
      pdf: metadata.pdf,
      sharesBalance : sharesBalance,
      price: rate,
      end: date,
    } });
  }

    // load the Dashboard data

    const id = await this._clerk.getMyCreatorID();
    this.setState ({ id });

    const x = await this._clerk.howManyArtworksDoIHave();
    this.setState({ x });
    this.setState({ registered: x.toString() });

    if (this.state.registered > 0) {

      var y = this.state.registered - 1;
      var auctionInstance = await this._clerk.getAuction(this.state.id.toString(),y);
      if (auctionInstance === "0x0000000000000000000000000000000000000000") {
        auctionInstance = undefined;
      }
      var nftInstance = await this._clerk.getNFT(this.state.id.toString(),y);
      if (nftInstance === "0x0000000000000000000000000000000000000000") {
        nftInstance = undefined;
      }
      var sharesInstance = await this._clerk.getShares(this.state.id.toString(),y);
      if (sharesInstance === "0x0000000000000000000000000000000000000000") {
        sharesInstance = undefined;
      }
      var lotteryInstance = await this._clerk.getLottery(this.state.id.toString(),y);
      if (lotteryInstance === "0x0000000000000000000000000000000000000000") {
        lotteryInstance = undefined;
      }
      var artworkVerified = await this._clerk.isThisArtworkVerified(this.state.id.toString(),y);
      if (artworkVerified === true) {
        var verified = "This artwork has been verified.";
      } else {
        verified = "This artwork has not been verified.";
      }

      // Poll data from Auction

      this._auction = new ethers.Contract(
        auctionInstance,
        AuctionArtifact.abi,
        this._provider.getSigner(0)
      );

      var auctionURL = "https://goerli.etherscan.io/address/" + auctionInstance + "";
      var lotteryURL = "https://goerli.etherscan.io/address/" + lotteryInstance + "";

      var priceRaw = await this._auction.rate();
      var price = priceRaw / 1000000000000000000;

      var auctionEnd = await this._auction.end();

      let auctionStatus;
      if (auctionEnd < Date.now()) {
        auctionStatus = "started" ;
      } else {
        auctionStatus = "closed" ;
      }

      // Poll data from sharesInstance
      this._shares = new ethers.Contract(
        sharesInstance,
        SharesArtifact.abi,
        this._provider.getSigner(0)
      );

      var sharesName = await this._shares.name();
      var sharesSymbol = await this._shares.symbol();
      var creatorsBalanceRaw = await this._shares.balanceOf(this.state.selectedAddress);
      var creatorsBalance = creatorsBalanceRaw / 1000000000000000000;
      var sharesURL = "https://goerli.etherscan.io/address/" + sharesInstance + "";

      // Poll data from NFT

      this._nft = new ethers.Contract(
        nftInstance,
        NFTArtifact.abi,
        this._provider.getSigner(0)
      );

      var nftURL = "https://goerli.etherscan.io/address/" + nftInstance + "";
      var getArtworkMetadata = await this._nft.tokenURI(1);
      var artworkMetadataRaw = await fetch(getArtworkMetadata);
      var artworkMetadata = await artworkMetadataRaw.json();

      this.setState({ art1: {
        name: sharesName,
        symbol: sharesSymbol,
        sharesInstance: sharesInstance,
        sharesURL: sharesURL,
        nftInstance: nftInstance,
        nftURL: nftURL,
        nftImage: artworkMetadata.image,
        auctionInstance: auctionInstance,
        lotteryInstance: lotteryInstance,
        lotteryURL: lotteryURL,
        auctionURL: auctionURL,
        metadata: getArtworkMetadata,
        sharesBalance : creatorsBalance,
        price: price,
        auctionStatus: auctionStatus,
        verified: verified
      } });
    }
  }

  async _Register(name, symbol, rate, metadata) {

    try {

      this._dismissTransactionError();

      const signer = this._provider.getSigner(0);

      // User deploy Lottery.sol
      const lotteryABI = LotteryArtifact.abi;
      const lotteryBytecode = LotteryArtifact.bytecode;
      const prepareLottery = new ContractFactory(lotteryABI, lotteryBytecode, signer);
      const lottery = await prepareLottery.deploy();
      console.log("Lottery.sol deployed:", lottery.address);
      this.setState({ txBeingSent: lottery.deployTransaction.hash });

      // User deploy NFT.sol
      const nftABI = NFTArtifact.abi;
      const nftBytecode = NFTArtifact.bytecode;
      const prepareNFT = new ContractFactory(nftABI, nftBytecode, signer);
      const nft = await prepareNFT.deploy(name, symbol, metadata, lottery.address, {gasLimit:5000000});
      await nft.deployed();
      console.log("NFT.sol deployed:", nft.address);

      // User deploy Auction.sol
      this._lottery = new ethers.Contract(
        lottery.address,
        LotteryArtifact.abi,
        this._provider.getSigner(0)
      );

      const end = await this._lottery.end();

      const abi = AuctionArtifact.abi;
      const bytecode = AuctionArtifact.bytecode;
      const prepareAuction = new ContractFactory(abi, bytecode, signer);
      const auction = await prepareAuction.deploy("0x23284128a90A928Cad13f1B082e7A371b48D03Dd", lottery.address, BigNumber.from("10000000000000000"), end);
      await auction.deployed();
      console.log("Auction.sol deployed:", auction.address);

      // User addAuction in Lottery.sol
      const addAuction = await this._lottery.addAuction(auction.address);
      await addAuction.wait();
      console.log("addAuction() done.");

      // User addNFT in Lottery.sol
      const addNFT = await this._lottery.addNFT(nft.address);
      await addNFT.wait();
      console.log("addNFT() done.");

      // User deploy Shares.sol
      const sharesABI = SharesArtifact.abi;
      const sharesBytecode = SharesArtifact.bytecode;
      const prepareShares = new ContractFactory(sharesABI, sharesBytecode, signer);
      const shares = await prepareShares.deploy(name, symbol, auction.address);
      await shares.deployed();
      console.log("Shares.sol deployed:", shares.address);

      // User addShares to Auction.sol
      this._auction = new ethers.Contract(
        auction.address,
        AuctionArtifact.abi,
        this._provider.getSigner(0)
      );

      const addShares = await this._auction.addShares(shares.address);
      await addShares.wait();
      console.log("addShares() done.");

      const register = await this._clerk.registerArtwork(shares.address, nft.address, auction.address, lottery.address);
      await register.wait();
      console.log("Registration tx hash:", register.hash);

      const start = await this._auction.start();
      await start.wait();
      console.log("start() done.");

      const receipt = await register.wait();

      if (receipt.status === 0) {
        throw new Error("Transaction failed");
      }

      await this._updateRegistered();

    } catch (error) {
      if (error.code === ERROR_CODE_TX_REJECTED_BY_USER) {
        return;
      }
      console.error(error);
      this.setState({ transactionError: error });

    } finally {

      this.setState({ txBeingSent: undefined });
    }
  }

  async _Buy(volume) {

    try {

      this._dismissTransactionError();

      // Approve

      this._dai = new ethers.Contract(
        "0x23284128a90A928Cad13f1B082e7A371b48D03Dd",
        DAIArtifact.abi,
        this._provider.getSigner(0)
      );

      const volume2 = volume * 1000000000000000000;
      const volume3 = volume2.toString();
      console.log("volume3:", volume3);

      const toApprove = volume3 * this.state.forSale1.price;
      console.log("toApprove:", toApprove);

      const approveMyDAI = await this._dai.approve(this.state.forSale1.auctionInstance, BigNumber.from(toApprove.toString()));
      await approveMyDAI.wait();

      // Buy

      const buy = await this._auction.buy(BigNumber.from(volume3),1 );
      const receipt = await buy.wait();

      if (receipt.status === 0) {
        throw new Error("Transaction failed");
      }
      new Audio('../level-up.mp3').play();
      await this._updateRegistered();

    } catch (error) {
      if (error.code === ERROR_CODE_TX_REJECTED_BY_USER) {
        return;
      }
      console.error(error);
      this.setState({ transactionError: error });

    } finally {

      this.setState({ txBeingSent: undefined });

    }
  }


  _dismissTransactionError() {
    this.setState({ transactionError: undefined });
  }

  _dismissNetworkError() {
    this.setState({ networkError: undefined });
  }

  _getRpcErrorMessage(error) {
    if (error.data) {
      return error.data.message;
    }

    return error.message;
  }

  _resetState() {
    this.setState(this.initialState);
  }

  _checkNetwork() {
    if (window.ethereum.networkVersion === HARDHAT_NETWORK_ID) {
      return true;
    }

    this.setState({
      networkError: 'Please switch your Metamask to Goerli Network'
    });

    return false;
  }
}
