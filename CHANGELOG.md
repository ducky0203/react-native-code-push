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

- Lowered `ios.deployment_target` from `15.5` to **`15.1`** in `CodePush.podspec`
  to match the React Native 0.85.3 baseline. The previous `15.5` floor caused
  CocoaPods to fail resolution in host apps that legitimately ship with
  `platform :ios, '15.1'`:
  ```
  [!] CocoaPods could not find compatible versions for pod "CodePush":
        Specs satisfying the dependency were found, but they required a
        higher minimum deployment target.
  ```
  The `tvos.deployment_target` was lowered to `15.1` as well, and the
  `IPHONEOS_DEPLOYMENT_TARGET` build settings in
  `ios/CodePush.xcodeproj/project.pbxproj` were aligned to `15.1` (some
  entries were still pinned to a legacy `9.0`).
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
- **Dependency cleanup** to silence install-time deprecation warnings:
  - Removed `code-push@4.2.3` (App Center sunset; never required at runtime
    by this package — it was a leftover dev-CLI dep). This also kills the
    transitive `superagent@8`, `superagent@5`, `formidable@1.2.6` warnings.
  - Bumped `glob` from `^7.1.7` → `^13.0.6` (uses the back-compat
    `glob.sync` alias added in glob 9.3+; requires Node ≥20, already the
    minimum for RN 0.85.3).
  - Added a yarn `resolutions` entry forcing `uuid@^11.1.0` to override the
    deprecated `uuid@7` nested under `xcode@3.0.1` (xcode only calls
    `uuid.v4()`, which is backward-compatible).
- Switched the dev workflow from `npm` to **Yarn 1.x** (`yarn.lock` is the
  source of truth; `package-lock.json` is `.gitignore`d). CI, `CONTRIBUTING.md`
  and `package.json` scripts updated accordingly.

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
