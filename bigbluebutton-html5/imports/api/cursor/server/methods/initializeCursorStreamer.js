import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import publishCursorUpdate from './publishCursorUpdate';
import Logger from '/imports/startup/server/logger';

export default function initializeAnnotationsStreamer(credentials) {
  const { meetingId } = credentials;

  check('meetingId', String);

  const streamName = `cursor-${meetingId}`;

  if (!Meteor.StreamerCentral.instances[streamName]) {
    const streamer = new Meteor.Streamer(streamName, { retransmit: false });

    streamer.allowRead(function allowRead() {
      return this.userId && this.userId.includes(meetingId);
    });
  
    streamer.allowWrite(function allowWrite() {
      return this.userId && this.userId.includes(meetingId);
    });
  
    streamer.on('publish', (message) => {
      publishCursorUpdate(message.credentials, message.payload);
    });
  }
}
