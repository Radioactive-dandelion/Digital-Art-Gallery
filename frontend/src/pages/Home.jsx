import React from "react";
import { Link } from "react-router-dom";

function Home() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  return (
    <div className="home-container">
      <div className="home-message">

        {token ? (
          <div className="welcome-message">
            <h3>Welcome back!</h3>

            <Link to="/gallery" className="home-btn">
              Go to Gallery
            </Link>

            <Link to="/profile" className="home-btn">
              My Profile
            </Link>

            {role === "artist" && (
              <Link to="/artist" className="home-btn">
                Artist Dashboard
              </Link>
            )}

            {role === "admin" && (
              <Link to="/admin" className="home-btn">
                Admin Panel
              </Link>
            )}

          </div>
        ) : (
          <div className="unauthorized-message">
            <h3>Welcome to Digital Art Gallery</h3>
            <p>Discover and purchase unique artworks</p>

            <Link to="/login" className="home-btn login-btn">
              Login
            </Link>

            <Link to="/register" className="home-btn">
              Register
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}

export default Home;