(module).exports = {
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

        let query = "INSERT INTO `buy_order` (account, currency, price, amount) VALUES ('" + account + "', '" + currency + "', '" + price + "', '" + amount + "')";
                        
        db.query(query, (err, result) => {
            if (err) {
                return res.status(500).send(err);
            }
            res.redirect('/market');
        });
    },
    addSellOrder: (req, res) => {
        let account = req.body.sell_account;
        let currency = req.body.sell_currency;
        let price = req.body.sell_price;
        let amount = req.body.sell_amount;

        let query = "INSERT INTO `sell_order` (account, currency, price, amount) VALUES ('" + account + "', '" + currency + "', '" + price + "', '" + amount + "')";
                        
        db.query(query, (err, result) => {
            if (err) {
                return res.status(500).send(err);
            }
            res.redirect('/market');
        });
    },
};