import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import { useParams } from "react-router-dom";

function ArtworkDetails() {
  const { id } = useParams();

  const [artwork, setArtwork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchArtwork = async () => {
      try {
        setLoading(true);

        const res = await axios.get(`/products/${id}`);

        setArtwork(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load artwork");
      } finally {
        setLoading(false);
      }
    };

    fetchArtwork();
  }, [id]);

  if (loading) return <div>Loading artwork...</div>;
  if (error) return <div>{error}</div>;
  if (!artwork) return <div>Artwork not found</div>;

  return (
    <div className="artwork-details-container">
      
      {/* Image */}
      <div className="artwork-image">
        {artwork.image ? (
          <img src={artwork.image} alt={artwork.title} />
        ) : (
          <div className="image-placeholder">No Image</div>
        )}
      </div>

      {/* Info */}
      <div className="artwork-info">
        <h2>{artwork.title}</h2>
        <p className="artist-name">
          by {artwork.artist || "Unknown"}
        </p>

        <h3>${artwork.price}</h3>

        <p className="description">
          {artwork.description || "No description"}
        </p>

        {/* Action */}
        <button className="btn btn-primary">
          Buy Now
        </button>
      </div>

    </div>
  );
}

export default ArtworkDetails;