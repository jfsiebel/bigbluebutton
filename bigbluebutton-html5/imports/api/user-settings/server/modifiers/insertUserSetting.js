import UserSettings from '/imports/api/user-settings';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';

export default function insertUserSetting(meetingId, userId, setting, value) {

    check(meetingId, String);
    check(userId, String);
    check(setting, String);
    check(value, Match.Any);

    const document = {
      meetingId,
      userId,
      setting,
      value
    };

    const cb = (err) => {
        if (err) {
          return Logger.error(`Adding user configuration to collection: ${err}`);
        }

      return Logger.verbose(`Upserted user configuration userId=${userId} meeting=${meetingId}`);
    };

    return UserSettings.insert(document, cb);
}