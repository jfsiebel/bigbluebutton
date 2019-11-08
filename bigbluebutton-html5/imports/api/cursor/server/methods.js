import { Meteor } from 'meteor/meteor';
import publishCursorUpdate from './methods/publishCursorUpdate';
import initializeCursorStreamer from './methods/initializeCursorStreamer';

Meteor.methods({
  publishCursorUpdate,
  initializeCursorStreamer,
});
