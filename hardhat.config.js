require("@nomiclabs/hardhat-waffle");

task("accounts", "Prints the list of accounts", async () => {
  const accounts = await ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// More info about object export: https://hardhat.org/config/

/**
 * @type import('hardhat/config').HardhatUserConfig
 */


// Go to https://infura.io/ and create a new project
// Replace this with your Infura project ID
const INFURA_PROJECT_ID = "89c4e0d4c51840d382a448717cd22b98";

// Replace this private key with your Ropsten account private key
// To export your private key from Metamask, open Metamask and
// go to Account Details > Export Private Key
// Be aware of NEVER putting real Ether into testing accounts
const ROPSTEN_PRIVATE_KEY = "7164e86c1869813f477bf882d8fe3b5602c2a306a42bf617a71bcca3214b2108";

module.exports = {
  solidity: "0.6.2",
  networks: {
    ropsten: {
      url: `https://ropsten.infura.io/v3/${INFURA_PROJECT_ID}`,
      accounts: [`0x${ROPSTEN_PRIVATE_KEY}`]
    }
  }
};
