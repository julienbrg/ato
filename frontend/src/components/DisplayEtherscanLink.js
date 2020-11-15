import React from "react";

export function DisplayEtherscanLink({ userAddr }) {
  return (
    <div>
      <a  target="_blank" id="my_anchor" href = {userAddr}>See your shares on Etherscan.</a>
    </div>
  );
}
