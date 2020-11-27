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
          if (name && symbol) {
            Register(name, symbol);
          }
        }}
      >
      <div className="form-group">
        <p>Choose a name and a symbol for your artwork, then click on 'Proceed' to register it.</p>
        <label>Name</label>
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
        <label>Symbol</label>
        <input className="form-control" type="text" name="symbol" placeholder="ML" required />
      </div>
      <input className="btn btn-primary" type="submit" value="Proceed" />
      </form>
      </div>
  );
}
