# Contributing

## Using the plugin

### Environment setup

`node.js` and `yarn` are needed for using this project. You can download the `node.js` installer here: https://nodejs.org/download/, and install `yarn` (classic, v1.x) following https://classic.yarnpkg.com/lang/en/docs/install/.

> This project uses **Yarn 1.x** as its package manager. The repo ships a
> `yarn.lock`; please do **not** commit a `package-lock.json` (it's
> `.gitignore`d).

Once you have installed `node.js` and `yarn`, install the dev dependencies for the project.

```
yarn install
```

### Using the plugin manually

Follow these steps to test your modifications to the plugin manually:
- clone this repository
- install the dependencies

	Navigate to the root folder from your command line console and run:
	```
	yarn install
	```
- install the plugin in a React-Native project

	Navigate to the root folder of your React-Native project from your command line console and run:
	```
	yarn add local_path_to_your_clone_of_this_repo
	```
- configure the plugin using the steps in the README.md
- build and run your app on an emulator or device

## Test

### Environment setup

First, make sure you have installed the dependencies for the plugin by following the steps above.

Then, make sure you have installed `react-native`.

```
yarn global add react-native
```

To run Android tests, make sure you have `sdk\tools`, `sdk\emulator` and  `sdk\platform-tools` in your PATH.

To run iOS tests, make sure you've installed CocoaPods and have `.gem/bin` in your PATH.

### Supported platforms

The plugin has end to end tests for Android and iOS. Depending on your development machine OS, you can run some or all the tests.

OS            | Supported tests
------------- | -------------
OS X          | Android, iOS
Windows       | Android

### Test descriptions

The tests first build the app.

They then check if the required emulators are currently running.

If an Android emulator is not running, it attempts to boot the latest Android emulator. You can specify an emulator by adding env variable `ANDROID_EMU=yourEmulatorNameHere` to the yarn command. For example: `ANDROID_EMU=yourEmulatorNameHere yarn test:android`.

If an iOS simulator is not running, it attempts to boot the latest iOS iPhone simulator. You can specify a simulator by adding env variable `IOS_EMU=yourSimulatorNameHere` to the yarn command. For example: `IOS_EMU="iPhone 8 (0567DFF8-329E-41A3-BD6D-E48E9DD5EF39)" yarn test:ios`.

If all the required emulators are not running and the tests fail to boot them, the tests will fail.

If you would like the tests to always restart the necessary emulators (killing them if they are currently running), setup a env variable `CLEAN=true` to the command. For example: `CLEAN=true yarn test`.

The desired unit tests are then run.

If you would like to skip building, add a `:fast` in the command you'd like to run. For example, `yarn test:ios` becomes `yarn test:fast:ios` or `yarn test:android` becomes `yarn test:fast:android`.

There is a both a full unit test suite and a "core" set of unit tests that you may run. If you would like to run only the core tests, setup a env variable `CORE=true` to the command. For example: `CORE=true yarn test:android`.

If you would like to pull the plugin from NPM rather than running the tests on the local version, setup a env variable `NPM=true` to the command. For example: `NPM=true yarn test:ios`.

#### Default

To run all of the unit tests on Android and iOS:
```
yarn test
```

#### iOS

To run all of the unit tests on iOS:
```
yarn test:ios
```

#### Android

To run all of the unit tests on Android:
```
yarn test:android
```

#### More examples

All possible testing configurations have tasks!

The platforms are ordered as follows, and ran in that order:
android, ios

To run the core unit tests on Android:
```
CORE=true yarn test:android
```

To run all of the unit tests on iOS and pull the plugin from NPM:
```
NPM=true yarn test:ios
```

To run all of the unit tests on Android and iOS without building first:
```
yarn test:fast
```

To run all of the unit tests on iOS and restart the emulators:
```
CLEAN=true yarn test:ios
```

To run the core unit tests on Android and pull the plugin from NPM:
```
NPM=true CORE=true yarn test:android
```

...and so on!
