import Logger from '/imports/startup/server/logger';

const logClient = function (type, logDescription, logCode = 'was_not_provided', extraInfo = {}, userInfo = {}) {
  const SERVER_CONN_ID = this.connection.id;
  const logContents = {
    logCode,
    logDescription,
    connectionId: SERVER_CONN_ID,
    extraInfo,
    userInfo,
  };

  // if (User) { // TODO--
  //   if ((userInfo.credentials && User.meetingId === userInfo.credentials.meetingId)
  //     || ((userInfo.meetingId && User.meetingId === userInfo.meetingId))) {
  //     logContents.extraInfo.validUser = 'valid';
  //   } else {
  //     logContents.extraInfo.validUser = 'invalid';
  //   }
  // } else {
  //   logContents.extraInfo.validUser = 'notFound';
  // }

  // If I don't pass message, logs will start with `undefined`
  Logger.log({ message: JSON.stringify(logContents), level: type });
  // Logger.log({ message: 'client->server', level: type, logContents });
};

export default logClient;
