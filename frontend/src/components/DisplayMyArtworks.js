import React from "react";

export function DisplayMyArtworks({ userAddr })
{
  return (
    <div><br />
      <p>
        <strong><a target="_blank" rel="noreferrer" href = {userAddr}>View all your artworks on Etherscan</a></strong>
      </p>
    </div>
  );
}
