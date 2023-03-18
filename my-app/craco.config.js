const path = require('path');
console.log(path.join(__dirname, '../build'));
module.exports = {
  devServer: {
    port: 3301,
    static: ['./public', '../build'],
  },
  webpack: {
    externals: {
      react: 'React',
      'react-dom': 'ReactDOM',
    },
  },
};
