import { Meteor } from 'meteor/meteor';
import fs from 'fs';
import ini from 'ini';

export default class Settings {
};

Meteor.startup(() => {
    const INI_FILE = ini.parse(fs.readFileSync('assets/app/config/settings.ini', 'utf-8'));

    console.log('INI_FILE', INI_FILE);

    Meteor.settings = JSON.parse(JSON.stringify(INI_FILE));
    __meteor_runtime_config__.PUBLIC_SETTINGS = JSON.parse(JSON.stringify(INI_FILE.public));

    const TOOLBAR = Meteor.settings.public.whiteboard.toolbar;

    let mappedColors = TOOLBAR.colors.map(el => {
        let stringParts = el.split("|");
        return {label: stringParts[0].trim(), value: stringParts[1].trim()};
    })

    let mappedThickness = TOOLBAR.thickness.map(el => {
        return { value: el };
    });

    let mappedFontSize = TOOLBAR.font_sizes.map(el => {
        return { value: el };
    });

    let mappedTools = TOOLBAR.tools.map(el => {
        let stringParts = el.split("|");
        return {icon: stringParts[0].trim(), value: stringParts[1].trim()};
    })

    __meteor_runtime_config__.PUBLIC_SETTINGS.whiteboard.toolbar.colors = mappedColors;
    __meteor_runtime_config__.PUBLIC_SETTINGS.whiteboard.toolbar.thickness = mappedThickness;
    __meteor_runtime_config__.PUBLIC_SETTINGS.whiteboard.toolbar.font_sizes = mappedFontSize;
    __meteor_runtime_config__.PUBLIC_SETTINGS.whiteboard.toolbar.tools = mappedTools;

})