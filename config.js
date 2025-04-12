module.exports = {
  development:{
    CRON_API_END: process.env.CRON_API_END || 'http://localhost:9500'
    AUTH_END: process.env.AUTH_END || 'http://localhost:9661',
    MSG_SEND_URL: process.env.MSG_SEND_URL || 'http://localhost:9667/send',
    WAMPURL: process.env.WAMPURL || 'wss://localhost:9700/ws',
    WAMPREALM: process.env.WAMPREALM || 'realm1',
    DB_POLL_LENGTH: 600000,
    OD_USER:process.env.OD_USER || 'test',
    OD_PASS:process.env.OD_PASS || 'test'
  },
  testing:{
    CRON_API_END: process.env.CRON_API_END || 'http://localhost:9500'
    AUTH_END: process.env.AUTH_END || 'http://localhost:9661',
    MSG_SEND_URL: process.env.MSG_SEND_URL || 'http://localhost:9667/send',
    WAMPURL: process.env.WAMPURL || 'wss://localhost:9700/ws',
    WAMPREALM: process.env.WAMPREALM || 'realm1',
    DB_POLL_LENGTH: 600000,
    OD_USER:process.env.OD_USER || 'test',
    OD_PASS:process.env.OD_PASS || 'test'
  },
  production:{
    CRON_API_END: process.env.CRON_API_END || 'http://localhost:9500'
    AUTH_END: process.env.AUTH_END || 'http://localhost:9661',
    MSG_SEND_URL: process.env.MSG_SEND_URL || 'http://localhost:9667/send',
    WAMPURL: process.env.WAMPURL || 'wss://localhost:9700/ws',
    WAMPREALM: process.env.WAMPREALM || 'realm1',
    DB_POLL_LENGTH: 600000,
    OD_USER:process.env.OD_USER || 'test',
    OD_PASS:process.env.OD_PASS || 'test'
  }
};
