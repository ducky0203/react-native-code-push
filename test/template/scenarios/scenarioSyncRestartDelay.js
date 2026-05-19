var CodePushWrapper = require("../codePushWrapper.js");
import CodePush from "@ducky0203/react-native-code-push";

module.exports = {
    startTest: function (testApp) {
        CodePushWrapper.sync(testApp, undefined, undefined,
            {
                installMode: CodePush.InstallMode.ON_NEXT_RESTART,
                minimumBackgroundDuration: 15
            });
    },

    getScenarioName: function () {
        return "Sync Restart Delay";
    }
};
