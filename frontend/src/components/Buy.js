import React from "react";

export function Buy({ Buy, volume }) {
  return (
    <div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const formData = new FormData(event.target);
          const volume = formData.get("volume");
          if (volume) {
            Buy(volume);
          }
        }}
      >
      <div className="form-group">

        <p>How many shares do you want to buy?</p>

        <input
          className="form-control"
          type="number"
          step="1"
          name="volume"
          placeholder="30"
          required
          min="10"
          max="1000"
        />

          <p><i>
              <small>

                  <p>When you buy shares of this artwork, you get a chance to win the NFT. </p>
                  <p class="text-danger">All ATO holders get a 50% discount.</p>
              </small>

          </i></p>


      </div>

      <input className="btn-lg btn-success mr-md-3" type="submit" value="Buy" />
      </form>
      </div>
  );
}
