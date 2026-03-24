import React, { useState } from "react";
import axios from "../../api/axios";
import { useNavigate } from "react-router-dom";

function UploadArtwork() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: ""
  });

  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle input change
  const handleChange = (field) => (e) => {
    setForm(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  // Handle image selection
  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title || !form.price) {
      setError("Title and price are required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("price", form.price);

      if (image) {
        formData.append("image", image);
      }

      await axios.post("/products", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      navigate("/artist");

    } catch (err) {
      console.error(err);
      setError("Failed to upload artwork");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="artist-container">
      <h2>Upload New Artwork</h2>

      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit} className="form">

        <div className="mb-3">
          <label>Title</label>
          <input
            type="text"
            className="form-control"
            value={form.title}
            onChange={handleChange("title")}
          />
        </div>

        <div className="mb-3">
          <label>Description</label>
          <textarea
            className="form-control"
            value={form.description}
            onChange={handleChange("description")}
          />
        </div>

        <div className="mb-3">
          <label>Price</label>
          <input
            type="number"
            className="form-control"
            value={form.price}
            onChange={handleChange("price")}
          />
        </div>

        <div className="mb-3">
          <label>Artwork Image</label>
          <input
            type="file"
            className="form-control"
            accept="image/*"
            onChange={handleImageChange}
          />
        </div>

        <button
          type="submit"
          className="btn btn-success"
          disabled={loading}
        >
          {loading ? "Uploading..." : "Upload"}
        </button>

        <button
          type="button"
          className="btn btn-secondary ms-2"
          onClick={() => navigate("/artist")}
        >
          Cancel
        </button>

      </form>
    </div>
  );
}

export default UploadArtwork;