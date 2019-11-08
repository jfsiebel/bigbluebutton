import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';

export default function initializeAnnotationsStreamer(credentials) {
  const { meetingId } = credentials;

  check('meetingId', String);

  const streamName = `annotations-${meetingId}`;

  if (!Meteor.StreamerCentral.instances[streamName]) {
    const streamer = new Meteor.Streamer(streamName, { retransmit: false });
    streamer.allowRead(function allowRead() {
      if (!this.userId) return false;

      return this.userId && this.userId.includes(meetingId);
    });

    streamer.allowWrite(function allowWrite() {
      return false;
    });
    Logger.debug('Annotations streamer created for ', streamName);
  } else {
    Logger.debug('Annotations streamer is already created for ', streamName);
  }
}
