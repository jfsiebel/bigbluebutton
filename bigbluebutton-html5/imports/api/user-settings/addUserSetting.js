import UserSettings from '/imports/api/user-settings';
import { check } from 'meteor/check';

export default function addUserSetting(meetingId, userId, setting, settingValue) {

    check(meetingId, String);
    check(userId, String);
    check(setting, String);
    check(settingValue, Match.Any);

    const document = {
      meetingId,
      userId,
      setting,
      settingValue
    };

    const cb = (err) => {
        if (err) {
          return Logger.error(`Adding user configuration to collection: ${err}`);
        }

      return Logger.verbose(`Upserted user configuration userId=${userId} meeting=${meetingId}`);
    };

    return UserSettings.insert(document, cb);
}