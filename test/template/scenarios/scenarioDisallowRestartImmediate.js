var CodePushWrapper = require("../codePushWrapper.js");
import CodePush from "@ducky0203/react-native-code-push";

module.exports = {
    startTest: function (testApp) {
        CodePush.disallowRestart();
        CodePushWrapper.checkAndInstall(testApp,
            () => {
                CodePush.allowRestart();
            },
            undefined,
            CodePush.InstallMode.IMMEDIATE,
            undefined,
            true
        );
    },

    getScenarioName: function () {
        return "disallowRestart";
    }
};
