module.exports = {
  networks: {
  development: {
  host: process.env.DEVELOPMENT_HOST,
  port: 8545,
  network_id: "*"
 },
 coverage: {
   host: "localhost",
   network_id: "*",
   port: 8545,         // <-- If you change this, also set the port option in .solcover.js.
   gas: 0xfffffffffff, // <-- Use this high gas value
   gasPrice: 0x01      // <-- Use this low gas price
 },
 rinkeby:{
   host: process.env.LIVE_HOST,
   port: process.env.LIVE_PORT,
   network_id:"*",
   gas: 700000,
   gasPrice: 0
 }
},
solc: {
 optimizer: {
   enabled: true,
   runs: 200
 }
},
// mocha: {  
//  reporter: "spec",
//  reporter: "mocha-junit-reporter", 
//  reporterOptions: {  
//    mochaFile: "coverage/testresults.xml"
//  }  
// },
};
