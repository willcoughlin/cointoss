module.exports = {
  entry: './src/static/index.tsx',
  output: {
    filename: 'bundle.js',
    path: __dirname + '/dist/static'
  },
  devtool: 'source-map',
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json', '.css']
  },
  module: {
    rules: [
      { 
        test: /\.tsx?$/, 
        loader: 'awesome-typescript-loader' 
      },
      { 
        enforce: 'pre', 
        test: /\.js$/, 
        loader: 'source-map-loader' 
      },
      {
        test: /\.css$/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-modules-typescript-loader' },
          { loader: 'css-loader' }
        ]
      }
    ]
  },
  externals: {
    'react': 'React',
    'react-dom': 'ReactDOM',
    'socket.io': 'io'
  }
}