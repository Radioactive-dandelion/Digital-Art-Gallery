import React, { useEffect, useState } from "react";
import axios from "../../api/axios";

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch users from User Service
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);

        const res = await axios.get("/admin/users");

        setUsers(res.data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Delete user
  const handleDelete = async (id) => {
    try {
      await axios.delete(`/admin/users/${id}`);

      setUsers(users.filter(user => user.id !== id));
    } catch (err) {
      console.error(err);
      setError("Failed to delete user");
    }
  };

  // Change role
  const handleRoleChange = async (id, newRole) => {
    try {
      await axios.put(`/admin/users/${id}/role`, { role: newRole });

      setUsers(users.map(user =>
        user.id === id ? { ...user, role: newRole } : user
      ));
    } catch (err) {
      console.error(err);
      setError("Failed to update role");
    }
  };

  if (loading) return <div>Loading users...</div>;

  return (
    <div className="admin-container">
      <h2>Manage Users</h2>

      {error && <div className="error">{error}</div>}

      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Change Role</th>
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
                <select
                  value={user.role}
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                >
                  <option value="buyer">Buyer</option>
                  <option value="artist">Artist</option>
                  <option value="admin">Admin</option>
                </select>
              </td>

              <td>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDelete(user.id)}
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

export default ManageUsers;