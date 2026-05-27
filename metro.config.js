// Expo Metro config. The infra/ folder is a separate CDK project with its own
// node_modules — exclude it so Metro doesn't crawl or watch it.
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

const infraDir = path.resolve(__dirname, 'infra');
config.resolver.blockList = [new RegExp(`^${infraDir.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/.*`)];

module.exports = config;
