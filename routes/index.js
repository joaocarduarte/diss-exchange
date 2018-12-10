(module).exports = {
    getHomePage: (req, res) => {
        res.render('index.ejs', {
            title: "Exchange"
        });
    },
    getMarketPage: (req, res) => {
        res.render('market.ejs', {
            title: "Market"
        });
    },
};