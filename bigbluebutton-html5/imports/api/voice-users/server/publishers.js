import VoiceUsers from '/imports/api/voice-users';
import { Meteor } from 'meteor/meteor';
import Logger from '/imports/startup/server/logger';
import AuthTokenValidation, { ValidationStates } from '/imports/api/auth-token-validation';

function voiceUser() {
  const tokenValidation = AuthTokenValidation.findOne({ connectionId: this.connection.id });

  if (!tokenValidation || tokenValidation.validationStatus !== ValidationStates.VALIDATED) {
    Logger.warn(`Publishing VoiceUsers was requested by unauth connection ${this.connection.id}`);
    return VoiceUsers.find({ meetingId: '' });
  }
  const { meetingId, userId } = tokenValidation;

  Logger.debug(`Publishing VoiceUsers for ${meetingId} ${userId}`);

  return VoiceUsers.find({ meetingId });
}

function publish(...args) {
  const boundVoiceUser = voiceUser.bind(this);
  return boundVoiceUser(...args);
}

Meteor.publish('voiceUsers', publish);
