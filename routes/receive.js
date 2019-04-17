const order = require('./order');

handleReceivingMoney = function (customer, crypto) {
    db.query("SELECT * FROM `buy_order` ORDER BY price DESC", (err, result) => {
        if (err) {
            return 1;
        }

        var sum = 0;
        for(i=0; i < result.length; i++){
            sum = sum + result[i].amount;
        }

        // Sum of buy orders needs to be higher or equal than the crypto received
        if (sum >= crypto){
            //Adds crypto received to customer balance in order to automatize the process in their name
            db.query("SELECT * FROM account WHERE account_id = ?", [customer], (err, result1) => {
                if (err) {
                    return 1;
                }
                let total = result1[0].crypto_balance + crypto;
                db.query("UPDATE account SET crypto_balance = ? WHERE account_id = ?", [total, customer], (err, result2) => {
                    if (err) {
                        return 1;
                    }
                    var fiat = 0;
                    convertReceivingMoney(customer, crypto, fiat);
                });
            });
        }
        else {
            console.log("Not enough local market orders to support this transaction")
        }
    });
}

convertReceivingMoney = function(customer, crypto, fiat) {
    db.query("SELECT * FROM `buy_order` ORDER BY price DESC LIMIT 1", (err, result) => {
        if (err) {
            return 1;
        }

        if(crypto == 0 ){
            //Money tottaly converted
            console.log("Received fiat: " + fiat.toFixed(2) + "€");
        }
        else{
            //If the buy offer sum is higher or equal to the crypto amount
            if(result[0].amount >= crypto){
                console.log("aqui: " + crypto * result[0].price);
                createSellOrder(customer, 2, result[0].price, crypto);
                convertReceivingMoney(customer, 0, (crypto * result[0].price));
            }
            else{   //If the buy offer sum is lower to the crypto amount
                createSellOrder(customer, 2, result[0].price, result[0].amount);
                convertReceivingMoney(customer, (crypto - result[0].amount), (fiat + (result[0].amount * result[0].price)));
            }
        }

    });
}