export default{
  newJob(job){
    return `
    <style>
      table {
        width: 100%;
        border-collapse: collapse;
      }
      th, td {
        border: 1px solid black;
        padding: 8px;
        text-align: left;
      }
      th {
        background-color: #f4f4f4;
      }
      tr:nth-child(even) {
        background-color: #f9f9f9;
      }
      .centered {
        text-align: center;
      }
      .bold {
        font-weight: bold;
      }
    </style>

    <table>
      <!-- Job Title Section -->
      <tr>
        <th colspan="2" class="centered bold">New Job</th>
      </tr>
      <tr>
        <td colspan="2" class="centered">${job.title}</td>
      </tr>
      <tr>
        <td colspan="2" class="centered">${job.description}</td>
      </tr>

      <!-- User and Host Information -->
      <tr>
        <td class="bold">User/Host</td>
        <td>${job.user}@${job.hostname}</td>
      </tr>
      <tr>
        <td class="bold">Command/Outfile</td>
        <td>${job.cmdToExec} > ${job.outfile}</td>
      </tr>

      <!-- Cron Schedule Section -->
      <tr>
        <th colspan="2" class="centered bold">Schedule</th>
      </tr>
      <tr>
        <td class="bold">Cron Time</td>
        <td class="centered">${job.cronTime}</td>
      </tr>
      <tr>
        <td class="bold">Friendly Time</td>
        <td class="centered">${job.friendlyTime}</td>
      </tr>

      <!-- Properties Section -->
      <tr>
        <th colspan="2" class="centered bold">Properties</th>
      </tr>
      <tr>
        <td class="bold">Container</td>
        <td>${job.container}</td>
      </tr>
      <tr>
        <td class="bold">Image Name</td>
        <td>${job.imgName}</td>
      </tr>
      <tr>
        <td class="bold">Shell</td>
        <td>${job.shell}</td>
      </tr>
      <tr>
        <td class="bold">Path Variable</td>
        <td>${job.pathVariable}</td>
      </tr>
      <tr>
        <td class="bold">Timezone</td>
        <td>${job.tz_code}</td>
      </tr>
      <tr>
        <td class="bold">Cron Wrapper Path</td>
        <td>${job.cronWrapperPath}</td>
      </tr>
      <tr>
        <td class="bold">Created Date</td>
        <td>${job.created_date}</td>
      </tr>
      <tr>
        <td class="bold">Disabled</td>
        <td>${job.disabled ? 'Yes' : 'No'}</td>
      </tr>
    </table>
    `;
  },
  jobChanged(before,after){
    return `
    <style>
      table {
        width: 100%;
        border-collapse: collapse;
      }
      th, td {
        border: 1px solid black;
        padding: 8px;
        text-align: left;
      }
      th {
        background-color: #f4f4f4;
      }
      tr:nth-child(even) {
        background-color: #f9f9f9;
      }
      .centered {
        text-align: center;
      }
      .bold {
        font-weight: bold;
      }
    </style>

    <table>
      <!-- Job Title Section -->
      <tr>
        <th colspan="2" class="centered bold">Before</th>
      </tr>
      <tr>
        <td colspan="2" class="centered">${before.title}</td>
      </tr>
      <tr>
        <td colspan="2" class="centered">${before.description}</td>
      </tr>

      <!-- User and Host Information -->
      <tr>
        <td class="bold">User/Host</td>
        <td>${before.user}@${before.hostname}</td>
      </tr>
      <tr>
        <td class="bold">Command/Outfile</td>
        <td>${before.cmdToExec} > ${before.outfile}</td>
      </tr>

      <!-- Cron Schedule Section -->
      <tr>
        <th colspan="2" class="centered bold">Schedule</th>
      </tr>
      <tr>
        <td class="bold">Cron Time</td>
        <td class="centered">${before.cronTime}</td>
      </tr>
      <tr>
        <td class="bold">Friendly Time</td>
        <td class="centered">${before.friendlyTime}</td>
      </tr>

      <!-- Properties Section -->
      <tr>
        <th colspan="2" class="centered bold">Properties</th>
      </tr>
      <tr>
        <td class="bold">Container</td>
        <td>${before.container}</td>
      </tr>
      <tr>
        <td class="bold">Image Name</td>
        <td>${before.imgName}</td>
      </tr>
      <tr>
        <td class="bold">Shell</td>
        <td>${before.shell}</td>
      </tr>
      <tr>
        <td class="bold">Path Variable</td>
        <td>${before.pathVariable}</td>
      </tr>
      <tr>
        <td class="bold">Timezone</td>
        <td>${before.tz_code}</td>
      </tr>
      <tr>
        <td class="bold">Cron Wrapper Path</td>
        <td>${before.cronWrapperPath}</td>
      </tr>
      <tr>
        <td class="bold">Created Date</td>
        <td>${before.created_date}</td>
      </tr>
      <tr>
        <td class="bold">Disabled</td>
        <td>${before.disabled ? 'Yes' : 'No'}</td>
      </tr>
    </table>
    <br>
    <table>
      <!-- Job Title Section -->
      <tr>
        <th colspan="2" class="centered bold">After</th>
      </tr>
      <tr>
        <td colspan="2" class="centered">${after.title}</td>
      </tr>
      <tr>
        <td colspan="2" class="centered">${after.description}</td>
      </tr>

      <!-- User and Host Information -->
      <tr>
        <td class="bold">User/Host</td>
        <td>${after.user}@${after.hostname}</td>
      </tr>
      <tr>
        <td class="bold">Command/Outfile</td>
        <td>${after.cmdToExec} > ${after.outfile}</td>
      </tr>

      <!-- Cron Schedule Section -->
      <tr>
        <th colspan="2" class="centered bold">Schedule</th>
      </tr>
      <tr>
        <td class="bold">Cron Time</td>
        <td class="centered">${after.cronTime}</td>
      </tr>
      <tr>
        <td class="bold">Friendly Time</td>
        <td class="centered">${after.friendlyTime}</td>
      </tr>

      <!-- Properties Section -->
      <tr>
        <th colspan="2" class="centered bold">Properties</th>
      </tr>
      <tr>
        <td class="bold">Container</td>
        <td>${after.container}</td>
      </tr>
      <tr>
        <td class="bold">Image Name</td>
        <td>${after.imgName}</td>
      </tr>
      <tr>
        <td class="bold">Shell</td>
        <td>${after.shell}</td>
      </tr>
      <tr>
        <td class="bold">Path Variable</td>
        <td>${after.pathVariable}</td>
      </tr>
      <tr>
        <td class="bold">Timezone</td>
        <td>${after.tz_code}</td>
      </tr>
      <tr>
        <td class="bold">Cron Wrapper Path</td>
        <td>${after.cronWrapperPath}</td>
      </tr>
      <tr>
        <td class="bold">Created Date</td>
        <td>${after.created_date}</td>
      </tr>
      <tr>
        <td class="bold">Disabled</td>
        <td>${after.disabled ? 'Yes' : 'No'}</td>
      </tr>
    </table>
    `;
  },
  jobDeleted(job){
    return `
    <style>
      table {
        width: 100%;
        border-collapse: collapse;
      }
      th, td {
        border: 1px solid black;
        padding: 8px;
        text-align: left;
      }
      th {
        background-color: #f4f4f4;
      }
      tr:nth-child(even) {
        background-color: #f9f9f9;
      }
      .centered {
        text-align: center;
      }
      .bold {
        font-weight: bold;
      }
    </style>

    <table>
      <!-- Job Title Section -->
      <tr>
        <th colspan="2" class="centered bold">Deleted Job</th>
      </tr>
      <tr>
        <td colspan="2" class="centered">${job.title}</td>
      </tr>
      <tr>
        <td colspan="2" class="centered">${job.description}</td>
      </tr>

      <!-- User and Host Information -->
      <tr>
        <td class="bold">User/Host</td>
        <td>${job.user}@${job.hostname}</td>
      </tr>
      <tr>
        <td class="bold">Command/Outfile</td>
        <td>${job.cmdToExec} > ${job.outfile}</td>
      </tr>

      <!-- Cron Schedule Section -->
      <tr>
        <th colspan="2" class="centered bold">Schedule</th>
      </tr>
      <tr>
        <td class="bold">Cron Time</td>
        <td class="centered">${job.cronTime}</td>
      </tr>
      <tr>
        <td class="bold">Friendly Time</td>
        <td class="centered">${job.friendlyTime}</td>
      </tr>

      <!-- Properties Section -->
      <tr>
        <th colspan="2" class="centered bold">Properties</th>
      </tr>
      <tr>
        <td class="bold">Container</td>
        <td>${job.container}</td>
      </tr>
      <tr>
        <td class="bold">Image Name</td>
        <td>${job.imgName}</td>
      </tr>
      <tr>
        <td class="bold">Shell</td>
        <td>${job.shell}</td>
      </tr>
      <tr>
        <td class="bold">Path Variable</td>
        <td>${job.pathVariable}</td>
      </tr>
      <tr>
        <td class="bold">Timezone</td>
        <td>${job.tz_code}</td>
      </tr>
      <tr>
        <td class="bold">Cron Wrapper Path</td>
        <td>${job.cronWrapperPath}</td>
      </tr>
      <tr>
        <td class="bold">Created Date</td>
        <td>${job.created_date}</td>
      </tr>
      <tr>
        <td class="bold">Disabled</td>
        <td>${job.disabled ? 'Yes' : 'No'}</td>
      </tr>
    </table>
    `;
  },
  executionComplete(job,execution){
    return `
    <style>
      table{
        border:1px solid black
      }
      tr:nth-child(even) {
        background-color: #cdcfd1;
      }
      table td{
        border:1px solid black;
      }
      .centered{
        margin:auto;
        text-align:center;
      }
    </style>
    <table>
      <tr>
        <th colspan='2' class='centered'><b>${job.title} has executed on schedule!</b></th>
      </tr>
      <tr>
        <td colspan='2' class='centered'>${job.description}</td>
      </tr>
      <tr>
        <td colspan='2' class='centered'>${job.cmdToExec}</td>
      </tr>
      <tr>
        <td colspan='2' class='centered'>${job.user}@${job.hostname}</td>
      </tr>
      <tr>
        <td colspan='2' class='centered'><b>Schedule</b></td>
      </tr>
      <tr>
        <td class='centered'>${job.cronTime}</td>
        <td class='centered'>${job.friendlyTime}</td>
      </tr>
      <tr>
        <td>Start: ${execution.startTime}</td>
        <td>End: ${execution.endTime}</td>
      </tr>
      <tr>
        <td colspan='2' class='centered'><b>Output</b></td>
      </tr>
      <tr>
        <td colspan='4'>${execution.output.replaceAll('\n','<br>')}</td>
      </tr>
    <table>
    `;
  }
}
