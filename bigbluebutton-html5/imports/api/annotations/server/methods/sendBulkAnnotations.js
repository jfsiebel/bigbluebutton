import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import sendAnnotation from './sendAnnotation';

export default function sendBulkAnnotations(credentials, payload, packetNumber) {
  check(credentials, Object);
  check(payload, [Object]);
  check(packetNumber, Number);

  console.log(`Starting sending ${payload.length} annotations for packet ${packetNumber}`);
  console.log('=========================================================================');

  payload.forEach(annotation => sendAnnotation(credentials, annotation, packetNumber));

  console.log('=========================================================================');
  console.log(`Sent ${payload.length} annotations for packet ${packetNumber}`);
  console.log('\n');

  return packetNumber;
}
