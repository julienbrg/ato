import React from "react";

export function WaitingForTransactionMessage({ txHash }) {
  return (

    <div className="alert alert-info" role="alert">
      <p>
        Tx hash: <strong>{txHash}</strong>
      </p>
    </div>
  );
}
