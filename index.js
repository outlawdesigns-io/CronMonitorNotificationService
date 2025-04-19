import autobahn from 'autobahn';
import axios from 'axios';
import cronClient from  '@outlawdesigns/cronmonitor-rest-client';

import config from './config.js';

const wampConn = new autobahn.Connection({
  url:process.env.WAMPURL,
  realm:process.env.WAMPREALM
});

cronClient.init(process.env.CRON_API_END);
cronClient.get().auth.init();
let auth_token = await cronClient.get().auth.authenticate();
cronClient.get().auth.onTokenUpdate((newToken)=>{
  auth_token = newToken;
});

const POLL_LENGTH = config.DB_POLL_LENGTH;
let eventTypes = [];
let subscriptions = [];


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
async function _sendMessage(message,auth_token){
  const url = process.env.MSG_SEND_URL;
  const headers = {
    'auth_token':auth_token,
    'Content-Type':'application/json'
  };
  const response = await axios.post(url,message,{ headers:headers });
  console.log(response.data);
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

wampConn.onopen = async (session)=>{

  console.log('Connected to WAMP router...');
  eventTypes = await cronClient.get().events.getAll();
  subscriptions = (await cronClient.get().subscriptions.getAll()).map((e)=>{
    e.eventObj = eventTypes.filter(f => f.id === e.eventId)[0];
    return e;
  });
  console.log(`${subscriptions.length} subscriptions retrieved...`);

  session.subscribe('io.outlawdesigns.cron.executionMissed',async (data)=>{
    let relevantSubs = subscriptions.filter(e => e.eventObj.name == 'io.outlawdesigns.cron.executionMissed');
    if(relevantSubs.length === 0){
      return;
    }
    let job = data[0];
    let avgExecSec = await cronClient.get().jobs.getAvgExecution(job.id);
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

  session.subscribe('io.outlawdesigns.cron.illegalExecution',async (data)=>{
    let relevantSubs = subscriptions.filter(e => e.eventObj.name == 'io.outlawdesigns.cron.illegalExecution');
    if(relevantSubs.length === 0){
      return;
    }
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

  session.subscribe('io.outlawdesigns.cron.executionComplete',async (data)=>{
    let relevantSubs = subscriptions.filter(e => e.eventObj.name == 'io.outlawdesigns.cron.executionComplete');
    if(relevantSubs.length === 0){
      return;
    }
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

  session.subscribe('io.outlawdesigns.cron.jobDeleted',async (data)=>{
    let relevantSubs = subscriptions.filter(e => e.eventObj.name == 'io.outlawdesigns.cron.jobDeleted');
    if(relevantSubs.length === 0){
      return;
    }
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

  session.subscribe('io.outlawdesigns.cron.jobChanged',async (data)=>{
    let relevantSubs = subscriptions.filter(e => e.eventObj.name == 'io.outlawdesigns.cron.jobChanged');
    if(relevantSubs.length === 0){
      return;
    }
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

  session.subscribe('io.outlawdesigns.cron.jobCreated',async (data)=>{
    let relevantSubs = subscriptions.filter(e => e.eventObj.name == 'io.outlawdesigns.cron.jobCreated');
    if(relevantSubs.length === 0){
      return;
    }
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
    const updatedSubs = await cronClient.get().subscriptions.getAll();
    if(updatedSubs.length !== subscriptions.length){
      subscriptions = updatedSubs.map((e)=>{
        e.eventObj = eventTypes.filter(f => f.id === e.eventId)[0];
        return e;
      });
    }
  },POLL_LENGTH);
}

wampConn.open();

//send a custom useragent string to identify this app.

// (async ()=>{
//   let subs = await _getSubscriptions();
//   let relevantSubs = subs.filter(e => e.eventObj.name == 'io.outlawdesigns.cron.executionMissed');
//   console.log(relevantSubs);
// })();
