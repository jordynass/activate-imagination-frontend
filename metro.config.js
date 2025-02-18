const { getDefaultConfig } = require('@expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

// Add any custom configuration here
defaultConfig.resolver.assetExts.push(
  // Adds support for `.db` files for SQLite databases
  'db',
  // Add other file extensions you need here
);

defaultConfig.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
});

// Add any additional configuration specific to your app
defaultConfig.resolver.sourceExts = [
  'js',
  'jsx',
  'json',
  'ts',
  'tsx',
  'cjs',
  // Add other source extensions you need
];

// Configure the watchFolders to include any external workspaces or monorepo packages
defaultConfig.watchFolders = [
  ...defaultConfig.watchFolders,
  // Add paths to any external workspaces here if needed
];

// Configure the blockList to exclude test files and other patterns
defaultConfig.resolver.blockList = [
  /.*\.git\/.*/,
  /.*\/__tests__\/.*/,  // Exclude all files in __tests__ directories
  /.*\.test\.[jt]sx?$/,  // Exclude all .test.js, .test.jsx, .test.ts, and .test.tsx files
  /.*\.spec\.[jt]sx?$/,  // Exclude all .spec.js, .spec.jsx, .spec.ts, and .spec.tsx files
];

module.exports = defaultConfig;