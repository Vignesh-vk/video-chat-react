import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import io from 'socket.io-client';
import './Chat.css';
import axiosInstance from '../../Axiosinstance';

const socket = io(process.env.REACT_APP_BACKEND_URL);

const Chat = () => {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [callRequest, setCallRequest] = useState(null);
  const [isCallAccepted, setIsCallAccepted] = useState(false);

  useEffect(() => {
    if (!auth.isAuthenticated) {
      navigate('/');
    }

    socket.emit('register', auth.email);

    socket.on('receive_message', (msg) => {
      if (msg.sender === activeUser || msg.receiver === activeUser) {
        setMessages((prevMessages) => [...prevMessages, msg]);
      }
    });

    socket.on('video_call_request', (data) => {
      if (data.receiver === auth.email) {
        setCallRequest({ sender: data.sender, receiver: data.receiver });
      }
    });

    socket.on('video_call_accepted', (data) => {
      if (data.sender === auth.email) {
        navigate('/video-call', {
          state: {
            senderEmail: data.sender,
            receiverEmail: data.receiver,
          },
        });
      }
    });

    socket.on('video_call_rejected_notification', (data) => {
      alert(data.message);
    });

    return () => {
      socket.off('receive_message');
      socket.off('video_call_request');
      socket.off('video_call_accepted');
    };
  }, [auth.isAuthenticated, navigate, activeUser]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axiosInstance.get('/auth');
        setUsers(response.data);
        setActiveUser(response.data[0].email);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, [auth.isAuthenticated, navigate])

  useEffect(() => {
    if (activeUser) {
      const fetchChatHistory = async () => {
        try {
          const response = await axiosInstance.get(`/messages/${auth.email}/${activeUser}`);
          setMessages(response.data);
        } catch (error) {
          console.error('Error fetching chat history:', error);
        }
      };

      fetchChatHistory();
    }
  }, [activeUser, auth.email]);

  const sendMessage = () => {
    if (auth.email && message.trim() !== '' && activeUser) {
      const msg = {
        sender: auth.email,
        receiver: activeUser,
        message: message,
        name: auth.name,
      };
      socket.emit('send_message', msg);
      setMessage('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleDashboard = () => {
    navigate('/dashboard');
  };

  const handleUserClick = (user) => {
    setActiveUser(user.email);
  };

  const handleVideoCallRequest = (receiverEmail) => {
    socket.emit('video_call_request', {
      sender: auth.email,
      receiver: receiverEmail,
    });

    navigate('/video-call', {
      state: {
        receiverEmail: receiverEmail,
        senderEmail: auth.email,
      },
    });
  };

  const acceptVideoCall = (senderEmail) => {
    setIsCallAccepted(true);
    socket.emit('video_call_accepted', {
      sender: senderEmail,
      receiver: auth.email,
    });
    navigate('/video-call', {
      state: {
        senderEmail: senderEmail,
        receiverEmail: auth.email,
      },
    });
  };

  const rejectVideoCall = (senderEmail) => {
    socket.emit('video_call_rejected_notification', {
      sender: senderEmail,
      receiver: auth.email,
    });

    console.log(`Call from ${senderEmail} has been rejected.`);

    setCallRequest(null);
  };

  return (
    <div className="chat-container">
      <div className="user-info">
        <h1>Welcome {auth.email}</h1>
        <button onClick={handleDashboard}>Dashboard</button>
        <button onClick={handleLogout} style={{marginLeft: '10px'}}>Logout</button>
      </div>
      <div className="chat-wrapper">
        <div className="users-list">
          <h2>Users</h2>
          {users.map((user) => (
            <div
              key={user.id}
              className={`user-item ${activeUser === user.email ? 'active' : ''}`}
              onClick={() => handleUserClick(user)}
            >
              {user.name}
            </div>
          ))}
        </div>

        <div className="chat-window">
          <h2>Chat with {activeUser}</h2>
          <button onClick={() => handleVideoCallRequest(activeUser)}>
            Video Call
          </button>
          <div className="messages">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={msg.sender === auth.email ? 'message-sent' : 'message-received'}
              >
                <strong>{msg.name}:</strong> {msg.message}
              </div>
            ))}
          </div>

          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message"
          />
          <button onClick={sendMessage}>Send</button>
        </div>
        {callRequest && (
          <div className="call-notification">
            <h3>{callRequest.sender} is calling you!</h3>
            <button onClick={() => acceptVideoCall(callRequest.sender)}>Accept</button>
            <button onClick={() => rejectVideoCall(callRequest.sender)}>Reject</button>
          </div>
        )}

      </div>
    </div>
  );
};

export default Chat;
// if (retryCount > 0) {
//   console.log('Retrying to join channel...');
//   setTimeout(() => joinChannel(retryCount - 1), 2000); // Retry after 2 seconds
// } else {
//   console.log('Max retries reached');
// }