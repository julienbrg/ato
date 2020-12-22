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
          type="text"
          step="1"
          name="volume"
          placeholder="1"
          required
        />
      </div>
      <br />
      <input className="btn-lg btn-success mr-md-3" type="submit" value="Buy" />
      </form>
      </div>
  );
}
