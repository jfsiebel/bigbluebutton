import { Meteor } from 'meteor/meteor';
import RedisPubSub from '/imports/startup/server/redis';
import Logger from '/imports/startup/server/logger';
import ClientConnections from '/imports/startup/server/ClientConnections';
import userLeaving from './userLeaving';
import upsertValidationState from '/imports/api/auth-token-validation/server/modifiers/upsertValidationState';
import { ValidationStates } from '/imports/api/auth-token-validation';
import pendingAuthenticationsStore from '../store/pendingAuthentications';
import BannedUsers from '../store/bannedUsers';

export default function validateAuthToken(meetingId, requesterUserId, requesterToken, externalId) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'ValidateAuthTokenReqMsg';

  const sessionId = `${meetingId}--${requesterUserId}`;
  const connectionId = this.connection.id;
  // Do I need to attach the onCloseConnection prior to addConnection? TODO
  if (!ClientConnections.addConnection(sessionId, this.connection)) return;
  const onCloseConnection = Meteor.bindEnvironment(() => {
    try {
      userLeaving(meetingId, requesterUserId, connectionId);
    } catch (e) {
      Logger.error(`Exception while executing userLeaving: ${e}`);
    }
  });

  this.connection.onClose(() => {
    onCloseConnection();
  });

  // new user
  upsertValidationState(meetingId, requesterUserId, ValidationStates.VALIDATING, connectionId);
  // Check if externalId is banned from the meeting
  if (externalId) {
    if (BannedUsers.has(meetingId, externalId)) {
      Logger.warn(`A banned user with extId ${externalId} tried to enter in meeting ${meetingId}`);
      return;
    }
  }

  // Store reference of methodInvocationObject ( to postpone the connection userId definition )
  pendingAuthenticationsStore.add(meetingId, requesterUserId, requesterToken, this);

  const payload = {
    userId: requesterUserId,
    authToken: requesterToken,
  };

  Logger.info(`User '${requesterUserId}' is trying to validate auth token for meeting '${meetingId}' from connection '${this.connection.id}'`);

  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
