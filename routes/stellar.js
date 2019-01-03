const sync_mysql = require('sync-mysql');

//SYNC db conection
var connection = new sync_mysql({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'exchange-db',
    multipleStatements: true
});
global.connection = connection;

//-------- STELLAR
// Config your server
var config = {};
config.baseAccount = "GCTBIDPRUIBUPB6ETJI7RSFPNZEGCGDE6DXCV73P6NX3RBZ43L4ADTWH";
config.baseAccountSecret = "SC2NXK74HDSNUWG6I5KNFN7GW3ADX77IU3PY3XXY7CTHWTQJYUXD5CCT";

module.exports.publicKey = config.baseAccount;


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
var lastToken = latestCursorPosition();

console.log("Last Cursor: " + lastToken);

// Listen for payments from where you last stopped
// GET https://horizon-testnet.stellar.org/accounts/{config.baseAccount}/payments?cursor={last_token}
let callBuilder = server.payments().forAccount(config.baseAccount);

// If no cursor has been saved yet, don't add cursor parameter
if (lastToken) {
    callBuilder.cursor(lastToken);
}


callBuilder.stream({onmessage: handlePaymentResponse});
/*
// Load the account sequence number from Horizon and return the account
// GET https://horizon-testnet.stellar.org/accounts/{config.baseAccount}
server.loadAccount(config.baseAccount).then(function (account) {
    submitPendingTransactions(account);
})
*/

function latestCursorPosition() {
    var cenas = connection.query("SELECT crsr FROM `StellarCursor` WHERE id = (SELECT MAX(id) FROM `StellarCursor`)");
    if(cenas[0] == undefined){
        return cenas[0];
    }
    return cenas[0].crsr;
}

//---- Listening for Deposits
function listenDeposits (){
    // Start listening for payments from where you last stopped
    var lastToken = latestCursorPosition();

    // GET https://horizon-testnet.stellar.org/accounts/{config.baseAccount}/payments?cursor={last_token}
    let callBuilder = server.payments().forAccount(config.baseAccount);

    // If no cursor has been saved yet, don't add cursor parameter
    if (lastToken) {
    callBuilder.cursor(lastToken);
    }

    callBuilder.stream({onmessage: handlePaymentResponse});
}


function handlePaymentResponse(record) {
    // GET https://horizon-testnet.stellar.org/transaction/{id-of-transaction-this-payment-is-part-of}
    record.transaction().then(function(txn) {
        var customer = txn.memo;
  
        // If this isn't a payment to the baseAccount, skip
        if (record.to != config.baseAccount) {
            return;
        }
        if (record.asset_type != 'native') {
           // If you are a XLM exchange and the customer sends
           // you a non-native asset, some options for handling it are
           // 1. Trade the asset to native and credit that amount
           // 2. Send it back to the customer  
        } else {
            // Credit the customer in the memo field
            var userExists = connection.query("SELECT EXISTS(SELECT 1 FROM account WHERE account_id = ?) AS cstmr", [customer]);
            if (userExists[0].cstmr) {

                // Store the amount the customer has paid you in your database
                var cryptoBalance = connection.query("SELECT * FROM account WHERE account_id = ?", [customer]);
                let total = cryptoBalance[0].crypto_balance + Number(record.amount);
                connection.query("UPDATE account SET crypto_balance = ? WHERE account_id = ?", [total, customer]);

                // Store the cursor in your database
                connection.query("INSERT INTO stellarcursor (crsr) VALUES (?)", [record.paging_token]);

                console.log("===> Payment received to account: " + customer
                    + "\n= Amout: " + record.amount 
                    + "\n= New cursor: " + record.paging_token
                    + "\n");

                /* TODO - Fazer o codigo em cima em transacao
                // Update in an atomic transaction
                db.transaction(function() {
                // Store the amount the customer has paid you in your database
                store([record.amount, customer], "StellarDeposits");
                // Store the cursor in your database
                store(record.paging_token, "StellarCursor");
                });
                */
            } else {
                // If customer cannot be found, you can raise an error,
                // add them to your customers list and credit them,
                // or do anything else appropriate to your needs
                console.log("!! Payment receiver with a invalid customer:" + customer);
          }
        }
    })
    .catch(function(err) {
    // Process error
    });
}

function submitPendingTransactions(account){
    return;
}