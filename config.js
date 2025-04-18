process.env.NODE_ENV = process.env.NODE_ENV || 'development';
//WAMP connection
process.env.WAMPURL = process.env.WAMPURL || 'wss://localhost:9700/ws';
process.env.WAMPREALM = process.env.WAMPREALM || 'realm1';
//Authentication API
process.env.OD_ACCOUNTS_BASE_URL = process.env.AUTH_END || 'https://localhost:9661';
//Credentials
process.env.OD_ACCOUNTS_USER = process.env.OD_ACCOUNTS_USER || 'test';
process.env.OD_ACCOUNTS_PASS = process.env.OD_ACCOUNTS_PASS || 'test'
//CRON API
process.env.CRON_API_END = process.env.CRON_API_END || 'https://localhost:9550';
//Message API
process.env.MSG_SEND_URL = process.env.MSG_SEND_URL || 'https://localhost:9667/send';

export default {
  DB_POLL_LENGTH: 600000,
};
