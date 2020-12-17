import React from "react";

export function DisplayMyEtherscanLink({ userAddr })
{
  return (
    <div>
      <p>
        <strong><a target="_blank" rel="noreferrer" href = {userAddr}>View your artworks' shares on Etherscan</a></strong>
      </p>
    </div>
  );
}
