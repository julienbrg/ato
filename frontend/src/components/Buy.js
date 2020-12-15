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



//
// <form>
//   <label>Quantity:</label>
//   <input
//     className="form-control"
//     type="text"
//     step="1"
//     name="volume"
//     required
//   />
//   <br />
//   <button type="button" className="btn-lg btn-success mr-md-3" onClick={
//     (volume) => this._Buy(volume);
//     volume.preventDefault();
//     const formData = new FormData(volume.target);
//     const volume = formData.get("volume");
//
//   } >Buy</button>
//
// </form>
