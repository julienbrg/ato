import React from "react";

export function SharesInfo({ cAddr }) {
  return (
    <div>
      <p>Your artwork shares will be available at <strong className={"text-danger"}>{cAddr}</strong></p>
    </div>
  );
}
