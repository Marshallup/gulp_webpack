require("colors");
module.exports = {
  plugins: [
    require("postcss-easy-import")({
      extensions: ".css",
    }),
    require("autoprefixer"),
    require("doiuse")({
      browsers: [
        "> .5% and last 2 versions",
        "not dead",
        "not OperaMini all",
        "ie >= 11",
        "Edge >= 12",
      ],
      ignore: ["rem"], // an optional array of features to ignore
      ignoreFiles: ["**/normalize.css", "**/modern-css-reset/dist/*.css"], // an optional array of file globs to match against original source file path, to ignore
      onFeatureUsage: function (info) {
        const selector = info.usage.parent.selector;
        const property = `${info.usage.prop}: ${info.usage.value}`;

        let status = info.featureData.caniuseData.status.toUpperCase();

        if (info.featureData.missing) {
          status = "NOT SUPPORTED".red;
        } else if (info.featureData.partial) {
          status = "PARTIAL SUPPORT".yellow;
        }
        console.log(
          `\n${status}:\n\n    ${selector} {\n        ${property};\n    }\n`
        );
      },
    }),
    require("postcss-sorting")({
      order: [
        "custom-properties",
        "dollar-variables",
        "declarations",
        "at-rules",
        "rules",
      ],

      "properties-order": "alphabetical",

      "unspecified-properties-position": "bottom",
    }),
    require("node-css-mqpacker"),
  ],
};
