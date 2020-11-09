import Logger from './logger';
import userLeaving from '/imports/api/users/server/methods/userLeaving';
import { extractCredentials } from '/imports/api/common/server/helpers';

class ClientConnections {
  constructor() {
    Logger.debug('Initializing client connections structure', { logCode: 'client_connections_init' });
    this.connections = new Map();

    setInterval(() => {
      this.print();
    }, 60000);
  }

  add(sessionId, connection) {
    Logger.info('Client connections add called', { logCode: 'client_connections_add', extraInfo: { sessionId, connection } });
    if (!sessionId || !connection) {
      Logger.error(`Error on add new client connection. sessionId=${sessionId} connection=${connection.id}`,
        { logCode: 'client_connections_add_error', extraInfo: { sessionId, connection } }
      );

      return;
    }

    const { meetingId, requesterUserId: userId } = extractCredentials(sessionId);

    if (!this.exists(meetingId)) {
      Logger.debug(`Meeting not found in connections: meetingId=${meetingId}`);
      this.createMeetingConnections(meetingId);
    }

    const sessionConnections = this.connections.get(meetingId);

    if (sessionConnections.has(userId) && sessionConnections.get(userId).includes(connection.id)) {
      Logger.debug(`Connection already exists for user. userId=${userId} connectionId=${connection.id}`);

      return false;
    }

    connection.onClose(Meteor.bindEnvironment(() => {
      userLeaving(meetingId, userId, connection.id);
    }));

    Logger.debug(`Adding new connection for sessionId=${sessionId} connection=${connection.id}`);

    if (!sessionConnections.has(userId)) {
      Logger.debug(`Creating connections poll for userId=${userId} meetingId=${meetingId}`);

      sessionConnections.set(userId, []);
    }

    return sessionConnections.get(userId).push(connection.id);
  }

  createMeetingConnections(meetingId) {
    Logger.info(
      'Client connections create meeting called',
      { logCode: 'client_connections_create_meeting_connections', extraInfo: { meetingId } }
    );

    if (!meetingId) {
      Logger.error(`Error on create new meeting connections. meetingId=${meetingId}`,
        { logCode: 'client_connections_create_meeting_connections_error', extraInfo: { meetingId } }
      );

      return;
    }

    if (!this.exists(meetingId))
      return this.connections.set(meetingId, new Map());
  }

  exists(meetingId) {
    return this.connections.has(meetingId);
  }

  getConnectionsForClient(sessionId) {
    const { meetingId, requesterUserId: userId } = extractCredentials(sessionId);

    return this.connections.get(meetingId)?.get(userId);
  }

  print() {
    const mapConnectionsObj = {};
    this.connections.forEach((value, key) => {
      mapConnectionsObj[key] = {};

      value.forEach((v, k) => {
        mapConnectionsObj[key][k] = v;
      });

    });
    Logger.info('Active connections', mapConnectionsObj);
  }

  removeClientConnection(sessionId, connectionId = null) {
    Logger.info(`Removing connectionId for user. sessionId=${sessionId} connectionId=${connectionId}`,
      { logCode: 'client_connections_remove_client_connection', extraInfo: { sessionId, connectionId } }
    );
    const { meetingId, requesterUserId: userId } = extractCredentials(sessionId);

    const meetingConnections = this.connections.get(meetingId)

    if (meetingConnections?.has(userId)) {
      Logger.debug(`Filtering connections for userId=${userId} meetingId=${meetingId}`);
      const filteredConnections = meetingConnections.get(userId).filter(c => c !== connectionId);

      return connectionId && filteredConnections.length ? meetingConnections.set(userId, filteredConnections) : meetingConnections.delete(userId);
    }

    Logger.error(`Couldn't find active connection for user.`, { logCode: 'client_connections_remove_client_connection_error', extraInfo: { meetingId, userId } });

    return false;
  }

  removeMeeting(meetingId) {
    Logger.debug(`Removing connections for meeting=${meetingId}`, { logCode: 'client_connections_remove_meeting', extraInfo: { meetingId } });
    return this.connections.delete(meetingId);
  }

  syncConnectionsWithServer() {
    console.error('syncConnectionsWithServer', Array.from(Meteor.server.sessions.keys()), Meteor.server);
  }

}

const ClientConnectionsSingleton = new ClientConnections();

export default ClientConnectionsSingleton;
