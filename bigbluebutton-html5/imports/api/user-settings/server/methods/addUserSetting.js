import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { insertUserSetting } from "/imports/api/user-settings/server/modifiers/insertUserSetting";


export default function addUserSetting(meetingID, userID, setting, value) {

    check(meetingID, String);
    check(userID, String);
    check(setting, String);
    check(value, Match.Any);

    return insertUserSetting(meetingID, userID, setting, value);

}