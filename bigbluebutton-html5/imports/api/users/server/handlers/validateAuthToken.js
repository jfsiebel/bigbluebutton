import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import Users from '/imports/api/users';
import userJoin from './userJoin';
import ClientConnections from '/imports/startup/server/ClientConnections';
import upsertValidationState from '/imports/api/auth-token-validation/server/modifiers/upsertValidationState';
import removeValidationState from '/imports/api/auth-token-validation/server/modifiers/removeValidationState';
import { ValidationStates } from '/imports/api/auth-token-validation';
import pendingAuthenticationsStore from '../store/pendingAuthentications';
import createDummyUser from '../modifiers/createDummyUser';

const clearOtherSessions = (sessionUserId, current = false) => {
  const serverSessions = Meteor.server.sessions;
  Object.keys(serverSessions)
    .filter(i => serverSessions[i].userId === sessionUserId)
    .filter(i => i !== current)
    .forEach(i => serverSessions[i].close());
};

export default function handleValidateAuthToken({ body }, meetingId) {
  const {
    userId,
    valid,
    authToken,
    waitForApproval,
  } = body;

  check(userId, String);
  check(authToken, String);
  check(valid, Boolean);
  check(waitForApproval, Boolean);

  // akka-apps responded with valid: Boolean
  const sessionId = `${meetingId}--${userId}`;
  const connection = ClientConnections.getActiveConnectionsFor(sessionId);
  const connectionId = connection ? connection.id : null;
  Logger.info(`ValidateAuthToken back to meteor. valid=${valid}  for ${sessionId}`);
  const pendingAuths = pendingAuthenticationsStore.take(meetingId, userId, authToken);

  if (!valid) {
    pendingAuths.forEach(
      (pendingAuth) => {
        try {
          const { methodInvocationObject } = pendingAuth;
          // const connectionId = methodInvocationObject.connection.id;

          // Schedule socket disconnection for this user, giving some time for client receiving the reason of disconnection
          Meteor.setTimeout(() => {
            methodInvocationObject.connection.close();
          }, 2000);

          Logger.info(`Closed connection ${methodInvocationObject.connection.id} due to invalid auth token.`);
        } catch (e) {
          Logger.error(`Error closing socket for meetingId '${meetingId}', userId '${userId}', authToken ${authToken}`);
        }
      },
    );

    return;
  }

  if (valid) {
    // Define user ID on connections
    pendingAuths.forEach(
      (pendingAuth) => {
        const { methodInvocationObject } = pendingAuth;

        /* Logic migrated from validateAuthToken method ( postponed to only run in case of success response ) - Begin */
        methodInvocationObject.setUserId(sessionId);

        const User = Users.findOne({
          meetingId,
          userId,
        });

        if (!User) {
          createDummyUser(meetingId, userId, authToken);
        }

        // setConnectionIdAndAuthToken(meetingId, userId, methodInvocationObject.connection.id, authToken);
        /* End of logic migrated from validateAuthToken */
      },
    );
  }

  /* start of CAN_BE_REMOVED_ONCE_FLASH_CLIENT_REMOVED */
  // const selector = {
  //   meetingId,
  //   userId,
  //   clientType: 'HTML5',
  // };
  // const User = Users.findOne(selector);
  //
  // console.error('case 001', body);
  // // If we dont find the user on our collection is a flash user and we can skip
  // if (!User) {
  //   console.error('case 002');
  //   Logger.warn(`handlers/validateAuthToken.js We picked the response for a Flash user ${sessionId}`);
  //   return;
  // }
  /* end of CAN_BE_REMOVED_ONCE_FLASH_CLIENT_REMOVED */

  console.error('case 003');
  if (!valid) {
    upsertValidationState(meetingId, userId, ValidationStates.INVALID, connectionId);
    // TODO remove [dummy] user from db. Auth token validation failed.
    // if not valid TODO - close connection
  } else if (!connectionId) {
    console.error('case 014');
    // Closed session before finishing user join process.

    // upsertValidationState(meetingId, userId, ValidationStates.NOT_VALIDATED, connectionId);
    removeValidationState(meetingId, userId, connectionId);
    // TODO remove [dummy] user from db.
  } else {
    console.error('case 005 - so far so good', connectionId);
    upsertValidationState(meetingId, userId, ValidationStates.VALIDATED, connectionId);

    // TODO send joining request
    if (waitForApproval) {
      //
      console.error('case 006');
    } else {
      console.error('case 007');
      // Has active connection and passed token validation. Join
      userJoin(meetingId, userId, authToken);
    }
    console.error('case 008');
    // const modifier = {
    //   $set: {
    //     validated: valid,
    //     approved: !waitForApproval,
    //     loginTime: Date.now(),
    //     inactivityCheck: false,
    //   },
    // };
    // const cb = (err, numChanged) => {
    //   if (err) {
    //     return Logger.error(`Validating auth token: ${err}`);
    //   }
    //
    //   if (numChanged) {
    //     // if (valid) {
    //     //   const sessionUserId = `${meetingId}-${userId}`;
    //     //   const currentConnectionId = User.connectionId ? User.connectionId : false;
    //     //   clearOtherSessions(sessionUserId, currentConnectionId);
    //     // }
    //
    //     return Logger.info(`Validated auth token as ${valid} user=${userId} meeting=${meetingId}`);
    //   }
    //
    //   return Logger.info('No auth to validate');
    // };
    console.error('case 011');
    // Users.update(selector, modifier, cb);
  }

  console.error('case 013');
}
