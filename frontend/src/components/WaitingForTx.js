import React from "react";

export function WaitingForTx({ txHash }) {
  return (
    <div className="alert alert-info" role="alert">
      <p>
        Your artwork is being registered . . .
      </p>
      <p>
        Tx hash: <strong>{txHash}</strong>
      </p>
    </div>
  );
}
