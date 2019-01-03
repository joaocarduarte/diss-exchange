const stellar = require('./stellar');

module.exports = {
    getAccountInfo: (req, res) => {
        db.query("SELECT * FROM account LIMIT 1; SELECT * FROM `buy_order` WHERE account=1 ORDER BY price DESC; SELECT * FROM `sell_order` WHERE account=1 ORDER BY price ASC", [1, 2, 3], (err, results) => {
            if (err) {
                res.redirect('/');
            }
            res.render('account.ejs', {
                title: "Account"
                ,account: results[0]
                ,buy_order: results[1]
                ,sell_order: results[2]
                ,publicKey: stellar.publicKey
            });
        });

        //stellar.listenDeposits();  
    },
    deleteAccountBuyOrder: (req, res) => {
        let buy_order_id = req.params.id;

        //Get total value in the order
        let selectOrderQuery = "SELECT * FROM `buy_order` WHERE buy_order_id = ?";
        db.query(selectOrderQuery, [buy_order_id], (err, result) => {
            if (err) {
                return res.status(500).send(err);
            }
            let total = result[0].price * result[0].amount;

            //Get fiat balance from account
            let balanceQuery = "SELECT fiat_balance FROM account WHERE account_id = 1";
            db.query(balanceQuery, (err, result1) => {
                if (err) {
                    return res.status(500).send(err);
                }
                let balanceFinal = result1[0].fiat_balance + total;
                
                //Update fiat balance
                let updateBalanceQuery = "UPDATE account SET fiat_balance=" + balanceFinal + " WHERE account_id = 1 ";
                db.query(updateBalanceQuery, (err, result2) => {
                    if (err) {
                        return res.status(500).send(err);
                    }

                    //Delete buy order
                    let deleteQuery = "DELETE FROM `buy_order` WHERE buy_order_id = ?";
                    db.query(deleteQuery, [buy_order_id], (err, result) => {
                        if (err) {
                            return res.status(500).send(err);
                        }
                        res.redirect('/account');
                    });
                });
            });
        });
    },
    deleteAccountSellOrder: (req, res) => {
        let sell_order_id = req.params.id;

        //Get total value in the order
        let selectOrderQuery = "SELECT * FROM `sell_order` WHERE sell_order_id = ?";
        db.query(selectOrderQuery, [sell_order_id], (err, result) => {
            if (err) {
                return res.status(500).send(err);
            }
            let total = result[0].price * result[0].amount;

            //Get crypto balance from account
            let balanceQuery = "SELECT crypto_balance FROM account WHERE account_id = 1";
            db.query(balanceQuery, (err, result1) => {
                if (err) {
                    return res.status(500).send(err);
                }
                let balanceFinal = result1[0].crypto_balance + total;
                
                //Update crypto balance
                let updateBalanceQuery = "UPDATE account SET crypto_balance=" + balanceFinal + " WHERE account_id = 1 ";
                db.query(updateBalanceQuery, (err, result2) => {
                    if (err) {
                        return res.status(500).send(err);
                    }

                    //Delete sell order
                    let deleteQuery = "DELETE FROM `sell_order` WHERE sell_order_id = ?";
                    db.query(deleteQuery, [sell_order_id], (err, result) => {
                        if (err) {
                            return res.status(500).send(err);
                        }
                        res.redirect('/account');
                    });
                });
            });
        });
    },
};