const { withDangerousMod } = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

const MARKER = 'embed-pods-xcodeproj';

const SNIPPET = `
# ${MARKER}: build the app .xcodeproj without opening the CocoaPods workspace.
post_integrate do |installer|
  require_relative '../plugins/embed-pods-xcodeproj'
  EmbedPodsXcodeproj.integrate(installer)
end
`;

function withPodsXcodeproj(config) {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const podfilePath = path.join(config.modRequest.platformProjectRoot, 'Podfile');
      const contents = fs.readFileSync(podfilePath, 'utf8');
      if (!contents.includes(MARKER)) {
        fs.writeFileSync(podfilePath, `${contents.trimEnd()}\n${SNIPPET}`);
      }
      return config;
    },
  ]);
}

module.exports = withPodsXcodeproj;
