import { Meteor } from 'meteor/meteor';
import logClient from './methods/logClient';

Meteor.methods({ 'methods.logClient': logClient });
