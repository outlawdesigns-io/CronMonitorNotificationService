process.env.NODE_ENV = process.env.NODE_ENV || 'development';
//WAMP connection
process.env.WAMPURL = process.env.WAMPURL || 'ws://localhost:8081/ws';
process.env.WAMPREALM = process.env.WAMPREALM || 'oauth2';
//Authentication API
process.env.OAUTH_DISC_URI = process.env.OAUTH_DISC_URI || 'https://auth.outlawdesigns.io/.well-known/openid-configuration';
process.env.OAUTH_SCOPE = process.env.OAUTH_SCOPE || 'openid, profile, email, roles';
process.env.CLIENT_ID = process.env.CLIENT_ID || 'cronsuite-notifications';
process.env.CLIENT_SECRET = process.env.CLIENT_SECRET || '12345';
process.env.WAMP_AUDIENCE = process.env.WAMP_AUDIENCE || 'wamp-client';
process.env.CRON_API_END = process.env.CRON_API_END || 'http://localhost:9001';
//Message API
process.env.MSG_SEND_URL = process.env.MSG_SEND_URL || 'http://localhost:9002';
//timers
process.env.API_POLL_LENGTH = process.env.API_POLL_LENGTH || 1800000;

export default {};
