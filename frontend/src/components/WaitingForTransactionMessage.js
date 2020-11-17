import React from "react";

export function WaitingForTransactionMessage({ txHash }) {
  return (

    <div className="alert alert-info" role="alert">
      <p>
        ERC-20 contract deployment pending.
      </p>
      <p>
        Tx hash: <strong>{txHash}</strong>
      </p>
    </div>
  );
}
