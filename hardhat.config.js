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

// Add your ID and private key here
const INFURA_PROJECT_ID = "";
const GOERLI_PRIVATE_KEY = "";

module.exports = {
  solidity: "0.6.2",
  networks: {
    goerli: {
      url: `https://goerli.infura.io/v3/${INFURA_PROJECT_ID}`,
      accounts: [`0x${GOERLI_PRIVATE_KEY}`]
    }
  }
};
