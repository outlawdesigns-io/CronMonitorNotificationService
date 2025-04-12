const autobahn = require('autobahn');
const axios = require('axios');

global.config = require('./config');

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const wampConn = new autobahn.Connection({
  url:global.config[process.env.NODE_ENV].WAMPURL,
  realm:global.config[process.env.NODE_ENV].WAMPREALM
});

/*
publish authclient
replace check token
build cronCLient
replace those.
*/


function _setMsgRecipients(subscription,msgObj){
  msgObj['to'] = subscription.recipient.split(';');
  if(subscription.recipient_cc !== null){
    msgObj['cc'] = subscription.recipient_cc.split(';');
  }
  if(subscription.recipient_bcc !== null){
    msgObj['bcc'] = subscription.recipient_bcc.split(';');
  }
  return msgObj;
}
async function _checkToken(auth_token,username,password){
  const verifyUrl = `${global.config[process.env.NODE_ENV].AUTH_END}/verify`;
  const authUrl = `${global.config[process.env.NODE_ENV].AUTH_END}/authenticate`;
  let headers = {'auth_token':auth_token};
  let response = await axios.get(verifyUrl,{headers:headers});
  if(response.status == 200 && !response.data.error){
    return auth_token;
  }else if(response.status == 200 && response.data.error && response.data.error.includes('Invalid Token')){
    headers = {'request_token':username, 'password':password};
    response = await axios.get(authUrl,{headers:headers});
    if(response.status == 200 && !response.data.error){
      return response.data.token;
    }
  }
  //you should always return on one of the two prior conditions.
  throw new Error(response.data);
}
async function _getSubscriptions(auth_token){
  const url = `${global.config[process.env.NODE_ENV].CRON_API_END}/subscription`;
  let headers = {'auth_token':auth_token};
  let response = await axios.get(url,{headers:headers});
  if(response.status == 200 && !response.data.error){
    return response.data;
  }
  throw new Error('Unexpected subscription retrieval condition.');
}
async function _getAvgExecSec(id,auth_token){
  const url = `${global.config[process.env.NODE_ENV].CRON_API_END}/job/${id}/avg`;
  let headers = {'auth_token':auth_token};
  let response = await axios.get(url,{headers:headers});
  if(response.status == 200 && !response.data.error){
    return response.data.avg_execution_seconds;
  }
  throw new Error('Unexpected subscription retrieval condition.');
}
async function _sendMessage(message,auth_token){
  const url = global.config[process.env.NODE_ENV].MSG_SEND_URL;
  const headers = {
    'auth_token':auth_token,
    'Content-Type':'application/json'
  };
  const response = await axios.post(url,message,{ headers:headers });
  return response.data;
}

//DYNAMIC APPROACH
/*function _buildMsgBody(event, data){
  //todo: implement
}
wampConn.onopen = async (session)=>{
  let eventList = await ModelFactory.getClass('event').getAll();
  for(let e in eventList){
    session.subscribe(eventList[e].name,(data)=>{
      _buildMsgBody(eventList[e],data);
    });
  }
}*/

//STATIC APPROACH
const POLL_LENGTH = global.config[process.env.NODE_ENV].DB_POLL_LENGTH;
const OD_USER = global.config[process.env.NODE_ENV].OD_USER;
const OD_PASS = global.config[process.env.NODE_ENV].OD_PASS;

let subscriptions = [];
let auth_token = '1234';

