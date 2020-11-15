import React from "react";

export function Register({ Register, name, symbol }) {
  return (
    <div>
      <h4>Register your artwork</h4>
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
        <p>Issue 10,000 shares</p>
        <label>Name</label>
        <input
          className="form-control"
          type="text"
          step="1"
          name="name"
          placeholder="My Super Token"
          required
        />
      </div>
      <div className="form-group">
        <label>Symbol</label>
        <input className="form-control" type="text" name="symbol" placeholder="MST" required />
      </div>
      <input className="btn btn-primary" type="submit" value="Proceed" />
      </form>
      </div>
  );
}
