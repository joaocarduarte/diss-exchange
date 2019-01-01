const express = require('express');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const util = require('util');
const path = require('path');
const app = express();

const {getSendPage} = require('./routes/send');
const {getOrders, addBuyOrder, addSellOrder} = require('./routes/market');
const {getAccountInfo, deleteAccountBuyOrder, deleteAccountSellOrder} = require('./routes/account');

const port = 5000;

// create connection to database
// the mysql.createConnection function takes in a configuration object which contains host, user, password and the database name.
const db = mysql.createConnection ({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'exchange-db',
    multipleStatements: true
});

// connect to database
db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Connected to database');
});
global.db = db;

// configure middleware
app.set('port', process.env.port || port); // set express to use this port
app.set('views', __dirname + '/views'); // set express to look in this folder to render our view
app.set('view engine', 'ejs'); // configure template engine
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); // parse form data client
app.use(express.static(path.join(__dirname, 'public'))); // configure express to use public folder
app.use(fileUpload()); // configure fileupload

// routes for the app
app.get('/', getSendPage);
app.get('/market', getOrders);
app.post('/addbuy', addBuyOrder);
app.post('/addsell', addSellOrder);
app.get('/account', getAccountInfo);
app.get('/deletebuy/:id', deleteAccountBuyOrder);
app.get('/deletesell/:id', deleteAccountSellOrder);
/*
app.get('/add', addPlayerPage);
app.get('/edit/:id', editPlayerPage);
app.get('/delete/:id', deletePlayer);
app.post('/add', addPlayer);
app.post('/edit/:id', editPlayer);
*/

// set the app to listen on the port
app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});

// STELLAR
// Config your server
var config = {};
config.baseAccount = "GCYRYPRECTSQMEHGQO4WSZA7OUKI7W4WGMDR72ZVVQ77NYVPVAVTKQLR";
config.baseAccountSecret = "SCKRH62WRNRTLKYPPGTDZENGWWYH7U4ATZCCWUJLOQN5K6D4FAX4YVTC";

// You can use Stellar.org's instance of Horizon or your own
config.horizon = 'https://horizon-testnet.stellar.org';

// Include the JS Stellar SDK
// It provides a client-side interface to Horizon
var StellarSdk = require('stellar-sdk');
// uncomment for live network:
// StellarSdk.Network.usePublicNetwork();

// Initialize the Stellar SDK with the Horizon instance
// You want to connect to
var server = new StellarSdk.Server(config.horizon);

// Get the latest cursor position
var lastToken = latestCursorPosition("StellarCursor");

console.log("lastToken -> " + lastToken);

async function latestCursorPosition(table) {
    try {
        db.query = util.promisify(db.query);
        var cenas = await db.query("SELECT * FROM `buy_order` WHERE buy_order_id = 1");
    }
    catch {
    }
    console.log(cenas[0].account);
    return cenas[0].account;
}

// Listen for payments from where you last stopped
// GET https://horizon-testnet.stellar.org/accounts/{config.baseAccount}/payments?cursor={last_token}
let callBuilder = server.payments().forAccount(config.baseAccount);

// If no cursor has been saved yet, don't add cursor parameter
if (lastToken) {
    callBuilder.cursor(lastToken);
}
/*
callBuilder.stream({onmessage: handlePaymentResponse});

// Load the account sequence number from Horizon and return the account
// GET https://horizon-testnet.stellar.org/accounts/{config.baseAccount}
server.loadAccount(config.baseAccount)
  .then(function (account) {
    submitPendingTransactions(account);
  })
*/


function handlePaymentResponse(){
    return;
}

function submitPendingTransactions(account){
    return;
}
