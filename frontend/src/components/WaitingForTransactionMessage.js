import React from "react";

export function WaitingForTransactionMessage({ txHash }) {
  return (

    <div className="alert alert-info" role="alert">
      <p>
        Deployment tx hash: <strong><small>{txHash}</small></strong>
      </p>
    </div>
  );
}
