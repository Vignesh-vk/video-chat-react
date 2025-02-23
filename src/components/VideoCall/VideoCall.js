import React, { useEffect, useState } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { useNavigate, useLocation } from 'react-router-dom';
import io from 'socket.io-client';
import "./VideoCall.css"
import { useAuth } from '../../context/AuthContext';

const socket = io(process.env.REACT_APP_BACKEND_URL);

const VideoCall = () => {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [client, setClient] = useState(null);
  const [localAudioTrack, setLocalAudioTrack] = useState(null);
  const [localVideoTrack, setLocalVideoTrack] = useState(null);
  const [remoteAudioTrack, setRemoteAudioTrack] = useState(null);
  const [remoteVideoTrack, setRemoteVideoTrack] = useState(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isRejected, setIsRejected] = useState(false);
  const [rejectionMessage, setRejectionMessage] = useState('');

  const senderEmail = location.state?.senderEmail;
  const receiverEmail = location.state?.receiverEmail;

  useEffect(() => {
    const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
    setClient(client);

    const joinChannel = async () => {
      try {
        const appId = process.env.REACT_APP_AGORA_APP_ID;
        const channelName = 'test-channel';

        await client.join(appId, channelName, null, null);
        console.log('Joined channel successfully');

        const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
        setLocalAudioTrack(audioTrack);
        setLocalVideoTrack(videoTrack);

        const localVideoElement = document.getElementById('local-video');
        if (videoTrack && localVideoElement) {
          videoTrack.play(localVideoElement);
          console.log('Local video is playing');
        }

        await client.publish([audioTrack, videoTrack]);
        console.log('Local tracks published');

        client.on('user-published', (user, mediaType) => {
          console.log('user-published event triggered: ', user, mediaType);
          client.subscribe(user, mediaType).then(() => {
            if (mediaType === 'audio') {
              setRemoteAudioTrack(user.audioTrack);
              if (user.audioTrack) {
                user.audioTrack.play();
                console.log('Remote audio is playing');
              }
            } else if (mediaType === 'video') {
              setRemoteVideoTrack(user.videoTrack);
              const remoteVideoElement = document.getElementById('remote-video');
              if (user.videoTrack && remoteVideoElement) {
                user.videoTrack.play(remoteVideoElement);
                console.log('Remote video is playing');
              }
            }
          }).catch((err) => {
            console.error('Error subscribing to remote user media:', err);
          });
        });

      } catch (error) {
        console.error('Error joining Agora channel:', error);
      }
    };

    joinChannel();

    return () => {
      if (client) {
        client.leave();
      }
    };
  }, []);

  useEffect(() => {
    socket.on('video_call_rejected_notification', (data) => {
      if (data.receiver === auth.email && data.sender === senderEmail) {
        setIsRejected(true);
        setRejectionMessage(data.message);
      }
    });

    return () => {
      socket.off('video_call_rejected_notification');
    };
  }, [auth.email, senderEmail]);

  const handleCloseCall = () => {
    navigate('/chat');
  };

  const leaveCall = () => {
    navigate('/chat');
    window.location.reload();
    if (client) {
      if (localAudioTrack) {
        localAudioTrack.stop();
        localAudioTrack.close();
      }
      if (localVideoTrack) {
        localVideoTrack.stop();
        localVideoTrack.close();
      }

      if (remoteAudioTrack) {
        remoteAudioTrack.stop();
        remoteAudioTrack.close();
      }
      if (remoteVideoTrack) {
        remoteVideoTrack.stop();
        remoteVideoTrack.close();
      }

      client.leave()
        .then(() => {
          console.log('Left the channel successfully');
        })
        .catch((error) => {
          console.error('Error leaving the channel:', error);
        });

      setLocalAudioTrack(null);
      setLocalVideoTrack(null);
      setRemoteAudioTrack(null);
      setRemoteVideoTrack(null);
    }
  };

  const toggleAudio = () => {
    if (localAudioTrack) {
      if (isAudioMuted) {
        localAudioTrack.setMuted(false);
        client.publish([localAudioTrack]);
      } else {
        localAudioTrack.setMuted(true);
      }
      setIsAudioMuted(!isAudioMuted);
    }
  };

  const toggleVideo = () => {
    if (localVideoTrack) {
      if (isVideoOff) {
        localVideoTrack.setEnabled(true);
      } else {
        localVideoTrack.setEnabled(false);
      }
      setIsVideoOff(!isVideoOff);
    }
  };

  return (
    <div className="video-call-container">
      <h2>Video Call</h2>
      <button onClick={leaveCall}>Leave Call</button>
      <div className="controls">
        <button onClick={toggleAudio}>
          {isAudioMuted ? 'Unmute Audio' : 'Mute Audio'}
        </button>
        <button onClick={toggleVideo}>
          {isVideoOff ? 'Turn Video On' : 'Turn Video Off'}
        </button>
      </div>

      <div className="video-container">
        <div
          id="local-video"
          style={{
            width: '300px',
            height: '300px',
            backgroundColor: '#000',
            border: '1px solid #fff',
          }}
        ></div>

        <div
          id="remote-video"
          style={{
            width: '300px',
            height: '300px',
            backgroundColor: '#000',
            border: '1px solid #fff',
          }}
        ></div>
      </div>
    </div>
  );
};

export default VideoCall;
