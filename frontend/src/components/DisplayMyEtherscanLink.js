import React from "react";

export function DisplayMyEtherscanLink({ userAddr })
{
  return (
    <div>
      <br />
      <p>
        <strong><a target="_blank" rel="noreferrer" href = {userAddr}>View all your artworks' shares on Etherscan</a></strong>
      </p>
      <br />
    </div>

  );
}
