import React, { useEffect, useState } from "react";
import axios from "../../api/axios";
import { useNavigate } from "react-router-dom";

function ArtistDashboard() {
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // Fetch artist artworks
  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        setLoading(true);

        const res = await axios.get("/artist/products");

        setArtworks(res.data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load artworks");
      } finally {
        setLoading(false);
      }
    };

    fetchArtworks();
  }, []);

  // Delete artwork
  const handleDelete = async (id) => {
    try {
      await axios.delete(`/products/${id}`);

      setArtworks(artworks.filter(a => a.id !== id));
    } catch (err) {
      console.error(err);
      setError("Failed to delete artwork");
    }
  };

  if (loading) return <div>Loading your artworks...</div>;

  return (
    <div className="artist-container">
      <h2>Artist Dashboard</h2>

      {error && <div className="error">{error}</div>}

      {/* Create new artwork */}
      <button
        className="btn btn-primary mb-3"
        onClick={() => navigate("/artist/upload")}
      >
        + Upload New Artwork
      </button>

      {/* Artworks list */}
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Price</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {artworks.map(art => (
            <tr key={art.id}>
              <td>{art.id}</td>
              <td>{art.title}</td>
              <td>${art.price}</td>

              <td>
                <button
                  className="btn btn-warning me-2"
                  onClick={() => navigate(`/artist/edit/${art.id}`)}
                >
                  Edit
                </button>

                <button
                  className="btn btn-danger"
                  onClick={() => handleDelete(art.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ArtistDashboard;