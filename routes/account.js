(module).exports = {
    getBalances: (req, res) => {
        // execute query
        db.query("SELECT * FROM account LIMIT 1", (err, [result]) => {
            if (err) {
                res.redirect('/');
            }
            console.log(result);
            res.render('account.ejs', {
                title: "Account"
                ,account: result
            });
        });
    },
};