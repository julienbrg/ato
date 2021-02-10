import React from "react";

export function WaitingForTx({ txHash }) {
  return (
    <div className="alert alert-info" role="alert">
      <p>
        Your artwork is being registered.
      </p>
      <p>
        You’re currently deploying several contracts. This process can take up to 3 minutes.
      </p>
      <p>
        Please check if you have confirmed all the transactions (Metamask).
      </p>
    </div>
  );
}
