// This is a script for deploying your contracts. You can adapt it to deploy
// yours, or create new ones.
async function main() {
  // This is just a convenience check
  if (network.name === "hardhat") {
    console.warn(
      "You are trying to deploy a contract to the Hardhat Network, which" +
        "gets automatically created and destroyed every time. Use the Hardhat" +
        " option '--network localhost'"
    );
  }

  // ethers is avaialble in the global scope
  const [deployer] = await ethers.getSigners();
  console.log(
    "Deployed from: ",
    await deployer.getAddress()
  );

  const Minter = await ethers.getContractFactory("Minter");
  const minter = await Minter.deploy();
  await minter.deployed();

  console.log("Contract address:", minter.address);

  // We also save the contract's artifacts and address in the frontend directory
  saveFrontendFiles(minter);
}

function saveFrontendFiles(minter) {
  const fs = require("fs");
  const contractsDir = __dirname + "/../frontend/src/contracts";

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    contractsDir + "/contract-address.json",
    JSON.stringify({ Minter: minter.address }, undefined, 2)
  );

  const MinterArtifact = artifacts.readArtifactSync("Minter");

  fs.writeFileSync(
    contractsDir + "/Minter.json",
    JSON.stringify(MinterArtifact, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
