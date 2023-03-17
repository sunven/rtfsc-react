const path = require('path')
module.exports ={
  "devServer": {
    "port": 3301,
      static: {
        directory: path.join(__dirname, '../build'),
      },
  },
  webpack:{
    externals:{
      react: 'React',
      'react-dom': 'ReactDOM',
    }
  }
}
