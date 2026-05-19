# @ducky0203/react-native-code-push

A React Native plugin that provides client-side integration with a CodePush
service, allowing you to easily add a dynamic, over-the-air update experience
to your React Native app.

This package is a maintained fork of the original
[microsoft/react-native-code-push](https://github.com/microsoft/react-native-code-push)
brought up to date with **React Native 0.85.3** (New Architecture /
Bridgeless mode supported).

> Current version: **v1.0.0** — targeting React Native **0.85.3**.
> Maintained by **DuckyPham**.

---

## Table of contents

* [How does it work?](#how-does-it-work)
* [Supported React Native versions](#supported-react-native-versions)
* [Supported components](#supported-components)
* [Getting started](#getting-started)
  * [iOS Setup](docs/setup-ios.md)
  * [Android Setup](docs/setup-android.md)
* [Plugin usage](#plugin-usage)
* [Releasing updates](#releasing-updates)
* [Multi-Deployment Testing](#multi-deployment-testing)
  * [Android](docs/multi-deployment-testing-android.md)
  * [iOS](docs/multi-deployment-testing-ios.md)
* [Dynamic Deployment Assignment](#dynamic-deployment-assignment)
* [API Reference](#api-reference)
  * [JavaScript API](docs/api-js.md)
  * [Objective-C API Reference (iOS)](docs/api-ios.md)
  * [Java API Reference (Android)](docs/api-android.md)
* [Store guideline compliance](#store-guideline-compliance)
* [Debugging / Troubleshooting](#debugging--troubleshooting)
* [TypeScript Consumption](#typescript-consumption)

---

## How does it work?

A React Native app is composed of JavaScript files and any accompanying
[images](https://reactnative.dev/docs/image), which are bundled together by the
[Metro bundler](https://github.com/facebook/metro) and distributed as part of a
platform-specific binary (an `.ipa` or `.apk` file). Once the app is released,
updating either the JavaScript code (bug fixes, new features) or image assets
requires you to recompile and redistribute the entire binary, which of course
includes any review time associated with the store(s) you are publishing to.

The CodePush plugin helps get product improvements in front of your end users
instantly by keeping your JavaScript and images synchronised with updates you
release to a CodePush-compatible server. This way, your app gets the benefits
of an offline mobile experience as well as the “web-like” agility of
side-loading updates as soon as they are available.

To ensure that your end users always have a functioning version of your app,
the CodePush plugin maintains a copy of the previous update, so that if you
accidentally push an update which includes a crash, it can automatically roll
back.

*Note: Any product changes which touch native code (e.g. modifying your
`AppDelegate.m`/`MainActivity.kt` file, adding a new plugin) cannot be
distributed via CodePush, and must be updated through the appropriate
store(s).*

## Supported React Native versions

- iOS **15.5+** (required by SSZipArchive 2.5+, which bundles zlib 1.2.12 to
  address [CVE-2018-25032](https://nvd.nist.gov/vuln/detail/CVE-2018-25032))
- Android API 24+ (TLS 1.2 compatible devices)

| React Native version | Supporting plugin version                       |
|----------------------|-------------------------------------------------|
| **0.85.3**           | **v1.0.0** *(New Architecture / Bridgeless)*    |

> This `1.0.x` line tracks React Native **0.85.3** specifically. Older RN
> versions (≤ 0.84) are **not** supported — use the upstream
> `react-native-code-push` or an earlier fork for those.

> **Heads-up — host app `Podfile`:** React Native 0.85.3 templates default
> the iOS deployment target to `15.1`, but this plugin requires `15.5`. You
> **must** raise the floor in your host app's `ios/Podfile`:
>
> ```ruby
> platform :ios, '15.5'
> ```
>
> Otherwise CocoaPods will fail with:
> ```
> [!] CocoaPods could not find compatible versions for pod "SSZipArchive":
>     Specs satisfying the dependency were found, but they required a
>     higher minimum deployment target.
> ```

### Supported components

When using the React Native asset system (`require("./foo.png")`), the
following list represents the set of core components (and props) whose
referenced images and videos can be updated via CodePush:

| Component                                       | Prop(s)                                  |
|-------------------------------------------------|------------------------------------------|
| `Image`                                         | `source`                                 |
| `MapView.Marker` <br />*(Requires [react-native-maps](https://github.com/lelandrichardson/react-native-maps) `>=O.3.2`)* | `image`                             |
| `ProgressViewIOS`                               | `progressImage`, `trackImage`            |
| `TabBarIOS.Item`                                | `icon`, `selectedIcon`                   |
| `ToolbarAndroid` <br />*(React Native 0.21.0+)* | `actions[].icon`, `logo`, `overflowIcon` |
| `Video`                                         | `source`                                 |

The following list represents the set of components (and props) that don't
currently support their assets being updated via CodePush, due to their
dependency on static images and videos (i.e. using the `{ uri: "foo" }`
syntax):

| Component   | Prop(s)                                                              |
|-------------|----------------------------------------------------------------------|
| `SliderIOS` | `maximumTrackImage`, `minimumTrackImage`, `thumbImage`, `trackImage` |
| `Video`     | `source`                                                             |

*Note: CodePush only works with Video components when using `require` in the
source prop, e.g.:*

```javascript
<Video source={require("./foo.mp4")} />
```

## Getting started

Install the plugin in your React Native project:

```shell
yarn add @ducky0203/react-native-code-push
# or
npm install --save @ducky0203/react-native-code-push
```

Then continue with the native module setup:

* [iOS Setup](docs/setup-ios.md)
* [Android Setup](docs/setup-android.md)

> **Backend:** This client talks to any CodePush-compatible server. The
> default server URL is `https://codepush.appcenter.ms/`, but **the original
> App Center / Microsoft CodePush service is sunset**. You should run your own
> backend (such as [code-push-server](https://github.com/lisong/code-push-server))
> or use a hosted alternative, and configure the URL via the
> `CodePushServerURL` key in `Info.plist` (iOS) or the `CodePushServerUrl`
> string resource in `strings.xml` (Android).

## Plugin usage

With the CodePush plugin installed and linked, and your app asking CodePush
where to get the right JS bundle from, the only thing left is to add the
necessary code to your app to control the following policies:

1. When (and how often) to check for an update? (for example, on app start, in
   response to clicking a button in a settings page, periodically at some
   fixed interval).
2. When an update is available, how to present it to the end user?

The simplest way to do this is to "CodePush-ify" your app's root component. To
do so, you can choose one of the following two options:

* **Option 1: Wrap your root component with the `codePush` higher-order
  component:**

  * For a class component

    ```javascript
    import codePush from "@ducky0203/react-native-code-push";

    class MyApp extends Component {
    }

    MyApp = codePush(MyApp);
    ```

  * For a functional component

    ```javascript
    import codePush from "@ducky0203/react-native-code-push";

    let MyApp: () => React$Node = () => {
    }

    MyApp = codePush(MyApp);
    ```

* **Option 2: Use the ES7 decorator syntax:**

  *NOTE: Decorators are not yet supported in Babel 6.x pending proposal
  update.* You may need to enable it by installing and using
  [babel-preset-react-native-stage-0](https://github.com/skevy/babel-preset-react-native-stage-0).

  * For a class component

    ```javascript
    import codePush from "@ducky0203/react-native-code-push";

    @codePush
    class MyApp extends Component {
    }
    ```

  * For a functional component

    ```javascript
    import codePush from "@ducky0203/react-native-code-push";

    const MyApp: () => React$Node = () => {
    }

    export default codePush(MyApp);
    ```

By default, CodePush will check for updates on every app start. If an update is
available, it will be silently downloaded, and installed the next time the app
is restarted (either explicitly by the end user or by the OS), which ensures
the least invasive experience for your end users. If an available update is
mandatory, then it will be installed immediately, ensuring that the end user
gets it as soon as possible.

If you would like your app to discover updates more quickly, you can also
choose to sync up with the CodePush server every time the app resumes from the
background.

* For a class component

    ```javascript
    let codePushOptions = { checkFrequency: codePush.CheckFrequency.ON_APP_RESUME };

    class MyApp extends Component {
    }

    MyApp = codePush(codePushOptions)(MyApp);
    ```

* For a functional component

    ```javascript
    let codePushOptions = { checkFrequency: codePush.CheckFrequency.ON_APP_RESUME };

    let MyApp: () => React$Node = () => {
    }

    MyApp = codePush(codePushOptions)(MyApp);
    ```

Alternatively, if you want fine-grained control over when the check happens
(like a button press or timer interval), you can call
[`CodePush.sync()`](docs/api-js.md#codepushsync) at any time with your desired
`SyncOptions`, and optionally turn off CodePush's automatic checking by
specifying a manual `checkFrequency`:

```javascript
let codePushOptions = { checkFrequency: codePush.CheckFrequency.MANUAL };

class MyApp extends Component {
    onButtonPress() {
        codePush.sync({
            updateDialog: true,
            installMode: codePush.InstallMode.IMMEDIATE
        });
    }

    render() {
        return (
            <View>
                <TouchableOpacity onPress={this.onButtonPress}>
                    <Text>Check for updates</Text>
                </TouchableOpacity>
            </View>
        )
    }
}

MyApp = codePush(codePushOptions)(MyApp);
```

If you would like to display an update confirmation dialog (an "active
install"), configure when an available update is installed (like force an
immediate restart) or customise the update experience in any other way, refer
to the [`codePush()`](docs/api-js.md#codepush) API reference.

*NOTE: If you are using [Redux](http://redux.js.org) and
[Redux Saga](https://redux-saga.js.org/), you can alternatively use the
[react-native-code-push-saga](http://github.com/lostintangent/react-native-code-push-saga)
module, which allows you to customise when `sync` is called in a perhaps
simpler/more idiomatic way.*

## Releasing updates

Once your app is configured and distributed to your users and you have made
some JS or asset changes, it's time to release them. The recommended way to do
that is via the [`code-push`](https://github.com/microsoft/code-push/tree/v3.0.1/cli)
CLI, which will bundle your JavaScript files, asset files, and release the
update to the CodePush server.

```shell
npm install -g code-push-cli
```

*NOTE: Before you can start releasing updates, please log into your CodePush
server using the `code-push login` command (use `--serverUrl` to point at your
self-hosted server).*

In its most basic form, this command only requires application name and
platform (ios/android):

```shell
code-push release-react <appName> <platform ios/android>
code-push release-react MyApp android -d Production
```

The `release-react` command enables such a simple workflow because it provides
many sensible defaults (like generating a release bundle, assuming your app's
entry file on iOS is either `index.ios.js` or `index.js`). However, all of
these defaults can be customised to allow incremental flexibility as
necessary, which makes it a good fit for most scenarios.

```shell
# Release a mandatory update with a changelog
code-push release-react MyApp ios -m --description "Modified the header color"

# Release an update for an app that uses a non-standard entry file name, and also capture
# the sourcemap file generated by react-native bundle
code-push release-react MyApp ios --entry-file MyApp.js --sourcemapOutput ../maps/MyApp.map

# Release a dev Android build to just 1/4 of your end users
code-push release-react MyApp android --rollout 25 --development true

# Release an update that targets users running any 1.1.* binary
code-push release-react MyApp android --targetBinaryVersion "~1.1.0"
```

The CodePush client supports differential updates, so even though you are
releasing your JS bundle and assets on every update, your end users will only
download the files they need.

For more details about how the `release-react` command works, as well as the
various parameters it exposes, refer to the
[CLI docs](https://github.com/microsoft/code-push/tree/v3.0.1/cli#releasing-updates-general).
Additionally, if you would prefer to handle running the `react-native bundle`
command yourself, refer to the
[`release` command](https://github.com/microsoft/code-push/tree/v3.0.1/cli#releasing-updates-general)
for more details.

*NOTE: CodePush updates should be tested in modes other than Debug mode. In
Debug mode, the React Native app always downloads the JS bundle generated by
the packager, so the JS bundle downloaded by CodePush does not apply.*

### Multi-Deployment Testing

In our [getting started](#getting-started) docs we illustrated how to
configure the CodePush plugin using a specific deployment key. However, in
order to effectively test your releases, it is critical that you leverage the
`Staging` and `Production` deployments that are auto-generated when you first
create your CodePush app (or any custom deployments you may have created).
This way, you never release an update to your end users that you haven't been
able to validate yourself.

*NOTE: The client-side rollback feature can help unblock users after installing
a release that resulted in a crash, and server-side rollbacks (i.e.
`code-push rollback`) allow you to prevent additional users from installing a
bad release once it's been identified.*

Workflow:

1. Release a CodePush update to your `Staging` deployment using
   `code-push release-react` (or `code-push release` if you need more
   control).
2. Run your staging/beta build of your app, sync the update from the server,
   and verify it works as expected.
3. Promote the tested release from `Staging` to `Production` using the
   `code-push promote` command.
4. Run your production/release build of your app, sync the update from the
   server, and verify it works as expected.

For platform-specific demo setups see:

  * [Android](docs/multi-deployment-testing-android.md)
  * [iOS](docs/multi-deployment-testing-ios.md)

### Dynamic Deployment Assignment

The above section illustrated how you can leverage multiple CodePush
deployments in order to effectively test your updates before broadly releasing
them. However, since that workflow statically embeds the deployment
assignment into the actual binary, a staging or production build will only
ever sync updates from that deployment. If you want to be able to perform A/B
tests, or provide early access of your app to certain users, it can prove
very useful to be able to dynamically place specific users (or audiences) into
specific deployments at runtime.

To achieve this kind of workflow, all you need to do is specify the deployment
key you want the current user to synchronise with when calling the `codePush`
method. When specified, this key will override the "default" one that was
provided in your app's `Info.plist` (iOS) or `MainActivity` (Android) files.
This allows you to produce a build for staging or production that is also
capable of being dynamically "redirected" as needed.

```javascript
// Imagine that "userProfile" is a prop that this component received
// which includes the deployment key that the current user should use.
codePush.sync({ deploymentKey: userProfile.CODEPUSH_KEY });
```

```shell
# Create your new deployment to hold releases of a specific app variant
code-push deployment add MyApp test-variant-one

# Target any new releases at that custom deployment
code-push release-react MyApp android -d test-variant-one
```

---

## API Reference

* [JavaScript API](docs/api-js.md)
* [Objective-C API Reference (iOS)](docs/api-ios.md)
* [Java API Reference (Android)](docs/api-android.md)

### Store Guideline Compliance

Android Google Play and iOS App Store have corresponding guidelines that have
rules you should be aware of before integrating the CodePush solution within
your application.

#### Google play

The third paragraph of the
[Device and Network Abuse](https://support.google.com/googleplay/android-developer/answer/9888379?hl=en)
topic describes that updating source code by any method other than Google
Play's update mechanism is restricted, but this restriction does not apply to
updating JavaScript bundles.

> This restriction does not apply to code that runs in a virtual machine and
> has limited access to Android APIs (such as JavaScript in a webview or
> browser).

That fully allows CodePush as it updates just JS bundles and can't update the
native code part.

#### App Store

Paragraph **3.3.2**, since back in 2015's
[Apple Developer Program License Agreement](https://developer.apple.com/programs/ios/information/)
fully allowed performing over-the-air updates of JavaScript and assets — and
in its latest version (20170605)
[downloadable here](https://developer.apple.com/terms/) this ruling is even
broader:

> Interpreted code may be downloaded to an Application but only so long as
> such code: (a) does not change the primary purpose of the Application by
> providing features or functionality that are inconsistent with the intended
> and advertised purpose of the Application as submitted to the App Store,
> (b) does not create a store or storefront for other code or applications,
> and (c) does not bypass signing, sandbox, or other security features of the
> OS.

CodePush allows you to follow these rules in full compliance, so long as the
update you push does not significantly deviate your product from its original
App Store-approved intent.

To further remain in compliance with Apple's guidelines we suggest that App
Store-distributed apps don't enable the `updateDialog` option when calling
`sync`, since in the
[App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
it is written that:

> Apps must not force users to rate the app, review the app, download other
> apps, or other similar actions in order to access functionality, content,
> or use of the app.

### Debugging / Troubleshooting

The `sync` method includes a lot of diagnostic logging out-of-the-box, so if
you're encountering an issue when using it, the best thing to try first is
examining the output logs of your app.

The simplest way to view these logs is to add the flag `--debug` for each
command. This will output a log stream that is filtered to just CodePush
messages.

Additionally, you can also use any of the platform-specific tools to view the
CodePush logs: the Chrome DevTools Console, the Xcode Console (iOS), the
[OS X Console](https://en.wikipedia.org/wiki/Console_%28OS_X%29#.7E.2FLibrary.2FLogs)
(iOS), and/or `adb logcat` (Android), and look for messages which are prefixed
with `[CodePush]`.

Note that by default, React Native logs are disabled on iOS in release builds,
so if you want to view them in a release build, you need to make the
following changes to your `AppDelegate.m` file:

1. Add an `#import <React/RCTLog.h>` statement.
2. Add the following statement to the top of your
   `application:didFinishLaunchingWithOptions` method:

    ```objective-c
    RCTSetLogThreshold(RCTLogLevelInfo);
    ```

Now you'll be able to see CodePush logs in either debug or release mode, on
both iOS and Android. If examining the logs doesn't provide an indication of
the issue, please refer to the following common issues for additional
resolution ideas:

| Issue / Symptom | Possible solution |
|-----------------|-------------------|
| Compilation error | Double-check that your version of React Native is [compatible](#supported-react-native-versions) with the CodePush version you are using. |
| Network timeout / hang when calling `sync` or `checkForUpdate` in the iOS Simulator | Try resetting the simulator by selecting the `Simulator -> Reset Content and Settings..` menu item, and then re-running your app. |
| Server responds with a `404` when calling `sync` or `checkForUpdate` | Double-check that the deployment key you added to your `Info.plist` (iOS), `build.gradle` (Android) or that you're passing to `sync` / `checkForUpdate`, is in fact correct. |
| Update not being discovered | Double-check that the version of your running app (like `1.0.0`) matches the version you specified when releasing the update to CodePush. Make sure that you are releasing to the same deployment that your app is configured to sync with. |
| Update not being displayed after restart | If you're not calling `sync` on app start, you need to explicitly call `notifyApplicationReady` on app start, otherwise the plugin will think your update failed and roll it back. |
| I've released an update for iOS but my Android app also shows an update and it breaks it | Be sure you have different deployment keys for each platform in order to receive updates correctly. |
| I've released a new update but changes are not reflected | Be sure that you are running the app in modes other than Debug. |
| No JS bundle is being found when running your app against the iOS simulator | By default, React Native doesn't generate your JS bundle when running against the simulator. Build for a real device or for Release to generate it. |

### TypeScript Consumption

This module ships its `*.d.ts` file as part of its NPM package, which allows
you to simply `import` it and receive intellisense in supporting editors (like
Visual Studio Code) as well as compile-time type checking if you're using
TypeScript. For the most part, this behaviour should just work out of the
box. However, if you've specified `es6` as the value for either the `target`
or `module`
[compiler option](http://www.typescriptlang.org/docs/handbook/compiler-options.html)
in your
[`tsconfig.json`](http://www.typescriptlang.org/docs/handbook/tsconfig-json.html)
file, then just make sure that you also set the `moduleResolution` option to
`node`. This ensures that the TypeScript compiler will look within the
`node_modules` for the type definitions of imported modules.

---

## License

MIT — see [LICENSE.md](LICENSE.md). This is a community fork; please refer to
the upstream [microsoft/react-native-code-push](https://github.com/microsoft/react-native-code-push)
project for the original copyright notice.
