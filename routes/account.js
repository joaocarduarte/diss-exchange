(module).exports = {
    getBalances: (req, res) => {
        // execute query
        db.query("SELECT * FROM account LIMIT 1; SELECT * FROM `buy_order` WHERE account=1 ORDER BY price DESC; SELECT * FROM `sell_order` WHERE account=1 ORDER BY price ASC", [1, 2, 3], (err, results) => {
            if (err) {
                res.redirect('/');
            }
            res.render('account.ejs', {
                title: "Account"
                ,account: results[0]
                ,buy_order: results[1]
                ,sell_order: results[2]
            });
        });
    },
};