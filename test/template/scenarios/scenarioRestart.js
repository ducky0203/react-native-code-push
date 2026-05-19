var CodePushWrapper = require("../codePushWrapper.js");
import CodePush from "@ducky0203/react-native-code-push";

module.exports = {
    startTest: function (testApp) {
        testApp.sendCurrentAndPendingPackage()
            .then(() => {
                CodePushWrapper.sync(testApp, (status) => {
                    if (status === CodePush.SyncStatus.UPDATE_INSTALLED) {
                        testApp.sendCurrentAndPendingPackage().then(CodePush.restartApp);
                    }
                }, undefined, { installMode: CodePush.InstallMode.ON_NEXT_RESTART });
            });
    },

    getScenarioName: function () {
        return "Restart";
    }
};
