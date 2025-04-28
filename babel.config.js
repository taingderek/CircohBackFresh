module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
      'nativewind/babel',
      ['module-resolver', {
        alias: {
          '@': './'
        },
      }],
      ['module:react-native-dotenv', {
        moduleName: '@env',
        path: '.env.development',
        blacklist: null,
        whitelist: null,
        safe: false,
        allowUndefined: true
      }]
    ]
  };
}; 