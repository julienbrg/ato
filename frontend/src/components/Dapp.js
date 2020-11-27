import React from "react";
import { ethers } from "ethers";
import { ContractFactory } from 'ethers';
import ClerkArtifact from "../contracts/Clerk.json";
import AuctionArtifact from "../contracts/Auction.json";
import NFTArtifact from "../contracts/NFT.json";

import contractAddress from "../contracts/contract-address.json";
import SharesArtifact from "../contracts/Shares.json";
import { NoWalletDetected } from "./NoWalletDetected";
import { ConnectWallet } from "./ConnectWallet";
import { Loading } from "./Loading";
import { Register } from "./Register";
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
          supply: undefined,
          nftInstance: undefined,
          nftURL: undefined,
          nftImage: undefined,
          auctionIstance: undefined,
          auctionURL: undefined,
          price: undefined
        },

      selectedAddress: undefined,
      txBeingSent: undefined,
      transactionError: undefined,
      networkError: undefined,
      registered: undefined,
      cAddr: undefined,
      cAddr2: undefined,

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

    // console.log(this.state.art1.nftImage);
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
        <p><i>[display items for sale]</i></p>
        <br />
        <p>...</p>
        <br />

        <hr />

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

        <h2>Dashboard</h2>

        {!this.state.registered && (
          <div className="row">
            <div className="col-12">
            <p>You haven't registered any artwork yet.</p>


            </div>
          </div>
        )}

        {this.state.registered && (

          <div className="row">

          <div className="col-12">
          <br />
          <p>You have registered <b><a href = {`https://goerli.etherscan.io/address/${this.state.selectedAddress}#tokentxns`}>{this.state.registered}</a></b> artworks so far.</p>
          <p>Here's your latest: </p>
          <br />
          </div>
          </div>
        )}

        {this.state.art1.name && (

          <div className="row">

          <div className="col-3">

          <img src = {this.state.art1.nftImage} className ="img-thumbnail"></img>

          </div>
          <div className="col-9">

          <h4>{this.state.art1.name}</h4>
          <p>Auction Instance: <b><a target="_blank" rel="noreferrer" href = {this.state.art1.auctionURL} >{this.state.art1.auctionInstance}</a></b></p>
          <p>NFT Instance: <b><a target="_blank" rel="noreferrer" href = {this.state.art1.nftURL} >{this.state.art1.nftInstance}</a></b></p>
          <p>Shares Instance: <b><a target="_blank" rel="noreferrer" href = {this.state.art1.sharesURL} >{this.state.art1.sharesInstance}</a></b></p>
          <p>Supply: <b>{this.state.art1.supply} {this.state.art1.symbol}</b></p>
          <p>Price per share: <b>{this.state.art1.price} €</b></p>
          <p>Status: <b className="text-success">auction started</b></p>

          <br />
          </div>
          </div>
        )}

          <div className="row">
            <div className="col-12">
            {this.state.id > 0 && (

              <DisplayMyEtherscanLink
                userAddr={`https://goerli.etherscan.io/address/${this.state.selectedAddress}#tokentxns`}
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
                  Register={(name, symbol) =>
                    this._Register(name, symbol)
                  }
                />
              )}
            </div>
          </div>
          <br />
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
    console.log("Instance of Clerk.sol: ",contractAddress);

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

    this._clerk = new ethers.Contract(

      contractAddress.Clerk,
      ClerkArtifact.abi,
      this._provider.getSigner(0)

    );

    const id = await this._clerk.getMyCreatorID();
    this.setState ({ id });

    const x = await this._clerk.howManyArtworksDoIHave();
    this.setState({ x });
    this.setState({ registered: x.toString() });

    if (this.state.registered > 0) {

      // Get artwork sharesInstance and auctionInstance
      var y = this.state.registered - 1;
      var auctionInstance = await this._clerk.getAuctionInstance(this.state.id.toString(),y);
      if (auctionInstance === "0x0000000000000000000000000000000000000000") {
        auctionInstance = undefined;
      }
      var nftInstance = await this._clerk.getNFTInstance(this.state.id.toString(),y);
      if (nftInstance === "0x0000000000000000000000000000000000000000") {
        nftInstance = undefined;
      }
      var sharesInstance = await this._clerk.getSharesInstance(this.state.id.toString(),y);
      if (sharesInstance === "0x0000000000000000000000000000000000000000") {
        sharesInstance = undefined;
      }


      // Poll data from auctionInstance

      this._auction = new ethers.Contract(
        auctionInstance,
        AuctionArtifact.abi,
        this._provider.getSigner(0)
      );

      var auctionPriceBig = await this._auction.price();
      var auctionPrice = auctionPriceBig.toString();
      var auctionURL = "https://goerli.etherscan.io/address/" + auctionInstance + "";

      // Poll data from sharesInstance
      this._shares = new ethers.Contract(
        sharesInstance,
        SharesArtifact.abi,
        this._provider.getSigner(0)
      );

      var sharesName = await this._shares.name();
      var sharesSymbol = await this._shares.symbol();
      var sharesSupply = "10,000";
      var sharesURL = "https://goerli.etherscan.io/address/" + sharesInstance + "";

      // Poll data from nftInstance

      this._nft = new ethers.Contract(
        nftInstance,
        NFTArtifact.abi,
        this._provider.getSigner(0)
      );

      var tokenURI = await this._nft.tokenURI(1);

      // Faux. Il faut se connecter à l'URI récup l'URL de l'image.
      var nftImage = tokenURI.image ;

      // console.log("nftImage:", nftImage);

      var nftURL = "https://goerli.etherscan.io/address/" + nftInstance + "";

      // Update all states
      this.setState({ art1: {
        name: sharesName,
        symbol: sharesSymbol,
        sharesInstance: sharesInstance,
        sharesURL: sharesURL,
        supply: sharesSupply,
        nftInstance: nftInstance,
        nftURL: nftURL,
        nftImage: "https://strat.cc/load-runner.png",
        auctionInstance: auctionInstance,
        auctionURL: auctionURL,
        price: auctionPrice
      } });


    }
  }

  async _Register(name, symbol) {

    try {

      this._dismissTransactionError();

      const signer = this._provider.getSigner(0);


      // User deploy Auction.sol
      const abi = [
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "addr1",
				"type": "address"
			}
		],
		"name": "addNftInstance",
		"outputs": [
			{
				"internalType": "bool",
				"name": "ok",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "addr1",
				"type": "address"
			}
		],
		"name": "addSharesInstance",
		"outputs": [
			{
				"internalType": "bool",
				"name": "ok",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "buy",
		"outputs": [
			{
				"internalType": "string",
				"name": "receipt",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "endAuction",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "nftInstance",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "price",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "sharesInstance",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]
      const bytecode = {
	"linkReferences": {},
	"object": "608060405234801561001057600080fd5b50600160028190555062093a8042016003819055507f48656c6c6f2100000000000000000000000000000000000000000000000000006040518082815260200191505060405180910390a06103ed8061006a6000396000f3fe608060405234801561001057600080fd5b506004361061007d5760003560e01c8063d96a094a1161005b578063d96a094a1461012e578063ebd91c8c146101d5578063fc9d70f014610209578063fe67a54b146102635761007d565b8063185f518914610082578063a035b1fe146100dc578063ac5e4dd8146100fa575b600080fd5b6100c46004803603602081101561009857600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050610281565b60405180821515815260200191505060405180910390f35b6100e46102cc565b6040518082815260200191505060405180910390f35b6101026102d2565b604051808273ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b61015a6004803603602081101561014457600080fd5b81019080803590602001909291905050506102f8565b6040518080602001828103825283818151815260200191508051906020019080838360005b8381101561019a57808201518184015260208101905061017f565b50505050905090810190601f1680156101c75780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b6101dd610341565b604051808273ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b61024b6004803603602081101561021f57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050610365565b60405180821515815260200191505060405180910390f35b61026b6103b1565b6040518082815260200191505060405180910390f35b6000816000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555060019050919050565b60025481565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b60606040518060400160405280600a81526020017f5468616e6b20796f752100000000000000000000000000000000000000000000815250905060006002548302905050919050565b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b600081600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555060019050919050565b6003548156fea264697066735822122053db9510ab49821a7a5a58e17c3bfec40e6515364b7dbf78c4ddbf904475cdc164736f6c634300060c0033",
	"opcodes": "PUSH1 0x80 PUSH1 0x40 MSTORE CALLVALUE DUP1 ISZERO PUSH2 0x10 JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST POP PUSH1 0x1 PUSH1 0x2 DUP2 SWAP1 SSTORE POP PUSH3 0x93A80 TIMESTAMP ADD PUSH1 0x3 DUP2 SWAP1 SSTORE POP PUSH32 0x48656C6C6F210000000000000000000000000000000000000000000000000000 PUSH1 0x40 MLOAD DUP1 DUP3 DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 LOG0 PUSH2 0x3ED DUP1 PUSH2 0x6A PUSH1 0x0 CODECOPY PUSH1 0x0 RETURN INVALID PUSH1 0x80 PUSH1 0x40 MSTORE CALLVALUE DUP1 ISZERO PUSH2 0x10 JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST POP PUSH1 0x4 CALLDATASIZE LT PUSH2 0x7D JUMPI PUSH1 0x0 CALLDATALOAD PUSH1 0xE0 SHR DUP1 PUSH4 0xD96A094A GT PUSH2 0x5B JUMPI DUP1 PUSH4 0xD96A094A EQ PUSH2 0x12E JUMPI DUP1 PUSH4 0xEBD91C8C EQ PUSH2 0x1D5 JUMPI DUP1 PUSH4 0xFC9D70F0 EQ PUSH2 0x209 JUMPI DUP1 PUSH4 0xFE67A54B EQ PUSH2 0x263 JUMPI PUSH2 0x7D JUMP JUMPDEST DUP1 PUSH4 0x185F5189 EQ PUSH2 0x82 JUMPI DUP1 PUSH4 0xA035B1FE EQ PUSH2 0xDC JUMPI DUP1 PUSH4 0xAC5E4DD8 EQ PUSH2 0xFA JUMPI JUMPDEST PUSH1 0x0 DUP1 REVERT JUMPDEST PUSH2 0xC4 PUSH1 0x4 DUP1 CALLDATASIZE SUB PUSH1 0x20 DUP2 LT ISZERO PUSH2 0x98 JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST DUP2 ADD SWAP1 DUP1 DUP1 CALLDATALOAD PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND SWAP1 PUSH1 0x20 ADD SWAP1 SWAP3 SWAP2 SWAP1 POP POP POP PUSH2 0x281 JUMP JUMPDEST PUSH1 0x40 MLOAD DUP1 DUP3 ISZERO ISZERO DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 RETURN JUMPDEST PUSH2 0xE4 PUSH2 0x2CC JUMP JUMPDEST PUSH1 0x40 MLOAD DUP1 DUP3 DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 RETURN JUMPDEST PUSH2 0x102 PUSH2 0x2D2 JUMP JUMPDEST PUSH1 0x40 MLOAD DUP1 DUP3 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 RETURN JUMPDEST PUSH2 0x15A PUSH1 0x4 DUP1 CALLDATASIZE SUB PUSH1 0x20 DUP2 LT ISZERO PUSH2 0x144 JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST DUP2 ADD SWAP1 DUP1 DUP1 CALLDATALOAD SWAP1 PUSH1 0x20 ADD SWAP1 SWAP3 SWAP2 SWAP1 POP POP POP PUSH2 0x2F8 JUMP JUMPDEST PUSH1 0x40 MLOAD DUP1 DUP1 PUSH1 0x20 ADD DUP3 DUP2 SUB DUP3 MSTORE DUP4 DUP2 DUP2 MLOAD DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP DUP1 MLOAD SWAP1 PUSH1 0x20 ADD SWAP1 DUP1 DUP4 DUP4 PUSH1 0x0 JUMPDEST DUP4 DUP2 LT ISZERO PUSH2 0x19A JUMPI DUP1 DUP3 ADD MLOAD DUP2 DUP5 ADD MSTORE PUSH1 0x20 DUP2 ADD SWAP1 POP PUSH2 0x17F JUMP JUMPDEST POP POP POP POP SWAP1 POP SWAP1 DUP2 ADD SWAP1 PUSH1 0x1F AND DUP1 ISZERO PUSH2 0x1C7 JUMPI DUP1 DUP3 SUB DUP1 MLOAD PUSH1 0x1 DUP4 PUSH1 0x20 SUB PUSH2 0x100 EXP SUB NOT AND DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP JUMPDEST POP SWAP3 POP POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 RETURN JUMPDEST PUSH2 0x1DD PUSH2 0x341 JUMP JUMPDEST PUSH1 0x40 MLOAD DUP1 DUP3 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 RETURN JUMPDEST PUSH2 0x24B PUSH1 0x4 DUP1 CALLDATASIZE SUB PUSH1 0x20 DUP2 LT ISZERO PUSH2 0x21F JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST DUP2 ADD SWAP1 DUP1 DUP1 CALLDATALOAD PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND SWAP1 PUSH1 0x20 ADD SWAP1 SWAP3 SWAP2 SWAP1 POP POP POP PUSH2 0x365 JUMP JUMPDEST PUSH1 0x40 MLOAD DUP1 DUP3 ISZERO ISZERO DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 RETURN JUMPDEST PUSH2 0x26B PUSH2 0x3B1 JUMP JUMPDEST PUSH1 0x40 MLOAD DUP1 DUP3 DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 RETURN JUMPDEST PUSH1 0x0 DUP2 PUSH1 0x0 DUP1 PUSH2 0x100 EXP DUP2 SLOAD DUP2 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF MUL NOT AND SWAP1 DUP4 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND MUL OR SWAP1 SSTORE POP PUSH1 0x1 SWAP1 POP SWAP2 SWAP1 POP JUMP JUMPDEST PUSH1 0x2 SLOAD DUP2 JUMP JUMPDEST PUSH1 0x1 PUSH1 0x0 SWAP1 SLOAD SWAP1 PUSH2 0x100 EXP SWAP1 DIV PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND DUP2 JUMP JUMPDEST PUSH1 0x60 PUSH1 0x40 MLOAD DUP1 PUSH1 0x40 ADD PUSH1 0x40 MSTORE DUP1 PUSH1 0xA DUP2 MSTORE PUSH1 0x20 ADD PUSH32 0x5468616E6B20796F752100000000000000000000000000000000000000000000 DUP2 MSTORE POP SWAP1 POP PUSH1 0x0 PUSH1 0x2 SLOAD DUP4 MUL SWAP1 POP POP SWAP2 SWAP1 POP JUMP JUMPDEST PUSH1 0x0 DUP1 SLOAD SWAP1 PUSH2 0x100 EXP SWAP1 DIV PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND DUP2 JUMP JUMPDEST PUSH1 0x0 DUP2 PUSH1 0x1 PUSH1 0x0 PUSH2 0x100 EXP DUP2 SLOAD DUP2 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF MUL NOT AND SWAP1 DUP4 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND MUL OR SWAP1 SSTORE POP PUSH1 0x1 SWAP1 POP SWAP2 SWAP1 POP JUMP JUMPDEST PUSH1 0x3 SLOAD DUP2 JUMP INVALID LOG2 PUSH5 0x6970667358 0x22 SLT KECCAK256 MSTORE8 0xDB SWAP6 LT 0xAB 0x49 DUP3 BYTE PUSH27 0x5A58E17C3BFEC40E6515364B7DBF78C4DDBF904475CDC164736F6C PUSH4 0x4300060C STOP CALLER ",
	"sourceMap": "509:909:0:-:0;;;658:119;;;;;;;;;;701:1;693:5;:9;;;;731:6;725:3;:12;712:10;:25;;;;752:17;747:23;;;;;;;;;;;;;;;;;;509:909;;;;;;"
}
      const prepareAuction = new ContractFactory(abi, bytecode, signer);
      const auction = await prepareAuction.deploy();

      // Show 'waiting for tx' msg
      this.setState({ txBeingSent: auction.deployTransaction.hash });

      // User deploy Shares.sol
      const sharesABI = [
      {
      "anonymous": false,
      "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
      ],
      "name": "Approval",
      "type": "event"
      },
      {
      "anonymous": false,
      "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
      ],
      "name": "Transfer",
      "type": "event"
      },
      {
      "inputs": [
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
      ],
      "name": "approve",
      "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
      },
      {
      "inputs": [
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "subtractedValue",
        "type": "uint256"
      }
      ],
      "name": "decreaseAllowance",
      "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
      },
      {
      "inputs": [
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "addedValue",
        "type": "uint256"
      }
      ],
      "name": "increaseAllowance",
      "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
      },
      {
      "inputs": [
      {
        "internalType": "address",
        "name": "recipient",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
      ],
      "name": "transfer",
      "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
      },
      {
      "inputs": [
      {
        "internalType": "address",
        "name": "sender",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "recipient",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
      ],
      "name": "transferFrom",
      "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
      },
      {
      "inputs": [
      {
        "internalType": "string",
        "name": "_tokenName",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_tokenTicker",
        "type": "string"
      }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
      },
      {
      "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      }
      ],
      "name": "allowance",
      "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
      ],
      "stateMutability": "view",
      "type": "function"
      },
      {
      "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
      ],
      "name": "balanceOf",
      "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
      ],
      "stateMutability": "view",
      "type": "function"
      },
      {
      "inputs": [],
      "name": "decimals",
      "outputs": [
      {
        "internalType": "uint8",
        "name": "",
        "type": "uint8"
      }
      ],
      "stateMutability": "view",
      "type": "function"
      },
      {
      "inputs": [],
      "name": "name",
      "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
      ],
      "stateMutability": "view",
      "type": "function"
      },
      {
      "inputs": [],
      "name": "symbol",
      "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
      ],
      "stateMutability": "view",
      "type": "function"
      },
      {
      "inputs": [],
      "name": "tokenName",
      "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
      ],
      "stateMutability": "view",
      "type": "function"
      },
      {
      "inputs": [],
      "name": "tokenTicker",
      "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
      ],
      "stateMutability": "view",
      "type": "function"
      },
      {
      "inputs": [],
      "name": "totalSupply",
      "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
      ],
      "stateMutability": "view",
      "type": "function"
      }
      ];
      const sharesBytecode = {
      "linkReferences": {},
      "object": "60806040523480156200001157600080fd5b50604051620018e1380380620018e1833981810160405260408110156200003757600080fd5b81019080805160405193929190846401000000008211156200005857600080fd5b838201915060208201858111156200006f57600080fd5b82518660018202830111640100000000821117156200008d57600080fd5b8083526020830192505050908051906020019080838360005b83811015620000c3578082015181840152602081019050620000a6565b50505050905090810190601f168015620000f15780820380516001836020036101000a031916815260200191505b50604052602001805160405193929190846401000000008211156200011557600080fd5b838201915060208201858111156200012c57600080fd5b82518660018202830111640100000000821117156200014a57600080fd5b8083526020830192505050908051906020019080838360005b838110156200018057808201518184015260208101905062000163565b50505050905090810190601f168015620001ae5780820380516001836020036101000a031916815260200191505b5060405250505081818160039080519060200190620001cf929190620004c9565b508060049080519060200190620001e8929190620004c9565b506012600560006101000a81548160ff021916908360ff160217905550505081600690805190602001906200021f929190620004c9565b50806007908051906020019062000238929190620004c9565b50620002553369021e19e0c9bab24000006200025d60201b60201c565b505062000578565b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff16141562000301576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601f8152602001807f45524332303a206d696e7420746f20746865207a65726f20616464726573730081525060200191505060405180910390fd5b62000315600083836200043b60201b60201c565b62000331816002546200044060201b620011951790919060201c565b6002819055506200038f816000808573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020546200044060201b620011951790919060201c565b6000808473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508173ffffffffffffffffffffffffffffffffffffffff16600073ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef836040518082815260200191505060405180910390a35050565b505050565b600080828401905083811015620004bf576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601b8152602001807f536166654d6174683a206164646974696f6e206f766572666c6f77000000000081525060200191505060405180910390fd5b8091505092915050565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f106200050c57805160ff19168380011785556200053d565b828001600101855582156200053d579182015b828111156200053c5782518255916020019190600101906200051f565b5b5090506200054c919062000550565b5090565b6200057591905b808211156200057157600081600090555060010162000557565b5090565b90565b61135980620005886000396000f3fe608060405234801561001057600080fd5b50600436106100cf5760003560e01c80635f48df441161008c57806395d89b411161006657806395d89b4114610449578063a457c2d7146104cc578063a9059cbb14610532578063dd62ed3e14610598576100cf565b80635f48df44146102eb5780636c02a9311461036e57806370a08231146103f1576100cf565b806306fdde03146100d4578063095ea7b31461015757806318160ddd146101bd57806323b872dd146101db578063313ce567146102615780633950935114610285575b600080fd5b6100dc610610565b6040518080602001828103825283818151815260200191508051906020019080838360005b8381101561011c578082015181840152602081019050610101565b50505050905090810190601f1680156101495780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b6101a36004803603604081101561016d57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803590602001909291905050506106b2565b604051808215151515815260200191505060405180910390f35b6101c56106d0565b6040518082815260200191505060405180910390f35b610247600480360360608110156101f157600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803590602001909291905050506106da565b604051808215151515815260200191505060405180910390f35b6102696107b3565b604051808260ff1660ff16815260200191505060405180910390f35b6102d16004803603604081101561029b57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803590602001909291905050506107ca565b604051808215151515815260200191505060405180910390f35b6102f361087d565b6040518080602001828103825283818151815260200191508051906020019080838360005b83811015610333578082015181840152602081019050610318565b50505050905090810190601f1680156103605780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b61037661091b565b6040518080602001828103825283818151815260200191508051906020019080838360005b838110156103b657808201518184015260208101905061039b565b50505050905090810190601f1680156103e35780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b6104336004803603602081101561040757600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff1690602001909291905050506109b9565b6040518082815260200191505060405180910390f35b610451610a01565b6040518080602001828103825283818151815260200191508051906020019080838360005b83811015610491578082015181840152602081019050610476565b50505050905090810190601f1680156104be5780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b610518600480360360408110156104e257600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050610aa3565b604051808215151515815260200191505060405180910390f35b61057e6004803603604081101561054857600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050610b70565b604051808215151515815260200191505060405180910390f35b6105fa600480360360408110156105ae57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050610b8e565b6040518082815260200191505060405180910390f35b606060038054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156106a85780601f1061067d576101008083540402835291602001916106a8565b820191906000526020600020905b81548152906001019060200180831161068b57829003601f168201915b5050505050905090565b60006106c66106bf610c15565b8484610c1d565b6001905092915050565b6000600254905090565b60006106e7848484610e14565b6107a8846106f3610c15565b6107a38560405180606001604052806028815260200161128e60289139600160008b73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000610759610c15565b73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020546110d59092919063ffffffff16565b610c1d565b600190509392505050565b6000600560009054906101000a900460ff16905090565b60006108736107d7610c15565b8461086e85600160006107e8610c15565b73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008973ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205461119590919063ffffffff16565b610c1d565b6001905092915050565b60078054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156109135780601f106108e857610100808354040283529160200191610913565b820191906000526020600020905b8154815290600101906020018083116108f657829003601f168201915b505050505081565b60068054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156109b15780601f10610986576101008083540402835291602001916109b1565b820191906000526020600020905b81548152906001019060200180831161099457829003601f168201915b505050505081565b60008060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549050919050565b606060048054600181600116156101000203166002900480601f016020809104026020016040519081016040528092919081815260200182805460018160011615610100020316600290048015610a995780601f10610a6e57610100808354040283529160200191610a99565b820191906000526020600020905b815481529060010190602001808311610a7c57829003601f168201915b5050505050905090565b6000610b66610ab0610c15565b84610b61856040518060600160405280602581526020016112ff6025913960016000610ada610c15565b73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008a73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020546110d59092919063ffffffff16565b610c1d565b6001905092915050565b6000610b84610b7d610c15565b8484610e14565b6001905092915050565b6000600160008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054905092915050565b600033905090565b600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff161415610ca3576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260248152602001806112db6024913960400191505060405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff161415610d29576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260228152602001806112466022913960400191505060405180910390fd5b80600160008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508173ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925836040518082815260200191505060405180910390a3505050565b600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff161415610e9a576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260258152602001806112b66025913960400191505060405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff161415610f20576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260238152602001806112236023913960400191505060405180910390fd5b610f2b83838361121d565b610f9681604051806060016040528060268152602001611268602691396000808773ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020546110d59092919063ffffffff16565b6000808573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002081905550611029816000808573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205461119590919063ffffffff16565b6000808473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508173ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef836040518082815260200191505060405180910390a3505050565b6000838311158290611182576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825283818151815260200191508051906020019080838360005b8381101561114757808201518184015260208101905061112c565b50505050905090810190601f1680156111745780820380516001836020036101000a031916815260200191505b509250505060405180910390fd5b5060008385039050809150509392505050565b600080828401905083811015611213576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601b8152602001807f536166654d6174683a206164646974696f6e206f766572666c6f77000000000081525060200191505060405180910390fd5b8091505092915050565b50505056fe45524332303a207472616e7366657220746f20746865207a65726f206164647265737345524332303a20617070726f766520746f20746865207a65726f206164647265737345524332303a207472616e7366657220616d6f756e7420657863656564732062616c616e636545524332303a207472616e7366657220616d6f756e74206578636565647320616c6c6f77616e636545524332303a207472616e736665722066726f6d20746865207a65726f206164647265737345524332303a20617070726f76652066726f6d20746865207a65726f206164647265737345524332303a2064656372656173656420616c6c6f77616e63652062656c6f77207a65726fa26469706673582212209af29f4628e25204ea793c5c8bf021bb30be2b2ae62b5ca6a54bc4190f510df564736f6c63430006060033",
      "opcodes": "PUSH1 0x80 PUSH1 0x40 MSTORE CALLVALUE DUP1 ISZERO PUSH3 0x11 JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST POP PUSH1 0x40 MLOAD PUSH3 0x18E1 CODESIZE SUB DUP1 PUSH3 0x18E1 DUP4 CODECOPY DUP2 DUP2 ADD PUSH1 0x40 MSTORE PUSH1 0x40 DUP2 LT ISZERO PUSH3 0x37 JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST DUP2 ADD SWAP1 DUP1 DUP1 MLOAD PUSH1 0x40 MLOAD SWAP4 SWAP3 SWAP2 SWAP1 DUP5 PUSH5 0x100000000 DUP3 GT ISZERO PUSH3 0x58 JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST DUP4 DUP3 ADD SWAP2 POP PUSH1 0x20 DUP3 ADD DUP6 DUP2 GT ISZERO PUSH3 0x6F JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST DUP3 MLOAD DUP7 PUSH1 0x1 DUP3 MUL DUP4 ADD GT PUSH5 0x100000000 DUP3 GT OR ISZERO PUSH3 0x8D JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST DUP1 DUP4 MSTORE PUSH1 0x20 DUP4 ADD SWAP3 POP POP POP SWAP1 DUP1 MLOAD SWAP1 PUSH1 0x20 ADD SWAP1 DUP1 DUP4 DUP4 PUSH1 0x0 JUMPDEST DUP4 DUP2 LT ISZERO PUSH3 0xC3 JUMPI DUP1 DUP3 ADD MLOAD DUP2 DUP5 ADD MSTORE PUSH1 0x20 DUP2 ADD SWAP1 POP PUSH3 0xA6 JUMP JUMPDEST POP POP POP POP SWAP1 POP SWAP1 DUP2 ADD SWAP1 PUSH1 0x1F AND DUP1 ISZERO PUSH3 0xF1 JUMPI DUP1 DUP3 SUB DUP1 MLOAD PUSH1 0x1 DUP4 PUSH1 0x20 SUB PUSH2 0x100 EXP SUB NOT AND DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP JUMPDEST POP PUSH1 0x40 MSTORE PUSH1 0x20 ADD DUP1 MLOAD PUSH1 0x40 MLOAD SWAP4 SWAP3 SWAP2 SWAP1 DUP5 PUSH5 0x100000000 DUP3 GT ISZERO PUSH3 0x115 JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST DUP4 DUP3 ADD SWAP2 POP PUSH1 0x20 DUP3 ADD DUP6 DUP2 GT ISZERO PUSH3 0x12C JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST DUP3 MLOAD DUP7 PUSH1 0x1 DUP3 MUL DUP4 ADD GT PUSH5 0x100000000 DUP3 GT OR ISZERO PUSH3 0x14A JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST DUP1 DUP4 MSTORE PUSH1 0x20 DUP4 ADD SWAP3 POP POP POP SWAP1 DUP1 MLOAD SWAP1 PUSH1 0x20 ADD SWAP1 DUP1 DUP4 DUP4 PUSH1 0x0 JUMPDEST DUP4 DUP2 LT ISZERO PUSH3 0x180 JUMPI DUP1 DUP3 ADD MLOAD DUP2 DUP5 ADD MSTORE PUSH1 0x20 DUP2 ADD SWAP1 POP PUSH3 0x163 JUMP JUMPDEST POP POP POP POP SWAP1 POP SWAP1 DUP2 ADD SWAP1 PUSH1 0x1F AND DUP1 ISZERO PUSH3 0x1AE JUMPI DUP1 DUP3 SUB DUP1 MLOAD PUSH1 0x1 DUP4 PUSH1 0x20 SUB PUSH2 0x100 EXP SUB NOT AND DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP JUMPDEST POP PUSH1 0x40 MSTORE POP POP POP DUP2 DUP2 DUP2 PUSH1 0x3 SWAP1 DUP1 MLOAD SWAP1 PUSH1 0x20 ADD SWAP1 PUSH3 0x1CF SWAP3 SWAP2 SWAP1 PUSH3 0x4C9 JUMP JUMPDEST POP DUP1 PUSH1 0x4 SWAP1 DUP1 MLOAD SWAP1 PUSH1 0x20 ADD SWAP1 PUSH3 0x1E8 SWAP3 SWAP2 SWAP1 PUSH3 0x4C9 JUMP JUMPDEST POP PUSH1 0x12 PUSH1 0x5 PUSH1 0x0 PUSH2 0x100 EXP DUP2 SLOAD DUP2 PUSH1 0xFF MUL NOT AND SWAP1 DUP4 PUSH1 0xFF AND MUL OR SWAP1 SSTORE POP POP POP DUP2 PUSH1 0x6 SWAP1 DUP1 MLOAD SWAP1 PUSH1 0x20 ADD SWAP1 PUSH3 0x21F SWAP3 SWAP2 SWAP1 PUSH3 0x4C9 JUMP JUMPDEST POP DUP1 PUSH1 0x7 SWAP1 DUP1 MLOAD SWAP1 PUSH1 0x20 ADD SWAP1 PUSH3 0x238 SWAP3 SWAP2 SWAP1 PUSH3 0x4C9 JUMP JUMPDEST POP PUSH3 0x255 CALLER PUSH10 0x21E19E0C9BAB2400000 PUSH3 0x25D PUSH1 0x20 SHL PUSH1 0x20 SHR JUMP JUMPDEST POP POP PUSH3 0x578 JUMP JUMPDEST PUSH1 0x0 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND DUP3 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND EQ ISZERO PUSH3 0x301 JUMPI PUSH1 0x40 MLOAD PUSH32 0x8C379A000000000000000000000000000000000000000000000000000000000 DUP2 MSTORE PUSH1 0x4 ADD DUP1 DUP1 PUSH1 0x20 ADD DUP3 DUP2 SUB DUP3 MSTORE PUSH1 0x1F DUP2 MSTORE PUSH1 0x20 ADD DUP1 PUSH32 0x45524332303A206D696E7420746F20746865207A65726F206164647265737300 DUP2 MSTORE POP PUSH1 0x20 ADD SWAP2 POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 REVERT JUMPDEST PUSH3 0x315 PUSH1 0x0 DUP4 DUP4 PUSH3 0x43B PUSH1 0x20 SHL PUSH1 0x20 SHR JUMP JUMPDEST PUSH3 0x331 DUP2 PUSH1 0x2 SLOAD PUSH3 0x440 PUSH1 0x20 SHL PUSH3 0x1195 OR SWAP1 SWAP2 SWAP1 PUSH1 0x20 SHR JUMP JUMPDEST PUSH1 0x2 DUP2 SWAP1 SSTORE POP PUSH3 0x38F DUP2 PUSH1 0x0 DUP1 DUP6 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND DUP2 MSTORE PUSH1 0x20 ADD SWAP1 DUP2 MSTORE PUSH1 0x20 ADD PUSH1 0x0 KECCAK256 SLOAD PUSH3 0x440 PUSH1 0x20 SHL PUSH3 0x1195 OR SWAP1 SWAP2 SWAP1 PUSH1 0x20 SHR JUMP JUMPDEST PUSH1 0x0 DUP1 DUP5 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND DUP2 MSTORE PUSH1 0x20 ADD SWAP1 DUP2 MSTORE PUSH1 0x20 ADD PUSH1 0x0 KECCAK256 DUP2 SWAP1 SSTORE POP DUP2 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND PUSH1 0x0 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND PUSH32 0xDDF252AD1BE2C89B69C2B068FC378DAA952BA7F163C4A11628F55A4DF523B3EF DUP4 PUSH1 0x40 MLOAD DUP1 DUP3 DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 LOG3 POP POP JUMP JUMPDEST POP POP POP JUMP JUMPDEST PUSH1 0x0 DUP1 DUP3 DUP5 ADD SWAP1 POP DUP4 DUP2 LT ISZERO PUSH3 0x4BF JUMPI PUSH1 0x40 MLOAD PUSH32 0x8C379A000000000000000000000000000000000000000000000000000000000 DUP2 MSTORE PUSH1 0x4 ADD DUP1 DUP1 PUSH1 0x20 ADD DUP3 DUP2 SUB DUP3 MSTORE PUSH1 0x1B DUP2 MSTORE PUSH1 0x20 ADD DUP1 PUSH32 0x536166654D6174683A206164646974696F6E206F766572666C6F770000000000 DUP2 MSTORE POP PUSH1 0x20 ADD SWAP2 POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 REVERT JUMPDEST DUP1 SWAP2 POP POP SWAP3 SWAP2 POP POP JUMP JUMPDEST DUP3 DUP1 SLOAD PUSH1 0x1 DUP2 PUSH1 0x1 AND ISZERO PUSH2 0x100 MUL SUB AND PUSH1 0x2 SWAP1 DIV SWAP1 PUSH1 0x0 MSTORE PUSH1 0x20 PUSH1 0x0 KECCAK256 SWAP1 PUSH1 0x1F ADD PUSH1 0x20 SWAP1 DIV DUP2 ADD SWAP3 DUP3 PUSH1 0x1F LT PUSH3 0x50C JUMPI DUP1 MLOAD PUSH1 0xFF NOT AND DUP4 DUP1 ADD OR DUP6 SSTORE PUSH3 0x53D JUMP JUMPDEST DUP3 DUP1 ADD PUSH1 0x1 ADD DUP6 SSTORE DUP3 ISZERO PUSH3 0x53D JUMPI SWAP2 DUP3 ADD JUMPDEST DUP3 DUP2 GT ISZERO PUSH3 0x53C JUMPI DUP3 MLOAD DUP3 SSTORE SWAP2 PUSH1 0x20 ADD SWAP2 SWAP1 PUSH1 0x1 ADD SWAP1 PUSH3 0x51F JUMP JUMPDEST JUMPDEST POP SWAP1 POP PUSH3 0x54C SWAP2 SWAP1 PUSH3 0x550 JUMP JUMPDEST POP SWAP1 JUMP JUMPDEST PUSH3 0x575 SWAP2 SWAP1 JUMPDEST DUP1 DUP3 GT ISZERO PUSH3 0x571 JUMPI PUSH1 0x0 DUP2 PUSH1 0x0 SWAP1 SSTORE POP PUSH1 0x1 ADD PUSH3 0x557 JUMP JUMPDEST POP SWAP1 JUMP JUMPDEST SWAP1 JUMP JUMPDEST PUSH2 0x1359 DUP1 PUSH3 0x588 PUSH1 0x0 CODECOPY PUSH1 0x0 RETURN INVALID PUSH1 0x80 PUSH1 0x40 MSTORE CALLVALUE DUP1 ISZERO PUSH2 0x10 JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST POP PUSH1 0x4 CALLDATASIZE LT PUSH2 0xCF JUMPI PUSH1 0x0 CALLDATALOAD PUSH1 0xE0 SHR DUP1 PUSH4 0x5F48DF44 GT PUSH2 0x8C JUMPI DUP1 PUSH4 0x95D89B41 GT PUSH2 0x66 JUMPI DUP1 PUSH4 0x95D89B41 EQ PUSH2 0x449 JUMPI DUP1 PUSH4 0xA457C2D7 EQ PUSH2 0x4CC JUMPI DUP1 PUSH4 0xA9059CBB EQ PUSH2 0x532 JUMPI DUP1 PUSH4 0xDD62ED3E EQ PUSH2 0x598 JUMPI PUSH2 0xCF JUMP JUMPDEST DUP1 PUSH4 0x5F48DF44 EQ PUSH2 0x2EB JUMPI DUP1 PUSH4 0x6C02A931 EQ PUSH2 0x36E JUMPI DUP1 PUSH4 0x70A08231 EQ PUSH2 0x3F1 JUMPI PUSH2 0xCF JUMP JUMPDEST DUP1 PUSH4 0x6FDDE03 EQ PUSH2 0xD4 JUMPI DUP1 PUSH4 0x95EA7B3 EQ PUSH2 0x157 JUMPI DUP1 PUSH4 0x18160DDD EQ PUSH2 0x1BD JUMPI DUP1 PUSH4 0x23B872DD EQ PUSH2 0x1DB JUMPI DUP1 PUSH4 0x313CE567 EQ PUSH2 0x261 JUMPI DUP1 PUSH4 0x39509351 EQ PUSH2 0x285 JUMPI JUMPDEST PUSH1 0x0 DUP1 REVERT JUMPDEST PUSH2 0xDC PUSH2 0x610 JUMP JUMPDEST PUSH1 0x40 MLOAD DUP1 DUP1 PUSH1 0x20 ADD DUP3 DUP2 SUB DUP3 MSTORE DUP4 DUP2 DUP2 MLOAD DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP DUP1 MLOAD SWAP1 PUSH1 0x20 ADD SWAP1 DUP1 DUP4 DUP4 PUSH1 0x0 JUMPDEST DUP4 DUP2 LT ISZERO PUSH2 0x11C JUMPI DUP1 DUP3 ADD MLOAD DUP2 DUP5 ADD MSTORE PUSH1 0x20 DUP2 ADD SWAP1 POP PUSH2 0x101 JUMP JUMPDEST POP POP POP POP SWAP1 POP SWAP1 DUP2 ADD SWAP1 PUSH1 0x1F AND DUP1 ISZERO PUSH2 0x149 JUMPI DUP1 DUP3 SUB DUP1 MLOAD PUSH1 0x1 DUP4 PUSH1 0x20 SUB PUSH2 0x100 EXP SUB NOT AND DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP JUMPDEST POP SWAP3 POP POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 RETURN JUMPDEST PUSH2 0x1A3 PUSH1 0x4 DUP1 CALLDATASIZE SUB PUSH1 0x40 DUP2 LT ISZERO PUSH2 0x16D JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST DUP2 ADD SWAP1 DUP1 DUP1 CALLDATALOAD PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND SWAP1 PUSH1 0x20 ADD SWAP1 SWAP3 SWAP2 SWAP1 DUP1 CALLDATALOAD SWAP1 PUSH1 0x20 ADD SWAP1 SWAP3 SWAP2 SWAP1 POP POP POP PUSH2 0x6B2 JUMP JUMPDEST PUSH1 0x40 MLOAD DUP1 DUP3 ISZERO ISZERO ISZERO ISZERO DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 RETURN JUMPDEST PUSH2 0x1C5 PUSH2 0x6D0 JUMP JUMPDEST PUSH1 0x40 MLOAD DUP1 DUP3 DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 RETURN JUMPDEST PUSH2 0x247 PUSH1 0x4 DUP1 CALLDATASIZE SUB PUSH1 0x60 DUP2 LT ISZERO PUSH2 0x1F1 JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST DUP2 ADD SWAP1 DUP1 DUP1 CALLDATALOAD PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND SWAP1 PUSH1 0x20 ADD SWAP1 SWAP3 SWAP2 SWAP1 DUP1 CALLDATALOAD PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND SWAP1 PUSH1 0x20 ADD SWAP1 SWAP3 SWAP2 SWAP1 DUP1 CALLDATALOAD SWAP1 PUSH1 0x20 ADD SWAP1 SWAP3 SWAP2 SWAP1 POP POP POP PUSH2 0x6DA JUMP JUMPDEST PUSH1 0x40 MLOAD DUP1 DUP3 ISZERO ISZERO ISZERO ISZERO DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 RETURN JUMPDEST PUSH2 0x269 PUSH2 0x7B3 JUMP JUMPDEST PUSH1 0x40 MLOAD DUP1 DUP3 PUSH1 0xFF AND PUSH1 0xFF AND DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 RETURN JUMPDEST PUSH2 0x2D1 PUSH1 0x4 DUP1 CALLDATASIZE SUB PUSH1 0x40 DUP2 LT ISZERO PUSH2 0x29B JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST DUP2 ADD SWAP1 DUP1 DUP1 CALLDATALOAD PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND SWAP1 PUSH1 0x20 ADD SWAP1 SWAP3 SWAP2 SWAP1 DUP1 CALLDATALOAD SWAP1 PUSH1 0x20 ADD SWAP1 SWAP3 SWAP2 SWAP1 POP POP POP PUSH2 0x7CA JUMP JUMPDEST PUSH1 0x40 MLOAD DUP1 DUP3 ISZERO ISZERO ISZERO ISZERO DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 RETURN JUMPDEST PUSH2 0x2F3 PUSH2 0x87D JUMP JUMPDEST PUSH1 0x40 MLOAD DUP1 DUP1 PUSH1 0x20 ADD DUP3 DUP2 SUB DUP3 MSTORE DUP4 DUP2 DUP2 MLOAD DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP DUP1 MLOAD SWAP1 PUSH1 0x20 ADD SWAP1 DUP1 DUP4 DUP4 PUSH1 0x0 JUMPDEST DUP4 DUP2 LT ISZERO PUSH2 0x333 JUMPI DUP1 DUP3 ADD MLOAD DUP2 DUP5 ADD MSTORE PUSH1 0x20 DUP2 ADD SWAP1 POP PUSH2 0x318 JUMP JUMPDEST POP POP POP POP SWAP1 POP SWAP1 DUP2 ADD SWAP1 PUSH1 0x1F AND DUP1 ISZERO PUSH2 0x360 JUMPI DUP1 DUP3 SUB DUP1 MLOAD PUSH1 0x1 DUP4 PUSH1 0x20 SUB PUSH2 0x100 EXP SUB NOT AND DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP JUMPDEST POP SWAP3 POP POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 RETURN JUMPDEST PUSH2 0x376 PUSH2 0x91B JUMP JUMPDEST PUSH1 0x40 MLOAD DUP1 DUP1 PUSH1 0x20 ADD DUP3 DUP2 SUB DUP3 MSTORE DUP4 DUP2 DUP2 MLOAD DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP DUP1 MLOAD SWAP1 PUSH1 0x20 ADD SWAP1 DUP1 DUP4 DUP4 PUSH1 0x0 JUMPDEST DUP4 DUP2 LT ISZERO PUSH2 0x3B6 JUMPI DUP1 DUP3 ADD MLOAD DUP2 DUP5 ADD MSTORE PUSH1 0x20 DUP2 ADD SWAP1 POP PUSH2 0x39B JUMP JUMPDEST POP POP POP POP SWAP1 POP SWAP1 DUP2 ADD SWAP1 PUSH1 0x1F AND DUP1 ISZERO PUSH2 0x3E3 JUMPI DUP1 DUP3 SUB DUP1 MLOAD PUSH1 0x1 DUP4 PUSH1 0x20 SUB PUSH2 0x100 EXP SUB NOT AND DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP JUMPDEST POP SWAP3 POP POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 RETURN JUMPDEST PUSH2 0x433 PUSH1 0x4 DUP1 CALLDATASIZE SUB PUSH1 0x20 DUP2 LT ISZERO PUSH2 0x407 JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST DUP2 ADD SWAP1 DUP1 DUP1 CALLDATALOAD PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND SWAP1 PUSH1 0x20 ADD SWAP1 SWAP3 SWAP2 SWAP1 POP POP POP PUSH2 0x9B9 JUMP JUMPDEST PUSH1 0x40 MLOAD DUP1 DUP3 DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 RETURN JUMPDEST PUSH2 0x451 PUSH2 0xA01 JUMP JUMPDEST PUSH1 0x40 MLOAD DUP1 DUP1 PUSH1 0x20 ADD DUP3 DUP2 SUB DUP3 MSTORE DUP4 DUP2 DUP2 MLOAD DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP DUP1 MLOAD SWAP1 PUSH1 0x20 ADD SWAP1 DUP1 DUP4 DUP4 PUSH1 0x0 JUMPDEST DUP4 DUP2 LT ISZERO PUSH2 0x491 JUMPI DUP1 DUP3 ADD MLOAD DUP2 DUP5 ADD MSTORE PUSH1 0x20 DUP2 ADD SWAP1 POP PUSH2 0x476 JUMP JUMPDEST POP POP POP POP SWAP1 POP SWAP1 DUP2 ADD SWAP1 PUSH1 0x1F AND DUP1 ISZERO PUSH2 0x4BE JUMPI DUP1 DUP3 SUB DUP1 MLOAD PUSH1 0x1 DUP4 PUSH1 0x20 SUB PUSH2 0x100 EXP SUB NOT AND DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP JUMPDEST POP SWAP3 POP POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 RETURN JUMPDEST PUSH2 0x518 PUSH1 0x4 DUP1 CALLDATASIZE SUB PUSH1 0x40 DUP2 LT ISZERO PUSH2 0x4E2 JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST DUP2 ADD SWAP1 DUP1 DUP1 CALLDATALOAD PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND SWAP1 PUSH1 0x20 ADD SWAP1 SWAP3 SWAP2 SWAP1 DUP1 CALLDATALOAD SWAP1 PUSH1 0x20 ADD SWAP1 SWAP3 SWAP2 SWAP1 POP POP POP PUSH2 0xAA3 JUMP JUMPDEST PUSH1 0x40 MLOAD DUP1 DUP3 ISZERO ISZERO ISZERO ISZERO DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 RETURN JUMPDEST PUSH2 0x57E PUSH1 0x4 DUP1 CALLDATASIZE SUB PUSH1 0x40 DUP2 LT ISZERO PUSH2 0x548 JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST DUP2 ADD SWAP1 DUP1 DUP1 CALLDATALOAD PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND SWAP1 PUSH1 0x20 ADD SWAP1 SWAP3 SWAP2 SWAP1 DUP1 CALLDATALOAD SWAP1 PUSH1 0x20 ADD SWAP1 SWAP3 SWAP2 SWAP1 POP POP POP PUSH2 0xB70 JUMP JUMPDEST PUSH1 0x40 MLOAD DUP1 DUP3 ISZERO ISZERO ISZERO ISZERO DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 RETURN JUMPDEST PUSH2 0x5FA PUSH1 0x4 DUP1 CALLDATASIZE SUB PUSH1 0x40 DUP2 LT ISZERO PUSH2 0x5AE JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST DUP2 ADD SWAP1 DUP1 DUP1 CALLDATALOAD PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND SWAP1 PUSH1 0x20 ADD SWAP1 SWAP3 SWAP2 SWAP1 DUP1 CALLDATALOAD PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND SWAP1 PUSH1 0x20 ADD SWAP1 SWAP3 SWAP2 SWAP1 POP POP POP PUSH2 0xB8E JUMP JUMPDEST PUSH1 0x40 MLOAD DUP1 DUP3 DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 RETURN JUMPDEST PUSH1 0x60 PUSH1 0x3 DUP1 SLOAD PUSH1 0x1 DUP2 PUSH1 0x1 AND ISZERO PUSH2 0x100 MUL SUB AND PUSH1 0x2 SWAP1 DIV DUP1 PUSH1 0x1F ADD PUSH1 0x20 DUP1 SWAP2 DIV MUL PUSH1 0x20 ADD PUSH1 0x40 MLOAD SWAP1 DUP2 ADD PUSH1 0x40 MSTORE DUP1 SWAP3 SWAP2 SWAP1 DUP2 DUP2 MSTORE PUSH1 0x20 ADD DUP3 DUP1 SLOAD PUSH1 0x1 DUP2 PUSH1 0x1 AND ISZERO PUSH2 0x100 MUL SUB AND PUSH1 0x2 SWAP1 DIV DUP1 ISZERO PUSH2 0x6A8 JUMPI DUP1 PUSH1 0x1F LT PUSH2 0x67D JUMPI PUSH2 0x100 DUP1 DUP4 SLOAD DIV MUL DUP4 MSTORE SWAP2 PUSH1 0x20 ADD SWAP2 PUSH2 0x6A8 JUMP JUMPDEST DUP3 ADD SWAP2 SWAP1 PUSH1 0x0 MSTORE PUSH1 0x20 PUSH1 0x0 KECCAK256 SWAP1 JUMPDEST DUP2 SLOAD DUP2 MSTORE SWAP1 PUSH1 0x1 ADD SWAP1 PUSH1 0x20 ADD DUP1 DUP4 GT PUSH2 0x68B JUMPI DUP3 SWAP1 SUB PUSH1 0x1F AND DUP3 ADD SWAP2 JUMPDEST POP POP POP POP POP SWAP1 POP SWAP1 JUMP JUMPDEST PUSH1 0x0 PUSH2 0x6C6 PUSH2 0x6BF PUSH2 0xC15 JUMP JUMPDEST DUP5 DUP5 PUSH2 0xC1D JUMP JUMPDEST PUSH1 0x1 SWAP1 POP SWAP3 SWAP2 POP POP JUMP JUMPDEST PUSH1 0x0 PUSH1 0x2 SLOAD SWAP1 POP SWAP1 JUMP JUMPDEST PUSH1 0x0 PUSH2 0x6E7 DUP5 DUP5 DUP5 PUSH2 0xE14 JUMP JUMPDEST PUSH2 0x7A8 DUP5 PUSH2 0x6F3 PUSH2 0xC15 JUMP JUMPDEST PUSH2 0x7A3 DUP6 PUSH1 0x40 MLOAD DUP1 PUSH1 0x60 ADD PUSH1 0x40 MSTORE DUP1 PUSH1 0x28 DUP2 MSTORE PUSH1 0x20 ADD PUSH2 0x128E PUSH1 0x28 SWAP2 CODECOPY PUSH1 0x1 PUSH1 0x0 DUP12 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND DUP2 MSTORE PUSH1 0x20 ADD SWAP1 DUP2 MSTORE PUSH1 0x20 ADD PUSH1 0x0 KECCAK256 PUSH1 0x0 PUSH2 0x759 PUSH2 0xC15 JUMP JUMPDEST PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND DUP2 MSTORE PUSH1 0x20 ADD SWAP1 DUP2 MSTORE PUSH1 0x20 ADD PUSH1 0x0 KECCAK256 SLOAD PUSH2 0x10D5 SWAP1 SWAP3 SWAP2 SWAP1 PUSH4 0xFFFFFFFF AND JUMP JUMPDEST PUSH2 0xC1D JUMP JUMPDEST PUSH1 0x1 SWAP1 POP SWAP4 SWAP3 POP POP POP JUMP JUMPDEST PUSH1 0x0 PUSH1 0x5 PUSH1 0x0 SWAP1 SLOAD SWAP1 PUSH2 0x100 EXP SWAP1 DIV PUSH1 0xFF AND SWAP1 POP SWAP1 JUMP JUMPDEST PUSH1 0x0 PUSH2 0x873 PUSH2 0x7D7 PUSH2 0xC15 JUMP JUMPDEST DUP5 PUSH2 0x86E DUP6 PUSH1 0x1 PUSH1 0x0 PUSH2 0x7E8 PUSH2 0xC15 JUMP JUMPDEST PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND DUP2 MSTORE PUSH1 0x20 ADD SWAP1 DUP2 MSTORE PUSH1 0x20 ADD PUSH1 0x0 KECCAK256 PUSH1 0x0 DUP10 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND DUP2 MSTORE PUSH1 0x20 ADD SWAP1 DUP2 MSTORE PUSH1 0x20 ADD PUSH1 0x0 KECCAK256 SLOAD PUSH2 0x1195 SWAP1 SWAP2 SWAP1 PUSH4 0xFFFFFFFF AND JUMP JUMPDEST PUSH2 0xC1D JUMP JUMPDEST PUSH1 0x1 SWAP1 POP SWAP3 SWAP2 POP POP JUMP JUMPDEST PUSH1 0x7 DUP1 SLOAD PUSH1 0x1 DUP2 PUSH1 0x1 AND ISZERO PUSH2 0x100 MUL SUB AND PUSH1 0x2 SWAP1 DIV DUP1 PUSH1 0x1F ADD PUSH1 0x20 DUP1 SWAP2 DIV MUL PUSH1 0x20 ADD PUSH1 0x40 MLOAD SWAP1 DUP2 ADD PUSH1 0x40 MSTORE DUP1 SWAP3 SWAP2 SWAP1 DUP2 DUP2 MSTORE PUSH1 0x20 ADD DUP3 DUP1 SLOAD PUSH1 0x1 DUP2 PUSH1 0x1 AND ISZERO PUSH2 0x100 MUL SUB AND PUSH1 0x2 SWAP1 DIV DUP1 ISZERO PUSH2 0x913 JUMPI DUP1 PUSH1 0x1F LT PUSH2 0x8E8 JUMPI PUSH2 0x100 DUP1 DUP4 SLOAD DIV MUL DUP4 MSTORE SWAP2 PUSH1 0x20 ADD SWAP2 PUSH2 0x913 JUMP JUMPDEST DUP3 ADD SWAP2 SWAP1 PUSH1 0x0 MSTORE PUSH1 0x20 PUSH1 0x0 KECCAK256 SWAP1 JUMPDEST DUP2 SLOAD DUP2 MSTORE SWAP1 PUSH1 0x1 ADD SWAP1 PUSH1 0x20 ADD DUP1 DUP4 GT PUSH2 0x8F6 JUMPI DUP3 SWAP1 SUB PUSH1 0x1F AND DUP3 ADD SWAP2 JUMPDEST POP POP POP POP POP DUP2 JUMP JUMPDEST PUSH1 0x6 DUP1 SLOAD PUSH1 0x1 DUP2 PUSH1 0x1 AND ISZERO PUSH2 0x100 MUL SUB AND PUSH1 0x2 SWAP1 DIV DUP1 PUSH1 0x1F ADD PUSH1 0x20 DUP1 SWAP2 DIV MUL PUSH1 0x20 ADD PUSH1 0x40 MLOAD SWAP1 DUP2 ADD PUSH1 0x40 MSTORE DUP1 SWAP3 SWAP2 SWAP1 DUP2 DUP2 MSTORE PUSH1 0x20 ADD DUP3 DUP1 SLOAD PUSH1 0x1 DUP2 PUSH1 0x1 AND ISZERO PUSH2 0x100 MUL SUB AND PUSH1 0x2 SWAP1 DIV DUP1 ISZERO PUSH2 0x9B1 JUMPI DUP1 PUSH1 0x1F LT PUSH2 0x986 JUMPI PUSH2 0x100 DUP1 DUP4 SLOAD DIV MUL DUP4 MSTORE SWAP2 PUSH1 0x20 ADD SWAP2 PUSH2 0x9B1 JUMP JUMPDEST DUP3 ADD SWAP2 SWAP1 PUSH1 0x0 MSTORE PUSH1 0x20 PUSH1 0x0 KECCAK256 SWAP1 JUMPDEST DUP2 SLOAD DUP2 MSTORE SWAP1 PUSH1 0x1 ADD SWAP1 PUSH1 0x20 ADD DUP1 DUP4 GT PUSH2 0x994 JUMPI DUP3 SWAP1 SUB PUSH1 0x1F AND DUP3 ADD SWAP2 JUMPDEST POP POP POP POP POP DUP2 JUMP JUMPDEST PUSH1 0x0 DUP1 PUSH1 0x0 DUP4 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND DUP2 MSTORE PUSH1 0x20 ADD SWAP1 DUP2 MSTORE PUSH1 0x20 ADD PUSH1 0x0 KECCAK256 SLOAD SWAP1 POP SWAP2 SWAP1 POP JUMP JUMPDEST PUSH1 0x60 PUSH1 0x4 DUP1 SLOAD PUSH1 0x1 DUP2 PUSH1 0x1 AND ISZERO PUSH2 0x100 MUL SUB AND PUSH1 0x2 SWAP1 DIV DUP1 PUSH1 0x1F ADD PUSH1 0x20 DUP1 SWAP2 DIV MUL PUSH1 0x20 ADD PUSH1 0x40 MLOAD SWAP1 DUP2 ADD PUSH1 0x40 MSTORE DUP1 SWAP3 SWAP2 SWAP1 DUP2 DUP2 MSTORE PUSH1 0x20 ADD DUP3 DUP1 SLOAD PUSH1 0x1 DUP2 PUSH1 0x1 AND ISZERO PUSH2 0x100 MUL SUB AND PUSH1 0x2 SWAP1 DIV DUP1 ISZERO PUSH2 0xA99 JUMPI DUP1 PUSH1 0x1F LT PUSH2 0xA6E JUMPI PUSH2 0x100 DUP1 DUP4 SLOAD DIV MUL DUP4 MSTORE SWAP2 PUSH1 0x20 ADD SWAP2 PUSH2 0xA99 JUMP JUMPDEST DUP3 ADD SWAP2 SWAP1 PUSH1 0x0 MSTORE PUSH1 0x20 PUSH1 0x0 KECCAK256 SWAP1 JUMPDEST DUP2 SLOAD DUP2 MSTORE SWAP1 PUSH1 0x1 ADD SWAP1 PUSH1 0x20 ADD DUP1 DUP4 GT PUSH2 0xA7C JUMPI DUP3 SWAP1 SUB PUSH1 0x1F AND DUP3 ADD SWAP2 JUMPDEST POP POP POP POP POP SWAP1 POP SWAP1 JUMP JUMPDEST PUSH1 0x0 PUSH2 0xB66 PUSH2 0xAB0 PUSH2 0xC15 JUMP JUMPDEST DUP5 PUSH2 0xB61 DUP6 PUSH1 0x40 MLOAD DUP1 PUSH1 0x60 ADD PUSH1 0x40 MSTORE DUP1 PUSH1 0x25 DUP2 MSTORE PUSH1 0x20 ADD PUSH2 0x12FF PUSH1 0x25 SWAP2 CODECOPY PUSH1 0x1 PUSH1 0x0 PUSH2 0xADA PUSH2 0xC15 JUMP JUMPDEST PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND DUP2 MSTORE PUSH1 0x20 ADD SWAP1 DUP2 MSTORE PUSH1 0x20 ADD PUSH1 0x0 KECCAK256 PUSH1 0x0 DUP11 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND DUP2 MSTORE PUSH1 0x20 ADD SWAP1 DUP2 MSTORE PUSH1 0x20 ADD PUSH1 0x0 KECCAK256 SLOAD PUSH2 0x10D5 SWAP1 SWAP3 SWAP2 SWAP1 PUSH4 0xFFFFFFFF AND JUMP JUMPDEST PUSH2 0xC1D JUMP JUMPDEST PUSH1 0x1 SWAP1 POP SWAP3 SWAP2 POP POP JUMP JUMPDEST PUSH1 0x0 PUSH2 0xB84 PUSH2 0xB7D PUSH2 0xC15 JUMP JUMPDEST DUP5 DUP5 PUSH2 0xE14 JUMP JUMPDEST PUSH1 0x1 SWAP1 POP SWAP3 SWAP2 POP POP JUMP JUMPDEST PUSH1 0x0 PUSH1 0x1 PUSH1 0x0 DUP5 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND DUP2 MSTORE PUSH1 0x20 ADD SWAP1 DUP2 MSTORE PUSH1 0x20 ADD PUSH1 0x0 KECCAK256 PUSH1 0x0 DUP4 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND DUP2 MSTORE PUSH1 0x20 ADD SWAP1 DUP2 MSTORE PUSH1 0x20 ADD PUSH1 0x0 KECCAK256 SLOAD SWAP1 POP SWAP3 SWAP2 POP POP JUMP JUMPDEST PUSH1 0x0 CALLER SWAP1 POP SWAP1 JUMP JUMPDEST PUSH1 0x0 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND DUP4 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND EQ ISZERO PUSH2 0xCA3 JUMPI PUSH1 0x40 MLOAD PUSH32 0x8C379A000000000000000000000000000000000000000000000000000000000 DUP2 MSTORE PUSH1 0x4 ADD DUP1 DUP1 PUSH1 0x20 ADD DUP3 DUP2 SUB DUP3 MSTORE PUSH1 0x24 DUP2 MSTORE PUSH1 0x20 ADD DUP1 PUSH2 0x12DB PUSH1 0x24 SWAP2 CODECOPY PUSH1 0x40 ADD SWAP2 POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 REVERT JUMPDEST PUSH1 0x0 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND DUP3 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND EQ ISZERO PUSH2 0xD29 JUMPI PUSH1 0x40 MLOAD PUSH32 0x8C379A000000000000000000000000000000000000000000000000000000000 DUP2 MSTORE PUSH1 0x4 ADD DUP1 DUP1 PUSH1 0x20 ADD DUP3 DUP2 SUB DUP3 MSTORE PUSH1 0x22 DUP2 MSTORE PUSH1 0x20 ADD DUP1 PUSH2 0x1246 PUSH1 0x22 SWAP2 CODECOPY PUSH1 0x40 ADD SWAP2 POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 REVERT JUMPDEST DUP1 PUSH1 0x1 PUSH1 0x0 DUP6 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND DUP2 MSTORE PUSH1 0x20 ADD SWAP1 DUP2 MSTORE PUSH1 0x20 ADD PUSH1 0x0 KECCAK256 PUSH1 0x0 DUP5 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND DUP2 MSTORE PUSH1 0x20 ADD SWAP1 DUP2 MSTORE PUSH1 0x20 ADD PUSH1 0x0 KECCAK256 DUP2 SWAP1 SSTORE POP DUP2 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND DUP4 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND PUSH32 0x8C5BE1E5EBEC7D5BD14F71427D1E84F3DD0314C0F7B2291E5B200AC8C7C3B925 DUP4 PUSH1 0x40 MLOAD DUP1 DUP3 DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 LOG3 POP POP POP JUMP JUMPDEST PUSH1 0x0 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND DUP4 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND EQ ISZERO PUSH2 0xE9A JUMPI PUSH1 0x40 MLOAD PUSH32 0x8C379A000000000000000000000000000000000000000000000000000000000 DUP2 MSTORE PUSH1 0x4 ADD DUP1 DUP1 PUSH1 0x20 ADD DUP3 DUP2 SUB DUP3 MSTORE PUSH1 0x25 DUP2 MSTORE PUSH1 0x20 ADD DUP1 PUSH2 0x12B6 PUSH1 0x25 SWAP2 CODECOPY PUSH1 0x40 ADD SWAP2 POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 REVERT JUMPDEST PUSH1 0x0 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND DUP3 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND EQ ISZERO PUSH2 0xF20 JUMPI PUSH1 0x40 MLOAD PUSH32 0x8C379A000000000000000000000000000000000000000000000000000000000 DUP2 MSTORE PUSH1 0x4 ADD DUP1 DUP1 PUSH1 0x20 ADD DUP3 DUP2 SUB DUP3 MSTORE PUSH1 0x23 DUP2 MSTORE PUSH1 0x20 ADD DUP1 PUSH2 0x1223 PUSH1 0x23 SWAP2 CODECOPY PUSH1 0x40 ADD SWAP2 POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 REVERT JUMPDEST PUSH2 0xF2B DUP4 DUP4 DUP4 PUSH2 0x121D JUMP JUMPDEST PUSH2 0xF96 DUP2 PUSH1 0x40 MLOAD DUP1 PUSH1 0x60 ADD PUSH1 0x40 MSTORE DUP1 PUSH1 0x26 DUP2 MSTORE PUSH1 0x20 ADD PUSH2 0x1268 PUSH1 0x26 SWAP2 CODECOPY PUSH1 0x0 DUP1 DUP8 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND DUP2 MSTORE PUSH1 0x20 ADD SWAP1 DUP2 MSTORE PUSH1 0x20 ADD PUSH1 0x0 KECCAK256 SLOAD PUSH2 0x10D5 SWAP1 SWAP3 SWAP2 SWAP1 PUSH4 0xFFFFFFFF AND JUMP JUMPDEST PUSH1 0x0 DUP1 DUP6 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND DUP2 MSTORE PUSH1 0x20 ADD SWAP1 DUP2 MSTORE PUSH1 0x20 ADD PUSH1 0x0 KECCAK256 DUP2 SWAP1 SSTORE POP PUSH2 0x1029 DUP2 PUSH1 0x0 DUP1 DUP6 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND DUP2 MSTORE PUSH1 0x20 ADD SWAP1 DUP2 MSTORE PUSH1 0x20 ADD PUSH1 0x0 KECCAK256 SLOAD PUSH2 0x1195 SWAP1 SWAP2 SWAP1 PUSH4 0xFFFFFFFF AND JUMP JUMPDEST PUSH1 0x0 DUP1 DUP5 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND DUP2 MSTORE PUSH1 0x20 ADD SWAP1 DUP2 MSTORE PUSH1 0x20 ADD PUSH1 0x0 KECCAK256 DUP2 SWAP1 SSTORE POP DUP2 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND DUP4 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND PUSH32 0xDDF252AD1BE2C89B69C2B068FC378DAA952BA7F163C4A11628F55A4DF523B3EF DUP4 PUSH1 0x40 MLOAD DUP1 DUP3 DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 LOG3 POP POP POP JUMP JUMPDEST PUSH1 0x0 DUP4 DUP4 GT ISZERO DUP3 SWAP1 PUSH2 0x1182 JUMPI PUSH1 0x40 MLOAD PUSH32 0x8C379A000000000000000000000000000000000000000000000000000000000 DUP2 MSTORE PUSH1 0x4 ADD DUP1 DUP1 PUSH1 0x20 ADD DUP3 DUP2 SUB DUP3 MSTORE DUP4 DUP2 DUP2 MLOAD DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP DUP1 MLOAD SWAP1 PUSH1 0x20 ADD SWAP1 DUP1 DUP4 DUP4 PUSH1 0x0 JUMPDEST DUP4 DUP2 LT ISZERO PUSH2 0x1147 JUMPI DUP1 DUP3 ADD MLOAD DUP2 DUP5 ADD MSTORE PUSH1 0x20 DUP2 ADD SWAP1 POP PUSH2 0x112C JUMP JUMPDEST POP POP POP POP SWAP1 POP SWAP1 DUP2 ADD SWAP1 PUSH1 0x1F AND DUP1 ISZERO PUSH2 0x1174 JUMPI DUP1 DUP3 SUB DUP1 MLOAD PUSH1 0x1 DUP4 PUSH1 0x20 SUB PUSH2 0x100 EXP SUB NOT AND DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP JUMPDEST POP SWAP3 POP POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 REVERT JUMPDEST POP PUSH1 0x0 DUP4 DUP6 SUB SWAP1 POP DUP1 SWAP2 POP POP SWAP4 SWAP3 POP POP POP JUMP JUMPDEST PUSH1 0x0 DUP1 DUP3 DUP5 ADD SWAP1 POP DUP4 DUP2 LT ISZERO PUSH2 0x1213 JUMPI PUSH1 0x40 MLOAD PUSH32 0x8C379A000000000000000000000000000000000000000000000000000000000 DUP2 MSTORE PUSH1 0x4 ADD DUP1 DUP1 PUSH1 0x20 ADD DUP3 DUP2 SUB DUP3 MSTORE PUSH1 0x1B DUP2 MSTORE PUSH1 0x20 ADD DUP1 PUSH32 0x536166654D6174683A206164646974696F6E206F766572666C6F770000000000 DUP2 MSTORE POP PUSH1 0x20 ADD SWAP2 POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 REVERT JUMPDEST DUP1 SWAP2 POP POP SWAP3 SWAP2 POP POP JUMP JUMPDEST POP POP POP JUMP INVALID GASLIMIT MSTORE NUMBER ORIGIN ADDRESS GASPRICE KECCAK256 PUSH21 0x72616E7366657220746F20746865207A65726F2061 PUSH5 0x6472657373 GASLIMIT MSTORE NUMBER ORIGIN ADDRESS GASPRICE KECCAK256 PUSH2 0x7070 PUSH19 0x6F766520746F20746865207A65726F20616464 PUSH19 0x65737345524332303A207472616E7366657220 PUSH2 0x6D6F PUSH22 0x6E7420657863656564732062616C616E636545524332 ADDRESS GASPRICE KECCAK256 PUSH21 0x72616E7366657220616D6F756E7420657863656564 PUSH20 0x20616C6C6F77616E636545524332303A20747261 PUSH15 0x736665722066726F6D20746865207A PUSH6 0x726F20616464 PUSH19 0x65737345524332303A20617070726F76652066 PUSH19 0x6F6D20746865207A65726F2061646472657373 GASLIMIT MSTORE NUMBER ORIGIN ADDRESS GASPRICE KECCAK256 PUSH5 0x6563726561 PUSH20 0x656420616C6C6F77616E63652062656C6F77207A PUSH6 0x726FA2646970 PUSH7 0x73582212209AF2 SWAP16 CHAINID 0x28 0xE2 MSTORE DIV 0xEA PUSH26 0x3C5C8BF021BB30BE2B2AE62B5CA6A54BC4190F510DF564736F6C PUSH4 0x43000606 STOP CALLER ",
      "sourceMap": "204:326:0:-:0;;;294:234;5:9:-1;2:2;;;27:1;24;17:12;2:2;294:234:0;;;;;;;;;;;;;;;15:2:-1;10:3;7:11;4:2;;;31:1;28;21:12;4:2;294:234:0;;;;;;;;;;;;;19:11:-1;14:3;11:20;8:2;;;44:1;41;34:12;8:2;71:11;66:3;62:21;55:28;;123:4;118:3;114:14;159:9;141:16;138:31;135:2;;;182:1;179;172:12;135:2;219:3;213:10;330:9;325:1;311:12;307:20;289:16;285:43;282:58;261:11;247:12;244:29;233:115;230:2;;;361:1;358;351:12;230:2;384:12;379:3;372:25;420:4;415:3;411:14;404:21;;0:432;;294:234:0;;;;;;;;;;23:1:-1;8:100;33:3;30:1;27:10;8:100;;;99:1;94:3;90:11;84:18;80:1;75:3;71:11;64:39;52:2;49:1;45:10;40:15;;8:100;;;12:14;294:234:0;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;19:11:-1;14:3;11:20;8:2;;;44:1;41;34:12;8:2;71:11;66:3;62:21;55:28;;123:4;118:3;114:14;159:9;141:16;138:31;135:2;;;182:1;179;172:12;135:2;219:3;213:10;330:9;325:1;311:12;307:20;289:16;285:43;282:58;261:11;247:12;244:29;233:115;230:2;;;361:1;358;351:12;230:2;384:12;379:3;372:25;420:4;415:3;411:14;404:21;;0:432;;294:234:0;;;;;;;;;;23:1:-1;8:100;33:3;30:1;27:10;8:100;;;99:1;94:3;90:11;84:18;80:1;75:3;71:11;64:39;52:2;49:1;45:10;40:15;;8:100;;;12:14;294:234:0;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;383:10;394:12;2028:4:3;2020:5;:12;;;;;;;;;;;;:::i;:::-;;2052:6;2042:7;:16;;;;;;;;;;;;:::i;:::-;;2080:2;2068:9;;:14;;;;;;;;;;;;;;;;;;1948:141;;438:10:0::1;426:9;:22;;;;;;;;;;;;:::i;:::-;;470:12;456:11;:26;;;;;;;;;;;;:::i;:::-;;490:31;496:10;508:12;490:5;;;:31;;:::i;:::-;294:234:::0;;204:326;;7778:370:3;7880:1;7861:21;;:7;:21;;;;7853:65;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;7929:49;7958:1;7962:7;7971:6;7929:20;;;:49;;:::i;:::-;8004:24;8021:6;8004:12;;:16;;;;;;:24;;;;:::i;:::-;7989:12;:39;;;;8059:30;8082:6;8059:9;:18;8069:7;8059:18;;;;;;;;;;;;;;;;:22;;;;;;:30;;;;:::i;:::-;8038:9;:18;8048:7;8038:18;;;;;;;;;;;;;;;:51;;;;8125:7;8104:37;;8121:1;8104:37;;;8134:6;8104:37;;;;;;;;;;;;;;;;;;7778:370;;:::o;10639:92::-;;;;:::o;874:176:2:-;932:7;951:9;967:1;963;:5;951:17;;991:1;986;:6;;978:46;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;1042:1;1035:8;;;874:176;;;;:::o;204:326:0:-;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;:::o;:::-;;;;;;;;;;;;;;;;;;;;;;;;;;;:::o;:::-;;;;;;;"
      };
      const prepareShares = new ContractFactory(sharesABI, sharesBytecode, signer);
      const _name = name;
      const _symbol = symbol;
      const _auctionInstance = auction.address;
      const shares = await prepareShares.deploy(_name, _symbol);


      // User deploy NFT.sol
      const nftABI = [
        {
          "inputs": [
            {
              "internalType": "string",
              "name": "_name",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "_symbol",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "_tokenURI",
              "type": "string"
            }
          ],
          "stateMutability": "nonpayable",
          "type": "constructor"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "owner",
              "type": "address"
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "approved",
              "type": "address"
            },
            {
              "indexed": true,
              "internalType": "uint256",
              "name": "tokenId",
              "type": "uint256"
            }
          ],
          "name": "Approval",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "owner",
              "type": "address"
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "operator",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "bool",
              "name": "approved",
              "type": "bool"
            }
          ],
          "name": "ApprovalForAll",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "from",
              "type": "address"
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "to",
              "type": "address"
            },
            {
              "indexed": true,
              "internalType": "uint256",
              "name": "tokenId",
              "type": "uint256"
            }
          ],
          "name": "Transfer",
          "type": "event"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "to",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "tokenId",
              "type": "uint256"
            }
          ],
          "name": "approve",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "owner",
              "type": "address"
            }
          ],
          "name": "balanceOf",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "baseURI",
          "outputs": [
            {
              "internalType": "string",
              "name": "",
              "type": "string"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "tokenId",
              "type": "uint256"
            }
          ],
          "name": "getApproved",
          "outputs": [
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "owner",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "operator",
              "type": "address"
            }
          ],
          "name": "isApprovedForAll",
          "outputs": [
            {
              "internalType": "bool",
              "name": "",
              "type": "bool"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "name",
          "outputs": [
            {
              "internalType": "string",
              "name": "",
              "type": "string"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "tokenId",
              "type": "uint256"
            }
          ],
          "name": "ownerOf",
          "outputs": [
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "from",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "to",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "tokenId",
              "type": "uint256"
            }
          ],
          "name": "safeTransferFrom",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "from",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "to",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "tokenId",
              "type": "uint256"
            },
            {
              "internalType": "bytes",
              "name": "_data",
              "type": "bytes"
            }
          ],
          "name": "safeTransferFrom",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "operator",
              "type": "address"
            },
            {
              "internalType": "bool",
              "name": "approved",
              "type": "bool"
            }
          ],
          "name": "setApprovalForAll",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "bytes4",
              "name": "interfaceId",
              "type": "bytes4"
            }
          ],
          "name": "supportsInterface",
          "outputs": [
            {
              "internalType": "bool",
              "name": "",
              "type": "bool"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "symbol",
          "outputs": [
            {
              "internalType": "string",
              "name": "",
              "type": "string"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "index",
              "type": "uint256"
            }
          ],
          "name": "tokenByIndex",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "owner",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "index",
              "type": "uint256"
            }
          ],
          "name": "tokenOfOwnerByIndex",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "tokenId",
              "type": "uint256"
            }
          ],
          "name": "tokenURI",
          "outputs": [
            {
              "internalType": "string",
              "name": "",
              "type": "string"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "totalSupply",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "from",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "to",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "tokenId",
              "type": "uint256"
            }
          ],
          "name": "transferFrom",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        }
      ];
      const nftBytecode = {
	"linkReferences": {},
	"object": "60806040523480156200001157600080fd5b506040516200375c3803806200375c833981810160405260608110156200003757600080fd5b81019080805160405193929190846401000000008211156200005857600080fd5b838201915060208201858111156200006f57600080fd5b82518660018202830111640100000000821117156200008d57600080fd5b8083526020830192505050908051906020019080838360005b83811015620000c3578082015181840152602081019050620000a6565b50505050905090810190601f168015620000f15780820380516001836020036101000a031916815260200191505b50604052602001805160405193929190846401000000008211156200011557600080fd5b838201915060208201858111156200012c57600080fd5b82518660018202830111640100000000821117156200014a57600080fd5b8083526020830192505050908051906020019080838360005b838110156200018057808201518184015260208101905062000163565b50505050905090810190601f168015620001ae5780820380516001836020036101000a031916815260200191505b5060405260200180516040519392919084640100000000821115620001d257600080fd5b83820191506020820185811115620001e957600080fd5b82518660018202830111640100000000821117156200020757600080fd5b8083526020830192505050908051906020019080838360005b838110156200023d57808201518184015260208101905062000220565b50505050905090810190601f1680156200026b5780820380516001836020036101000a031916815260200191505b5060405250505082826200028c6301ffc9a760e01b6200033760201b60201c565b8160069080519060200190620002a492919062000ee5565b508060079080519060200190620002bd92919062000ee5565b50620002d66380ac58cd60e01b6200033760201b60201c565b620002ee635b5e139f60e01b6200033760201b60201c565b6200030663780e9d6360e01b6200033760201b60201c565b50506200031b3360016200044060201b60201c565b6200032e6001826200046660201b60201c565b50505062000f8b565b63ffffffff60e01b817bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19161415620003d4576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601c8152602001807f4552433136353a20696e76616c696420696e746572666163652069640000000081525060200191505060405180910390fd5b6001600080837bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19167bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916815260200190815260200160002060006101000a81548160ff02191690831515021790555050565b62000462828260405180602001604052806000815250620004fc60201b60201c565b5050565b62000477826200057f60201b60201c565b620004ce576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602c81526020018062003730602c913960400191505060405180910390fd5b80600860008481526020019081526020016000209080519060200190620004f792919062000ee5565b505050565b6200050e8383620005a360201b60201c565b620005236000848484620007b760201b60201c565b6200057a576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526032815260200180620036d86032913960400191505060405180910390fd5b505050565b60006200059c826002620009f360201b6200146e1790919060201c565b9050919050565b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff16141562000647576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260208152602001807f4552433732313a206d696e7420746f20746865207a65726f206164647265737381525060200191505060405180910390fd5b62000658816200057f60201b60201c565b15620006cc576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601c8152602001807f4552433732313a20746f6b656e20616c7265616479206d696e7465640000000081525060200191505060405180910390fd5b620006e06000838362000a1560201b60201c565b6200073881600160008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002062000a1a60201b620014881790919060201c565b50620007568183600262000a3c60201b620014a2179092919060201c565b50808273ffffffffffffffffffffffffffffffffffffffff16600073ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef60405160405180910390a45050565b6000620007e58473ffffffffffffffffffffffffffffffffffffffff1662000a7960201b620014d71760201c565b620007f45760019050620009eb565b60606200097163150b7a0260e01b6200081262000a8c60201b60201c565b888787604051602401808573ffffffffffffffffffffffffffffffffffffffff1681526020018473ffffffffffffffffffffffffffffffffffffffff16815260200183815260200180602001828103825283818151815260200191508051906020019080838360005b83811015620008985780820151818401526020810190506200087b565b50505050905090810190601f168015620008c65780820380516001836020036101000a031916815260200191505b5095505050505050604051602081830303815290604052907bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff8381831617835250505050604051806060016040528060328152602001620036d8603291398773ffffffffffffffffffffffffffffffffffffffff1662000a9460201b620014ea179092919060201c565b905060008180602001905160208110156200098b57600080fd5b8101908080519060200190929190505050905063150b7a0260e01b7bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916817bffffffffffffffffffffffffffffffffffffffffffffffffffffffff191614925050505b949350505050565b600062000a0d836000018360001b62000ab460201b60201c565b905092915050565b505050565b600062000a34836000018360001b62000ad760201b60201c565b905092915050565b600062000a70846000018460001b8473ffffffffffffffffffffffffffffffffffffffff1660001b62000b5160201b60201c565b90509392505050565b600080823b905060008111915050919050565b600033905090565b606062000aab848460008562000c3060201b60201c565b90509392505050565b600080836001016000848152602001908152602001600020541415905092915050565b600062000aeb838362000df060201b60201c565b62000b4657826000018290806001815401808255809150506001900390600052602060002001600090919091909150558260000180549050836001016000848152602001908152602001600020819055506001905062000b4b565b600090505b92915050565b600080846001016000858152602001908152602001600020549050600081141562000bfa5784600001604051806040016040528086815260200185815250908060018154018082558091505060019003906000526020600020906002020160009091909190915060008201518160000155602082015181600101555050846000018054905085600101600086815260200190815260200160002081905550600191505062000c29565b8285600001600183038154811062000c0e57fe5b90600052602060002090600202016001018190555060009150505b9392505050565b60608247101562000c8d576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260268152602001806200370a6026913960400191505060405180910390fd5b62000c9e8562000a7960201b60201c565b62000d11576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601d8152602001807f416464726573733a2063616c6c20746f206e6f6e2d636f6e747261637400000081525060200191505060405180910390fd5b600060608673ffffffffffffffffffffffffffffffffffffffff1685876040518082805190602001908083835b6020831062000d63578051825260208201915060208101905060208303925062000d3e565b6001836020036101000a03801982511681845116808217855250505050505090500191505060006040518083038185875af1925050503d806000811462000dc7576040519150601f19603f3d011682016040523d82523d6000602084013e62000dcc565b606091505b509150915062000de482828662000e1360201b60201c565b92505050949350505050565b600080836001016000848152602001908152602001600020541415905092915050565b6060831562000e255782905062000ede565b60008351111562000e395782518084602001fd5b816040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825283818151815260200191508051906020019080838360005b8381101562000ea257808201518184015260208101905062000e85565b50505050905090810190601f16801562000ed05780820380516001836020036101000a031916815260200191505b509250505060405180910390fd5b9392505050565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f1062000f2857805160ff191683800117855562000f59565b8280016001018555821562000f59579182015b8281111562000f5857825182559160200191906001019062000f3b565b5b50905062000f68919062000f6c565b5090565b5b8082111562000f8757600081600090555060010162000f6d565b5090565b61273d8062000f9b6000396000f3fe608060405234801561001057600080fd5b506004361061010b5760003560e01c80634f6ccce7116100a257806395d89b411161007157806395d89b411461056d578063a22cb465146105f0578063b88d4fde14610640578063c87b56dd14610745578063e985e9c5146107ec5761010b565b80634f6ccce7146103f85780636352211e1461043a5780636c0360eb1461049257806370a08231146105155761010b565b806318160ddd116100de57806318160ddd1461029c57806323b872dd146102ba5780632f745c591461032857806342842e0e1461038a5761010b565b806301ffc9a71461011057806306fdde0314610173578063081812fc146101f6578063095ea7b31461024e575b600080fd5b61015b6004803603602081101561012657600080fd5b8101908080357bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19169060200190929190505050610866565b60405180821515815260200191505060405180910390f35b61017b6108cd565b6040518080602001828103825283818151815260200191508051906020019080838360005b838110156101bb5780820151818401526020810190506101a0565b50505050905090810190601f1680156101e85780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b6102226004803603602081101561020c57600080fd5b810190808035906020019092919050505061096f565b604051808273ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b61029a6004803603604081101561026457600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050610a0a565b005b6102a4610b4e565b6040518082815260200191505060405180910390f35b610326600480360360608110156102d057600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050610b5f565b005b6103746004803603604081101561033e57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050610bd5565b6040518082815260200191505060405180910390f35b6103f6600480360360608110156103a057600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050610c30565b005b6104246004803603602081101561040e57600080fd5b8101908080359060200190929190505050610c50565b6040518082815260200191505060405180910390f35b6104666004803603602081101561045057600080fd5b8101908080359060200190929190505050610c73565b604051808273ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b61049a610caa565b6040518080602001828103825283818151815260200191508051906020019080838360005b838110156104da5780820151818401526020810190506104bf565b50505050905090810190601f1680156105075780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b6105576004803603602081101561052b57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050610d4c565b6040518082815260200191505060405180910390f35b610575610e21565b6040518080602001828103825283818151815260200191508051906020019080838360005b838110156105b557808201518184015260208101905061059a565b50505050905090810190601f1680156105e25780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b61063e6004803603604081101561060657600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803515159060200190929190505050610ec3565b005b6107436004803603608081101561065657600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190803590602001906401000000008111156106bd57600080fd5b8201836020820111156106cf57600080fd5b803590602001918460018302840111640100000000831117156106f157600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f820116905080830192505050505050509192919290505050611079565b005b6107716004803603602081101561075b57600080fd5b81019080803590602001909291905050506110f1565b6040518080602001828103825283818151815260200191508051906020019080838360005b838110156107b1578082015181840152602081019050610796565b50505050905090810190601f1680156107de5780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b61084e6004803603604081101561080257600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff1690602001909291905050506113da565b60405180821515815260200191505060405180910390f35b6000806000837bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19167bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916815260200190815260200160002060009054906101000a900460ff169050919050565b606060068054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156109655780601f1061093a57610100808354040283529160200191610965565b820191906000526020600020905b81548152906001019060200180831161094857829003601f168201915b5050505050905090565b600061097a82611502565b6109cf576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602c815260200180612632602c913960400191505060405180910390fd5b6004600083815260200190815260200160002060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050919050565b6000610a1582610c73565b90508073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff161415610a9c576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260218152602001806126b66021913960400191505060405180910390fd5b8073ffffffffffffffffffffffffffffffffffffffff16610abb61151f565b73ffffffffffffffffffffffffffffffffffffffff161480610aea5750610ae981610ae461151f565b6113da565b5b610b3f576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260388152602001806125856038913960400191505060405180910390fd5b610b498383611527565b505050565b6000610b5a60026115e0565b905090565b610b70610b6a61151f565b826115f5565b610bc5576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260318152602001806126d76031913960400191505060405180910390fd5b610bd08383836116e9565b505050565b6000610c2882600160008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002061192c90919063ffffffff16565b905092915050565b610c4b83838360405180602001604052806000815250611079565b505050565b600080610c6783600261194690919063ffffffff16565b50905080915050919050565b6000610ca3826040518060600160405280602981526020016125e76029913960026119729092919063ffffffff16565b9050919050565b606060098054600181600116156101000203166002900480601f016020809104026020016040519081016040528092919081815260200182805460018160011615610100020316600290048015610d425780601f10610d1757610100808354040283529160200191610d42565b820191906000526020600020905b815481529060010190602001808311610d2557829003601f168201915b5050505050905090565b60008073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff161415610dd3576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602a8152602001806125bd602a913960400191505060405180910390fd5b610e1a600160008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020611991565b9050919050565b606060078054600181600116156101000203166002900480601f016020809104026020016040519081016040528092919081815260200182805460018160011615610100020316600290048015610eb95780601f10610e8e57610100808354040283529160200191610eb9565b820191906000526020600020905b815481529060010190602001808311610e9c57829003601f168201915b5050505050905090565b610ecb61151f565b73ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff161415610f6c576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260198152602001807f4552433732313a20617070726f766520746f2063616c6c65720000000000000081525060200191505060405180910390fd5b8060056000610f7961151f565b73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff0219169083151502179055508173ffffffffffffffffffffffffffffffffffffffff1661102661151f565b73ffffffffffffffffffffffffffffffffffffffff167f17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c318360405180821515815260200191505060405180910390a35050565b61108a61108461151f565b836115f5565b6110df576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260318152602001806126d76031913960400191505060405180910390fd5b6110eb848484846119a6565b50505050565b60606110fc82611502565b611151576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602f815260200180612687602f913960400191505060405180910390fd5b6060600860008481526020019081526020016000208054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156111fa5780601f106111cf576101008083540402835291602001916111fa565b820191906000526020600020905b8154815290600101906020018083116111dd57829003601f168201915b5050505050905060006009805460018160011615610100020316600290049050141561122957809150506113d5565b6000815111156113025760098160405160200180838054600181600116156101000203166002900480156112945780601f10611272576101008083540402835291820191611294565b820191906000526020600020905b815481529060010190602001808311611280575b505082805190602001908083835b602083106112c557805182526020820191506020810190506020830392506112a2565b6001836020036101000a038019825116818451168082178552505050505050905001925050506040516020818303038152906040529150506113d5565b600961130d84611a18565b604051602001808380546001816001161561010002031660029004801561136b5780601f1061134957610100808354040283529182019161136b565b820191906000526020600020905b815481529060010190602001808311611357575b505082805190602001908083835b6020831061139c5780518252602082019150602081019050602083039250611379565b6001836020036101000a038019825116818451168082178552505050505050905001925050506040516020818303038152906040529150505b919050565b6000600560008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff16905092915050565b6000611480836000018360001b611b5f565b905092915050565b600061149a836000018360001b611b82565b905092915050565b60006114ce846000018460001b8473ffffffffffffffffffffffffffffffffffffffff1660001b611bf2565b90509392505050565b600080823b905060008111915050919050565b60606114f98484600085611cce565b90509392505050565b600061151882600261146e90919063ffffffff16565b9050919050565b600033905090565b816004600083815260200190815260200160002060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550808273ffffffffffffffffffffffffffffffffffffffff1661159a83610c73565b73ffffffffffffffffffffffffffffffffffffffff167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b92560405160405180910390a45050565b60006115ee82600001611e77565b9050919050565b600061160082611502565b611655576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602c815260200180612559602c913960400191505060405180910390fd5b600061166083610c73565b90508073ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff1614806116cf57508373ffffffffffffffffffffffffffffffffffffffff166116b78461096f565b73ffffffffffffffffffffffffffffffffffffffff16145b806116e057506116df81856113da565b5b91505092915050565b8273ffffffffffffffffffffffffffffffffffffffff1661170982610c73565b73ffffffffffffffffffffffffffffffffffffffff1614611775576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602981526020018061265e6029913960400191505060405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1614156117fb576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602481526020018061250f6024913960400191505060405180910390fd5b611806838383611e88565b611811600082611527565b61186281600160008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020611e8d90919063ffffffff16565b506118b481600160008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002061148890919063ffffffff16565b506118cb818360026114a29092919063ffffffff16565b50808273ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef60405160405180910390a4505050565b600061193b8360000183611ea7565b60001c905092915050565b6000806000806119598660000186611f2a565b915091508160001c8160001c9350935050509250929050565b6000611985846000018460001b84611fc3565b60001c90509392505050565b600061199f826000016120b9565b9050919050565b6119b18484846116e9565b6119bd848484846120ca565b611a12576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260328152602001806124dd6032913960400191505060405180910390fd5b50505050565b60606000821415611a60576040518060400160405280600181526020017f30000000000000000000000000000000000000000000000000000000000000008152509050611b5a565b600082905060005b60008214611a8a578080600101915050600a8281611a8257fe5b049150611a68565b60608167ffffffffffffffff81118015611aa357600080fd5b506040519080825280601f01601f191660200182016040528015611ad65781602001600182028036833780820191505090505b50905060006001830390508593505b60008414611b5257600a8481611af757fe5b0660300160f81b82828060019003935081518110611b1157fe5b60200101907effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916908160001a905350600a8481611b4a57fe5b049350611ae5565b819450505050505b919050565b600080836001016000848152602001908152602001600020541415905092915050565b6000611b8e83836122e3565b611be7578260000182908060018154018082558091505060019003906000526020600020016000909190919091505582600001805490508360010160008481526020019081526020016000208190555060019050611bec565b600090505b92915050565b6000808460010160008581526020019081526020016000205490506000811415611c9957846000016040518060400160405280868152602001858152509080600181540180825580915050600190039060005260206000209060020201600090919091909150600082015181600001556020820151816001015550508460000180549050856001016000868152602001908152602001600020819055506001915050611cc7565b82856000016001830381548110611cac57fe5b90600052602060002090600202016001018190555060009150505b9392505050565b606082471015611d29576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260268152602001806125336026913960400191505060405180910390fd5b611d32856114d7565b611da4576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601d8152602001807f416464726573733a2063616c6c20746f206e6f6e2d636f6e747261637400000081525060200191505060405180910390fd5b600060608673ffffffffffffffffffffffffffffffffffffffff1685876040518082805190602001908083835b60208310611df45780518252602082019150602081019050602083039250611dd1565b6001836020036101000a03801982511681845116808217855250505050505090500191505060006040518083038185875af1925050503d8060008114611e56576040519150601f19603f3d011682016040523d82523d6000602084013e611e5b565b606091505b5091509150611e6b828286612306565b92505050949350505050565b600081600001805490509050919050565b505050565b6000611e9f836000018360001b6123d2565b905092915050565b600081836000018054905011611f08576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260228152602001806124bb6022913960400191505060405180910390fd5b826000018281548110611f1757fe5b9060005260206000200154905092915050565b60008082846000018054905011611f8c576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260228152602001806126106022913960400191505060405180910390fd5b6000846000018481548110611f9d57fe5b906000526020600020906002020190508060000154816001015492509250509250929050565b6000808460010160008581526020019081526020016000205490506000811415839061208a576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825283818151815260200191508051906020019080838360005b8381101561204f578082015181840152602081019050612034565b50505050905090810190601f16801561207c5780820380516001836020036101000a031916815260200191505b509250505060405180910390fd5b5084600001600182038154811061209d57fe5b9060005260206000209060020201600101549150509392505050565b600081600001805490509050919050565b60006120eb8473ffffffffffffffffffffffffffffffffffffffff166114d7565b6120f857600190506122db565b606061226263150b7a0260e01b61210d61151f565b888787604051602401808573ffffffffffffffffffffffffffffffffffffffff1681526020018473ffffffffffffffffffffffffffffffffffffffff16815260200183815260200180602001828103825283818151815260200191508051906020019080838360005b83811015612191578082015181840152602081019050612176565b50505050905090810190601f1680156121be5780820380516001836020036101000a031916815260200191505b5095505050505050604051602081830303815290604052907bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff83818316178352505050506040518060600160405280603281526020016124dd603291398773ffffffffffffffffffffffffffffffffffffffff166114ea9092919063ffffffff16565b9050600081806020019051602081101561227b57600080fd5b8101908080519060200190929190505050905063150b7a0260e01b7bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916817bffffffffffffffffffffffffffffffffffffffffffffffffffffffff191614925050505b949350505050565b600080836001016000848152602001908152602001600020541415905092915050565b60608315612316578290506123cb565b6000835111156123295782518084602001fd5b816040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825283818151815260200191508051906020019080838360005b83811015612390578082015181840152602081019050612375565b50505050905090810190601f1680156123bd5780820380516001836020036101000a031916815260200191505b509250505060405180910390fd5b9392505050565b600080836001016000848152602001908152602001600020549050600081146124ae576000600182039050600060018660000180549050039050600086600001828154811061241d57fe5b906000526020600020015490508087600001848154811061243a57fe5b906000526020600020018190555060018301876001016000838152602001908152602001600020819055508660000180548061247257fe5b600190038181906000526020600020016000905590558660010160008781526020019081526020016000206000905560019450505050506124b4565b60009150505b9291505056fe456e756d657261626c655365743a20696e646578206f7574206f6620626f756e64734552433732313a207472616e7366657220746f206e6f6e20455243373231526563656976657220696d706c656d656e7465724552433732313a207472616e7366657220746f20746865207a65726f2061646472657373416464726573733a20696e73756666696369656e742062616c616e636520666f722063616c6c4552433732313a206f70657261746f7220717565727920666f72206e6f6e6578697374656e7420746f6b656e4552433732313a20617070726f76652063616c6c6572206973206e6f74206f776e6572206e6f7220617070726f76656420666f7220616c6c4552433732313a2062616c616e636520717565727920666f7220746865207a65726f20616464726573734552433732313a206f776e657220717565727920666f72206e6f6e6578697374656e7420746f6b656e456e756d657261626c654d61703a20696e646578206f7574206f6620626f756e64734552433732313a20617070726f76656420717565727920666f72206e6f6e6578697374656e7420746f6b656e4552433732313a207472616e73666572206f6620746f6b656e2074686174206973206e6f74206f776e4552433732314d657461646174613a2055524920717565727920666f72206e6f6e6578697374656e7420746f6b656e4552433732313a20617070726f76616c20746f2063757272656e74206f776e65724552433732313a207472616e736665722063616c6c6572206973206e6f74206f776e6572206e6f7220617070726f766564a26469706673582212208fc1eabf640e52c204ff13e92376ea859ed79a5d2ad97d941e5626a294545ac064736f6c634300060c00334552433732313a207472616e7366657220746f206e6f6e20455243373231526563656976657220696d706c656d656e746572416464726573733a20696e73756666696369656e742062616c616e636520666f722063616c6c4552433732314d657461646174613a2055524920736574206f66206e6f6e6578697374656e7420746f6b656e",
	"opcodes": "PUSH1 0x80 PUSH1 0x40 MSTORE CALLVALUE DUP1 ISZERO PUSH3 0x11 JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST POP PUSH1 0x40 MLOAD PUSH3 0x375C CODESIZE SUB DUP1 PUSH3 0x375C DUP4 CODECOPY DUP2 DUP2 ADD PUSH1 0x40 MSTORE PUSH1 0x60 DUP2 LT ISZERO PUSH3 0x37 JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST DUP2 ADD SWAP1 DUP1 DUP1 MLOAD PUSH1 0x40 MLOAD SWAP4 SWAP3 SWAP2 SWAP1 DUP5 PUSH5 0x100000000 DUP3 GT ISZERO PUSH3 0x58 JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST DUP4 DUP3 ADD SWAP2 POP PUSH1 0x20 DUP3 ADD DUP6 DUP2 GT ISZERO PUSH3 0x6F JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST DUP3 MLOAD DUP7 PUSH1 0x1 DUP3 MUL DUP4 ADD GT PUSH5 0x100000000 DUP3 GT OR ISZERO PUSH3 0x8D JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST DUP1 DUP4 MSTORE PUSH1 0x20 DUP4 ADD SWAP3 POP POP POP SWAP1 DUP1 MLOAD SWAP1 PUSH1 0x20 ADD SWAP1 DUP1 DUP4 DUP4 PUSH1 0x0 JUMPDEST DUP4 DUP2 LT ISZERO PUSH3 0xC3 JUMPI DUP1 DUP3 ADD MLOAD DUP2 DUP5 ADD MSTORE PUSH1 0x20 DUP2 ADD SWAP1 POP PUSH3 0xA6 JUMP JUMPDEST POP POP POP POP SWAP1 POP SWAP1 DUP2 ADD SWAP1 PUSH1 0x1F AND DUP1 ISZERO PUSH3 0xF1 JUMPI DUP1 DUP3 SUB DUP1 MLOAD PUSH1 0x1 DUP4 PUSH1 0x20 SUB PUSH2 0x100 EXP SUB NOT AND DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP JUMPDEST POP PUSH1 0x40 MSTORE PUSH1 0x20 ADD DUP1 MLOAD PUSH1 0x40 MLOAD SWAP4 SWAP3 SWAP2 SWAP1 DUP5 PUSH5 0x100000000 DUP3 GT ISZERO PUSH3 0x115 JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST DUP4 DUP3 ADD SWAP2 POP PUSH1 0x20 DUP3 ADD DUP6 DUP2 GT ISZERO PUSH3 0x12C JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST DUP3 MLOAD DUP7 PUSH1 0x1 DUP3 MUL DUP4 ADD GT PUSH5 0x100000000 DUP3 GT OR ISZERO PUSH3 0x14A JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST DUP1 DUP4 MSTORE PUSH1 0x20 DUP4 ADD SWAP3 POP POP POP SWAP1 DUP1 MLOAD SWAP1 PUSH1 0x20 ADD SWAP1 DUP1 DUP4 DUP4 PUSH1 0x0 JUMPDEST DUP4 DUP2 LT ISZERO PUSH3 0x180 JUMPI DUP1 DUP3 ADD MLOAD DUP2 DUP5 ADD MSTORE PUSH1 0x20 DUP2 ADD SWAP1 POP PUSH3 0x163 JUMP JUMPDEST POP POP POP POP SWAP1 POP SWAP1 DUP2 ADD SWAP1 PUSH1 0x1F AND DUP1 ISZERO PUSH3 0x1AE JUMPI DUP1 DUP3 SUB DUP1 MLOAD PUSH1 0x1 DUP4 PUSH1 0x20 SUB PUSH2 0x100 EXP SUB NOT AND DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP JUMPDEST POP PUSH1 0x40 MSTORE PUSH1 0x20 ADD DUP1 MLOAD PUSH1 0x40 MLOAD SWAP4 SWAP3 SWAP2 SWAP1 DUP5 PUSH5 0x100000000 DUP3 GT ISZERO PUSH3 0x1D2 JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST DUP4 DUP3 ADD SWAP2 POP PUSH1 0x20 DUP3 ADD DUP6 DUP2 GT ISZERO PUSH3 0x1E9 JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST DUP3 MLOAD DUP7 PUSH1 0x1 DUP3 MUL DUP4 ADD GT PUSH5 0x100000000 DUP3 GT OR ISZERO PUSH3 0x207 JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST DUP1 DUP4 MSTORE PUSH1 0x20 DUP4 ADD SWAP3 POP POP POP SWAP1 DUP1 MLOAD SWAP1 PUSH1 0x20 ADD SWAP1 DUP1 DUP4 DUP4 PUSH1 0x0 JUMPDEST DUP4 DUP2 LT ISZERO PUSH3 0x23D JUMPI DUP1 DUP3 ADD MLOAD DUP2 DUP5 ADD MSTORE PUSH1 0x20 DUP2 ADD SWAP1 POP PUSH3 0x220 JUMP JUMPDEST POP POP POP POP SWAP1 POP SWAP1 DUP2 ADD SWAP1 PUSH1 0x1F AND DUP1 ISZERO PUSH3 0x26B JUMPI DUP1 DUP3 SUB DUP1 MLOAD PUSH1 0x1 DUP4 PUSH1 0x20 SUB PUSH2 0x100 EXP SUB NOT AND DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP JUMPDEST POP PUSH1 0x40 MSTORE POP POP POP DUP3 DUP3 PUSH3 0x28C PUSH4 0x1FFC9A7 PUSH1 0xE0 SHL PUSH3 0x337 PUSH1 0x20 SHL PUSH1 0x20 SHR JUMP JUMPDEST DUP2 PUSH1 0x6 SWAP1 DUP1 MLOAD SWAP1 PUSH1 0x20 ADD SWAP1 PUSH3 0x2A4 SWAP3 SWAP2 SWAP1 PUSH3 0xEE5 JUMP JUMPDEST POP DUP1 PUSH1 0x7 SWAP1 DUP1 MLOAD SWAP1 PUSH1 0x20 ADD SWAP1 PUSH3 0x2BD SWAP3 SWAP2 SWAP1 PUSH3 0xEE5 JUMP JUMPDEST POP PUSH3 0x2D6 PUSH4 0x80AC58CD PUSH1 0xE0 SHL PUSH3 0x337 PUSH1 0x20 SHL PUSH1 0x20 SHR JUMP JUMPDEST PUSH3 0x2EE PUSH4 0x5B5E139F PUSH1 0xE0 SHL PUSH3 0x337 PUSH1 0x20 SHL PUSH1 0x20 SHR JUMP JUMPDEST PUSH3 0x306 PUSH4 0x780E9D63 PUSH1 0xE0 SHL PUSH3 0x337 PUSH1 0x20 SHL PUSH1 0x20 SHR JUMP JUMPDEST POP POP PUSH3 0x31B CALLER PUSH1 0x1 PUSH3 0x440 PUSH1 0x20 SHL PUSH1 0x20 SHR JUMP JUMPDEST PUSH3 0x32E PUSH1 0x1 DUP3 PUSH3 0x466 PUSH1 0x20 SHL PUSH1 0x20 SHR JUMP JUMPDEST POP POP POP PUSH3 0xF8B JUMP JUMPDEST PUSH4 0xFFFFFFFF PUSH1 0xE0 SHL DUP2 PUSH28 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF NOT AND EQ ISZERO PUSH3 0x3D4 JUMPI PUSH1 0x40 MLOAD PUSH32 0x8C379A000000000000000000000000000000000000000000000000000000000 DUP2 MSTORE PUSH1 0x4 ADD DUP1 DUP1 PUSH1 0x20 ADD DUP3 DUP2 SUB DUP3 MSTORE PUSH1 0x1C DUP2 MSTORE PUSH1 0x20 ADD DUP1 PUSH32 0x4552433136353A20696E76616C696420696E7465726661636520696400000000 DUP2 MSTORE POP PUSH1 0x20 ADD SWAP2 POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 REVERT JUMPDEST PUSH1 0x1 PUSH1 0x0 DUP1 DUP4 PUSH28 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF NOT AND PUSH28 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF NOT AND DUP2 MSTORE PUSH1 0x20 ADD SWAP1 DUP2 MSTORE PUSH1 0x20 ADD PUSH1 0x0 KECCAK256 PUSH1 0x0 PUSH2 0x100 EXP DUP2 SLOAD DUP2 PUSH1 0xFF MUL NOT AND SWAP1 DUP4 ISZERO ISZERO MUL OR SWAP1 SSTORE POP POP JUMP JUMPDEST PUSH3 0x462 DUP3 DUP3 PUSH1 0x40 MLOAD DUP1 PUSH1 0x20 ADD PUSH1 0x40 MSTORE DUP1 PUSH1 0x0 DUP2 MSTORE POP PUSH3 0x4FC PUSH1 0x20 SHL PUSH1 0x20 SHR JUMP JUMPDEST POP POP JUMP JUMPDEST PUSH3 0x477 DUP3 PUSH3 0x57F PUSH1 0x20 SHL PUSH1 0x20 SHR JUMP JUMPDEST PUSH3 0x4CE JUMPI PUSH1 0x40 MLOAD PUSH32 0x8C379A000000000000000000000000000000000000000000000000000000000 DUP2 MSTORE PUSH1 0x4 ADD DUP1 DUP1 PUSH1 0x20 ADD DUP3 DUP2 SUB DUP3 MSTORE PUSH1 0x2C DUP2 MSTORE PUSH1 0x20 ADD DUP1 PUSH3 0x3730 PUSH1 0x2C SWAP2 CODECOPY PUSH1 0x40 ADD SWAP2 POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 REVERT JUMPDEST DUP1 PUSH1 0x8 PUSH1 0x0 DUP5 DUP2 MSTORE PUSH1 0x20 ADD SWAP1 DUP2 MSTORE PUSH1 0x20 ADD PUSH1 0x0 KECCAK256 SWAP1 DUP1 MLOAD SWAP1 PUSH1 0x20 ADD SWAP1 PUSH3 0x4F7 SWAP3 SWAP2 SWAP1 PUSH3 0xEE5 JUMP JUMPDEST POP POP POP JUMP JUMPDEST PUSH3 0x50E DUP4 DUP4 PUSH3 0x5A3 PUSH1 0x20 SHL PUSH1 0x20 SHR JUMP JUMPDEST PUSH3 0x523 PUSH1 0x0 DUP5 DUP5 DUP5 PUSH3 0x7B7 PUSH1 0x20 SHL PUSH1 0x20 SHR JUMP JUMPDEST PUSH3 0x57A JUMPI PUSH1 0x40 MLOAD PUSH32 0x8C379A000000000000000000000000000000000000000000000000000000000 DUP2 MSTORE PUSH1 0x4 ADD DUP1 DUP1 PUSH1 0x20 ADD DUP3 DUP2 SUB DUP3 MSTORE PUSH1 0x32 DUP2 MSTORE PUSH1 0x20 ADD DUP1 PUSH3 0x36D8 PUSH1 0x32 SWAP2 CODECOPY PUSH1 0x40 ADD SWAP2 POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 REVERT JUMPDEST POP POP POP JUMP JUMPDEST PUSH1 0x0 PUSH3 0x59C DUP3 PUSH1 0x2 PUSH3 0x9F3 PUSH1 0x20 SHL PUSH3 0x146E OR SWAP1 SWAP2 SWAP1 PUSH1 0x20 SHR JUMP JUMPDEST SWAP1 POP SWAP2 SWAP1 POP JUMP JUMPDEST PUSH1 0x0 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND DUP3 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND EQ ISZERO PUSH3 0x647 JUMPI PUSH1 0x40 MLOAD PUSH32 0x8C379A000000000000000000000000000000000000000000000000000000000 DUP2 MSTORE PUSH1 0x4 ADD DUP1 DUP1 PUSH1 0x20 ADD DUP3 DUP2 SUB DUP3 MSTORE PUSH1 0x20 DUP2 MSTORE PUSH1 0x20 ADD DUP1 PUSH32 0x4552433732313A206D696E7420746F20746865207A65726F2061646472657373 DUP2 MSTORE POP PUSH1 0x20 ADD SWAP2 POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 REVERT JUMPDEST PUSH3 0x658 DUP2 PUSH3 0x57F PUSH1 0x20 SHL PUSH1 0x20 SHR JUMP JUMPDEST ISZERO PUSH3 0x6CC JUMPI PUSH1 0x40 MLOAD PUSH32 0x8C379A000000000000000000000000000000000000000000000000000000000 DUP2 MSTORE PUSH1 0x4 ADD DUP1 DUP1 PUSH1 0x20 ADD DUP3 DUP2 SUB DUP3 MSTORE PUSH1 0x1C DUP2 MSTORE PUSH1 0x20 ADD DUP1 PUSH32 0x4552433732313A20746F6B656E20616C7265616479206D696E74656400000000 DUP2 MSTORE POP PUSH1 0x20 ADD SWAP2 POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 REVERT JUMPDEST PUSH3 0x6E0 PUSH1 0x0 DUP4 DUP4 PUSH3 0xA15 PUSH1 0x20 SHL PUSH1 0x20 SHR JUMP JUMPDEST PUSH3 0x738 DUP2 PUSH1 0x1 PUSH1 0x0 DUP6 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND DUP2 MSTORE PUSH1 0x20 ADD SWAP1 DUP2 MSTORE PUSH1 0x20 ADD PUSH1 0x0 KECCAK256 PUSH3 0xA1A PUSH1 0x20 SHL PUSH3 0x1488 OR SWAP1 SWAP2 SWAP1 PUSH1 0x20 SHR JUMP JUMPDEST POP PUSH3 0x756 DUP2 DUP4 PUSH1 0x2 PUSH3 0xA3C PUSH1 0x20 SHL PUSH3 0x14A2 OR SWAP1 SWAP3 SWAP2 SWAP1 PUSH1 0x20 SHR JUMP JUMPDEST POP DUP1 DUP3 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND PUSH1 0x0 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND PUSH32 0xDDF252AD1BE2C89B69C2B068FC378DAA952BA7F163C4A11628F55A4DF523B3EF PUSH1 0x40 MLOAD PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 LOG4 POP POP JUMP JUMPDEST PUSH1 0x0 PUSH3 0x7E5 DUP5 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND PUSH3 0xA79 PUSH1 0x20 SHL PUSH3 0x14D7 OR PUSH1 0x20 SHR JUMP JUMPDEST PUSH3 0x7F4 JUMPI PUSH1 0x1 SWAP1 POP PUSH3 0x9EB JUMP JUMPDEST PUSH1 0x60 PUSH3 0x971 PUSH4 0x150B7A02 PUSH1 0xE0 SHL PUSH3 0x812 PUSH3 0xA8C PUSH1 0x20 SHL PUSH1 0x20 SHR JUMP JUMPDEST DUP9 DUP8 DUP8 PUSH1 0x40 MLOAD PUSH1 0x24 ADD DUP1 DUP6 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND DUP2 MSTORE PUSH1 0x20 ADD DUP5 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND DUP2 MSTORE PUSH1 0x20 ADD DUP4 DUP2 MSTORE PUSH1 0x20 ADD DUP1 PUSH1 0x20 ADD DUP3 DUP2 SUB DUP3 MSTORE DUP4 DUP2 DUP2 MLOAD DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP DUP1 MLOAD SWAP1 PUSH1 0x20 ADD SWAP1 DUP1 DUP4 DUP4 PUSH1 0x0 JUMPDEST DUP4 DUP2 LT ISZERO PUSH3 0x898 JUMPI DUP1 DUP3 ADD MLOAD DUP2 DUP5 ADD MSTORE PUSH1 0x20 DUP2 ADD SWAP1 POP PUSH3 0x87B JUMP JUMPDEST POP POP POP POP SWAP1 POP SWAP1 DUP2 ADD SWAP1 PUSH1 0x1F AND DUP1 ISZERO PUSH3 0x8C6 JUMPI DUP1 DUP3 SUB DUP1 MLOAD PUSH1 0x1 DUP4 PUSH1 0x20 SUB PUSH2 0x100 EXP SUB NOT AND DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP JUMPDEST POP SWAP6 POP POP POP POP POP POP PUSH1 0x40 MLOAD PUSH1 0x20 DUP2 DUP4 SUB SUB DUP2 MSTORE SWAP1 PUSH1 0x40 MSTORE SWAP1 PUSH28 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF NOT AND PUSH1 0x20 DUP3 ADD DUP1 MLOAD PUSH28 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF DUP4 DUP2 DUP4 AND OR DUP4 MSTORE POP POP POP POP PUSH1 0x40 MLOAD DUP1 PUSH1 0x60 ADD PUSH1 0x40 MSTORE DUP1 PUSH1 0x32 DUP2 MSTORE PUSH1 0x20 ADD PUSH3 0x36D8 PUSH1 0x32 SWAP2 CODECOPY DUP8 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND PUSH3 0xA94 PUSH1 0x20 SHL PUSH3 0x14EA OR SWAP1 SWAP3 SWAP2 SWAP1 PUSH1 0x20 SHR JUMP JUMPDEST SWAP1 POP PUSH1 0x0 DUP2 DUP1 PUSH1 0x20 ADD SWAP1 MLOAD PUSH1 0x20 DUP2 LT ISZERO PUSH3 0x98B JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST DUP2 ADD SWAP1 DUP1 DUP1 MLOAD SWAP1 PUSH1 0x20 ADD SWAP1 SWAP3 SWAP2 SWAP1 POP POP POP SWAP1 POP PUSH4 0x150B7A02 PUSH1 0xE0 SHL PUSH28 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF NOT AND DUP2 PUSH28 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF NOT AND EQ SWAP3 POP POP POP JUMPDEST SWAP5 SWAP4 POP POP POP POP JUMP JUMPDEST PUSH1 0x0 PUSH3 0xA0D DUP4 PUSH1 0x0 ADD DUP4 PUSH1 0x0 SHL PUSH3 0xAB4 PUSH1 0x20 SHL PUSH1 0x20 SHR JUMP JUMPDEST SWAP1 POP SWAP3 SWAP2 POP POP JUMP JUMPDEST POP POP POP JUMP JUMPDEST PUSH1 0x0 PUSH3 0xA34 DUP4 PUSH1 0x0 ADD DUP4 PUSH1 0x0 SHL PUSH3 0xAD7 PUSH1 0x20 SHL PUSH1 0x20 SHR JUMP JUMPDEST SWAP1 POP SWAP3 SWAP2 POP POP JUMP JUMPDEST PUSH1 0x0 PUSH3 0xA70 DUP5 PUSH1 0x0 ADD DUP5 PUSH1 0x0 SHL DUP5 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND PUSH1 0x0 SHL PUSH3 0xB51 PUSH1 0x20 SHL PUSH1 0x20 SHR JUMP JUMPDEST SWAP1 POP SWAP4 SWAP3 POP POP POP JUMP JUMPDEST PUSH1 0x0 DUP1 DUP3 EXTCODESIZE SWAP1 POP PUSH1 0x0 DUP2 GT SWAP2 POP POP SWAP2 SWAP1 POP JUMP JUMPDEST PUSH1 0x0 CALLER SWAP1 POP SWAP1 JUMP JUMPDEST PUSH1 0x60 PUSH3 0xAAB DUP5 DUP5 PUSH1 0x0 DUP6 PUSH3 0xC30 PUSH1 0x20 SHL PUSH1 0x20 SHR JUMP JUMPDEST SWAP1 POP SWAP4 SWAP3 POP POP POP JUMP JUMPDEST PUSH1 0x0 DUP1 DUP4 PUSH1 0x1 ADD PUSH1 0x0 DUP5 DUP2 MSTORE PUSH1 0x20 ADD SWAP1 DUP2 MSTORE PUSH1 0x20 ADD PUSH1 0x0 KECCAK256 SLOAD EQ ISZERO SWAP1 POP SWAP3 SWAP2 POP POP JUMP JUMPDEST PUSH1 0x0 PUSH3 0xAEB DUP4 DUP4 PUSH3 0xDF0 PUSH1 0x20 SHL PUSH1 0x20 SHR JUMP JUMPDEST PUSH3 0xB46 JUMPI DUP3 PUSH1 0x0 ADD DUP3 SWAP1 DUP1 PUSH1 0x1 DUP2 SLOAD ADD DUP1 DUP3 SSTORE DUP1 SWAP2 POP POP PUSH1 0x1 SWAP1 SUB SWAP1 PUSH1 0x0 MSTORE PUSH1 0x20 PUSH1 0x0 KECCAK256 ADD PUSH1 0x0 SWAP1 SWAP2 SWAP1 SWAP2 SWAP1 SWAP2 POP SSTORE DUP3 PUSH1 0x0 ADD DUP1 SLOAD SWAP1 POP DUP4 PUSH1 0x1 ADD PUSH1 0x0 DUP5 DUP2 MSTORE PUSH1 0x20 ADD SWAP1 DUP2 MSTORE PUSH1 0x20 ADD PUSH1 0x0 KECCAK256 DUP2 SWAP1 SSTORE POP PUSH1 0x1 SWAP1 POP PUSH3 0xB4B JUMP JUMPDEST PUSH1 0x0 SWAP1 POP JUMPDEST SWAP3 SWAP2 POP POP JUMP JUMPDEST PUSH1 0x0 DUP1 DUP5 PUSH1 0x1 ADD PUSH1 0x0 DUP6 DUP2 MSTORE PUSH1 0x20 ADD SWAP1 DUP2 MSTORE PUSH1 0x20 ADD PUSH1 0x0 KECCAK256 SLOAD SWAP1 POP PUSH1 0x0 DUP2 EQ ISZERO PUSH3 0xBFA JUMPI DUP5 PUSH1 0x0 ADD PUSH1 0x40 MLOAD DUP1 PUSH1 0x40 ADD PUSH1 0x40 MSTORE DUP1 DUP7 DUP2 MSTORE PUSH1 0x20 ADD DUP6 DUP2 MSTORE POP SWAP1 DUP1 PUSH1 0x1 DUP2 SLOAD ADD DUP1 DUP3 SSTORE DUP1 SWAP2 POP POP PUSH1 0x1 SWAP1 SUB SWAP1 PUSH1 0x0 MSTORE PUSH1 0x20 PUSH1 0x0 KECCAK256 SWAP1 PUSH1 0x2 MUL ADD PUSH1 0x0 SWAP1 SWAP2 SWAP1 SWAP2 SWAP1 SWAP2 POP PUSH1 0x0 DUP3 ADD MLOAD DUP2 PUSH1 0x0 ADD SSTORE PUSH1 0x20 DUP3 ADD MLOAD DUP2 PUSH1 0x1 ADD SSTORE POP POP DUP5 PUSH1 0x0 ADD DUP1 SLOAD SWAP1 POP DUP6 PUSH1 0x1 ADD PUSH1 0x0 DUP7 DUP2 MSTORE PUSH1 0x20 ADD SWAP1 DUP2 MSTORE PUSH1 0x20 ADD PUSH1 0x0 KECCAK256 DUP2 SWAP1 SSTORE POP PUSH1 0x1 SWAP2 POP POP PUSH3 0xC29 JUMP JUMPDEST DUP3 DUP6 PUSH1 0x0 ADD PUSH1 0x1 DUP4 SUB DUP2 SLOAD DUP2 LT PUSH3 0xC0E JUMPI INVALID JUMPDEST SWAP1 PUSH1 0x0 MSTORE PUSH1 0x20 PUSH1 0x0 KECCAK256 SWAP1 PUSH1 0x2 MUL ADD PUSH1 0x1 ADD DUP2 SWAP1 SSTORE POP PUSH1 0x0 SWAP2 POP POP JUMPDEST SWAP4 SWAP3 POP POP POP JUMP JUMPDEST PUSH1 0x60 DUP3 SELFBALANCE LT ISZERO PUSH3 0xC8D JUMPI PUSH1 0x40 MLOAD PUSH32 0x8C379A000000000000000000000000000000000000000000000000000000000 DUP2 MSTORE PUSH1 0x4 ADD DUP1 DUP1 PUSH1 0x20 ADD DUP3 DUP2 SUB DUP3 MSTORE PUSH1 0x26 DUP2 MSTORE PUSH1 0x20 ADD DUP1 PUSH3 0x370A PUSH1 0x26 SWAP2 CODECOPY PUSH1 0x40 ADD SWAP2 POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 REVERT JUMPDEST PUSH3 0xC9E DUP6 PUSH3 0xA79 PUSH1 0x20 SHL PUSH1 0x20 SHR JUMP JUMPDEST PUSH3 0xD11 JUMPI PUSH1 0x40 MLOAD PUSH32 0x8C379A000000000000000000000000000000000000000000000000000000000 DUP2 MSTORE PUSH1 0x4 ADD DUP1 DUP1 PUSH1 0x20 ADD DUP3 DUP2 SUB DUP3 MSTORE PUSH1 0x1D DUP2 MSTORE PUSH1 0x20 ADD DUP1 PUSH32 0x416464726573733A2063616C6C20746F206E6F6E2D636F6E7472616374000000 DUP2 MSTORE POP PUSH1 0x20 ADD SWAP2 POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 REVERT JUMPDEST PUSH1 0x0 PUSH1 0x60 DUP7 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND DUP6 DUP8 PUSH1 0x40 MLOAD DUP1 DUP3 DUP1 MLOAD SWAP1 PUSH1 0x20 ADD SWAP1 DUP1 DUP4 DUP4 JUMPDEST PUSH1 0x20 DUP4 LT PUSH3 0xD63 JUMPI DUP1 MLOAD DUP3 MSTORE PUSH1 0x20 DUP3 ADD SWAP2 POP PUSH1 0x20 DUP2 ADD SWAP1 POP PUSH1 0x20 DUP4 SUB SWAP3 POP PUSH3 0xD3E JUMP JUMPDEST PUSH1 0x1 DUP4 PUSH1 0x20 SUB PUSH2 0x100 EXP SUB DUP1 NOT DUP3 MLOAD AND DUP2 DUP5 MLOAD AND DUP1 DUP3 OR DUP6 MSTORE POP POP POP POP POP POP SWAP1 POP ADD SWAP2 POP POP PUSH1 0x0 PUSH1 0x40 MLOAD DUP1 DUP4 SUB DUP2 DUP6 DUP8 GAS CALL SWAP3 POP POP POP RETURNDATASIZE DUP1 PUSH1 0x0 DUP2 EQ PUSH3 0xDC7 JUMPI PUSH1 0x40 MLOAD SWAP2 POP PUSH1 0x1F NOT PUSH1 0x3F RETURNDATASIZE ADD AND DUP3 ADD PUSH1 0x40 MSTORE RETURNDATASIZE DUP3 MSTORE RETURNDATASIZE PUSH1 0x0 PUSH1 0x20 DUP5 ADD RETURNDATACOPY PUSH3 0xDCC JUMP JUMPDEST PUSH1 0x60 SWAP2 POP JUMPDEST POP SWAP2 POP SWAP2 POP PUSH3 0xDE4 DUP3 DUP3 DUP7 PUSH3 0xE13 PUSH1 0x20 SHL PUSH1 0x20 SHR JUMP JUMPDEST SWAP3 POP POP POP SWAP5 SWAP4 POP POP POP POP JUMP JUMPDEST PUSH1 0x0 DUP1 DUP4 PUSH1 0x1 ADD PUSH1 0x0 DUP5 DUP2 MSTORE PUSH1 0x20 ADD SWAP1 DUP2 MSTORE PUSH1 0x20 ADD PUSH1 0x0 KECCAK256 SLOAD EQ ISZERO SWAP1 POP SWAP3 SWAP2 POP POP JUMP JUMPDEST PUSH1 0x60 DUP4 ISZERO PUSH3 0xE25 JUMPI DUP3 SWAP1 POP PUSH3 0xEDE JUMP JUMPDEST PUSH1 0x0 DUP4 MLOAD GT ISZERO PUSH3 0xE39 JUMPI DUP3 MLOAD DUP1 DUP5 PUSH1 0x20 ADD REVERT JUMPDEST DUP2 PUSH1 0x40 MLOAD PUSH32 0x8C379A000000000000000000000000000000000000000000000000000000000 DUP2 MSTORE PUSH1 0x4 ADD DUP1 DUP1 PUSH1 0x20 ADD DUP3 DUP2 SUB DUP3 MSTORE DUP4 DUP2 DUP2 MLOAD DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP DUP1 MLOAD SWAP1 PUSH1 0x20 ADD SWAP1 DUP1 DUP4 DUP4 PUSH1 0x0 JUMPDEST DUP4 DUP2 LT ISZERO PUSH3 0xEA2 JUMPI DUP1 DUP3 ADD MLOAD DUP2 DUP5 ADD MSTORE PUSH1 0x20 DUP2 ADD SWAP1 POP PUSH3 0xE85 JUMP JUMPDEST POP POP POP POP SWAP1 POP SWAP1 DUP2 ADD SWAP1 PUSH1 0x1F AND DUP1 ISZERO PUSH3 0xED0 JUMPI DUP1 DUP3 SUB DUP1 MLOAD PUSH1 0x1 DUP4 PUSH1 0x20 SUB PUSH2 0x100 EXP SUB NOT AND DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP JUMPDEST POP SWAP3 POP POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 REVERT JUMPDEST SWAP4 SWAP3 POP POP POP JUMP JUMPDEST DUP3 DUP1 SLOAD PUSH1 0x1 DUP2 PUSH1 0x1 AND ISZERO PUSH2 0x100 MUL SUB AND PUSH1 0x2 SWAP1 DIV SWAP1 PUSH1 0x0 MSTORE PUSH1 0x20 PUSH1 0x0 KECCAK256 SWAP1 PUSH1 0x1F ADD PUSH1 0x20 SWAP1 DIV DUP2 ADD SWAP3 DUP3 PUSH1 0x1F LT PUSH3 0xF28 JUMPI DUP1 MLOAD PUSH1 0xFF NOT AND DUP4 DUP1 ADD OR DUP6 SSTORE PUSH3 0xF59 JUMP JUMPDEST DUP3 DUP1 ADD PUSH1 0x1 ADD DUP6 SSTORE DUP3 ISZERO PUSH3 0xF59 JUMPI SWAP2 DUP3 ADD JUMPDEST DUP3 DUP2 GT ISZERO PUSH3 0xF58 JUMPI DUP3 MLOAD DUP3 SSTORE SWAP2 PUSH1 0x20 ADD SWAP2 SWAP1 PUSH1 0x1 ADD SWAP1 PUSH3 0xF3B JUMP JUMPDEST JUMPDEST POP SWAP1 POP PUSH3 0xF68 SWAP2 SWAP1 PUSH3 0xF6C JUMP JUMPDEST POP SWAP1 JUMP JUMPDEST JUMPDEST DUP1 DUP3 GT ISZERO PUSH3 0xF87 JUMPI PUSH1 0x0 DUP2 PUSH1 0x0 SWAP1 SSTORE POP PUSH1 0x1 ADD PUSH3 0xF6D JUMP JUMPDEST POP SWAP1 JUMP JUMPDEST PUSH2 0x273D DUP1 PUSH3 0xF9B PUSH1 0x0 CODECOPY PUSH1 0x0 RETURN INVALID PUSH1 0x80 PUSH1 0x40 MSTORE CALLVALUE DUP1 ISZERO PUSH2 0x10 JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST POP PUSH1 0x4 CALLDATASIZE LT PUSH2 0x10B JUMPI PUSH1 0x0 CALLDATALOAD PUSH1 0xE0 SHR DUP1 PUSH4 0x4F6CCCE7 GT PUSH2 0xA2 JUMPI DUP1 PUSH4 0x95D89B41 GT PUSH2 0x71 JUMPI DUP1 PUSH4 0x95D89B41 EQ PUSH2 0x56D JUMPI DUP1 PUSH4 0xA22CB465 EQ PUSH2 0x5F0 JUMPI DUP1 PUSH4 0xB88D4FDE EQ PUSH2 0x640 JUMPI DUP1 PUSH4 0xC87B56DD EQ PUSH2 0x745 JUMPI DUP1 PUSH4 0xE985E9C5 EQ PUSH2 0x7EC JUMPI PUSH2 0x10B JUMP JUMPDEST DUP1 PUSH4 0x4F6CCCE7 EQ PUSH2 0x3F8 JUMPI DUP1 PUSH4 0x6352211E EQ PUSH2 0x43A JUMPI DUP1 PUSH4 0x6C0360EB EQ PUSH2 0x492 JUMPI DUP1 PUSH4 0x70A08231 EQ PUSH2 0x515 JUMPI PUSH2 0x10B JUMP JUMPDEST DUP1 PUSH4 0x18160DDD GT PUSH2 0xDE JUMPI DUP1 PUSH4 0x18160DDD EQ PUSH2 0x29C JUMPI DUP1 PUSH4 0x23B872DD EQ PUSH2 0x2BA JUMPI DUP1 PUSH4 0x2F745C59 EQ PUSH2 0x328 JUMPI DUP1 PUSH4 0x42842E0E EQ PUSH2 0x38A JUMPI PUSH2 0x10B JUMP JUMPDEST DUP1 PUSH4 0x1FFC9A7 EQ PUSH2 0x110 JUMPI DUP1 PUSH4 0x6FDDE03 EQ PUSH2 0x173 JUMPI DUP1 PUSH4 0x81812FC EQ PUSH2 0x1F6 JUMPI DUP1 PUSH4 0x95EA7B3 EQ PUSH2 0x24E JUMPI JUMPDEST PUSH1 0x0 DUP1 REVERT JUMPDEST PUSH2 0x15B PUSH1 0x4 DUP1 CALLDATASIZE SUB PUSH1 0x20 DUP2 LT ISZERO PUSH2 0x126 JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST DUP2 ADD SWAP1 DUP1 DUP1 CALLDATALOAD PUSH28 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF NOT AND SWAP1 PUSH1 0x20 ADD SWAP1 SWAP3 SWAP2 SWAP1 POP POP POP PUSH2 0x866 JUMP JUMPDEST PUSH1 0x40 MLOAD DUP1 DUP3 ISZERO ISZERO DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 RETURN JUMPDEST PUSH2 0x17B PUSH2 0x8CD JUMP JUMPDEST PUSH1 0x40 MLOAD DUP1 DUP1 PUSH1 0x20 ADD DUP3 DUP2 SUB DUP3 MSTORE DUP4 DUP2 DUP2 MLOAD DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP DUP1 MLOAD SWAP1 PUSH1 0x20 ADD SWAP1 DUP1 DUP4 DUP4 PUSH1 0x0 JUMPDEST DUP4 DUP2 LT ISZERO PUSH2 0x1BB JUMPI DUP1 DUP3 ADD MLOAD DUP2 DUP5 ADD MSTORE PUSH1 0x20 DUP2 ADD SWAP1 POP PUSH2 0x1A0 JUMP JUMPDEST POP POP POP POP SWAP1 POP SWAP1 DUP2 ADD SWAP1 PUSH1 0x1F AND DUP1 ISZERO PUSH2 0x1E8 JUMPI DUP1 DUP3 SUB DUP1 MLOAD PUSH1 0x1 DUP4 PUSH1 0x20 SUB PUSH2 0x100 EXP SUB NOT AND DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP JUMPDEST POP SWAP3 POP POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 RETURN JUMPDEST PUSH2 0x222 PUSH1 0x4 DUP1 CALLDATASIZE SUB PUSH1 0x20 DUP2 LT ISZERO PUSH2 0x20C JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST DUP2 ADD SWAP1 DUP1 DUP1 CALLDATALOAD SWAP1 PUSH1 0x20 ADD SWAP1 SWAP3 SWAP2 SWAP1 POP POP POP PUSH2 0x96F JUMP JUMPDEST PUSH1 0x40 MLOAD DUP1 DUP3 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 RETURN JUMPDEST PUSH2 0x29A PUSH1 0x4 DUP1 CALLDATASIZE SUB PUSH1 0x40 DUP2 LT ISZERO PUSH2 0x264 JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST DUP2 ADD SWAP1 DUP1 DUP1 CALLDATALOAD PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND SWAP1 PUSH1 0x20 ADD SWAP1 SWAP3 SWAP2 SWAP1 DUP1 CALLDATALOAD SWAP1 PUSH1 0x20 ADD SWAP1 SWAP3 SWAP2 SWAP1 POP POP POP PUSH2 0xA0A JUMP JUMPDEST STOP JUMPDEST PUSH2 0x2A4 PUSH2 0xB4E JUMP JUMPDEST PUSH1 0x40 MLOAD DUP1 DUP3 DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 RETURN JUMPDEST PUSH2 0x326 PUSH1 0x4 DUP1 CALLDATASIZE SUB PUSH1 0x60 DUP2 LT ISZERO PUSH2 0x2D0 JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST DUP2 ADD SWAP1 DUP1 DUP1 CALLDATALOAD PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND SWAP1 PUSH1 0x20 ADD SWAP1 SWAP3 SWAP2 SWAP1 DUP1 CALLDATALOAD PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND SWAP1 PUSH1 0x20 ADD SWAP1 SWAP3 SWAP2 SWAP1 DUP1 CALLDATALOAD SWAP1 PUSH1 0x20 ADD SWAP1 SWAP3 SWAP2 SWAP1 POP POP POP PUSH2 0xB5F JUMP JUMPDEST STOP JUMPDEST PUSH2 0x374 PUSH1 0x4 DUP1 CALLDATASIZE SUB PUSH1 0x40 DUP2 LT ISZERO PUSH2 0x33E JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST DUP2 ADD SWAP1 DUP1 DUP1 CALLDATALOAD PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND SWAP1 PUSH1 0x20 ADD SWAP1 SWAP3 SWAP2 SWAP1 DUP1 CALLDATALOAD SWAP1 PUSH1 0x20 ADD SWAP1 SWAP3 SWAP2 SWAP1 POP POP POP PUSH2 0xBD5 JUMP JUMPDEST PUSH1 0x40 MLOAD DUP1 DUP3 DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 RETURN JUMPDEST PUSH2 0x3F6 PUSH1 0x4 DUP1 CALLDATASIZE SUB PUSH1 0x60 DUP2 LT ISZERO PUSH2 0x3A0 JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST DUP2 ADD SWAP1 DUP1 DUP1 CALLDATALOAD PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND SWAP1 PUSH1 0x20 ADD SWAP1 SWAP3 SWAP2 SWAP1 DUP1 CALLDATALOAD PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND SWAP1 PUSH1 0x20 ADD SWAP1 SWAP3 SWAP2 SWAP1 DUP1 CALLDATALOAD SWAP1 PUSH1 0x20 ADD SWAP1 SWAP3 SWAP2 SWAP1 POP POP POP PUSH2 0xC30 JUMP JUMPDEST STOP JUMPDEST PUSH2 0x424 PUSH1 0x4 DUP1 CALLDATASIZE SUB PUSH1 0x20 DUP2 LT ISZERO PUSH2 0x40E JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST DUP2 ADD SWAP1 DUP1 DUP1 CALLDATALOAD SWAP1 PUSH1 0x20 ADD SWAP1 SWAP3 SWAP2 SWAP1 POP POP POP PUSH2 0xC50 JUMP JUMPDEST PUSH1 0x40 MLOAD DUP1 DUP3 DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 RETURN JUMPDEST PUSH2 0x466 PUSH1 0x4 DUP1 CALLDATASIZE SUB PUSH1 0x20 DUP2 LT ISZERO PUSH2 0x450 JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST DUP2 ADD SWAP1 DUP1 DUP1 CALLDATALOAD SWAP1 PUSH1 0x20 ADD SWAP1 SWAP3 SWAP2 SWAP1 POP POP POP PUSH2 0xC73 JUMP JUMPDEST PUSH1 0x40 MLOAD DUP1 DUP3 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 RETURN JUMPDEST PUSH2 0x49A PUSH2 0xCAA JUMP JUMPDEST PUSH1 0x40 MLOAD DUP1 DUP1 PUSH1 0x20 ADD DUP3 DUP2 SUB DUP3 MSTORE DUP4 DUP2 DUP2 MLOAD DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP DUP1 MLOAD SWAP1 PUSH1 0x20 ADD SWAP1 DUP1 DUP4 DUP4 PUSH1 0x0 JUMPDEST DUP4 DUP2 LT ISZERO PUSH2 0x4DA JUMPI DUP1 DUP3 ADD MLOAD DUP2 DUP5 ADD MSTORE PUSH1 0x20 DUP2 ADD SWAP1 POP PUSH2 0x4BF JUMP JUMPDEST POP POP POP POP SWAP1 POP SWAP1 DUP2 ADD SWAP1 PUSH1 0x1F AND DUP1 ISZERO PUSH2 0x507 JUMPI DUP1 DUP3 SUB DUP1 MLOAD PUSH1 0x1 DUP4 PUSH1 0x20 SUB PUSH2 0x100 EXP SUB NOT AND DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP JUMPDEST POP SWAP3 POP POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 RETURN JUMPDEST PUSH2 0x557 PUSH1 0x4 DUP1 CALLDATASIZE SUB PUSH1 0x20 DUP2 LT ISZERO PUSH2 0x52B JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST DUP2 ADD SWAP1 DUP1 DUP1 CALLDATALOAD PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND SWAP1 PUSH1 0x20 ADD SWAP1 SWAP3 SWAP2 SWAP1 POP POP POP PUSH2 0xD4C JUMP JUMPDEST PUSH1 0x40 MLOAD DUP1 DUP3 DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 RETURN JUMPDEST PUSH2 0x575 PUSH2 0xE21 JUMP JUMPDEST PUSH1 0x40 MLOAD DUP1 DUP1 PUSH1 0x20 ADD DUP3 DUP2 SUB DUP3 MSTORE DUP4 DUP2 DUP2 MLOAD DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP DUP1 MLOAD SWAP1 PUSH1 0x20 ADD SWAP1 DUP1 DUP4 DUP4 PUSH1 0x0 JUMPDEST DUP4 DUP2 LT ISZERO PUSH2 0x5B5 JUMPI DUP1 DUP3 ADD MLOAD DUP2 DUP5 ADD MSTORE PUSH1 0x20 DUP2 ADD SWAP1 POP PUSH2 0x59A JUMP JUMPDEST POP POP POP POP SWAP1 POP SWAP1 DUP2 ADD SWAP1 PUSH1 0x1F AND DUP1 ISZERO PUSH2 0x5E2 JUMPI DUP1 DUP3 SUB DUP1 MLOAD PUSH1 0x1 DUP4 PUSH1 0x20 SUB PUSH2 0x100 EXP SUB NOT AND DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP JUMPDEST POP SWAP3 POP POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 RETURN JUMPDEST PUSH2 0x63E PUSH1 0x4 DUP1 CALLDATASIZE SUB PUSH1 0x40 DUP2 LT ISZERO PUSH2 0x606 JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST DUP2 ADD SWAP1 DUP1 DUP1 CALLDATALOAD PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND SWAP1 PUSH1 0x20 ADD SWAP1 SWAP3 SWAP2 SWAP1 DUP1 CALLDATALOAD ISZERO ISZERO SWAP1 PUSH1 0x20 ADD SWAP1 SWAP3 SWAP2 SWAP1 POP POP POP PUSH2 0xEC3 JUMP JUMPDEST STOP JUMPDEST PUSH2 0x743 PUSH1 0x4 DUP1 CALLDATASIZE SUB PUSH1 0x80 DUP2 LT ISZERO PUSH2 0x656 JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST DUP2 ADD SWAP1 DUP1 DUP1 CALLDATALOAD PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND SWAP1 PUSH1 0x20 ADD SWAP1 SWAP3 SWAP2 SWAP1 DUP1 CALLDATALOAD PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND SWAP1 PUSH1 0x20 ADD SWAP1 SWAP3 SWAP2 SWAP1 DUP1 CALLDATALOAD SWAP1 PUSH1 0x20 ADD SWAP1 SWAP3 SWAP2 SWAP1 DUP1 CALLDATALOAD SWAP1 PUSH1 0x20 ADD SWAP1 PUSH5 0x100000000 DUP2 GT ISZERO PUSH2 0x6BD JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST DUP3 ADD DUP4 PUSH1 0x20 DUP3 ADD GT ISZERO PUSH2 0x6CF JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST DUP1 CALLDATALOAD SWAP1 PUSH1 0x20 ADD SWAP2 DUP5 PUSH1 0x1 DUP4 MUL DUP5 ADD GT PUSH5 0x100000000 DUP4 GT OR ISZERO PUSH2 0x6F1 JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST SWAP2 SWAP1 DUP1 DUP1 PUSH1 0x1F ADD PUSH1 0x20 DUP1 SWAP2 DIV MUL PUSH1 0x20 ADD PUSH1 0x40 MLOAD SWAP1 DUP2 ADD PUSH1 0x40 MSTORE DUP1 SWAP4 SWAP3 SWAP2 SWAP1 DUP2 DUP2 MSTORE PUSH1 0x20 ADD DUP4 DUP4 DUP1 DUP3 DUP5 CALLDATACOPY PUSH1 0x0 DUP2 DUP5 ADD MSTORE PUSH1 0x1F NOT PUSH1 0x1F DUP3 ADD AND SWAP1 POP DUP1 DUP4 ADD SWAP3 POP POP POP POP POP POP POP SWAP2 SWAP3 SWAP2 SWAP3 SWAP1 POP POP POP PUSH2 0x1079 JUMP JUMPDEST STOP JUMPDEST PUSH2 0x771 PUSH1 0x4 DUP1 CALLDATASIZE SUB PUSH1 0x20 DUP2 LT ISZERO PUSH2 0x75B JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST DUP2 ADD SWAP1 DUP1 DUP1 CALLDATALOAD SWAP1 PUSH1 0x20 ADD SWAP1 SWAP3 SWAP2 SWAP1 POP POP POP PUSH2 0x10F1 JUMP JUMPDEST PUSH1 0x40 MLOAD DUP1 DUP1 PUSH1 0x20 ADD DUP3 DUP2 SUB DUP3 MSTORE DUP4 DUP2 DUP2 MLOAD DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP DUP1 MLOAD SWAP1 PUSH1 0x20 ADD SWAP1 DUP1 DUP4 DUP4 PUSH1 0x0 JUMPDEST DUP4 DUP2 LT ISZERO PUSH2 0x7B1 JUMPI DUP1 DUP3 ADD MLOAD DUP2 DUP5 ADD MSTORE PUSH1 0x20 DUP2 ADD SWAP1 POP PUSH2 0x796 JUMP JUMPDEST POP POP POP POP SWAP1 POP SWAP1 DUP2 ADD SWAP1 PUSH1 0x1F AND DUP1 ISZERO PUSH2 0x7DE JUMPI DUP1 DUP3 SUB DUP1 MLOAD PUSH1 0x1 DUP4 PUSH1 0x20 SUB PUSH2 0x100 EXP SUB NOT AND DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP JUMPDEST POP SWAP3 POP POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 RETURN JUMPDEST PUSH2 0x84E PUSH1 0x4 DUP1 CALLDATASIZE SUB PUSH1 0x40 DUP2 LT ISZERO PUSH2 0x802 JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST DUP2 ADD SWAP1 DUP1 DUP1 CALLDATALOAD PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND SWAP1 PUSH1 0x20 ADD SWAP1 SWAP3 SWAP2 SWAP1 DUP1 CALLDATALOAD PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND SWAP1 PUSH1 0x20 ADD SWAP1 SWAP3 SWAP2 SWAP1 POP POP POP PUSH2 0x13DA JUMP JUMPDEST PUSH1 0x40 MLOAD DUP1 DUP3 ISZERO ISZERO DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 RETURN JUMPDEST PUSH1 0x0 DUP1 PUSH1 0x0 DUP4 PUSH28 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF NOT AND PUSH28 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF NOT AND DUP2 MSTORE PUSH1 0x20 ADD SWAP1 DUP2 MSTORE PUSH1 0x20 ADD PUSH1 0x0 KECCAK256 PUSH1 0x0 SWAP1 SLOAD SWAP1 PUSH2 0x100 EXP SWAP1 DIV PUSH1 0xFF AND SWAP1 POP SWAP2 SWAP1 POP JUMP JUMPDEST PUSH1 0x60 PUSH1 0x6 DUP1 SLOAD PUSH1 0x1 DUP2 PUSH1 0x1 AND ISZERO PUSH2 0x100 MUL SUB AND PUSH1 0x2 SWAP1 DIV DUP1 PUSH1 0x1F ADD PUSH1 0x20 DUP1 SWAP2 DIV MUL PUSH1 0x20 ADD PUSH1 0x40 MLOAD SWAP1 DUP2 ADD PUSH1 0x40 MSTORE DUP1 SWAP3 SWAP2 SWAP1 DUP2 DUP2 MSTORE PUSH1 0x20 ADD DUP3 DUP1 SLOAD PUSH1 0x1 DUP2 PUSH1 0x1 AND ISZERO PUSH2 0x100 MUL SUB AND PUSH1 0x2 SWAP1 DIV DUP1 ISZERO PUSH2 0x965 JUMPI DUP1 PUSH1 0x1F LT PUSH2 0x93A JUMPI PUSH2 0x100 DUP1 DUP4 SLOAD DIV MUL DUP4 MSTORE SWAP2 PUSH1 0x20 ADD SWAP2 PUSH2 0x965 JUMP JUMPDEST DUP3 ADD SWAP2 SWAP1 PUSH1 0x0 MSTORE PUSH1 0x20 PUSH1 0x0 KECCAK256 SWAP1 JUMPDEST DUP2 SLOAD DUP2 MSTORE SWAP1 PUSH1 0x1 ADD SWAP1 PUSH1 0x20 ADD DUP1 DUP4 GT PUSH2 0x948 JUMPI DUP3 SWAP1 SUB PUSH1 0x1F AND DUP3 ADD SWAP2 JUMPDEST POP POP POP POP POP SWAP1 POP SWAP1 JUMP JUMPDEST PUSH1 0x0 PUSH2 0x97A DUP3 PUSH2 0x1502 JUMP JUMPDEST PUSH2 0x9CF JUMPI PUSH1 0x40 MLOAD PUSH32 0x8C379A000000000000000000000000000000000000000000000000000000000 DUP2 MSTORE PUSH1 0x4 ADD DUP1 DUP1 PUSH1 0x20 ADD DUP3 DUP2 SUB DUP3 MSTORE PUSH1 0x2C DUP2 MSTORE PUSH1 0x20 ADD DUP1 PUSH2 0x2632 PUSH1 0x2C SWAP2 CODECOPY PUSH1 0x40 ADD SWAP2 POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 REVERT JUMPDEST PUSH1 0x4 PUSH1 0x0 DUP4 DUP2 MSTORE PUSH1 0x20 ADD SWAP1 DUP2 MSTORE PUSH1 0x20 ADD PUSH1 0x0 KECCAK256 PUSH1 0x0 SWAP1 SLOAD SWAP1 PUSH2 0x100 EXP SWAP1 DIV PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND SWAP1 POP SWAP2 SWAP1 POP JUMP JUMPDEST PUSH1 0x0 PUSH2 0xA15 DUP3 PUSH2 0xC73 JUMP JUMPDEST SWAP1 POP DUP1 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND DUP4 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND EQ ISZERO PUSH2 0xA9C JUMPI PUSH1 0x40 MLOAD PUSH32 0x8C379A000000000000000000000000000000000000000000000000000000000 DUP2 MSTORE PUSH1 0x4 ADD DUP1 DUP1 PUSH1 0x20 ADD DUP3 DUP2 SUB DUP3 MSTORE PUSH1 0x21 DUP2 MSTORE PUSH1 0x20 ADD DUP1 PUSH2 0x26B6 PUSH1 0x21 SWAP2 CODECOPY PUSH1 0x40 ADD SWAP2 POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 REVERT JUMPDEST DUP1 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND PUSH2 0xABB PUSH2 0x151F JUMP JUMPDEST PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND EQ DUP1 PUSH2 0xAEA JUMPI POP PUSH2 0xAE9 DUP2 PUSH2 0xAE4 PUSH2 0x151F JUMP JUMPDEST PUSH2 0x13DA JUMP JUMPDEST JUMPDEST PUSH2 0xB3F JUMPI PUSH1 0x40 MLOAD PUSH32 0x8C379A000000000000000000000000000000000000000000000000000000000 DUP2 MSTORE PUSH1 0x4 ADD DUP1 DUP1 PUSH1 0x20 ADD DUP3 DUP2 SUB DUP3 MSTORE PUSH1 0x38 DUP2 MSTORE PUSH1 0x20 ADD DUP1 PUSH2 0x2585 PUSH1 0x38 SWAP2 CODECOPY PUSH1 0x40 ADD SWAP2 POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 REVERT JUMPDEST PUSH2 0xB49 DUP4 DUP4 PUSH2 0x1527 JUMP JUMPDEST POP POP POP JUMP JUMPDEST PUSH1 0x0 PUSH2 0xB5A PUSH1 0x2 PUSH2 0x15E0 JUMP JUMPDEST SWAP1 POP SWAP1 JUMP JUMPDEST PUSH2 0xB70 PUSH2 0xB6A PUSH2 0x151F JUMP JUMPDEST DUP3 PUSH2 0x15F5 JUMP JUMPDEST PUSH2 0xBC5 JUMPI PUSH1 0x40 MLOAD PUSH32 0x8C379A000000000000000000000000000000000000000000000000000000000 DUP2 MSTORE PUSH1 0x4 ADD DUP1 DUP1 PUSH1 0x20 ADD DUP3 DUP2 SUB DUP3 MSTORE PUSH1 0x31 DUP2 MSTORE PUSH1 0x20 ADD DUP1 PUSH2 0x26D7 PUSH1 0x31 SWAP2 CODECOPY PUSH1 0x40 ADD SWAP2 POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 REVERT JUMPDEST PUSH2 0xBD0 DUP4 DUP4 DUP4 PUSH2 0x16E9 JUMP JUMPDEST POP POP POP JUMP JUMPDEST PUSH1 0x0 PUSH2 0xC28 DUP3 PUSH1 0x1 PUSH1 0x0 DUP7 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND DUP2 MSTORE PUSH1 0x20 ADD SWAP1 DUP2 MSTORE PUSH1 0x20 ADD PUSH1 0x0 KECCAK256 PUSH2 0x192C SWAP1 SWAP2 SWAP1 PUSH4 0xFFFFFFFF AND JUMP JUMPDEST SWAP1 POP SWAP3 SWAP2 POP POP JUMP JUMPDEST PUSH2 0xC4B DUP4 DUP4 DUP4 PUSH1 0x40 MLOAD DUP1 PUSH1 0x20 ADD PUSH1 0x40 MSTORE DUP1 PUSH1 0x0 DUP2 MSTORE POP PUSH2 0x1079 JUMP JUMPDEST POP POP POP JUMP JUMPDEST PUSH1 0x0 DUP1 PUSH2 0xC67 DUP4 PUSH1 0x2 PUSH2 0x1946 SWAP1 SWAP2 SWAP1 PUSH4 0xFFFFFFFF AND JUMP JUMPDEST POP SWAP1 POP DUP1 SWAP2 POP POP SWAP2 SWAP1 POP JUMP JUMPDEST PUSH1 0x0 PUSH2 0xCA3 DUP3 PUSH1 0x40 MLOAD DUP1 PUSH1 0x60 ADD PUSH1 0x40 MSTORE DUP1 PUSH1 0x29 DUP2 MSTORE PUSH1 0x20 ADD PUSH2 0x25E7 PUSH1 0x29 SWAP2 CODECOPY PUSH1 0x2 PUSH2 0x1972 SWAP1 SWAP3 SWAP2 SWAP1 PUSH4 0xFFFFFFFF AND JUMP JUMPDEST SWAP1 POP SWAP2 SWAP1 POP JUMP JUMPDEST PUSH1 0x60 PUSH1 0x9 DUP1 SLOAD PUSH1 0x1 DUP2 PUSH1 0x1 AND ISZERO PUSH2 0x100 MUL SUB AND PUSH1 0x2 SWAP1 DIV DUP1 PUSH1 0x1F ADD PUSH1 0x20 DUP1 SWAP2 DIV MUL PUSH1 0x20 ADD PUSH1 0x40 MLOAD SWAP1 DUP2 ADD PUSH1 0x40 MSTORE DUP1 SWAP3 SWAP2 SWAP1 DUP2 DUP2 MSTORE PUSH1 0x20 ADD DUP3 DUP1 SLOAD PUSH1 0x1 DUP2 PUSH1 0x1 AND ISZERO PUSH2 0x100 MUL SUB AND PUSH1 0x2 SWAP1 DIV DUP1 ISZERO PUSH2 0xD42 JUMPI DUP1 PUSH1 0x1F LT PUSH2 0xD17 JUMPI PUSH2 0x100 DUP1 DUP4 SLOAD DIV MUL DUP4 MSTORE SWAP2 PUSH1 0x20 ADD SWAP2 PUSH2 0xD42 JUMP JUMPDEST DUP3 ADD SWAP2 SWAP1 PUSH1 0x0 MSTORE PUSH1 0x20 PUSH1 0x0 KECCAK256 SWAP1 JUMPDEST DUP2 SLOAD DUP2 MSTORE SWAP1 PUSH1 0x1 ADD SWAP1 PUSH1 0x20 ADD DUP1 DUP4 GT PUSH2 0xD25 JUMPI DUP3 SWAP1 SUB PUSH1 0x1F AND DUP3 ADD SWAP2 JUMPDEST POP POP POP POP POP SWAP1 POP SWAP1 JUMP JUMPDEST PUSH1 0x0 DUP1 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND DUP3 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND EQ ISZERO PUSH2 0xDD3 JUMPI PUSH1 0x40 MLOAD PUSH32 0x8C379A000000000000000000000000000000000000000000000000000000000 DUP2 MSTORE PUSH1 0x4 ADD DUP1 DUP1 PUSH1 0x20 ADD DUP3 DUP2 SUB DUP3 MSTORE PUSH1 0x2A DUP2 MSTORE PUSH1 0x20 ADD DUP1 PUSH2 0x25BD PUSH1 0x2A SWAP2 CODECOPY PUSH1 0x40 ADD SWAP2 POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 REVERT JUMPDEST PUSH2 0xE1A PUSH1 0x1 PUSH1 0x0 DUP5 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND DUP2 MSTORE PUSH1 0x20 ADD SWAP1 DUP2 MSTORE PUSH1 0x20 ADD PUSH1 0x0 KECCAK256 PUSH2 0x1991 JUMP JUMPDEST SWAP1 POP SWAP2 SWAP1 POP JUMP JUMPDEST PUSH1 0x60 PUSH1 0x7 DUP1 SLOAD PUSH1 0x1 DUP2 PUSH1 0x1 AND ISZERO PUSH2 0x100 MUL SUB AND PUSH1 0x2 SWAP1 DIV DUP1 PUSH1 0x1F ADD PUSH1 0x20 DUP1 SWAP2 DIV MUL PUSH1 0x20 ADD PUSH1 0x40 MLOAD SWAP1 DUP2 ADD PUSH1 0x40 MSTORE DUP1 SWAP3 SWAP2 SWAP1 DUP2 DUP2 MSTORE PUSH1 0x20 ADD DUP3 DUP1 SLOAD PUSH1 0x1 DUP2 PUSH1 0x1 AND ISZERO PUSH2 0x100 MUL SUB AND PUSH1 0x2 SWAP1 DIV DUP1 ISZERO PUSH2 0xEB9 JUMPI DUP1 PUSH1 0x1F LT PUSH2 0xE8E JUMPI PUSH2 0x100 DUP1 DUP4 SLOAD DIV MUL DUP4 MSTORE SWAP2 PUSH1 0x20 ADD SWAP2 PUSH2 0xEB9 JUMP JUMPDEST DUP3 ADD SWAP2 SWAP1 PUSH1 0x0 MSTORE PUSH1 0x20 PUSH1 0x0 KECCAK256 SWAP1 JUMPDEST DUP2 SLOAD DUP2 MSTORE SWAP1 PUSH1 0x1 ADD SWAP1 PUSH1 0x20 ADD DUP1 DUP4 GT PUSH2 0xE9C JUMPI DUP3 SWAP1 SUB PUSH1 0x1F AND DUP3 ADD SWAP2 JUMPDEST POP POP POP POP POP SWAP1 POP SWAP1 JUMP JUMPDEST PUSH2 0xECB PUSH2 0x151F JUMP JUMPDEST PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND DUP3 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND EQ ISZERO PUSH2 0xF6C JUMPI PUSH1 0x40 MLOAD PUSH32 0x8C379A000000000000000000000000000000000000000000000000000000000 DUP2 MSTORE PUSH1 0x4 ADD DUP1 DUP1 PUSH1 0x20 ADD DUP3 DUP2 SUB DUP3 MSTORE PUSH1 0x19 DUP2 MSTORE PUSH1 0x20 ADD DUP1 PUSH32 0x4552433732313A20617070726F766520746F2063616C6C657200000000000000 DUP2 MSTORE POP PUSH1 0x20 ADD SWAP2 POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 REVERT JUMPDEST DUP1 PUSH1 0x5 PUSH1 0x0 PUSH2 0xF79 PUSH2 0x151F JUMP JUMPDEST PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND DUP2 MSTORE PUSH1 0x20 ADD SWAP1 DUP2 MSTORE PUSH1 0x20 ADD PUSH1 0x0 KECCAK256 PUSH1 0x0 DUP5 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND DUP2 MSTORE PUSH1 0x20 ADD SWAP1 DUP2 MSTORE PUSH1 0x20 ADD PUSH1 0x0 KECCAK256 PUSH1 0x0 PUSH2 0x100 EXP DUP2 SLOAD DUP2 PUSH1 0xFF MUL NOT AND SWAP1 DUP4 ISZERO ISZERO MUL OR SWAP1 SSTORE POP DUP2 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND PUSH2 0x1026 PUSH2 0x151F JUMP JUMPDEST PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND PUSH32 0x17307EAB39AB6107E8899845AD3D59BD9653F200F220920489CA2B5937696C31 DUP4 PUSH1 0x40 MLOAD DUP1 DUP3 ISZERO ISZERO DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 LOG3 POP POP JUMP JUMPDEST PUSH2 0x108A PUSH2 0x1084 PUSH2 0x151F JUMP JUMPDEST DUP4 PUSH2 0x15F5 JUMP JUMPDEST PUSH2 0x10DF JUMPI PUSH1 0x40 MLOAD PUSH32 0x8C379A000000000000000000000000000000000000000000000000000000000 DUP2 MSTORE PUSH1 0x4 ADD DUP1 DUP1 PUSH1 0x20 ADD DUP3 DUP2 SUB DUP3 MSTORE PUSH1 0x31 DUP2 MSTORE PUSH1 0x20 ADD DUP1 PUSH2 0x26D7 PUSH1 0x31 SWAP2 CODECOPY PUSH1 0x40 ADD SWAP2 POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 REVERT JUMPDEST PUSH2 0x10EB DUP5 DUP5 DUP5 DUP5 PUSH2 0x19A6 JUMP JUMPDEST POP POP POP POP JUMP JUMPDEST PUSH1 0x60 PUSH2 0x10FC DUP3 PUSH2 0x1502 JUMP JUMPDEST PUSH2 0x1151 JUMPI PUSH1 0x40 MLOAD PUSH32 0x8C379A000000000000000000000000000000000000000000000000000000000 DUP2 MSTORE PUSH1 0x4 ADD DUP1 DUP1 PUSH1 0x20 ADD DUP3 DUP2 SUB DUP3 MSTORE PUSH1 0x2F DUP2 MSTORE PUSH1 0x20 ADD DUP1 PUSH2 0x2687 PUSH1 0x2F SWAP2 CODECOPY PUSH1 0x40 ADD SWAP2 POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 REVERT JUMPDEST PUSH1 0x60 PUSH1 0x8 PUSH1 0x0 DUP5 DUP2 MSTORE PUSH1 0x20 ADD SWAP1 DUP2 MSTORE PUSH1 0x20 ADD PUSH1 0x0 KECCAK256 DUP1 SLOAD PUSH1 0x1 DUP2 PUSH1 0x1 AND ISZERO PUSH2 0x100 MUL SUB AND PUSH1 0x2 SWAP1 DIV DUP1 PUSH1 0x1F ADD PUSH1 0x20 DUP1 SWAP2 DIV MUL PUSH1 0x20 ADD PUSH1 0x40 MLOAD SWAP1 DUP2 ADD PUSH1 0x40 MSTORE DUP1 SWAP3 SWAP2 SWAP1 DUP2 DUP2 MSTORE PUSH1 0x20 ADD DUP3 DUP1 SLOAD PUSH1 0x1 DUP2 PUSH1 0x1 AND ISZERO PUSH2 0x100 MUL SUB AND PUSH1 0x2 SWAP1 DIV DUP1 ISZERO PUSH2 0x11FA JUMPI DUP1 PUSH1 0x1F LT PUSH2 0x11CF JUMPI PUSH2 0x100 DUP1 DUP4 SLOAD DIV MUL DUP4 MSTORE SWAP2 PUSH1 0x20 ADD SWAP2 PUSH2 0x11FA JUMP JUMPDEST DUP3 ADD SWAP2 SWAP1 PUSH1 0x0 MSTORE PUSH1 0x20 PUSH1 0x0 KECCAK256 SWAP1 JUMPDEST DUP2 SLOAD DUP2 MSTORE SWAP1 PUSH1 0x1 ADD SWAP1 PUSH1 0x20 ADD DUP1 DUP4 GT PUSH2 0x11DD JUMPI DUP3 SWAP1 SUB PUSH1 0x1F AND DUP3 ADD SWAP2 JUMPDEST POP POP POP POP POP SWAP1 POP PUSH1 0x0 PUSH1 0x9 DUP1 SLOAD PUSH1 0x1 DUP2 PUSH1 0x1 AND ISZERO PUSH2 0x100 MUL SUB AND PUSH1 0x2 SWAP1 DIV SWAP1 POP EQ ISZERO PUSH2 0x1229 JUMPI DUP1 SWAP2 POP POP PUSH2 0x13D5 JUMP JUMPDEST PUSH1 0x0 DUP2 MLOAD GT ISZERO PUSH2 0x1302 JUMPI PUSH1 0x9 DUP2 PUSH1 0x40 MLOAD PUSH1 0x20 ADD DUP1 DUP4 DUP1 SLOAD PUSH1 0x1 DUP2 PUSH1 0x1 AND ISZERO PUSH2 0x100 MUL SUB AND PUSH1 0x2 SWAP1 DIV DUP1 ISZERO PUSH2 0x1294 JUMPI DUP1 PUSH1 0x1F LT PUSH2 0x1272 JUMPI PUSH2 0x100 DUP1 DUP4 SLOAD DIV MUL DUP4 MSTORE SWAP2 DUP3 ADD SWAP2 PUSH2 0x1294 JUMP JUMPDEST DUP3 ADD SWAP2 SWAP1 PUSH1 0x0 MSTORE PUSH1 0x20 PUSH1 0x0 KECCAK256 SWAP1 JUMPDEST DUP2 SLOAD DUP2 MSTORE SWAP1 PUSH1 0x1 ADD SWAP1 PUSH1 0x20 ADD DUP1 DUP4 GT PUSH2 0x1280 JUMPI JUMPDEST POP POP DUP3 DUP1 MLOAD SWAP1 PUSH1 0x20 ADD SWAP1 DUP1 DUP4 DUP4 JUMPDEST PUSH1 0x20 DUP4 LT PUSH2 0x12C5 JUMPI DUP1 MLOAD DUP3 MSTORE PUSH1 0x20 DUP3 ADD SWAP2 POP PUSH1 0x20 DUP2 ADD SWAP1 POP PUSH1 0x20 DUP4 SUB SWAP3 POP PUSH2 0x12A2 JUMP JUMPDEST PUSH1 0x1 DUP4 PUSH1 0x20 SUB PUSH2 0x100 EXP SUB DUP1 NOT DUP3 MLOAD AND DUP2 DUP5 MLOAD AND DUP1 DUP3 OR DUP6 MSTORE POP POP POP POP POP POP SWAP1 POP ADD SWAP3 POP POP POP PUSH1 0x40 MLOAD PUSH1 0x20 DUP2 DUP4 SUB SUB DUP2 MSTORE SWAP1 PUSH1 0x40 MSTORE SWAP2 POP POP PUSH2 0x13D5 JUMP JUMPDEST PUSH1 0x9 PUSH2 0x130D DUP5 PUSH2 0x1A18 JUMP JUMPDEST PUSH1 0x40 MLOAD PUSH1 0x20 ADD DUP1 DUP4 DUP1 SLOAD PUSH1 0x1 DUP2 PUSH1 0x1 AND ISZERO PUSH2 0x100 MUL SUB AND PUSH1 0x2 SWAP1 DIV DUP1 ISZERO PUSH2 0x136B JUMPI DUP1 PUSH1 0x1F LT PUSH2 0x1349 JUMPI PUSH2 0x100 DUP1 DUP4 SLOAD DIV MUL DUP4 MSTORE SWAP2 DUP3 ADD SWAP2 PUSH2 0x136B JUMP JUMPDEST DUP3 ADD SWAP2 SWAP1 PUSH1 0x0 MSTORE PUSH1 0x20 PUSH1 0x0 KECCAK256 SWAP1 JUMPDEST DUP2 SLOAD DUP2 MSTORE SWAP1 PUSH1 0x1 ADD SWAP1 PUSH1 0x20 ADD DUP1 DUP4 GT PUSH2 0x1357 JUMPI JUMPDEST POP POP DUP3 DUP1 MLOAD SWAP1 PUSH1 0x20 ADD SWAP1 DUP1 DUP4 DUP4 JUMPDEST PUSH1 0x20 DUP4 LT PUSH2 0x139C JUMPI DUP1 MLOAD DUP3 MSTORE PUSH1 0x20 DUP3 ADD SWAP2 POP PUSH1 0x20 DUP2 ADD SWAP1 POP PUSH1 0x20 DUP4 SUB SWAP3 POP PUSH2 0x1379 JUMP JUMPDEST PUSH1 0x1 DUP4 PUSH1 0x20 SUB PUSH2 0x100 EXP SUB DUP1 NOT DUP3 MLOAD AND DUP2 DUP5 MLOAD AND DUP1 DUP3 OR DUP6 MSTORE POP POP POP POP POP POP SWAP1 POP ADD SWAP3 POP POP POP PUSH1 0x40 MLOAD PUSH1 0x20 DUP2 DUP4 SUB SUB DUP2 MSTORE SWAP1 PUSH1 0x40 MSTORE SWAP2 POP POP JUMPDEST SWAP2 SWAP1 POP JUMP JUMPDEST PUSH1 0x0 PUSH1 0x5 PUSH1 0x0 DUP5 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND DUP2 MSTORE PUSH1 0x20 ADD SWAP1 DUP2 MSTORE PUSH1 0x20 ADD PUSH1 0x0 KECCAK256 PUSH1 0x0 DUP4 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND DUP2 MSTORE PUSH1 0x20 ADD SWAP1 DUP2 MSTORE PUSH1 0x20 ADD PUSH1 0x0 KECCAK256 PUSH1 0x0 SWAP1 SLOAD SWAP1 PUSH2 0x100 EXP SWAP1 DIV PUSH1 0xFF AND SWAP1 POP SWAP3 SWAP2 POP POP JUMP JUMPDEST PUSH1 0x0 PUSH2 0x1480 DUP4 PUSH1 0x0 ADD DUP4 PUSH1 0x0 SHL PUSH2 0x1B5F JUMP JUMPDEST SWAP1 POP SWAP3 SWAP2 POP POP JUMP JUMPDEST PUSH1 0x0 PUSH2 0x149A DUP4 PUSH1 0x0 ADD DUP4 PUSH1 0x0 SHL PUSH2 0x1B82 JUMP JUMPDEST SWAP1 POP SWAP3 SWAP2 POP POP JUMP JUMPDEST PUSH1 0x0 PUSH2 0x14CE DUP5 PUSH1 0x0 ADD DUP5 PUSH1 0x0 SHL DUP5 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND PUSH1 0x0 SHL PUSH2 0x1BF2 JUMP JUMPDEST SWAP1 POP SWAP4 SWAP3 POP POP POP JUMP JUMPDEST PUSH1 0x0 DUP1 DUP3 EXTCODESIZE SWAP1 POP PUSH1 0x0 DUP2 GT SWAP2 POP POP SWAP2 SWAP1 POP JUMP JUMPDEST PUSH1 0x60 PUSH2 0x14F9 DUP5 DUP5 PUSH1 0x0 DUP6 PUSH2 0x1CCE JUMP JUMPDEST SWAP1 POP SWAP4 SWAP3 POP POP POP JUMP JUMPDEST PUSH1 0x0 PUSH2 0x1518 DUP3 PUSH1 0x2 PUSH2 0x146E SWAP1 SWAP2 SWAP1 PUSH4 0xFFFFFFFF AND JUMP JUMPDEST SWAP1 POP SWAP2 SWAP1 POP JUMP JUMPDEST PUSH1 0x0 CALLER SWAP1 POP SWAP1 JUMP JUMPDEST DUP2 PUSH1 0x4 PUSH1 0x0 DUP4 DUP2 MSTORE PUSH1 0x20 ADD SWAP1 DUP2 MSTORE PUSH1 0x20 ADD PUSH1 0x0 KECCAK256 PUSH1 0x0 PUSH2 0x100 EXP DUP2 SLOAD DUP2 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF MUL NOT AND SWAP1 DUP4 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND MUL OR SWAP1 SSTORE POP DUP1 DUP3 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND PUSH2 0x159A DUP4 PUSH2 0xC73 JUMP JUMPDEST PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND PUSH32 0x8C5BE1E5EBEC7D5BD14F71427D1E84F3DD0314C0F7B2291E5B200AC8C7C3B925 PUSH1 0x40 MLOAD PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 LOG4 POP POP JUMP JUMPDEST PUSH1 0x0 PUSH2 0x15EE DUP3 PUSH1 0x0 ADD PUSH2 0x1E77 JUMP JUMPDEST SWAP1 POP SWAP2 SWAP1 POP JUMP JUMPDEST PUSH1 0x0 PUSH2 0x1600 DUP3 PUSH2 0x1502 JUMP JUMPDEST PUSH2 0x1655 JUMPI PUSH1 0x40 MLOAD PUSH32 0x8C379A000000000000000000000000000000000000000000000000000000000 DUP2 MSTORE PUSH1 0x4 ADD DUP1 DUP1 PUSH1 0x20 ADD DUP3 DUP2 SUB DUP3 MSTORE PUSH1 0x2C DUP2 MSTORE PUSH1 0x20 ADD DUP1 PUSH2 0x2559 PUSH1 0x2C SWAP2 CODECOPY PUSH1 0x40 ADD SWAP2 POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 REVERT JUMPDEST PUSH1 0x0 PUSH2 0x1660 DUP4 PUSH2 0xC73 JUMP JUMPDEST SWAP1 POP DUP1 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND DUP5 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND EQ DUP1 PUSH2 0x16CF JUMPI POP DUP4 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND PUSH2 0x16B7 DUP5 PUSH2 0x96F JUMP JUMPDEST PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND EQ JUMPDEST DUP1 PUSH2 0x16E0 JUMPI POP PUSH2 0x16DF DUP2 DUP6 PUSH2 0x13DA JUMP JUMPDEST JUMPDEST SWAP2 POP POP SWAP3 SWAP2 POP POP JUMP JUMPDEST DUP3 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND PUSH2 0x1709 DUP3 PUSH2 0xC73 JUMP JUMPDEST PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND EQ PUSH2 0x1775 JUMPI PUSH1 0x40 MLOAD PUSH32 0x8C379A000000000000000000000000000000000000000000000000000000000 DUP2 MSTORE PUSH1 0x4 ADD DUP1 DUP1 PUSH1 0x20 ADD DUP3 DUP2 SUB DUP3 MSTORE PUSH1 0x29 DUP2 MSTORE PUSH1 0x20 ADD DUP1 PUSH2 0x265E PUSH1 0x29 SWAP2 CODECOPY PUSH1 0x40 ADD SWAP2 POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 REVERT JUMPDEST PUSH1 0x0 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND DUP3 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND EQ ISZERO PUSH2 0x17FB JUMPI PUSH1 0x40 MLOAD PUSH32 0x8C379A000000000000000000000000000000000000000000000000000000000 DUP2 MSTORE PUSH1 0x4 ADD DUP1 DUP1 PUSH1 0x20 ADD DUP3 DUP2 SUB DUP3 MSTORE PUSH1 0x24 DUP2 MSTORE PUSH1 0x20 ADD DUP1 PUSH2 0x250F PUSH1 0x24 SWAP2 CODECOPY PUSH1 0x40 ADD SWAP2 POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 REVERT JUMPDEST PUSH2 0x1806 DUP4 DUP4 DUP4 PUSH2 0x1E88 JUMP JUMPDEST PUSH2 0x1811 PUSH1 0x0 DUP3 PUSH2 0x1527 JUMP JUMPDEST PUSH2 0x1862 DUP2 PUSH1 0x1 PUSH1 0x0 DUP7 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND DUP2 MSTORE PUSH1 0x20 ADD SWAP1 DUP2 MSTORE PUSH1 0x20 ADD PUSH1 0x0 KECCAK256 PUSH2 0x1E8D SWAP1 SWAP2 SWAP1 PUSH4 0xFFFFFFFF AND JUMP JUMPDEST POP PUSH2 0x18B4 DUP2 PUSH1 0x1 PUSH1 0x0 DUP6 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND DUP2 MSTORE PUSH1 0x20 ADD SWAP1 DUP2 MSTORE PUSH1 0x20 ADD PUSH1 0x0 KECCAK256 PUSH2 0x1488 SWAP1 SWAP2 SWAP1 PUSH4 0xFFFFFFFF AND JUMP JUMPDEST POP PUSH2 0x18CB DUP2 DUP4 PUSH1 0x2 PUSH2 0x14A2 SWAP1 SWAP3 SWAP2 SWAP1 PUSH4 0xFFFFFFFF AND JUMP JUMPDEST POP DUP1 DUP3 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND DUP5 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND PUSH32 0xDDF252AD1BE2C89B69C2B068FC378DAA952BA7F163C4A11628F55A4DF523B3EF PUSH1 0x40 MLOAD PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 LOG4 POP POP POP JUMP JUMPDEST PUSH1 0x0 PUSH2 0x193B DUP4 PUSH1 0x0 ADD DUP4 PUSH2 0x1EA7 JUMP JUMPDEST PUSH1 0x0 SHR SWAP1 POP SWAP3 SWAP2 POP POP JUMP JUMPDEST PUSH1 0x0 DUP1 PUSH1 0x0 DUP1 PUSH2 0x1959 DUP7 PUSH1 0x0 ADD DUP7 PUSH2 0x1F2A JUMP JUMPDEST SWAP2 POP SWAP2 POP DUP2 PUSH1 0x0 SHR DUP2 PUSH1 0x0 SHR SWAP4 POP SWAP4 POP POP POP SWAP3 POP SWAP3 SWAP1 POP JUMP JUMPDEST PUSH1 0x0 PUSH2 0x1985 DUP5 PUSH1 0x0 ADD DUP5 PUSH1 0x0 SHL DUP5 PUSH2 0x1FC3 JUMP JUMPDEST PUSH1 0x0 SHR SWAP1 POP SWAP4 SWAP3 POP POP POP JUMP JUMPDEST PUSH1 0x0 PUSH2 0x199F DUP3 PUSH1 0x0 ADD PUSH2 0x20B9 JUMP JUMPDEST SWAP1 POP SWAP2 SWAP1 POP JUMP JUMPDEST PUSH2 0x19B1 DUP5 DUP5 DUP5 PUSH2 0x16E9 JUMP JUMPDEST PUSH2 0x19BD DUP5 DUP5 DUP5 DUP5 PUSH2 0x20CA JUMP JUMPDEST PUSH2 0x1A12 JUMPI PUSH1 0x40 MLOAD PUSH32 0x8C379A000000000000000000000000000000000000000000000000000000000 DUP2 MSTORE PUSH1 0x4 ADD DUP1 DUP1 PUSH1 0x20 ADD DUP3 DUP2 SUB DUP3 MSTORE PUSH1 0x32 DUP2 MSTORE PUSH1 0x20 ADD DUP1 PUSH2 0x24DD PUSH1 0x32 SWAP2 CODECOPY PUSH1 0x40 ADD SWAP2 POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 REVERT JUMPDEST POP POP POP POP JUMP JUMPDEST PUSH1 0x60 PUSH1 0x0 DUP3 EQ ISZERO PUSH2 0x1A60 JUMPI PUSH1 0x40 MLOAD DUP1 PUSH1 0x40 ADD PUSH1 0x40 MSTORE DUP1 PUSH1 0x1 DUP2 MSTORE PUSH1 0x20 ADD PUSH32 0x3000000000000000000000000000000000000000000000000000000000000000 DUP2 MSTORE POP SWAP1 POP PUSH2 0x1B5A JUMP JUMPDEST PUSH1 0x0 DUP3 SWAP1 POP PUSH1 0x0 JUMPDEST PUSH1 0x0 DUP3 EQ PUSH2 0x1A8A JUMPI DUP1 DUP1 PUSH1 0x1 ADD SWAP2 POP POP PUSH1 0xA DUP3 DUP2 PUSH2 0x1A82 JUMPI INVALID JUMPDEST DIV SWAP2 POP PUSH2 0x1A68 JUMP JUMPDEST PUSH1 0x60 DUP2 PUSH8 0xFFFFFFFFFFFFFFFF DUP2 GT DUP1 ISZERO PUSH2 0x1AA3 JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST POP PUSH1 0x40 MLOAD SWAP1 DUP1 DUP3 MSTORE DUP1 PUSH1 0x1F ADD PUSH1 0x1F NOT AND PUSH1 0x20 ADD DUP3 ADD PUSH1 0x40 MSTORE DUP1 ISZERO PUSH2 0x1AD6 JUMPI DUP2 PUSH1 0x20 ADD PUSH1 0x1 DUP3 MUL DUP1 CALLDATASIZE DUP4 CALLDATACOPY DUP1 DUP3 ADD SWAP2 POP POP SWAP1 POP JUMPDEST POP SWAP1 POP PUSH1 0x0 PUSH1 0x1 DUP4 SUB SWAP1 POP DUP6 SWAP4 POP JUMPDEST PUSH1 0x0 DUP5 EQ PUSH2 0x1B52 JUMPI PUSH1 0xA DUP5 DUP2 PUSH2 0x1AF7 JUMPI INVALID JUMPDEST MOD PUSH1 0x30 ADD PUSH1 0xF8 SHL DUP3 DUP3 DUP1 PUSH1 0x1 SWAP1 SUB SWAP4 POP DUP2 MLOAD DUP2 LT PUSH2 0x1B11 JUMPI INVALID JUMPDEST PUSH1 0x20 ADD ADD SWAP1 PUSH31 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF NOT AND SWAP1 DUP2 PUSH1 0x0 BYTE SWAP1 MSTORE8 POP PUSH1 0xA DUP5 DUP2 PUSH2 0x1B4A JUMPI INVALID JUMPDEST DIV SWAP4 POP PUSH2 0x1AE5 JUMP JUMPDEST DUP2 SWAP5 POP POP POP POP POP JUMPDEST SWAP2 SWAP1 POP JUMP JUMPDEST PUSH1 0x0 DUP1 DUP4 PUSH1 0x1 ADD PUSH1 0x0 DUP5 DUP2 MSTORE PUSH1 0x20 ADD SWAP1 DUP2 MSTORE PUSH1 0x20 ADD PUSH1 0x0 KECCAK256 SLOAD EQ ISZERO SWAP1 POP SWAP3 SWAP2 POP POP JUMP JUMPDEST PUSH1 0x0 PUSH2 0x1B8E DUP4 DUP4 PUSH2 0x22E3 JUMP JUMPDEST PUSH2 0x1BE7 JUMPI DUP3 PUSH1 0x0 ADD DUP3 SWAP1 DUP1 PUSH1 0x1 DUP2 SLOAD ADD DUP1 DUP3 SSTORE DUP1 SWAP2 POP POP PUSH1 0x1 SWAP1 SUB SWAP1 PUSH1 0x0 MSTORE PUSH1 0x20 PUSH1 0x0 KECCAK256 ADD PUSH1 0x0 SWAP1 SWAP2 SWAP1 SWAP2 SWAP1 SWAP2 POP SSTORE DUP3 PUSH1 0x0 ADD DUP1 SLOAD SWAP1 POP DUP4 PUSH1 0x1 ADD PUSH1 0x0 DUP5 DUP2 MSTORE PUSH1 0x20 ADD SWAP1 DUP2 MSTORE PUSH1 0x20 ADD PUSH1 0x0 KECCAK256 DUP2 SWAP1 SSTORE POP PUSH1 0x1 SWAP1 POP PUSH2 0x1BEC JUMP JUMPDEST PUSH1 0x0 SWAP1 POP JUMPDEST SWAP3 SWAP2 POP POP JUMP JUMPDEST PUSH1 0x0 DUP1 DUP5 PUSH1 0x1 ADD PUSH1 0x0 DUP6 DUP2 MSTORE PUSH1 0x20 ADD SWAP1 DUP2 MSTORE PUSH1 0x20 ADD PUSH1 0x0 KECCAK256 SLOAD SWAP1 POP PUSH1 0x0 DUP2 EQ ISZERO PUSH2 0x1C99 JUMPI DUP5 PUSH1 0x0 ADD PUSH1 0x40 MLOAD DUP1 PUSH1 0x40 ADD PUSH1 0x40 MSTORE DUP1 DUP7 DUP2 MSTORE PUSH1 0x20 ADD DUP6 DUP2 MSTORE POP SWAP1 DUP1 PUSH1 0x1 DUP2 SLOAD ADD DUP1 DUP3 SSTORE DUP1 SWAP2 POP POP PUSH1 0x1 SWAP1 SUB SWAP1 PUSH1 0x0 MSTORE PUSH1 0x20 PUSH1 0x0 KECCAK256 SWAP1 PUSH1 0x2 MUL ADD PUSH1 0x0 SWAP1 SWAP2 SWAP1 SWAP2 SWAP1 SWAP2 POP PUSH1 0x0 DUP3 ADD MLOAD DUP2 PUSH1 0x0 ADD SSTORE PUSH1 0x20 DUP3 ADD MLOAD DUP2 PUSH1 0x1 ADD SSTORE POP POP DUP5 PUSH1 0x0 ADD DUP1 SLOAD SWAP1 POP DUP6 PUSH1 0x1 ADD PUSH1 0x0 DUP7 DUP2 MSTORE PUSH1 0x20 ADD SWAP1 DUP2 MSTORE PUSH1 0x20 ADD PUSH1 0x0 KECCAK256 DUP2 SWAP1 SSTORE POP PUSH1 0x1 SWAP2 POP POP PUSH2 0x1CC7 JUMP JUMPDEST DUP3 DUP6 PUSH1 0x0 ADD PUSH1 0x1 DUP4 SUB DUP2 SLOAD DUP2 LT PUSH2 0x1CAC JUMPI INVALID JUMPDEST SWAP1 PUSH1 0x0 MSTORE PUSH1 0x20 PUSH1 0x0 KECCAK256 SWAP1 PUSH1 0x2 MUL ADD PUSH1 0x1 ADD DUP2 SWAP1 SSTORE POP PUSH1 0x0 SWAP2 POP POP JUMPDEST SWAP4 SWAP3 POP POP POP JUMP JUMPDEST PUSH1 0x60 DUP3 SELFBALANCE LT ISZERO PUSH2 0x1D29 JUMPI PUSH1 0x40 MLOAD PUSH32 0x8C379A000000000000000000000000000000000000000000000000000000000 DUP2 MSTORE PUSH1 0x4 ADD DUP1 DUP1 PUSH1 0x20 ADD DUP3 DUP2 SUB DUP3 MSTORE PUSH1 0x26 DUP2 MSTORE PUSH1 0x20 ADD DUP1 PUSH2 0x2533 PUSH1 0x26 SWAP2 CODECOPY PUSH1 0x40 ADD SWAP2 POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 REVERT JUMPDEST PUSH2 0x1D32 DUP6 PUSH2 0x14D7 JUMP JUMPDEST PUSH2 0x1DA4 JUMPI PUSH1 0x40 MLOAD PUSH32 0x8C379A000000000000000000000000000000000000000000000000000000000 DUP2 MSTORE PUSH1 0x4 ADD DUP1 DUP1 PUSH1 0x20 ADD DUP3 DUP2 SUB DUP3 MSTORE PUSH1 0x1D DUP2 MSTORE PUSH1 0x20 ADD DUP1 PUSH32 0x416464726573733A2063616C6C20746F206E6F6E2D636F6E7472616374000000 DUP2 MSTORE POP PUSH1 0x20 ADD SWAP2 POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 REVERT JUMPDEST PUSH1 0x0 PUSH1 0x60 DUP7 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND DUP6 DUP8 PUSH1 0x40 MLOAD DUP1 DUP3 DUP1 MLOAD SWAP1 PUSH1 0x20 ADD SWAP1 DUP1 DUP4 DUP4 JUMPDEST PUSH1 0x20 DUP4 LT PUSH2 0x1DF4 JUMPI DUP1 MLOAD DUP3 MSTORE PUSH1 0x20 DUP3 ADD SWAP2 POP PUSH1 0x20 DUP2 ADD SWAP1 POP PUSH1 0x20 DUP4 SUB SWAP3 POP PUSH2 0x1DD1 JUMP JUMPDEST PUSH1 0x1 DUP4 PUSH1 0x20 SUB PUSH2 0x100 EXP SUB DUP1 NOT DUP3 MLOAD AND DUP2 DUP5 MLOAD AND DUP1 DUP3 OR DUP6 MSTORE POP POP POP POP POP POP SWAP1 POP ADD SWAP2 POP POP PUSH1 0x0 PUSH1 0x40 MLOAD DUP1 DUP4 SUB DUP2 DUP6 DUP8 GAS CALL SWAP3 POP POP POP RETURNDATASIZE DUP1 PUSH1 0x0 DUP2 EQ PUSH2 0x1E56 JUMPI PUSH1 0x40 MLOAD SWAP2 POP PUSH1 0x1F NOT PUSH1 0x3F RETURNDATASIZE ADD AND DUP3 ADD PUSH1 0x40 MSTORE RETURNDATASIZE DUP3 MSTORE RETURNDATASIZE PUSH1 0x0 PUSH1 0x20 DUP5 ADD RETURNDATACOPY PUSH2 0x1E5B JUMP JUMPDEST PUSH1 0x60 SWAP2 POP JUMPDEST POP SWAP2 POP SWAP2 POP PUSH2 0x1E6B DUP3 DUP3 DUP7 PUSH2 0x2306 JUMP JUMPDEST SWAP3 POP POP POP SWAP5 SWAP4 POP POP POP POP JUMP JUMPDEST PUSH1 0x0 DUP2 PUSH1 0x0 ADD DUP1 SLOAD SWAP1 POP SWAP1 POP SWAP2 SWAP1 POP JUMP JUMPDEST POP POP POP JUMP JUMPDEST PUSH1 0x0 PUSH2 0x1E9F DUP4 PUSH1 0x0 ADD DUP4 PUSH1 0x0 SHL PUSH2 0x23D2 JUMP JUMPDEST SWAP1 POP SWAP3 SWAP2 POP POP JUMP JUMPDEST PUSH1 0x0 DUP2 DUP4 PUSH1 0x0 ADD DUP1 SLOAD SWAP1 POP GT PUSH2 0x1F08 JUMPI PUSH1 0x40 MLOAD PUSH32 0x8C379A000000000000000000000000000000000000000000000000000000000 DUP2 MSTORE PUSH1 0x4 ADD DUP1 DUP1 PUSH1 0x20 ADD DUP3 DUP2 SUB DUP3 MSTORE PUSH1 0x22 DUP2 MSTORE PUSH1 0x20 ADD DUP1 PUSH2 0x24BB PUSH1 0x22 SWAP2 CODECOPY PUSH1 0x40 ADD SWAP2 POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 REVERT JUMPDEST DUP3 PUSH1 0x0 ADD DUP3 DUP2 SLOAD DUP2 LT PUSH2 0x1F17 JUMPI INVALID JUMPDEST SWAP1 PUSH1 0x0 MSTORE PUSH1 0x20 PUSH1 0x0 KECCAK256 ADD SLOAD SWAP1 POP SWAP3 SWAP2 POP POP JUMP JUMPDEST PUSH1 0x0 DUP1 DUP3 DUP5 PUSH1 0x0 ADD DUP1 SLOAD SWAP1 POP GT PUSH2 0x1F8C JUMPI PUSH1 0x40 MLOAD PUSH32 0x8C379A000000000000000000000000000000000000000000000000000000000 DUP2 MSTORE PUSH1 0x4 ADD DUP1 DUP1 PUSH1 0x20 ADD DUP3 DUP2 SUB DUP3 MSTORE PUSH1 0x22 DUP2 MSTORE PUSH1 0x20 ADD DUP1 PUSH2 0x2610 PUSH1 0x22 SWAP2 CODECOPY PUSH1 0x40 ADD SWAP2 POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 REVERT JUMPDEST PUSH1 0x0 DUP5 PUSH1 0x0 ADD DUP5 DUP2 SLOAD DUP2 LT PUSH2 0x1F9D JUMPI INVALID JUMPDEST SWAP1 PUSH1 0x0 MSTORE PUSH1 0x20 PUSH1 0x0 KECCAK256 SWAP1 PUSH1 0x2 MUL ADD SWAP1 POP DUP1 PUSH1 0x0 ADD SLOAD DUP2 PUSH1 0x1 ADD SLOAD SWAP3 POP SWAP3 POP POP SWAP3 POP SWAP3 SWAP1 POP JUMP JUMPDEST PUSH1 0x0 DUP1 DUP5 PUSH1 0x1 ADD PUSH1 0x0 DUP6 DUP2 MSTORE PUSH1 0x20 ADD SWAP1 DUP2 MSTORE PUSH1 0x20 ADD PUSH1 0x0 KECCAK256 SLOAD SWAP1 POP PUSH1 0x0 DUP2 EQ ISZERO DUP4 SWAP1 PUSH2 0x208A JUMPI PUSH1 0x40 MLOAD PUSH32 0x8C379A000000000000000000000000000000000000000000000000000000000 DUP2 MSTORE PUSH1 0x4 ADD DUP1 DUP1 PUSH1 0x20 ADD DUP3 DUP2 SUB DUP3 MSTORE DUP4 DUP2 DUP2 MLOAD DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP DUP1 MLOAD SWAP1 PUSH1 0x20 ADD SWAP1 DUP1 DUP4 DUP4 PUSH1 0x0 JUMPDEST DUP4 DUP2 LT ISZERO PUSH2 0x204F JUMPI DUP1 DUP3 ADD MLOAD DUP2 DUP5 ADD MSTORE PUSH1 0x20 DUP2 ADD SWAP1 POP PUSH2 0x2034 JUMP JUMPDEST POP POP POP POP SWAP1 POP SWAP1 DUP2 ADD SWAP1 PUSH1 0x1F AND DUP1 ISZERO PUSH2 0x207C JUMPI DUP1 DUP3 SUB DUP1 MLOAD PUSH1 0x1 DUP4 PUSH1 0x20 SUB PUSH2 0x100 EXP SUB NOT AND DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP JUMPDEST POP SWAP3 POP POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 REVERT JUMPDEST POP DUP5 PUSH1 0x0 ADD PUSH1 0x1 DUP3 SUB DUP2 SLOAD DUP2 LT PUSH2 0x209D JUMPI INVALID JUMPDEST SWAP1 PUSH1 0x0 MSTORE PUSH1 0x20 PUSH1 0x0 KECCAK256 SWAP1 PUSH1 0x2 MUL ADD PUSH1 0x1 ADD SLOAD SWAP2 POP POP SWAP4 SWAP3 POP POP POP JUMP JUMPDEST PUSH1 0x0 DUP2 PUSH1 0x0 ADD DUP1 SLOAD SWAP1 POP SWAP1 POP SWAP2 SWAP1 POP JUMP JUMPDEST PUSH1 0x0 PUSH2 0x20EB DUP5 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND PUSH2 0x14D7 JUMP JUMPDEST PUSH2 0x20F8 JUMPI PUSH1 0x1 SWAP1 POP PUSH2 0x22DB JUMP JUMPDEST PUSH1 0x60 PUSH2 0x2262 PUSH4 0x150B7A02 PUSH1 0xE0 SHL PUSH2 0x210D PUSH2 0x151F JUMP JUMPDEST DUP9 DUP8 DUP8 PUSH1 0x40 MLOAD PUSH1 0x24 ADD DUP1 DUP6 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND DUP2 MSTORE PUSH1 0x20 ADD DUP5 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND DUP2 MSTORE PUSH1 0x20 ADD DUP4 DUP2 MSTORE PUSH1 0x20 ADD DUP1 PUSH1 0x20 ADD DUP3 DUP2 SUB DUP3 MSTORE DUP4 DUP2 DUP2 MLOAD DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP DUP1 MLOAD SWAP1 PUSH1 0x20 ADD SWAP1 DUP1 DUP4 DUP4 PUSH1 0x0 JUMPDEST DUP4 DUP2 LT ISZERO PUSH2 0x2191 JUMPI DUP1 DUP3 ADD MLOAD DUP2 DUP5 ADD MSTORE PUSH1 0x20 DUP2 ADD SWAP1 POP PUSH2 0x2176 JUMP JUMPDEST POP POP POP POP SWAP1 POP SWAP1 DUP2 ADD SWAP1 PUSH1 0x1F AND DUP1 ISZERO PUSH2 0x21BE JUMPI DUP1 DUP3 SUB DUP1 MLOAD PUSH1 0x1 DUP4 PUSH1 0x20 SUB PUSH2 0x100 EXP SUB NOT AND DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP JUMPDEST POP SWAP6 POP POP POP POP POP POP PUSH1 0x40 MLOAD PUSH1 0x20 DUP2 DUP4 SUB SUB DUP2 MSTORE SWAP1 PUSH1 0x40 MSTORE SWAP1 PUSH28 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF NOT AND PUSH1 0x20 DUP3 ADD DUP1 MLOAD PUSH28 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF DUP4 DUP2 DUP4 AND OR DUP4 MSTORE POP POP POP POP PUSH1 0x40 MLOAD DUP1 PUSH1 0x60 ADD PUSH1 0x40 MSTORE DUP1 PUSH1 0x32 DUP2 MSTORE PUSH1 0x20 ADD PUSH2 0x24DD PUSH1 0x32 SWAP2 CODECOPY DUP8 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND PUSH2 0x14EA SWAP1 SWAP3 SWAP2 SWAP1 PUSH4 0xFFFFFFFF AND JUMP JUMPDEST SWAP1 POP PUSH1 0x0 DUP2 DUP1 PUSH1 0x20 ADD SWAP1 MLOAD PUSH1 0x20 DUP2 LT ISZERO PUSH2 0x227B JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST DUP2 ADD SWAP1 DUP1 DUP1 MLOAD SWAP1 PUSH1 0x20 ADD SWAP1 SWAP3 SWAP2 SWAP1 POP POP POP SWAP1 POP PUSH4 0x150B7A02 PUSH1 0xE0 SHL PUSH28 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF NOT AND DUP2 PUSH28 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF NOT AND EQ SWAP3 POP POP POP JUMPDEST SWAP5 SWAP4 POP POP POP POP JUMP JUMPDEST PUSH1 0x0 DUP1 DUP4 PUSH1 0x1 ADD PUSH1 0x0 DUP5 DUP2 MSTORE PUSH1 0x20 ADD SWAP1 DUP2 MSTORE PUSH1 0x20 ADD PUSH1 0x0 KECCAK256 SLOAD EQ ISZERO SWAP1 POP SWAP3 SWAP2 POP POP JUMP JUMPDEST PUSH1 0x60 DUP4 ISZERO PUSH2 0x2316 JUMPI DUP3 SWAP1 POP PUSH2 0x23CB JUMP JUMPDEST PUSH1 0x0 DUP4 MLOAD GT ISZERO PUSH2 0x2329 JUMPI DUP3 MLOAD DUP1 DUP5 PUSH1 0x20 ADD REVERT JUMPDEST DUP2 PUSH1 0x40 MLOAD PUSH32 0x8C379A000000000000000000000000000000000000000000000000000000000 DUP2 MSTORE PUSH1 0x4 ADD DUP1 DUP1 PUSH1 0x20 ADD DUP3 DUP2 SUB DUP3 MSTORE DUP4 DUP2 DUP2 MLOAD DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP DUP1 MLOAD SWAP1 PUSH1 0x20 ADD SWAP1 DUP1 DUP4 DUP4 PUSH1 0x0 JUMPDEST DUP4 DUP2 LT ISZERO PUSH2 0x2390 JUMPI DUP1 DUP3 ADD MLOAD DUP2 DUP5 ADD MSTORE PUSH1 0x20 DUP2 ADD SWAP1 POP PUSH2 0x2375 JUMP JUMPDEST POP POP POP POP SWAP1 POP SWAP1 DUP2 ADD SWAP1 PUSH1 0x1F AND DUP1 ISZERO PUSH2 0x23BD JUMPI DUP1 DUP3 SUB DUP1 MLOAD PUSH1 0x1 DUP4 PUSH1 0x20 SUB PUSH2 0x100 EXP SUB NOT AND DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP JUMPDEST POP SWAP3 POP POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 REVERT JUMPDEST SWAP4 SWAP3 POP POP POP JUMP JUMPDEST PUSH1 0x0 DUP1 DUP4 PUSH1 0x1 ADD PUSH1 0x0 DUP5 DUP2 MSTORE PUSH1 0x20 ADD SWAP1 DUP2 MSTORE PUSH1 0x20 ADD PUSH1 0x0 KECCAK256 SLOAD SWAP1 POP PUSH1 0x0 DUP2 EQ PUSH2 0x24AE JUMPI PUSH1 0x0 PUSH1 0x1 DUP3 SUB SWAP1 POP PUSH1 0x0 PUSH1 0x1 DUP7 PUSH1 0x0 ADD DUP1 SLOAD SWAP1 POP SUB SWAP1 POP PUSH1 0x0 DUP7 PUSH1 0x0 ADD DUP3 DUP2 SLOAD DUP2 LT PUSH2 0x241D JUMPI INVALID JUMPDEST SWAP1 PUSH1 0x0 MSTORE PUSH1 0x20 PUSH1 0x0 KECCAK256 ADD SLOAD SWAP1 POP DUP1 DUP8 PUSH1 0x0 ADD DUP5 DUP2 SLOAD DUP2 LT PUSH2 0x243A JUMPI INVALID JUMPDEST SWAP1 PUSH1 0x0 MSTORE PUSH1 0x20 PUSH1 0x0 KECCAK256 ADD DUP2 SWAP1 SSTORE POP PUSH1 0x1 DUP4 ADD DUP8 PUSH1 0x1 ADD PUSH1 0x0 DUP4 DUP2 MSTORE PUSH1 0x20 ADD SWAP1 DUP2 MSTORE PUSH1 0x20 ADD PUSH1 0x0 KECCAK256 DUP2 SWAP1 SSTORE POP DUP7 PUSH1 0x0 ADD DUP1 SLOAD DUP1 PUSH2 0x2472 JUMPI INVALID JUMPDEST PUSH1 0x1 SWAP1 SUB DUP2 DUP2 SWAP1 PUSH1 0x0 MSTORE PUSH1 0x20 PUSH1 0x0 KECCAK256 ADD PUSH1 0x0 SWAP1 SSTORE SWAP1 SSTORE DUP7 PUSH1 0x1 ADD PUSH1 0x0 DUP8 DUP2 MSTORE PUSH1 0x20 ADD SWAP1 DUP2 MSTORE PUSH1 0x20 ADD PUSH1 0x0 KECCAK256 PUSH1 0x0 SWAP1 SSTORE PUSH1 0x1 SWAP5 POP POP POP POP POP PUSH2 0x24B4 JUMP JUMPDEST PUSH1 0x0 SWAP2 POP POP JUMPDEST SWAP3 SWAP2 POP POP JUMP INVALID GASLIMIT PUSH15 0x756D657261626C655365743A20696E PUSH5 0x6578206F75 PUSH21 0x206F6620626F756E64734552433732313A20747261 PUSH15 0x7366657220746F206E6F6E20455243 CALLDATACOPY ORIGIN BALANCE MSTORE PUSH6 0x636569766572 KECCAK256 PUSH10 0x6D706C656D656E746572 GASLIMIT MSTORE NUMBER CALLDATACOPY ORIGIN BALANCE GASPRICE KECCAK256 PUSH21 0x72616E7366657220746F20746865207A65726F2061 PUSH5 0x6472657373 COINBASE PUSH5 0x6472657373 GASPRICE KECCAK256 PUSH10 0x6E73756666696369656E PUSH21 0x2062616C616E636520666F722063616C6C45524337 ORIGIN BALANCE GASPRICE KECCAK256 PUSH16 0x70657261746F7220717565727920666F PUSH19 0x206E6F6E6578697374656E7420746F6B656E45 MSTORE NUMBER CALLDATACOPY ORIGIN BALANCE GASPRICE KECCAK256 PUSH2 0x7070 PUSH19 0x6F76652063616C6C6572206973206E6F74206F PUSH24 0x6E6572206E6F7220617070726F76656420666F7220616C6C GASLIMIT MSTORE NUMBER CALLDATACOPY ORIGIN BALANCE GASPRICE KECCAK256 PUSH3 0x616C61 PUSH15 0x636520717565727920666F72207468 PUSH6 0x207A65726F20 PUSH2 0x6464 PUSH19 0x6573734552433732313A206F776E6572207175 PUSH6 0x727920666F72 KECCAK256 PUSH15 0x6F6E6578697374656E7420746F6B65 PUSH15 0x456E756D657261626C654D61703A20 PUSH10 0x6E646578206F7574206F PUSH7 0x20626F756E6473 GASLIMIT MSTORE NUMBER CALLDATACOPY ORIGIN BALANCE GASPRICE KECCAK256 PUSH2 0x7070 PUSH19 0x6F76656420717565727920666F72206E6F6E65 PUSH25 0x697374656E7420746F6B656E4552433732313A207472616E73 PUSH7 0x6572206F662074 PUSH16 0x6B656E2074686174206973206E6F7420 PUSH16 0x776E4552433732314D65746164617461 GASPRICE KECCAK256 SSTORE MSTORE 0x49 KECCAK256 PUSH18 0x7565727920666F72206E6F6E657869737465 PUSH15 0x7420746F6B656E4552433732313A20 PUSH2 0x7070 PUSH19 0x6F76616C20746F2063757272656E74206F776E PUSH6 0x724552433732 BALANCE GASPRICE KECCAK256 PUSH21 0x72616E736665722063616C6C6572206973206E6F74 KECCAK256 PUSH16 0x776E6572206E6F7220617070726F7665 PUSH5 0xA264697066 PUSH20 0x582212208FC1EABF640E52C204FF13E92376EA85 SWAP15 0xD7 SWAP11 0x5D 0x2A 0xD9 PUSH30 0x941E5626A294545AC064736F6C634300060C00334552433732313A207472 PUSH2 0x6E73 PUSH7 0x657220746F206E PUSH16 0x6E204552433732315265636569766572 KECCAK256 PUSH10 0x6D706C656D656E746572 COINBASE PUSH5 0x6472657373 GASPRICE KECCAK256 PUSH10 0x6E73756666696369656E PUSH21 0x2062616C616E636520666F722063616C6C45524337 ORIGIN BALANCE 0x4D PUSH6 0x746164617461 GASPRICE KECCAK256 SSTORE MSTORE 0x49 KECCAK256 PUSH20 0x6574206F66206E6F6E6578697374656E7420746F PUSH12 0x656E00000000000000000000 ",
	"sourceMap": "173:311:0:-:0;;;200:282;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;297:5;303:7;768:40:2;435:10;787:20;;768:18;;;:40;;:::i;:::-;3657:5:5;3649;:13;;;;;;;;;;;;:::i;:::-;;3682:7;3672;:17;;;;;;;;;;;;:::i;:::-;;3777:40;2740:10;3796:20;;3777:18;;;:40;;:::i;:::-;3827:49;3072:10;3846:29;;3827:18;;;:49;;:::i;:::-;3886:51;3445:10;3905:31;;3886:18;;;:51;;:::i;:::-;3575:369;;372:24:0::1;382:10;394:1;372:9;;;:24;;:::i;:::-;402:26;415:1;418:9;402:12;;;:26;;:::i;:::-;200:282:::0;;;173:311;;1499:198:2;1597:10;1582:25;;:11;:25;;;;;1574:66;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;1686:4;1650:20;:33;1671:11;1650:33;;;;;;;;;;;;;;;;;;:40;;;;;;;;;;;;;;;;;;1499:198;:::o;11187:108:5:-;11262:26;11272:2;11276:7;11262:26;;;;;;;;;;;;:9;;;:26;;:::i;:::-;11187:108;;:::o;14227:212::-;14326:16;14334:7;14326;;;:16;;:::i;:::-;14318:73;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;14423:9;14401:10;:19;14412:7;14401:19;;;;;;;;;;;:31;;;;;;;;;;;;:::i;:::-;;14227:212;;:::o;11516:247::-;11611:18;11617:2;11621:7;11611:5;;;:18;;:::i;:::-;11647:54;11678:1;11682:2;11686:7;11695:5;11647:22;;;:54;;:::i;:::-;11639:117;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;11516:247;;;:::o;10252:117::-;10309:4;10332:30;10354:7;10332:12;:21;;;;;;:30;;;;:::i;:::-;10325:37;;10252:117;;;:::o;12085:393::-;12178:1;12164:16;;:2;:16;;;;12156:61;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;12236:16;12244:7;12236;;;:16;;:::i;:::-;12235:17;12227:58;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;12296:45;12325:1;12329:2;12333:7;12296:20;;;:45;;:::i;:::-;12352:30;12374:7;12352:13;:17;12366:2;12352:17;;;;;;;;;;;;;;;:21;;;;;;:30;;;;:::i;:::-;;12393:29;12410:7;12419:2;12393:12;:16;;;;;;:29;;;;;:::i;:::-;;12463:7;12459:2;12438:33;;12455:1;12438:33;;;;;;;;;;;;12085:393;;:::o;15313:589::-;15433:4;15458:15;:2;:13;;;;;;;:15;;:::i;:::-;15453:58;;15496:4;15489:11;;;;15453:58;15520:23;15546:246;15598:45;;;15657:12;:10;;;:12;;:::i;:::-;15683:4;15701:7;15722:5;15562:175;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;15546:246;;;;;;;;;;;;;;;;;:2;:15;;;;;;;;:246;;;;;:::i;:::-;15520:272;;15802:13;15829:10;15818:32;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;15802:48;;1076:10;15878:16;;15868:26;;;:6;:26;;;;15860:35;;;;15313:589;;;;;;;:::o;6799:149:11:-;6883:4;6906:35;6916:3;:10;;6936:3;6928:12;;6906:9;;;:35;;:::i;:::-;6899:42;;6799:149;;;;:::o;16659:93:5:-;;;;:::o;8032:129:12:-;8099:4;8122:32;8127:3;:10;;8147:5;8139:14;;8122:4;;;:32;;:::i;:::-;8115:39;;8032:129;;;;:::o;6247:174:11:-;6336:4;6359:55;6364:3;:10;;6384:3;6376:12;;6406:5;6398:14;;6390:23;;6359:4;;;:55;;:::i;:::-;6352:62;;6247:174;;;;;:::o;726:413:10:-;786:4;989:12;1098:7;1086:20;1078:28;;1131:1;1124:4;:8;1117:15;;;726:413;;;:::o;590:104:1:-;643:15;677:10;670:17;;590:104;:::o;3581:193:10:-;3684:12;3715:52;3737:6;3745:4;3751:1;3754:12;3715:21;;;:52;;:::i;:::-;3708:59;;3581:193;;;;;:::o;4278:123:11:-;4349:4;4393:1;4372:3;:12;;:17;4385:3;4372:17;;;;;;;;;;;;:22;;4365:29;;4278:123;;;;:::o;1640:404:12:-;1703:4;1724:21;1734:3;1739:5;1724:9;;;:21;;:::i;:::-;1719:319;;1761:3;:11;;1778:5;1761:23;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;1941:3;:11;;:18;;;;1919:3;:12;;:19;1932:5;1919:19;;;;;;;;;;;:40;;;;1980:4;1973:11;;;;1719:319;2022:5;2015:12;;1640:404;;;;;:::o;1836:678:11:-;1912:4;2026:16;2045:3;:12;;:17;2058:3;2045:17;;;;;;;;;;;;2026:36;;2089:1;2077:8;:13;2073:435;;;2143:3;:12;;2161:38;;;;;;;;2178:3;2161:38;;;;2191:5;2161:38;;;2143:57;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;2355:3;:12;;:19;;;;2335:3;:12;;:17;2348:3;2335:17;;;;;;;;;;;:39;;;;2395:4;2388:11;;;;;2073:435;2466:5;2430:3;:12;;2454:1;2443:8;:12;2430:26;;;;;;;;;;;;;;;;;;:33;;:41;;;;2492:5;2485:12;;;1836:678;;;;;;:::o;4608:523:10:-;4735:12;4792:5;4767:21;:30;;4759:81;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;4858:18;4869:6;4858:10;;;:18;;:::i;:::-;4850:60;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;4981:12;4995:23;5022:6;:11;;5042:5;5050:4;5022:33;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;4980:75;;;;5072:52;5090:7;5099:10;5111:12;5072:17;;;:52;;:::i;:::-;5065:59;;;;4608:523;;;;;;:::o;3805:127:12:-;3878:4;3924:1;3901:3;:12;;:19;3914:5;3901:19;;;;;;;;;;;;:24;;3894:31;;3805:127;;;;:::o;7091:725:10:-;7206:12;7234:7;7230:580;;;7264:10;7257:17;;;;7230:580;7395:1;7375:10;:17;:21;7371:429;;;7633:10;7627:17;7693:15;7680:10;7676:2;7672:19;7665:44;7582:145;7772:12;7765:20;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;7091:725;;;;;;:::o;173:311:0:-;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;:::o;:::-;;;;;;;;;;;;;;;;;;;;;:::o;:::-;;;;;;;"
};
      const _tokenURI = "https://strat.cc/nft.json";
      const prepareNFT = new ContractFactory(nftABI, nftBytecode, signer);
      const nft = await prepareNFT.deploy(_name, _symbol,_tokenURI);


      // Send nftInstance and sharesInstance to Clerk
      const register = await this._clerk.registerArtwork(shares.address,nft.address,auction.address);


      // Wait for 3 deployments
      await auction.deployed();
      console.log("Auction.sol deployed:", auction.address);
      await shares.deployed();
      console.log("Shares.sol deployed:", shares.address);
      await nft.deployed();
      console.log("NFT.sol deployed:", nft.address);

      // Get the registration tx hash
      await register.wait();
      console.log("Registration tx hash:", register.hash);

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

      // Remove 'waiting for tx' msg
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
