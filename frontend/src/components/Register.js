import React from "react";

export function Register({ Register, name, symbol }) {
  return (
    <div>
      <hr />
      <h2>Register your artwork</h2>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const formData = new FormData(event.target);
          const name = formData.get("name");
          const symbol = formData.get("symbol");
          const rate = formData.get("rate");
          const volume = formData.get("volume");
          if (name && symbol && rate && volume) {
            Register(name, symbol, rate, volume);
          }
        }}
      >
      <div className="form-group">
        <p>Click on 'Proceed' to register your artwork.</p>
        <label>Name:</label>
        <input
          className="form-control"
          type="text"
          step="1"
          name="name"
          placeholder="Mona Lisa"
          required
        />
      </div>
      <div className="form-group">
        <label>Symbol:</label>
        <input className="form-control" type="text" name="symbol" placeholder="ML" required />
      </div>
      <div className="form-group">
        <label>Price per share (in USD):</label>
        <input className="form-control" type="text" name="rate" placeholder="0.01" required />
      </div>
      <div className="form-group">
        <label>JSON file URL</label>
        <input className="form-control" type="text" name="volume" placeholder="http://example.com/monalisa.json" required />
      </div>
      <br />
      <input className="btn-lg btn-primary" type="submit" value="Proceed" />
      </form>
      </div>
  );
}
