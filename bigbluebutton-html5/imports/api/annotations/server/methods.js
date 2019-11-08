import { Meteor } from 'meteor/meteor';
import undoAnnotation from './methods/undoAnnotation';
import clearWhiteboard from './methods/clearWhiteboard';
import sendAnnotation from './methods/sendAnnotation';
import sendBulkAnnotations from './methods/sendBulkAnnotations';
import initializeAnnotationsStreamer from './methods/initializeAnnotationsStreamer';

Meteor.methods({
  undoAnnotation,
  clearWhiteboard,
  sendAnnotation,
  sendBulkAnnotations,
  initializeAnnotationsStreamer,
});
