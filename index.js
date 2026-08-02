import { setTimeout } from 'node:timers/promises';
import autobahn from 'autobahn';
import axios from 'axios';
import cronClient from  '@outlawdesigns/cronmonitor-rest-client';
import templatePopulator from './templatePopulator.js';
import config from './config.js';

const resources = [process.env.MSG_SEND_URL,process.env.WAMP_AUDIENCE];

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
  const url = `${process.env.MSG_SEND_URL}/send`;
  const headers = {
    'Authorization':`Bearer ${auth_token}`,
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

//^ I think we can make this work if we ensure templatePopulator methods match event name

//STATIC APPROACH

async function executionMissedHandler(data){
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
    _sendMessage(msgObj,cronClient.get().auth.getAccessToken());
    console.log('io.outlawdesigns.cron.executionMissed message sent...');
  }
}
async function jobChangedHandler(data){
  let relevantSubs = subscriptions.filter(e => e.eventObj.name == 'io.outlawdesigns.cron.jobChanged');
  if(relevantSubs.length === 0){
    return;
  }
  let oldJob = data[0];
  let newJob = data[1];
  let msgBody = templatePopulator.jobChanged(oldJob,newJob);
  for(let i in relevantSubs){
    let sub = relevantSubs[i];
    _sendMessage(_setMsgRecipients(sub,{
      subject: 'Cron Monitor: Job Changed',
      msg_name:'io.outlawdesigns.cron.jobChanged',
      body:msgBody
    }),cronClient.get().auth.getAccessToken());
  }
}
async function illegalExecutionHandler(data){
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
    }),cronClient.get().auth.getAccessToken());
    console.log('io.outlawdesigns.cron.illegalExecution message sent...');
  }
}
async function executionCompleteHandler(data){
  let relevantSubs = subscriptions.filter(e => e.eventObj.name == 'io.outlawdesigns.cron.executionComplete');
  if(relevantSubs.length === 0){
    return;
  }
  let job = data[0];
  let execution = data[1];
  let msgBody = templatePopulator.executionComplete(job,execution);
  for(let i in relevantSubs){
    let sub = relevantSubs[i];
    _sendMessage(_setMsgRecipients(sub,{
      subject:'Cron Monitor: Execution Complete',
      msg_name:'io.outlawdesigns.cron.executionComplete',
      body:msgBody,
      flag:`${job.id}_${execution.id}`
    }),cronClient.get().auth.getAccessToken());
    console.log('io.outlawdesigns.cron.executionComplete message sent...');
  }
}
async function jobDeletedHandler(data){
  let relevantSubs = subscriptions.filter(e => e.eventObj.name == 'io.outlawdesigns.cron.jobDeleted');
  if(relevantSubs.length === 0){
    return;
  }
  let job = data[0];
  let msgBody = templatePopulator.jobDeleted(job);
  for(let i in relevantSubs){
    let sub = relevantSubs[i];
    _sendMessage(_setMsgRecipients(sub,{
      subject: 'Cron Monitor: Job Deleted',
      msg_name:'io.outlawdesigns.cron.jobDeleted',
      body:msgBody
    }),cronClient.get().auth.getAccessToken());
  }
}
async function jobCreatedHandler(data){
  let relevantSubs = subscriptions.filter(e => e.eventObj.name == 'io.outlawdesigns.cron.jobCreated');
  if(relevantSubs.length === 0){
    return;
  }
  let job = data[0];
  let msgBody = templatePopulator.newJob(job);
  for(let i in relevantSubs){
    let sub = relevantSubs[i];
    _sendMessage(_setMsgRecipients(sub,{
      subject: 'Cron Monitor: Job Created',
      msg_name:'io.outlawdesigns.cron.jobCreated',
      body:msgBody
    }),cronClient.get().auth.getAccessToken());
  }
}
async function intervalHandler(){
  let retrievedSubs;
  try{
    eventTypes = await cronClient.get().events.getAll();
    retrievedSubs = await cronClient.get().subscriptions.getAll();
  }catch(err){
    //why doesn't this get intercepted?
    console.log(`${new Date().toLocaleString()}: ${err?.response?.data || err.message}`);
    //await cronClient.get().auth.clientCredentialFlow(scope,[...resources,process.env.CRON_API_END]);
    return;
  }
  subscriptions = retrievedSubs.filter(e => !e.disabled).map((e)=>{
    e.eventObj = eventTypes.find(f => f.id === e.eventId);
    return e;
  });
  //console.log(`Subscription list retrieved from cron-service api. ${subscriptions.length} subscriptions in list...`);
}
function tokenRefreshHandler(tokenSet){
  console.log('cron-service api access_token updated...');
}

const wampConn = new autobahn.Connection({
  url:process.env.WAMPURL,
  realm:process.env.WAMPREALM,
  authmethods: ['ticket'],
  authid: process.env.CLIENT_ID,
  onchallenge: function(session,method,extra){
    console.log('wamp router challenge received...');
    return cronClient.get().auth.getAccessToken();
  }
});

wampConn.onopen = async (session)=>{

  console.log('Connected to WAMP router...');
  intervalHandler();
  try{
    await session.subscribe('io.outlawdesigns.cron.executionMissed',executionMissedHandler);
    await session.subscribe('io.outlawdesigns.cron.jobChanged',jobChangedHandler);
    await session.subscribe('io.outlawdesigns.cron.illegalExecution',illegalExecutionHandler);
    await session.subscribe('io.outlawdesigns.cron.executionComplete',executionCompleteHandler);
    await session.subscribe('io.outlawdesigns.cron.jobDeleted',jobDeletedHandler);
    await session.subscribe('io.outlawdesigns.cron.jobCreated',jobCreatedHandler);
  }catch(err){
    console.log(`Subscriptions failed...`);
    console.error(err);
    wampConn.close();
    return;
  }
  try{
    setInterval(intervalHandler,POLL_LENGTH);
  }catch(err){
    //would this ever actually do anything? You've already succesfully called intervalHandler
    console.log(`Failed to register cron-service poll...`);
    console.error(err);
    wampConn.close();
    return;
  }
}

const POLL_LENGTH = process.env.API_POLL_LENGTH;
let eventTypes = [];
let subscriptions = [];

cronClient.init(process.env.CRON_API_END,process.env.OAUTH_SCOPE,resources);
cronClient.get().onRefresh(tokenRefreshHandler);
await cronClient.get().auth.init(new URL(process.env.OAUTH_DISC_URI),process.env.CLIENT_ID,process.env.CLIENT_SECRET);
await cronClient.get().auth.clientCredentialFlow(process.env.OAUTH_SCOPE,[...resources,process.env.CRON_API_END]);
await setTimeout(3000); //wait a few seconds to avoid busting the token's nbf time

wampConn.open();
