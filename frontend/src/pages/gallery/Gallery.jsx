import React, { useEffect, useState } from "react";
import axios from "../api/axios";

function Gallery() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        const res = await axios.get("/products");

        setProducts(res.data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load artworks");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <div>Loading gallery...</div>;

  return (
    <div className="gallery-container">
      <h2>Art Gallery</h2>

      {error && <div className="error">{error}</div>}

      <div className="gallery-grid">
        {products.map(product => (
          <div className="gallery-card" key={product.id}>

            {/* Image */}
            {product.image ? (
              <img
                src={product.image}
                alt={product.title}
                className="gallery-image"
              />
            ) : (
              <div className="image-placeholder">No Image</div>
            )}

            {/* Info */}
            <h4>{product.title}</h4>
            <p>${product.price}</p>
            <p className="artist-name">
              by {product.artist || "Unknown"}
            </p>

            {/* Action */}
            <button className="btn btn-primary">
              View
            </button>

          </div>
        ))}
      </div>
    </div>
  );
}

export default Gallery;