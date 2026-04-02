import React, { useEffect, useState, useRef } from "react";
import API from "./api";
import socket from "./socket";
import { jwtDecode } from "jwt-decode";
import "./Chat.css";

export default function Chat() {
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]); 
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const messagesEndRef = useRef(null);

  const token = localStorage.getItem("token");
  const userId = token ? jwtDecode(token).id : null;

  useEffect(() => {
    if (userId) socket.emit("join", userId);
    socket.on("receiveMessage", (data) => {
      setMessages((prev) => [...prev, data]);
      fetchRecentChats();
    });
    return () => socket.off("receiveMessage");
  }, [userId]);

  const fetchRecentChats = async () => {
    if (!userId) return;
    try {
      const res = await API.get(`/messages/conversations?userId=${userId}`); 
      setRecentUsers(res.data);
    } catch (err) { console.log(err); }
  };

  useEffect(() => { fetchRecentChats(); }, [userId]);

  const handleSearch = async (e) => {
    const q = e.target.value;
    setSearch(q);
    if (q.length > 1) {
      try {
        const res = await API.get(`/auth/search?q=${q}`);
        setSearchResults(res.data.filter((u) => u._id !== userId));
      } catch (err) { console.log(err); }
    } else { setSearchResults([]); }
  };

  const selectUser = async (user) => {
    setSelectedUser(user);
    setSearch("");
    setSearchResults([]);
    try {
      const res = await API.get(`/messages?sender=${userId}&receiver=${user._id}`);
      setMessages(res.data);
    } catch (err) { console.log(err); }
  };

  const sendMessage = () => {
    if (!msg.trim() || !selectedUser) return;
    const newMsg = { sender: userId, receiver: selectedUser._id, message: msg };
    socket.emit("sendMessage", newMsg);
    setMessages((prev) => [...prev, newMsg]);
    setMsg("");
    fetchRecentChats();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  return (
    <div className="chat-container">
      {/* SIDEBAR */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h3>Node-Talk</h3>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>

        <div className="search-container">
          <input
            className="search-input"
            placeholder="Search by username..."
            value={search}
            onChange={handleSearch}
          />
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {searchResults.length > 0 && (
            <div className="search-results-section">
              <p style={{ padding: "10px 20px", fontSize: "12px", color: "gray", fontWeight: "bold" }}>SEARCH RESULTS</p>
              {searchResults.map((u) => (
                <div key={u._id} onClick={() => selectUser(u)} className="user-card">
                  <div className="avatar">{u.name[0]}</div>
                  <div>
                    <strong>{u.name}</strong><br/>
                    <small>@{u.username}</small>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="recent-chats-section">
            <p style={{ padding: "10px 20px", fontSize: "12px", color: "gray", fontWeight: "bold" }}>RECENT CHATS</p>
            {recentUsers.length === 0 ? (
              <p style={{ padding: "20px", textAlign: "center", color: "#999", fontSize: "13px" }}>No chats yet. Search to start!</p>
            ) : (
              recentUsers.map((u) => (
                <div 
                  key={u._id} 
                  onClick={() => selectUser(u)} 
                  className={`user-card ${selectedUser?._id === u._id ? "active" : ""}`}
                >
                  <div className="avatar">{u.name[0]}</div>
                  <div>
                    <strong>{u.name}</strong><br/>
                    <small>@{u.username}</small>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* CHAT AREA */}
      <div className="chat-area">
        {selectedUser ? (
          <>
            <div className="chat-header">
              <div className="avatar" style={{ width: "35px", height: "35px", fontSize: "14px" }}>{selectedUser.name[0]}</div>
              <span>{selectedUser.name}</span>
            </div>

            <div className="messages-container">
              {messages.map((m, i) => (
                <div key={i} className={`message-bubble ${m.sender === userId ? "msg-sent" : "msg-received"}`}>
                  {m.message}
                </div>
              ))}
              <div ref={messagesEndRef}></div>
            </div>

            <div className="input-area">
              <input
                className="chat-input-field"
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
              />
              <button className="send-button" onClick={sendMessage}>
                ➤
              </button>
            </div>
          </>
        ) : (
          <div style={{ margin: "auto", textAlign: "center", color: "white", background: "rgba(0,0,0,0.4)", padding: "20px", borderRadius: "15px", backdropFilter: "blur(5px)" }}>
            <h2>Node-Talk</h2>
            <p>Select a conversation to start chatting.</p>
          </div>
        )}
      </div>
    </div>
  );
}