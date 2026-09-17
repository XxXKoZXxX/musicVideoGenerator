// jest.config.js
// Exports CRA-compatible Jest configuration so standalone Jest CLI and IDE test extensions
// (e.g. VS Code / Antigravity Jest) run tests with proper Babel & asset transforms.
const path = require('path');
const createJestConfig = require('react-scripts/scripts/utils/createJestConfig');

module.exports = createJestConfig(
  (relativePath) => path.resolve(__dirname, 'node_modules/react-scripts', relativePath),
  __dirname,
  false
);
