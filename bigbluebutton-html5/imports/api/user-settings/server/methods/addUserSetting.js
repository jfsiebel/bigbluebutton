import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import insertUserSetting from "/imports/api/user-settings/server/modifiers/insertUserSetting";


export default function addUserSetting(credentials, meetingId, userId, setting, value) {
    check(meetingId, String);
    check(userId, String);
    check(setting, String);
    check(value, Match.Any);

    return insertUserSetting(meetingId, userId, setting, value);
}