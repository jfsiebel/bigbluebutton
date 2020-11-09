import AuthTokenValidation from '/imports/api/auth-token-validation';
import Logger from '/imports/startup/server/logger';

export default function clearAuthTokenValidation(meetingId) {
  return AuthTokenValidation.remove({ meetingId }, (err, num) => {
    if (err) {
      Logger.info(`Error when removing auth-token-validation for meeting=${meetingId}`);
    }

    Logger.info(`Cleared AuthTokenValidation (${meetingId})`);
  });
}
