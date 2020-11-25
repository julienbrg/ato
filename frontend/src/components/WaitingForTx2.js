import React from "react";

export function WaitingForTx2({ txHash }) {
  return (
    <div className="alert alert-info" role="alert">
      <p>
        Your artwork is being registered . . .
      </p>
    </div>
  );
}
