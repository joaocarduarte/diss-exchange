const order = require('./order');

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
        let account = 1;
        let currency = 2;
        let price = req.body.buy_price;
        let amount = req.body.buy_amount;


        if(createBuyOrder(account, currency, price, amount) == 1){
            return res.status(500).send(err);
        }
        else {
            res.redirect('/market');
        }
    },
    addSellOrder: (req, res) => {
        let account = 1;
        let currency = 2;
        let price = req.body.sell_price;
        let amount = req.body.sell_amount;

        if(createSellOrder(account, currency, price, amount) == 1){
            return res.status(500).send(err);
        }
        else {
            res.redirect('/market');
        }
    },
};