const sync_mysql = require('sync-mysql');
var StellarSdk = require('stellar-sdk');
const receive = require('./receive');

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
var sourceKeys = StellarSdk.Keypair.fromSecret('SA7RB5DI4XYYHMNI4G7SK6HJEBNWARU7V4O5EUFRM2MNECQA3MOVNEVQ');

var config = {};
config.baseAccount = "GCCBAN6UI27YF7HLJZHLM47TJW2VD7KIBOKCICITA4577K4HZ4TY2HNZ";
config.baseAccountSecret = "SA7RB5DI4XYYHMNI4G7SK6HJEBNWARU7V4O5EUFRM2MNECQA3MOVNEVQ";

module.exports.publicKey = config.baseAccount;

StellarSdk.Network.useTestNetwork();

// Initialize the Stellar SDK with the Horizon instance
config.horizon = 'https://horizon-testnet.stellar.org';
var server = new StellarSdk.Server(config.horizon);

// Get the latest cursor position
var lastToken = latestCursorPosition();

// Listen for payments from where you last stopped
let callBuilder = server.payments().forAccount(config.baseAccount);

// If no cursor has been saved yet, don't add cursor parameter
if (lastToken) {
    callBuilder.cursor(lastToken);
}

callBuilder.stream({onmessage: handlePaymentResponse});

// Load the account sequence number from Horizon and return the account
server.loadAccount(config.baseAccount).then(function (account) {
    submitPendingTransactions(account);
})


function latestCursorPosition() {
    var cenas = connection.query("SELECT crsr FROM `StellarCursor` WHERE id = (SELECT MAX(id) FROM `StellarCursor`)");
    if(cenas[0] == undefined){
        return cenas[0];
    }
    return cenas[0].crsr;
}

//Deposits
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

        if(customer.startsWith('s')){
            customer = customer.substring(1);

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

                    handleReceivingMoney(customer, Number(record.amount));

                    // Store the cursor in your database
                    connection.query("INSERT INTO stellarcursor (crsr) VALUES (?)", [record.paging_token]);

                    console.log("\n===> Payment received to account: " + customer
                        + "\n= Amout: " + record.amount + " xlm"
                        + "\n= New cursor: " + record.paging_token);

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
                    // Store the cursor in your database
                    connection.query("INSERT INTO stellarcursor (crsr) VALUES (?)", [record.paging_token]);

                    console.log("===> Payment received to account: Invalid Account!!"
                        + "\n= Amout: " + record.amount + " xlm"
                        + "\n= New cursor: " + record.paging_token
                        + "\n");
                }
            }

        }
        else{
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
                        + "\n= Amout: " + record.amount + " xlm"
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
                    // Store the cursor in your database
                    connection.query("INSERT INTO stellarcursor (crsr) VALUES (?)", [record.paging_token]);

                    console.log("===> Payment received to account: Invalid Account!!"
                        + "\n= Amout: " + record.amount + " xlm"
                        + "\n= New cursor: " + record.paging_token
                        + "\n");
                }
            }
        }
    })
    .catch(function(err) {
    // Process error
    });
}


//Withdrawals
exports.handleRequestWithdrawal = function (userID,amountLumens,destinationAddress,memo) {
    // Read the user's balance from the exchange's database
    var cryptoBalance = connection.query("SELECT * FROM account WHERE account_id = ?", [userID]);

    // Check that user has the required lumens
    if (amountLumens <= cryptoBalance[0].crypto_balance){

        // Debit the user's internal lumen balance by the amount of lumens they are withdrawing
        let total = cryptoBalance[0].crypto_balance - amountLumens;
        connection.query("UPDATE account SET crypto_balance = ? WHERE account_id = ?", [total, userID]);

        // Save the transaction information in the StellarTransactions table
        // store([userID, destinationAddress, amountLumens, "pending"], "StellarTransactions");
        connection.query("INSERT INTO stellartransactions (user_id, destination, xlm_amount, memo, state) VALUES (?, ?, ?, ?, ?);", [userID, destinationAddress, amountLumens, memo, "pending"]);

        console.log("\n===> Withdraw from account: " + userID
                    + "\n= Amout: " + amountLumens + " xlm"
                    + "\n= Destination: " + destinationAddress
                    + "\n= Memo: " + memo
                    + "\n");
        
    } else {
        // If the user doesn't have enough XLM, you can alert them
        console.log("User doesn't have enough XLM!");
    }
}



// This is the function that handles submitting a single transaction
async function submitTransaction( transactionId, destinationAddress, amountLumens, memo) {
    console.log("\n===> Submitting trasaction " + transactionId + "; amount = "+ amountLumens);
    
    // Update transaction state to sending so it won't be resubmitted in case of the failure.
    connection.query("UPDATE stellartransactions SET state = ? WHERE id = ?", ["sending", transactionId]);

    await server.loadAccount(destinationAddress)
    // If the account is not found, surface a nice error message for logging.
    .catch(StellarSdk.NotFoundError, function (error) {
        connection.query("UPDATE stellartransactions SET state = ? WHERE id = ?", ["error", transactionId]);
        throw new Error('The destination account does not exist!');
    })
    // If there was no error, load up-to-date information on your account.
    .then(function() {
        return server.loadAccount(sourceKeys.publicKey());
    })
    .then(function(sourceAccount) {
        // Start building the transaction.
        transaction = new StellarSdk.TransactionBuilder(sourceAccount)
        .addOperation(StellarSdk.Operation.payment({
            destination: destinationAddress,
            asset: StellarSdk.Asset.native(),
            amount: amountLumens.toString()
        }))
        // A memo is optional
        .addMemo(StellarSdk.Memo.text(memo))
        .build();

        // Sign the transaction to prove you are actually the person sending it.
        transaction.sign(sourceKeys);

        // And finally, send it off to Stellar!
        return server.submitTransaction(transaction);
    })
    .then(function(result) {
        connection.query("UPDATE stellartransactions SET state = ? WHERE id = ?", ["done", transactionId]);
        console.log('= Success!\n');
        //console.log('Results:', result);
    })
    .catch(function(error) {
        connection.query("UPDATE stellartransactions SET state = ? WHERE id = ?", ["error", transactionId]);
        console.error('Something went wrong!', error);
        // If the result is unknown (no response body, timeout etc.) we simply resubmit
        // already built transaction:
        // server.submitTransaction(transaction);
    });
}

// This function handles submitting all pending transactions, and calls the previous one
// This function should be run in the background continuously

async function submitPendingTransactions() {
    // See what transactions in the db are still pending
    var pendingTransactions = connection.query("SELECT * FROM stellartransactions WHERE state = ?", ["pending"]);
    

    if (pendingTransactions.length > 0) {
        var tx = pendingTransactions.pop();
        await submitTransaction( tx.id, tx.destination, tx.xlm_amount, tx.memo);
    }

    // Wait 30 seconds and process next batch of transactions.
    setTimeout(
        function() {
        submitPendingTransactions();
        }, 0*1000);

}