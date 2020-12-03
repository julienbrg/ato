import React from "react";

export function Admin({ Admin, creatorID, artworkID }) {
  return (


    <div className="alert alert-danger">

      <h2>Admin</h2>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const formData = new FormData(event.target);
          const creatorID = formData.get("creatorID");
          const artworkID = formData.get("artworkID");
          if (artworkID && artworkID) {
            Admin(artworkID, artworkID);
          }
        }}
      >
      <div className="form-group">
        <p><i>Verify an artwork</i></p>
        <label>creatorID</label>
        <input
          className="form-control"
          type="text"
          step="1"
          name="creatorID"
          placeholder="1"
          required
        />
      </div>
      <div className="form-group">
        <label>artworkID</label>
        <input className="form-control" type="text" name="artworkID" placeholder="0" required />
      </div>
      <input className="btn-sm btn-danger" type="submit" value="Verify" />

      </form>
      <br />

      </div>
  );
}
