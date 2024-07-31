import dotenv from 'dotenv';

dotenv.config();

const {
    AUTH_DOMAIN,
    FIREBASE_API_KEY,
    FIREBASE_PROJECT_ID,
    STORAGE_BUCKET,
    MESSAGING_SENDER_ID,
    APP_ID,
  } = process.env;
  

  export default {

    firebaseConfig: {
      apiKey: API_KEY,
      authDomain: AUTH_DOMAIN,
      projectId: PROJECT_ID,
      storageBucket: STORAGE_BUCKET,
      messagingSenderId: MESSAGING_SENDER_ID,
      appId: APP_ID,
    },
  };