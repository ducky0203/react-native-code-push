var CodePushWrapper = require("../codePushWrapper.js");
import CodePush from "@ducky0203/react-native-code-push";

module.exports = {
    startTest: function (testApp) {
        testApp.readyAfterUpdate();
        CodePush.notifyAppReady();
    },

    getScenarioName: function () {
        return "Good Update";
    }
};
