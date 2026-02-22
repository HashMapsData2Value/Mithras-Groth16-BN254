# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# React Native / fbjni
# Fixes crashes like:
#   java.lang.NoSuchFieldError: no "Lcom/facebook/jni/HybridData;" field "mHybridData" in class
#   "Lcom/facebook/react/cxxbridge/CatalystInstanceImpl;"
#
# Note: these rules only apply when code shrinking is enabled (e.g. Release with `minifyEnabled true`).

-keep class com.facebook.jni.HybridData { *; }

# Keep the backing native handle field name stable for JNI.
-keepclassmembers class com.facebook.react.cxxbridge.CatalystInstanceImpl {
	com.facebook.jni.HybridData mHybridData;
}

# Some RN versions place CatalystInstanceImpl under bridge.*
-keepclassmembers class com.facebook.react.bridge.CatalystInstanceImpl {
	com.facebook.jni.HybridData mHybridData;
}

# Conservative keeps for commonly-reflected bridge classes (from historical RN/Proguard issues).
-keep class com.facebook.react.cxxbridge.ModuleRegistryHolder { *; }
-keep class com.facebook.react.cxxbridge.CatalystInstanceImpl { *; }
-keep class com.facebook.react.cxxbridge.JavaScriptExecutor { *; }
-keep class com.facebook.react.bridge.queue.NativeRunnable { *; }
-keep class com.facebook.react.bridge.ReadableType { *; }
