import { Meteor } from 'meteor/meteor';
import fs from 'fs';
import ini from 'ini';

export default class {};

Meteor.startup(() => {
    const FILE_PATH = 'assets/app/config/settings.ini';

    try {
        if (fs.existsSync(FILE_PATH)) {
            const INI_FILE = ini.parse(fs.readFileSync(FILE_PATH, 'utf-8'));
            const SETTINGS = JSON.parse(JSON.stringify(INI_FILE));

            Meteor.settings = SETTINGS;
            __meteor_runtime_config__.PUBLIC_SETTINGS = SETTINGS.public;

            const TOOLBAR = Meteor.settings.public.whiteboard.toolbar;

            let mappedColors = TOOLBAR.colors.map(el => {
                let stringParts = el.split("|");
                return {label: stringParts[0].trim(), value: stringParts[1].trim()};
            })

            let mappedThickness = TOOLBAR.thickness.reverse().map(el => {
                return { value: new Number(el).valueOf() };
            });

            let mappedFontSize = TOOLBAR.font_sizes.reverse().map(el => {
                return { value: new Number(el).valueOf() };
            });

            let mappedTools = TOOLBAR.tools.map(el => {
                let stringParts = el.split("|");
                return {icon: stringParts[0].trim(), value: stringParts[1].trim()};
            })

            __meteor_runtime_config__.PUBLIC_SETTINGS.whiteboard.toolbar.colors = mappedColors;
            __meteor_runtime_config__.PUBLIC_SETTINGS.whiteboard.toolbar.thickness = mappedThickness;
            __meteor_runtime_config__.PUBLIC_SETTINGS.whiteboard.toolbar.font_sizes = mappedFontSize;
            __meteor_runtime_config__.PUBLIC_SETTINGS.whiteboard.toolbar.tools = mappedTools;

        }        
    } catch (error) {
        console.error('Error on load ini file.', error);
    }
})