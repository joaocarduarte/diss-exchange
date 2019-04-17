const order = require('./order');
const stellar = require('./stellar');

module.exports = {
    getSendPage: (req, res) => {
        res.render('send.ejs', {
            title: "Send"
        });
    },
    sendMoney: (req, res) => {
        let destinationAddress = req.body.send_destination;
        let fiat = req.body.send_amount;
        let memo = "s" + req.body.send_memo;
        let userID = 1;

        console.log("destination: " + destinationAddress + " | fiat: " + fiat + " | memo: " + memo);
        handleSendingMoney(destinationAddress, fiat, memo);
        
        res.redirect('/');

    },
};

handleSendingMoney = function (destination, fiat, memo) {
    db.query("SELECT * FROM `sell_order` ORDER BY price ASC", (err, result) => {
        if (err) {
            return 1;
        }

        var sum = 0;
        for(i=0; i < result.length; i++){
            sum = sum + (result[i].price * result[i].amount);
        }

        // Sum of sell orders needs to be higher thatn the fiat to be transfared
        if (sum >= fiat){
            var crypto = 0;
            convertSendingMoney(destination, fiat, memo, crypto);
        }
        else {
            console.log("Not enough local market orders to support this transaction")
        }
    });
}

convertSendingMoney = function(destination, fiat, memo, crypto) {
    db.query("SELECT * FROM `sell_order` ORDER BY price ASC LIMIT 1", (err, result) => {
        if (err) {
            return 1;
        }

        if(fiat == 0 ){
            console.log("Send crypto: " + crypto.toFixed(7));
            stellar.handleRequestWithdrawal(1,crypto,destination,memo);
        }
        else{
            //If the sell offer sum is higher or equal to the fiat amount
            if((result[0].price * result[0].amount) >= fiat){
                console.log("aqui: " + (crypto + (fiat / result[0].price)) + "preço: " + result[0].price);
                createBuyOrder(1, 2, result[0].price, fiat / result[0].price);
                convertSendingMoney(destination, 0, memo, (crypto + (fiat / result[0].price)));
            }
            else{
                console.log("aqui1:" + (crypto + result[0].amount));
                createBuyOrder(1, 2, result[0].price, result[0].amount);
                convertSendingMoney(destination, (fiat - (result[0].price * result[0].amount)), memo, (crypto + result[0].amount));
            }
        }

    });
}