wampConn.onopen = async (session)=>{
  console.log('Connected to WAMP router...');
  subscriptions = await _getSubscriptions(auth_token);
  console.log(`${subscriptions.length} subscriptions retrieved...`);
  auth_token = await _checkToken(auth_token,OD_USER,OD_PASS);
  console.log('Messeage Service token retrieved...');
  session.subscribe('io.outlawdesigns.cron.executionMissed',async (data)=>{
    let relevantSubs = subscriptions.filter(e => e.event_name == 'io.outlawdesigns.cron.executionMissed');
    if(relevantSubs.length === 0){
      return;
    }
    auth_token = await _checkToken(auth_token,OD_USER,OD_PASS);
    let job = data[0];
    let avgExecSec = await _getAvgExecSec(job.id,auth_token);
    let msgBody = `${job.title} has exceeded expected execution time of ${avgExecSec} seconds and is presumed failed. See ${job.hostname}:${job.outfile} for more details.`;
    for(let i in relevantSubs){
      let sub = relevantSubs[i];
      let msgObj = _setMsgRecipients(sub,{
        subject:'Cron Monitor: Job Execution Missed',
        msg_name:'io.outlawdesigns.cron.executionMissed',
        body:msgBody,
        flag:`${job.id}_`
      });
      _sendMessage(msgObj,auth_token);
      console.log('io.outlawdesigns.cron.executionMissed message sent...');
    }
  });
  session.subscribe('io.outlawdesigns.cron.illegalExecution',(data)=>{
    let relevantSubs = subscriptions.filter(e => e.event_name == 'io.outlawdesigns.cron.illegalExecution');
    if(relevantSubs.length === 0){
      return;
    }
    auth_token = await _checkToken(auth_token,OD_USER,OD_PASS);
    let execution = data[0];
    let msgBody = `An execution has been created for a disabled or unregistered job with ID: ${execution.jobId}`;
    for(let i in relevantSubs){
      let sub = relevantSubs[i];
      _sendMessage(_setMsgRecipients(sub,{
        subject:'Cron Monitor: Illegal Execution',
        msg_name:'io.outlawdesigns.cron.illegalExecution',
        body:msgBody,
      }),auth_token);
      console.log('io.outlawdesigns.cron.illegalExecution message sent...');
    }
  });
  session.subscribe('io.outlawdesigns.cron.executionComplete',(data)=>{
    let relevantSubs = subscriptions.filter(e => e.event_name == 'io.outlawdesigns.cron.executionComplete');
    if(relevantSubs.length === 0){
      return;
    }
    auth_token = await _checkToken(auth_token,OD_USER,OD_PASS);
    let job = data[0];
    let execution = data[1];
    let msgBody = `${job.title} has executed on-schedule. Ouptut: ${execution.output}`;
    for(let i in relevantSubs){
      let sub = relevantSubs[i];
      _sendMessage(_setMsgRecipients(sub,{
        subject:'Cron Monitor: Execution Complete',
        msg_name:'io.outlawdesigns.cron.executionComplete',
        body:msgBody,
        flag:`${job.id}_${execution.id}`
      }),auth_token);
      console.log('io.outlawdesigns.cron.illegalExecution message sent...');
    }
  });
  session.subscribe('io.outlawdesigns.cron.jobDeleted',(data)=>{
    let relevantSubs = subscriptions.filter(e => e.event_name == 'io.outlawdesigns.cron.jobDeleted');
    if(relevantSubs.length === 0){
      return;
    }
    auth_token = await _checkToken(auth_token,OD_USER,OD_PASS);
    let job = data[0];
    let msgBody = ``;
    for(let i in relevantSubs){
      let sub = relevantSubs[i];
      _sendMessage(_setMsgRecipients(sub,{
        subject: 'Cron Monitor: Job Deleted',
        msg_name:'io.outlawdesigns.cron.jobDeleted',
        body:msgBody
      }),auth_token);
    }
  });
  session.subscribe('io.outlawdesigns.cron.jobChanged',(data)=>{
    let relevantSubs = subscriptions.filter(e => e.event_name == 'io.outlawdesigns.cron.jobChanged');
    if(relevantSubs.length === 0){
      return;
    }
    auth_token = await _checkToken(auth_token,OD_USER,OD_PASS);
    let oldJob = data[0];
    let newJob = data[1];
    let msgBody = ``;
    for(let i in relevantSubs){
      let sub = relevantSubs[i];
      _sendMessage(_setMsgRecipients(sub,{
        subject: 'Cron Monitor: Job Changed',
        msg_name:'io.outlawdesigns.cron.jobChanged',
        body:msgBody
      }),auth_token);
    }
  });
  session.subscribe('io.outlawdesigns.cron.jobCreated',(data)=>{
    let relevantSubs = subscriptions.filter(e => e.event_name == 'io.outlawdesigns.cron.jobCreated');
    if(relevantSubs.length === 0){
      return;
    }
    auth_token = await _checkToken(auth_token,OD_USER,OD_PASS);
    let job = data[0];
    let msgBody = ``;
    for(let i in relevantSubs){
      let sub = relevantSubs[i];
      _sendMessage(_setMsgRecipients(sub,{
        subject: 'Cron Monitor: Job Created',
        msg_name:'io.outlawdesigns.cron.jobCreated',
        body:msgBody
      }),auth_token);
    }
  });
  setInterval(async ()=>{
    auth_token = await _checkToken(auth_token,OD_USER,OD_PASS);
    const updatedSubs = await _getSubscriptions(auth_token);
    if(updatedSubs.length !== subscriptions.length){
      subscriptions = updatedSubs;
    }
  },POLL_LENGTH);
}

wampConn.open();

//send a custom useragent string to identify this app.

// (async ()=>{
//   let subs = await _getSubscriptions();
//   let relevantSubs = subs.filter(e => e.event_name == 'io.outlawdesigns.cron.executionMissed');
//   console.log(relevantSubs);
// })();
