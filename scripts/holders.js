async function main() {

  if (network.name === "hardhat") {
    console.log("network: ",network.name);
    console.warn(
      "You are trying to deploy a contract to the Hardhat Network, which" +
        "gets automatically created and destroyed every time. Use the Hardhat" +
        " option '--network localhost'"
    );
  }

// connect to Web3

// network = goerli

// Load contract data with Art addr

// read transfer

const abi = [
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

// This can be an address or an ENS name
const address = "0x1A19dd623D663a158F831cfB109EFeF38eC1A16d";
console.log("hello");
// An example Provider
const provider = ethers.getDefaultProvider();

if (provider) {
  console.log("nope");
} else {
  console.log(provider);
}

console.log(address);
// An example Signer
const signer = ethers.Wallet.createRandom().connect(provider);

// Read-Only; By connecting to a Provider, allows:
// - Any constant function
// - Querying Filters
// - Populating Unsigned Transactions for non-constant methods
// - Estimating Gas for non-constant (as an anonymous sender)
// - Static Calling non-constant methods (as anonymous sender)
const erc20 = new ethers.Contract(address, abi, provider);

// Read-Write; By connecting to a Signer, allows:
// - Everything from Read-Only (except as Signer, not anonymous)
// - Sending transactions for non-constant functions
const erc20_rw = new ethers.Contract(address, abi, signer)



main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
