(module).exports = {
    getSendPage: (req, res) => {
        res.render('send.ejs', {
            title: "Send"
        });
    },
};