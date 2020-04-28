import Users from '/imports/api/users';
import { Meteor } from 'meteor/meteor';
import Logger from '/imports/startup/server/logger';
import AuthTokenValidation, { ValidationStates } from '/imports/api/auth-token-validation';

const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;

function users(isModerator = false) {
  const tokenValidation = AuthTokenValidation.findOne({ connectionId: this.connection.id });

  if (!tokenValidation || tokenValidation.validationStatus !== ValidationStates.VALIDATED) {
    Logger.warn(`Publishing Users was requested by unauth connection ${this.connection.id}`);
    return Users.find({ meetingId: '' });
  }
  const { meetingId, userId } = tokenValidation;

  Logger.debug(`Publishing Users for ${meetingId} ${userId}`);

  const selector = {
    $or: [
      { meetingId },
    ],
  };

  if (isModerator) {
    const User = Users.findOne({ userId, meetingId });
    if (!!User && User.role === ROLE_MODERATOR) {
      selector.$or.push({
        'breakoutProps.isBreakoutUser': true,
        'breakoutProps.parentId': meetingId,
        connectionStatus: 'online',
      });
    }
  }

  const options = {
    fields: {
      authToken: false,
    },
  };

  Logger.debug(`Publishing Users for ${meetingId} ${userId}`);

  return Users.find(selector, options);
}

function publish(...args) {
  const boundUsers = users.bind(this);
  return boundUsers(...args);
}

Meteor.publish('users', publish);
