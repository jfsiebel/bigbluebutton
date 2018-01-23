import Auth from '/imports/ui/services/auth';
import { log } from '/imports/ui/services/api';
import queryString from 'query-string';

// disconnected and trying to open a new connection
const STATUS_CONNECTING = 'connecting';

export function joinRouteHandler(nextState, history) {
  const { sessionToken } = queryString.parse(nextState.search);

  if (!nextState || !sessionToken) {
    history.replace("/error/404");
  }

  // use enter api to get params for the client
  const url = `/bigbluebutton/api/enter?sessionToken=${sessionToken}`;

  fetch(url)
    .then(response => response.json())
    .then((data) => {
      const { meetingID, internalUserID, authToken, logoutUrl } = data.response;

      Auth.set(meetingID, internalUserID, authToken, logoutUrl, sessionToken);
      history.replace("/");
    });
}

export function logoutRouteHandler(nextState, replace) {
  Auth.logout()
    .then((logoutURL = window.location.origin) => {
      const protocolPattern = /^((http|https):\/\/)/;

      window.location.href =
        protocolPattern.test(logoutURL) ?
          logoutURL :
          `http://${logoutURL}`;
    });
}

/**
 * Check if should revalidate the auth
 * @param {Object} status
 * @param {String} lastStatus
 */
export function shouldAuthenticate(status, lastStatus) {
  return lastStatus != null && lastStatus === STATUS_CONNECTING && status.connected;
}

/**
 * Check if the isn't the first connection try, preventing to authenticate on login.
 * @param {Object} status
 * @param {string} lastStatus
 */
export function updateStatus(status, lastStatus) {
  return status.retryCount > 0 && lastStatus !== STATUS_CONNECTING ? status.status : lastStatus;
}

function _addReconnectObservable() {
  let lastStatus = null;

  Tracker.autorun(() => {
    lastStatus = updateStatus(Meteor.status(), lastStatus);

    if (shouldAuthenticate(Meteor.status(), lastStatus)) {
      Auth.authenticate(true);
      lastStatus = Meteor.status().status;
    }
  });
}

export function authenticatedRouteHandler(nextState, history) {
  const credentialsSnapshot = {
    meetingId: Auth.meetingID,
    requesterUserId: Auth.userID,
    requesterToken: Auth.token,
  };

  // if (Auth.loggedIn) {
  //   return;
  // }

  _addReconnectObservable();

  Auth.authenticate()
    .then(() => {
      return;
    })
    .catch((reason) => {
      log('error', reason);

      // make sure users who did not connect are not added to the meeting
      // do **not** use the custom call - it relies on expired data
      Meteor.call('userLogout', credentialsSnapshot, (error) => {
        if (error) {
          throw new Error(error);
        }
      });

      history.replace(`/error/${reason.error}`);
      return;
    });
}
