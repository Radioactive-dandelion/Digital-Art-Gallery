import React, { useEffect, useState } from "react";
import axios from "../../api/axios";

function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch products from Product Service
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        const res = await axios.get("/products");

        setProducts(res.data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Delete product
  const handleDelete = async (id) => {
    try {
      await axios.delete(`/products/${id}`);

      // Remove from UI
      setProducts(products.filter(p => p.id !== id));

    } catch (err) {
      console.error(err);
      setError("Failed to delete product");
    }
  };

  if (loading) return <div>Loading products...</div>;

  return (
    <div className="admin-container">
      <h2>Manage Artworks</h2>

      {error && <div className="error">{error}</div>}

      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Price</th>
            <th>Artist</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {products.map(product => (
            <tr key={product.id}>
              <td>{product.id}</td>
              <td>{product.title}</td>
              <td>${product.price}</td>
              <td>{product.artist || "Unknown"}</td>

              <td>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDelete(product.id)}
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

export default ManageProducts;