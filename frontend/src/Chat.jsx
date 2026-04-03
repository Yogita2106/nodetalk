import React, { useEffect, useState, useRef } from "react";
import API from "./api";
import socket from "./socket";
import { jwtDecode } from "jwt-decode";
import { Send, Search, LogOut, MessageSquare, User as UserIcon } from "lucide-react";
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
      const res = await API.get(`https://chatapp-2csn.onrender.com/api/messages/conversations?userId=${userId}`); 
      setRecentUsers(res.data);
    } catch (err) { console.log(err); }
  };

  useEffect(() => { fetchRecentChats(); }, [userId]);

  const handleSearch = async (e) => {
    const q = e.target.value;
    setSearch(q);
    if (q.length > 1) {
      try {
        const res = await API.get(`https://chatapp-2csn.onrender.com/api/auth/search?q=${q}`);
        setSearchResults(res.data.filter((u) => u._id !== userId));
      } catch (err) { console.log(err); }
    } else { setSearchResults([]); }
  };

  const selectUser = async (user) => {
    setSelectedUser(user);
    setSearch("");
    setSearchResults([]);
    try {
      const res = await API.get(`https://chatapp-2csn.onrender.com/api/messages?sender=${userId}&receiver=${user._id}`);
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

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  return (
    <div className="chat-layout">
      <aside className="sidebar-modern">
        <header className="sidebar-head">
          <div className="brand">
            <MessageSquare color="#fff" />
            <span>NodeTalk</span>
          </div>
          <button className="icon-btn-logout" onClick={() => { localStorage.clear(); window.location.reload(); }}>
            <LogOut size={20} />
          </button>
        </header>

        <div className="search-box-wrapper">
          <Search size={18} className="search-icon" />
          <input placeholder="Search friends..." value={search} onChange={handleSearch} />
        </div>

        <div className="user-list-scroll">
          {searchResults.length > 0 && (
            <div className="section-wrap">
              <label>Search Results</label>
              {searchResults.map((u) => (
                <div key={u._id} onClick={() => selectUser(u)} className="user-item">
                  <div className="avatar-circle">{u.name[0]}</div>
                  <div className="user-info">
                    <h5>{u.name}</h5>
                    <span>@{u.username}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="section-wrap">
            <label>Recent Conversations</label>
            {recentUsers.map((u) => (
              <div key={u._id} onClick={() => selectUser(u)} className={`user-item ${selectedUser?._id === u._id ? "active" : ""}`}>
                <div className="avatar-circle">{u.name[0]}</div>
                <div className="user-info">
                  <h5>{u.name}</h5>
                  <span>View profile</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      <main className="main-chat-window">
        {selectedUser ? (
          <>
            <header className="chat-top-bar">
              <div className="avatar-small">{selectedUser.name[0]}</div>
              <div className="status-info">
                <h4>{selectedUser.name}</h4>
                <p>Online</p>
              </div>
            </header>

            <div className="messages-area">
              {messages.map((m, i) => (
                <div key={i} className={`bubble-wrap ${m.sender === userId ? "sent" : "received"}`}>
                  <div className="bubble-content">{m.message}</div>
                </div>
              ))}
              <div ref={messagesEndRef}></div>
            </div>

            <footer className="input-dock">
              <input
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Write a message..."
              />
              <button className="btn-send-msg" onClick={sendMessage}>
                <Send size={20} />
              </button>
            </footer>
          </>
        ) : (
          <div className="no-chat-state">
            <div className="welcome-box">
              <MessageSquare size={48} color="#667eea" />
              <h3>Start a Conversation</h3>
              <p>Select a user from the sidebar to begin chatting securely.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}