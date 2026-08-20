// helpers/notifyOnComplete.js
require('dotenv').config();
const axios = require('axios');

module.exports = async function notifyOnComplete() {
  const url = process.env.STOP_CONTAINER_URL;

  if (!url) {
    console.warn('No TRIGGER_API_URL defined in .env');
    return;
  }

  try {
    const response = await axios.get(url);
    console.log('✅ Notified completion:', response.status);
  } catch (error) {
    console.error('❌ Failed to notify completion:', error.message);
  }
};
