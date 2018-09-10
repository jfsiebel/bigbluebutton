import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import UserSettings from '/imports/api/user-settings';
import mapToAcl from '/imports/startup/mapToAcl';

function userSettings(credentials) {
    const { meetingId, requesterUserId } = credentials;

    check(meetingId, String);
    check(requesterUserId, String);

    Logger.info(`Publishing user settings for ${meetingId} ${requesterUserId}`);

    return UserSettings.find({ meetingId, userId: requesterUserId });
}

function publish(...args) {
    const boundUserSettings = userSettings.bind(this);
    return mapToAcl('subscriptions.user-settings', boundUserSettings)(args);
}

Meteor.publish('user-settings', publish);