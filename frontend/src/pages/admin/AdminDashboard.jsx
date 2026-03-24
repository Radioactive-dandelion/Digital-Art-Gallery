import React, { useEffect, useState } from "react";
import axios from "../../api/axios";

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch users (User Service)
        const usersRes = await axios.get("/admin/users");

        // Fetch products (Product Service)
        const productsRes = await axios.get("/admin/products");

        setUsers(usersRes.data || []);
        setProducts(productsRes.data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load admin data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Delete user
  const handleDeleteUser = async (id) => {
    try {
      await axios.delete(`/admin/users/${id}`);
      setUsers(users.filter(user => user.id !== id));
    } catch (err) {
      console.error(err);
      setError("Failed to delete user");
    }
  };

  // Delete product
  const handleDeleteProduct = async (id) => {
    try {
      await axios.delete(`/admin/products/${id}`);
      setProducts(products.filter(p => p.id !== id));
    } catch (err) {
      console.error(err);
      setError("Failed to delete product");
    }
  };

  if (loading) return <div>Loading admin panel...</div>;

  return (
    <div className="admin-container">
      <h2>Admin Dashboard</h2>

      {error && <div className="error">{error}</div>}

      {/* USERS */}
      <div className="admin-section">
        <h3>Users</h3>

        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PRODUCTS */}
      <div className="admin-section">
        <h3>Artworks</h3>

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
            {products.map(product => (
              <tr key={product.id}>
                <td>{product.id}</td>
                <td>{product.title}</td>
                <td>${product.price}</td>
                <td>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDeleteProduct(product.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminDashboard;