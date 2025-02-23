This app is a simple chat application where users can send and receive messages in real-time.

Features
    User authentication and registration
    Real-time messaging using Socket.IO
    Video calling feature with Agora SDK integration
    Responsive UI using CSS Flexbox/Grid
    User-friendly interface
    
Installation
    To get the app up and running on your local machine, follow these steps:

Clone the repository:
    git clone https://github.com/Vignesh-vk/video-chat-react.git

Install dependencies:
    npm install

Environment Variables
    You will need to configure the following environment variables for the app to work correctly:

    REACT_APP_BACKEND_URL=http://localhost:5000
    REACT_APP_AGORA_APP_ID= 5a6ee7d42981401c952d2d2982123c83

Start the development server:
    npm start
    This will run the app on http://localhost:3000 by default.

Usage
    Once the app is running, open your browser and visit http://localhost:3000 to start using the app. You should see the homepage with all available features (e.g., login/signup forms, messaging, video call, etc.).