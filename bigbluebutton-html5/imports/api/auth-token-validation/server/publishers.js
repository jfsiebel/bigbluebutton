import { Meteor } from 'meteor/meteor';
import AuthTokenValidation from '/imports/api/auth-token-validation';

function authTokenValidation({ meetingId, userId }) {
  const connectionId = this.connection.id;
  const selector = {
    meetingId,
    userId,
    connectionId,
  };

  const options = {
    fields: {
      // password: false,
    },
  };

  return AuthTokenValidation.find(selector, options);
}

function publish(...args) {
  const boundAuthTokenValidation = authTokenValidation.bind(this);
  return boundAuthTokenValidation(...args);
}

Meteor.publish('authtokenvalidation', publish);
