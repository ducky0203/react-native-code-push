# Changelog

All notable changes to `@ducky0203/react-native-code-push` are documented in
this file.

This project is a maintained fork of
[microsoft/react-native-code-push](https://github.com/microsoft/react-native-code-push)
and follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## v1.0.0

First release published as `@ducky0203/react-native-code-push`, owned by
**DuckyPham**. Targets **React Native 0.85.3** and adapts the library to the
breaking changes introduced in the 0.85 line (New Architecture / Bridgeless
mode by default).

### Android

- Bumped `compileSdkVersion`, `targetSdkVersion`, `buildToolsVersion` defaults
  to Android SDK 35.
- Bumped `minSdkVersion` default to 24 (matches React Native 0.79+).
- Enabled `buildFeatures { buildConfig = true }` — required by AGP 8.x to keep
  using `buildConfigField`.
- Set Java source/target compatibility to 17 (required by React Native 0.85).
- Use the modern `com.facebook.react:react-android` artifact instead of the
  removed `react-native` Maven coordinate.
- Cleaned up `android/settings.gradle` (no longer references `:app`) and
  removed the obsolete `android.useDeprecatedNdk` flag from
  `android/gradle.properties`.
- Made `CodePushNativeModule.loadBundle` resilient against the new
  `UnsupportedOperationException` thrown by the stubbed legacy bridge:
  - Detects `ReactHost` (bridgeless) at runtime instead of using the
    library-side `BuildConfig.IS_NEW_ARCHITECTURE_ENABLED` flag.
  - Falls back to recreating the current `Activity` whenever the legacy
    `recreateReactContextInBackground` path is unavailable.
  - Catches `Throwable` from `getReactInstanceManager()` /
    `getReactNativeHost()` so apps running in bridgeless mode no longer
    crash on update install.

### iOS

- Kept `ios.deployment_target = 15.5`, which satisfies the RN 0.85 minimum
  of iOS 15.1.
- Source code already calls `RCTTriggerReloadCommandListeners`, so reload
  works in both bridge and bridgeless mode. The KVC fallback on `super.bridge`
  is a no-op under bridgeless because of Objective-C nil-messaging.

### Branding / housekeeping

- Renamed npm package: `@outblock/react-native-code-push` →
  `@ducky0203/react-native-code-push`.
- New maintainer: **DuckyPham**.
- Replaced the hard-coded server URL (`https://api.revopush.org/`) with the
  canonical CodePush default `https://codepush.appcenter.ms/`. **You must
  override this** via `CodePushServerURL` (`Info.plist`) on iOS or
  `CodePushServerUrl` (`strings.xml`) on Android — see README.
- Removed all third-party branding from the docs, README and source files.
- Updated keywords / description in `package.json` and added explicit
  `peerDependencies` (`react >=19.2.3`, `react-native >=0.85.3`).

### Notes for consumers

If your app is on the new architecture / bridgeless mode (the default on
RN 0.85), expose the bundle path to React Native by returning
`[CodePush bundleURL]` (iOS) or `CodePush.getJSBundleFile()` (Android) from
your host's `sourceURL` / `getJSBundleFile()` method. The native side will
trigger a reload — the host will then re-read the bundle URL and pick up the
freshly downloaded update.

```objc
// iOS – AppDelegate.mm
- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge {
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [CodePush bundleURL];
#endif
}
```

```kotlin
// Android – MainApplication.kt
override fun getJSBundleFile(): String? = CodePush.getJSBundleFile()
```
