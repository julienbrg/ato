import React from "react";

export function Register({ Register, name, symbol, rate, metadata }) {
  return (
    <div>
      <hr />
      <h2>Register an artwork</h2>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const formData = new FormData(event.target);
          const name = formData.get("name");
          const symbol = formData.get("symbol");
          const rate = formData.get("rate");
          const metadata = formData.get("metadata");
          if (name && symbol && rate && metadata) {
            Register(name, symbol, rate, metadata);
          }
        }}
      >
      <div className="form-group">
        <p>Click on 'Proceed' to register an artwork.</p>
        <label>Name:</label>
        <input
          className="form-control"
          type="text"
          step="1"
          name="name"
          placeholder="Lode Runner #1"
          required
        />
      </div>
      <div className="form-group">
        <label>Symbol:</label>
        <input
          className="form-control"
          type="text"
          name="symbol"
          placeholder="LR1"
          required
        />
      </div>
      <div className="form-group">
        <label>Price per share (in DAI):</label>
        <input
          className="form-control"
          type="text"
          name="rate"
          placeholder="0.01"
          required
        />
      </div>
      <div className="form-group">
        <label>JSON file URL</label>
        <input
          className="form-control"
          type="text"
          name="metadata"
          placeholder="http://example.com/myJsonFile.json"
          required
        />
          <i><small> You can use this URL: <a href="https://ipfs.io/ipfs/QmfYyTACYNmFFZGbVoAT24o8pvbw5HfC1WjAeRoSdi1ZdW"> https://ipfs.io/ipfs/QmfYyTACYNmFFZGbVoAT24o8pvbw5HfC1WjAeRoSdi1ZdW</a> </small></i>

      </div>

      <br />
      <input
        className="btn-lg btn-primary"
        type="submit"
        value="Proceed"
      />
      </form>
    </div>
  );
}
