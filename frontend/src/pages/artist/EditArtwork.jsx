import React, { useEffect, useState } from "react";
import axios from "../../api/axios";
import { useParams, useNavigate } from "react-router-dom";

function EditArtwork() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [artwork, setArtwork] = useState({
    title: "",
    description: "",
    price: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Load artwork data
  useEffect(() => {
    const fetchArtwork = async () => {
      try {
        setLoading(true);

        const res = await axios.get(`/products/${id}`);

        setArtwork({
          title: res.data.title || "",
          description: res.data.description || "",
          price: res.data.price || "",
        });

      } catch (err) {
        console.error(err);
        setError("Failed to load artwork");
      } finally {
        setLoading(false);
      }
    };

    fetchArtwork();
  }, [id]);

  // Handle input changes
  const handleChange = (field) => (e) => {
    setArtwork(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  // Submit update
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!artwork.title || !artwork.price) {
      setError("Title and price are required");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await axios.put(`/products/${id}`, artwork);

      navigate("/artist"); // back to dashboard

    } catch (err) {
      console.error(err);
      setError("Failed to update artwork");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading artwork...</div>;

  return (
    <div className="artist-container">
      <h2>Edit Artwork</h2>

      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit} className="form">

        <div className="mb-3">
          <label>Title</label>
          <input
            type="text"
            className="form-control"
            value={artwork.title}
            onChange={handleChange("title")}
          />
        </div>

        <div className="mb-3">
          <label>Description</label>
          <textarea
            className="form-control"
            value={artwork.description}
            onChange={handleChange("description")}
          />
        </div>

        <div className="mb-3">
          <label>Price</label>
          <input
            type="number"
            className="form-control"
            value={artwork.price}
            onChange={handleChange("price")}
          />
        </div>

        <button
          type="submit"
          className="btn btn-success"
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Changes"}
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

export default EditArtwork;