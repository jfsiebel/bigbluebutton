import SessionStorage from '/imports/ui/services/storage/session';

const CUSTOM_DATA_KEY = 'BBB_customdata';

export default function getFromConfig(item, defaultValue) {
    const data = SessionStorage.getItem(CUSTOM_DATA_KEY);

    if (data !== null && data[item] !== undefined) {
        return data[item];
    }

    return defaultValue;
    
}