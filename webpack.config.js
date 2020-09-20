const webpack = require("webpack"),
  TerserWebpackPlugin = require("terser-webpack-plugin"),
  mode = require("gulp-mode")();

const isProduction = function () {
  if (mode.production()) {
    return {
      mode: "production",
      bool: false,
    };
  } else {
    return {
      mode: "development",
      bool: true,
    };
  }
};
const isDev = isProduction().bool;
const optimization = () => {
  const config = {
    splitChunks: {
      chunks: "all",
    },
  };
  if (isDev) {
    config.minimizer = [new TerserWebpackPlugin()];
  }
  return config;
};
const babelOptions = (preset) => {
  const opts = {
    presets: ["@babel/preset-env"],
    plugins: ["@babel/plugin-proposal-class-properties"],
  };

  if (preset) {
    opts.presets.push(preset);
  }
  return opts;
};
const jsLoaders = () => {
  const loaders = [
    {
      loader: "babel-loader",
      options: babelOptions(),
    },
  ];

  if (isDev) {
    loaders.push("eslint-loader");
  }

  return loaders;
};

const config = {
  mode: isProduction().mode,
  devtool: isDev ? "source-map" : "",
  entry: {
    app: "./src/assets/js/app.js",
  },
  output: {
    filename: "[name].js",
  },
  optimization: optimization(),
  module: {
    rules: [
      {
        test: /\.(js)$/,
        exclude: /(node_modules)/,
        use: jsLoaders(),
      },
    ],
  },
};

module.exports = {
  config: config,
  isProd: isProduction,
};
