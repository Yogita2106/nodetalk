import React, { useState, useEffect } from "react";
import Auth from "./Auth";
import Chat from "./Chat"; //

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <div>
      {!user ? (
        <Auth onLoginSuccess={handleLoginSuccess} />
      ) : (
        <Chat currentUser={user} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;