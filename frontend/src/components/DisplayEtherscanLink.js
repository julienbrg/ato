import React from "react";

export function DisplayEtherscanLink({ userAddr }) {
  return (
    <div>
      <a  target="_blank" rel="noreferrer" href = {userAddr}>View your shares on Etherscan.</a>
    </div>
  );
}
