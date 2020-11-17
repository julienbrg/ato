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

const INFURA_PROJECT_ID = "89c4e0d4c51840d382a448717cd22b98";
const GOERLI_PRIVATE_KEY = "ecfac123a8856ec3a3e5c99eebec1351bf170b8a117ea37daa6f39208e5a5756";

module.exports = {
  solidity: "0.6.2",
  networks: {
    goerli: {
      url: `https://goerli.infura.io/v3/${INFURA_PROJECT_ID}`,
      accounts: [`0x${GOERLI_PRIVATE_KEY}`]
    }
  }
};
