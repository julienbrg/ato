import React from "react";

export function DisplayEtherscanLink({ userAddr, cDeployed, latestContractDeployedEtherscan, cName, cSymbol, cSupply }) {
  return (
    <div>

    <h4>Your latest artwork registered</h4>
    <p>
      Address: <strong><a target="_blank" rel="noreferrer" href = {latestContractDeployedEtherscan}>{cDeployed}</a></strong>
    </p>
    <p>
      Name: <strong>{cName}</strong>
    </p>
    <p>
      Symbol: <strong>{cSymbol}</strong>
    </p>
    <p>
      Supply: <strong>{cSupply}</strong> units
    </p>
    <p>
      <a target="_blank" rel="noreferrer" href = {userAddr}>View all your artworks on Etherscan.</a>
    </p>
    </div>
  );
}
