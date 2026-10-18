plugins {
    id("com.android.library")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.halex.security"
    compileSdk = 34

    defaultConfig {
        minSdk = 26
    }
}

dependencies {
    testImplementation("junit:junit:4.13.2")
}
