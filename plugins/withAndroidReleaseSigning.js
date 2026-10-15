const { withAppBuildGradle } = require("expo/config-plugins");

const MARKER = "keystorePropertiesFile";

const HELPER = `def keystorePropertiesFile = rootProject.file("../credentials/keystore.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

`;

const RELEASE_CONFIG = `        release {
            if (keystorePropertiesFile.exists()) {
                storeFile file(keystoreProperties['storeFile'])
                storePassword keystoreProperties['storePassword']
                keyAlias keystoreProperties['keyAlias']
                keyPassword keystoreProperties['keyPassword']
            }
        }
`;

function withAndroidReleaseSigning(config) {
  return withAppBuildGradle(config, (config) => {
    if (config.modResults.language !== "groovy") return config;
    let contents = config.modResults.contents;
    if (!contents.includes(MARKER)) {
      contents = contents.replace("\nandroid {", `\n${HELPER}android {`);
      contents = contents.replace(
        "    signingConfigs {\n        debug {",
        `    signingConfigs {\n${RELEASE_CONFIG}        debug {`,
      );
      contents = contents.replace(
        /release \{\n(?:\s*\/\/.*\n)*\s*signingConfig signingConfigs\.debug/,
        "release {\n            signingConfig signingConfigs.release",
      );
    }
    config.modResults.contents = contents;
    return config;
  });
}

module.exports = withAndroidReleaseSigning;
