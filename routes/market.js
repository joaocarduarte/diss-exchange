module.exports = {
    getOrders: (req, res) => {
        // execute query
        db.query("SELECT * FROM `buy_order` ORDER BY price DESC", (err, result1) => {
            if (err) {
                res.redirect('/');
            }
            db.query("SELECT * FROM `sell_order` ORDER BY price ASC", (err, result2) => {
                if (err) {
                    res.redirect('/');
                }
                res.render('market.ejs', {
                    title: "Market"
                    ,buy_order: result1
                    ,sell_order: result2
                });
            });
        });
    },
    addBuyOrder: (req, res) => {
        let account = req.body.buy_account;
        let currency = req.body.buy_currency;
        let price = req.body.buy_price;
        let amount = req.body.buy_amount;

        //Create buy order
        let insertBuyQuery = "INSERT INTO `buy_order` (account, currency, price, amount) VALUES ('1', '2', '" + price + "', '" + amount + "')";                     
        db.query(insertBuyQuery, (err, result) => {
            if (err) {
                return res.status(500).send(err);
            }
        });

        //Update fiat balance
        let balanceQuery = "SELECT fiat_balance FROM account WHERE account_id = 1";
        db.query(balanceQuery, (err, result) => {
            if (err) {
                return res.status(500).send(err);
            }

            let balance = result[0].fiat_balance;
            let balanceFinal = balance - (price * amount);
            
            let updateBalanceQuery = "UPDATE account SET fiat_balance=" + balanceFinal + " WHERE account_id = 1 ";
            db.query(updateBalanceQuery, (err, result) => {
                if (err) {
                    return res.status(500).send(err);
                }
                res.redirect('/market');
            });
        });
    },
    addSellOrder: (req, res) => {
        let account = req.body.sell_account;
        let currency = req.body.sell_currency;
        let price = req.body.sell_price;
        let amount = req.body.sell_amount;

        //Create sell order
        let query = "INSERT INTO `sell_order` (account, currency, price, amount) VALUES ('1', '2', '" + price + "', '" + amount + "')";                
        db.query(query, (err, result) => {
            if (err) {
                return res.status(500).send(err);
            }
        });

        //Update crypto balance
        let balanceQuery = "SELECT crypto_balance FROM account WHERE account_id = 1";
        db.query(balanceQuery, (err, result) => {
            if (err) {
                return res.status(500).send(err);
            }

            let balance = result[0].crypto_balance;
            let balanceFinal = balance - (amount);
            
            let updateBalanceQuery = "UPDATE account SET crypto_balance=" + balanceFinal + " WHERE account_id = 1 ";
            db.query(updateBalanceQuery, (err, result) => {
                if (err) {
                    return res.status(500).send(err);
                }
                res.redirect('/market');
            });
        });
    },
};