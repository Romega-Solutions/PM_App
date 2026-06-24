module.exports = function (api) {
  api.cache(true);
  const isTest = process.env.NODE_ENV === 'test';
  
  const plugins = [];
  
  if (!isTest) {
    plugins.push([
      "babel-plugin-import",
      {
        libraryName: "lucide-react-native",
        customName: (name) => {
          if (name === 'lucide-icon') return 'lucide-react-native';
          const aliases = {
            "check-circle": "circle-check",
            "x-circle": "circle-x",
            "check-circle2": "circle-check-big",
            "alert-circle": "circle-alert",
            "upload-cloud": "cloud-upload",
            "edit": "pencil",
            "help-circle": "circle-question-mark",
            "alert-triangle": "triangle-alert",
            "home": "house"
          };
          const resolvedName = aliases[name] || name;
          return `lucide-react-native/dist/esm/icons/${resolvedName}.js`;
        }
      }
    ]);
  }

  return {
    presets: [
      "babel-preset-expo"
    ],
    plugins
  };
};
