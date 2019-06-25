// create and export config variables

// container for all envs

var environments = {};

// we will only export a part of this - a sub/object

environments.staging = {
  'httpPort': 3000,
  'httpsPort': 3001,
  'envName': 'staging'
}

environments.production = {
  'httpPort': 5000,
  'httpsPort': 5001,
  'envName': 'production'
}

// which to export? 
// read command line first, if it exists as string, make it lowercase
// this sh ould be staging or production
var currentEnvironment  = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase(): '';
// is env one of the one's defined? 
// env should be set to one of our envs
// if it is staging / prodcution, then as above, it will become an object, use it
// if it is none of the above, use default staging. 
var environmentToExport = typeof(environments[currentEnvironment]) =='object'? environments[currentEnvironment] : environments.staging;

// export only the request environemtn

module.exports = environmentToExport;