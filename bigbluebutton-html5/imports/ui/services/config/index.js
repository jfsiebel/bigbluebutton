import Auth from '/imports/ui/services/auth';
import UserSettings from '/imports/api/user-settings';

export default function getFromConfig(item, defaultValue) {

    const { meetingID, userID } = Auth;

    const selector = {
        meetingId: meetingID,
        userId: userID,
        setting: item
    }

    const setting = UserSettings.findOne(selector);

    if (setting != undefined) {
        return setting.value;
    }

    return defaultValue;
    
}