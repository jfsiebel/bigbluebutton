import { Meteor } from 'meteor/meteor';
import mapToAcl from '/imports/startup/mapToAcl';
import addUserSetting from './methods/addUserSetting';

Meteor.methods(mapToAcl(['methods.addUserSetting'], {
    addUserSetting,
}));