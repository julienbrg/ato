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

// Add your own private key here
const INFURA_PROJECT_ID = "89c4e0d4c51840d382a448717cd22b98";
const GOERLI_PRIVATE_KEY = "c5e8f61d1ab959b397eecc0a37a6517b8e67a0e7cf1f4bce5591f3ed80199122";

module.exports = {
  solidity: "0.6.2",
  networks: {
    goerli: {
      url: `https://goerli.infura.io/v3/${INFURA_PROJECT_ID}`,
      accounts: [`0x${GOERLI_PRIVATE_KEY}`]
    }
  }
};
