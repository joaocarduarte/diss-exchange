const mysql = require('mysql');

const connection = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password : 'password',
    database : 'exchange-db'
});

connection.connect(function(err) {
    if (err) throw err;
    console.log("Connected to exchange-db as id " + connection.threadId);

    //Account Table
    var account = `CREATE TABLE IF NOT EXISTS account(
        account_id INT AUTO_INCREMENT PRIMARY KEY, 
        iban CHAR(25),
        fiat_balance DECIMAL(13,2),
        crypto_balance DECIMAL(18,7)
    );`;
    connection.query(account, function(err, results, fields){
        if(err) throw err;
        console.log("Account table created")
    })

    //Currency Table
    var currency = `CREATE TABLE IF NOT EXISTS currency(
        currency_id INT AUTO_INCREMENT PRIMARY KEY, 
        symbol VARCHAR(4)
    );`;
    connection.query(currency, function(err, results, fields){
    if(err) throw err;
    console.log("Currency table created")
    })

    //Buy Order Table
    var buy_order = `CREATE TABLE IF NOT EXISTS buy_order(
        buy_order_id INT AUTO_INCREMENT PRIMARY KEY,
        account INT, 
        currency INT,
        price DECIMAL(13,2),
        amount DECIMAL(18,7),
        FOREIGN KEY (account) REFERENCES account(account_id),
        FOREIGN KEY (currency) REFERENCES currency(currency_id)
    );`;
    connection.query(buy_order, function(err, results, fields){
    if(err) throw err;
    console.log("Buy order table created")
    })

    //Sell Order Table
    var sell_order = `CREATE TABLE IF NOT EXISTS sell_order(
        sell_order_id INT AUTO_INCREMENT PRIMARY KEY, 
        account INT, 
        currency INT,
        price DECIMAL(13,2),
        amount DECIMAL(18,7),
        FOREIGN KEY (account) REFERENCES account(account_id),
        FOREIGN KEY (currency) REFERENCES currency(currency_id)
    );`;
    connection.query(sell_order, function(err, results, fields){
    if(err) throw err;
    console.log("Sell order table created")
    })

    //Transaction Table
    var transaction = `CREATE TABLE IF NOT EXISTS transaction(
        transaction_id INT AUTO_INCREMENT PRIMARY KEY,
        account INT, 
        currency INT,
        amount DECIMAL(18,7),
        destination_iban CHAR(25),
        FOREIGN KEY (account) REFERENCES account(account_id),
        FOREIGN KEY (currency) REFERENCES currency(currency_id)
    );`;
    connection.query(transaction, function(err, results, fields){
    if(err) throw err;
    console.log("Transaction table created")
    })

    //Account Inserts
    var account_inserts = `INSERT INTO account (iban, fiat_balance, crypto_balance) VALUES ?;`;
    var account_inserts_values =[
        ['PT50002700000001234567831', 500, 500],
        ['PT50002700000001234567832', 1000, 1000]
    ];
    connection.query(account_inserts, [account_inserts_values], function (err, result) {
    if (err) throw err;
    console.log("Inserts into Account table");
    });

    //Currency Inserts
    var currency_inserts = `INSERT INTO currency VALUES ?;`;
    var currency_inserts_values =[
        [ 1,'EUR'],
        [ 2,'XLM']
    ];
    connection.query(currency_inserts, [currency_inserts_values], function (err, result) {
    if (err) throw err;
    console.log("Inserts into Currency table");
    });

    //Buy Orders Inserts
    var buy_order_inserts = `INSERT INTO buy_order VALUES ?;`;
    var buy_order_inserts_values =[
        [ 1, 1, 2, 5, 10],
        [ 2, 2, 2, 2, 30],
    ];
    connection.query(buy_order_inserts, [buy_order_inserts_values], function (err, result) {
    if (err) throw err;
    console.log("Inserts into Buy Order table");
    });

    //Sell orders Inserts
    var sell_order_inserts = `INSERT INTO sell_order VALUES ?;`;
    var sell_order_inserts_values =[
        [ 1, 1, 1, 10, 60],
        [ 2, 2, 1, 20, 50],
    ];
    connection.query(sell_order_inserts, [sell_order_inserts_values], function (err, result) {
    if (err) throw err;
    console.log("Inserts into Sell Order table");
    });


  });