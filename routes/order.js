createBuyOrder = function (account, currency, price, amount) {

    //Update fiat balance from account
    let balanceQuery = "SELECT fiat_balance FROM account WHERE account_id =" + account;
    db.query(balanceQuery, (err, result) => {
        if (err) {
            return 1;
        }

        let balanceFinal = result[0].fiat_balance - (Number(price) * Number(amount));
        let updateBalanceQuery = "UPDATE account SET fiat_balance=" + balanceFinal + " WHERE account_id =" + account;
        db.query(updateBalanceQuery, (err, result) => {
            if (err) {
                return 1;
            }
            handleBuyOrder(account, currency, price, amount);
        });
    });
}

createSellOrder = function (account, currency, price, amount) {

    //Update crypto balance from account
    db.query("SELECT crypto_balance FROM account WHERE account_id = ?", [account], (err, result) => {
        if (err) {
            return 1;
        }

        let balanceFinal = result[0].crypto_balance -  Number(amount);
        db.query("UPDATE account SET crypto_balance = ? WHERE account_id =? ", [balanceFinal, account], (err, result) => {
            if (err) {
                return 1;
            }
            handleSellOrder(account, currency, price, amount);
        });
    });
}

handleBuyOrder = function (account, currency, price, amount) {
    db.query("SELECT * FROM `sell_order` WHERE price <= ? ORDER BY price ASC LIMIT 1", [price], (err, result) => {
        if (err) {
            return 1;
        }

        if(result.length == 0) {
            //Insert buy order
            db.query("INSERT INTO `buy_order` (account, currency, price, amount) VALUES ( ?, ?, ?, ?)", [account, currency, price, amount], (err, result) => {
                if (err) {
                    return 1;
                }

                console.log("===> Buy Order: " + " account: " + account + " | currency: " + currency + " | price " + price + " | amount " + amount);
                return 0;
            });
        }
        else {

            // If buy order amount is bigger than sell order amount
            if( amount > result[0].amount) {
                //Get fiat balance from sell order account
                db.query("SELECT fiat_balance FROM account WHERE account_id = ?", [result[0].account], (err, result1) => {
                    if (err) {
                        return 1;
                    }
                    //Update sell order account's fiat balance 
                    let balance = result1[0].fiat_balance + (result[0].price * result[0].amount);
                    db.query("UPDATE account SET fiat_balance = ? WHERE account_id = ?", [balance, result[0].account], (err) => {
                        if (err) {
                            return 1;
                        }
                        //Delete sell order
                        db.query("DELETE FROM `sell_order` WHERE sell_order_id = ?", [result[0].sell_order_id], (err) => {
                            if (err) {
                                return 1;
                            }
                            //Get crypto balance from buy order account
                            db.query("SELECT crypto_balance FROM account WHERE account_id = ?", [account],(err, result2) => {
                                if (err) {
                                    return 1;
                                }

                                //Update buy order account crypto balance
                                let balance = result2[0].crypto_balance + result[0].amount;
                                db.query("UPDATE account SET crypto_balance= ? WHERE account_id = ? ", [balance, account], (err,) => {
                                    if (err) {
                                        return 1;
                                    }
                                    console.log("Valor da buy order: " + (amount - result[0].amount));
                                    handleBuyOrder(account, currency, price, (Number(amount) - result[0].amount));
                                });
                            });
                        });
                    });
                });
                
            }
            // If buy order amount is equal than sell order amount
            else if( amount == result[0].amount ){
                //Get fiat balance from sell order account
                db.query("SELECT fiat_balance FROM account WHERE account_id = ?", [result[0].account], (err, result1) => {
                    if (err) {
                        return 1;
                    }
                    //Update fiat balance from sell order account
                    let balance = result1[0].fiat_balance + (result[0].price * result[0].amount);
                    db.query("UPDATE account SET fiat_balance = ? WHERE account_id = ?", [balance, result[0].account], (err) => {
                        if (err) {
                            return 1;
                        }
                        //Delete sell order
                        db.query("DELETE FROM `sell_order` WHERE sell_order_id = ?", [result[0].sell_order_id], (err) => {
                            if (err) {
                                return 1;
                            }
                            //Get crypto balance from buy order account
                            db.query("SELECT crypto_balance FROM account WHERE account_id = ?", [account],(err, result2) => {
                                if (err) {
                                    return 1;
                                }

                                //Update crypto balance from buy order account
                                let cryptoBalance = result2[0].crypto_balance + Number(amount);
                                db.query("UPDATE account SET crypto_balance= ? WHERE account_id = ? ", [cryptoBalance, account], (err,) => {
                                    if (err) {
                                        return 1;
                                    }
                                    console.log("Valor da buy order: " + (amount - result[0].amount));
                                    return 0;
                                });
                            });
                        });
                    });
                });
            }
            // If buy order amount is equal than sell order amount
            else if( amount < result[0].amount ){
                //Get fiat balance from sell order account
                db.query("SELECT fiat_balance FROM account WHERE account_id = ?", [result[0].account], (err, result1) => {
                    if (err) {
                        return 1;
                    }
                    //Update fiat balance from sell order account
                    let balance = result1[0].fiat_balance + (result[0].price * Number(amount));
                    db.query("UPDATE account SET fiat_balance = ? WHERE account_id = ?", [balance, result[0].account], (err) => {
                        if (err) {
                            return 1;
                        }
                        //Update sell order
                        db.query("UPDATE sell_order SET amount = ? WHERE sell_order_id = ?", [result[0].amount -amount, result[0].sell_order_id], (err) => {
                            if (err) {
                                return 1;
                            }
                            //Get crypto balance from buy order account
                            db.query("SELECT crypto_balance FROM account WHERE account_id = ?", [account],(err, result2) => {
                                if (err) {
                                    return 1;
                                }

                                //Update crypto balance from buy order account
                                let balance = result2[0].crypto_balance + Number(amount);
                                db.query("UPDATE account SET crypto_balance= ? WHERE account_id = ? ", [balance, account], (err,) => {
                                    if (err) {
                                        return 1;
                                    }
                                    console.log("Valor da sell order: " + (result[0].amount - amount));
                                    return 0;
                                });
                            });
                        });
                    });
                });
            }
        }
    });
}

handleSellOrder = function (account, currency, price, amount) {
    db.query("SELECT * FROM `buy_order` WHERE price >= ? ORDER BY price ASC LIMIT 1", [price], (err, result) => {
        if (err) {
            return 1;
        }

        if(result.length == 0) {
            //Insert sell order
            db.query("INSERT INTO `sell_order` (account, currency, price, amount) VALUES( ?, ?, ?, ?)", [account, currency, price, amount], (err, result) => {
                if (err) {
                    return 1;
                }
                console.log("===> Sell Order: " + " account: " + account + " | currency: " + currency + " | price " + price + " | amount " + amount);
                return 0;
            });
        }
        else {

            // If sell order amount is bigger than buy order amount
            if( amount > result[0].amount) {
                //Get crypto balance from buy order account
                db.query("SELECT crypto_balance FROM account WHERE account_id = ?", [result[0].account], (err, result1) => {
                    if (err) {
                        return 1;
                    }
                    //Update crypto balance from buy order account
                    let balance = result1[0].crypto_balance + result[0].amount;
                    db.query("UPDATE account SET crypto_balance = ? WHERE account_id = ?", [balance, result[0].account], (err) => {
                        if (err) {
                            return 1;
                        }
                        //Delete buy order
                        db.query("DELETE FROM buy_order WHERE buy_order_id = ?", [result[0].buy_order_id], (err) => {
                            if (err) {
                                return 1;
                            }
                            //Get fiat balance from sell order account
                            db.query("SELECT fiat_balance FROM account WHERE account_id = ?", [account],(err, result2) => {
                                if (err) {
                                    return 1;
                                }
                                //Update fiat balance from sell order account
                                let balance = result2[0].fiat_balance + (Number(price) * result[0].amount);
                                db.query("UPDATE account SET fiat_balance= ? WHERE account_id = ? ", [balance, account], (err,) => {
                                    if (err) {
                                        return 1;
                                    }
                                    console.log("Amount da sell order: " + (amount - result[0].amount));
                                    handleSellOrder(account, currency, price, (Number(amount) - result[0].amount));
                                });
                            });
                        });
                    });
                });
                
            }
            // If sell order amount is equal than buy order amount
            else if( amount == result[0].amount ){
                //Get crypto balance from buy order account
                db.query("SELECT crypto_balance FROM account WHERE account_id = ?", [result[0].account], (err, result1) => {
                    if (err) {
                        return 1;
                    }
                    //Update crypto balance from buy order account
                    let balance = result1[0].crypto_balance + result[0].amount;
                    db.query("UPDATE account SET crypto_balance = ? WHERE account_id = ?", [balance, result[0].account], (err) => {
                        if (err) {
                            return 1;
                        }
                        //Delete buy order
                        db.query("DELETE FROM buy_order WHERE buy_order_id = ?", [result[0].buy_order_id], (err) => {
                            if (err) {
                                return 1;
                            }
                            //Get fiat balance from sell order account
                            db.query("SELECT fiat_balance FROM account WHERE account_id = ?", [account],(err, result2) => {
                                if (err) {
                                    return 1;
                                }
                                //Update fiat balance from sell order account
                                let balance = result2[0].fiat_balance + (Number(price) * result[0].amount);
                                db.query("UPDATE account SET fiat_balance= ? WHERE account_id = ? ", [balance, account], (err,) => {
                                    if (err) {
                                        return 1;
                                    }
                                    console.log("Amount da sell order: " + (amount - result[0].amount));
                                    return 0;
                                });
                            });
                        });
                    });
                });
            }
            // If sell order amount is lower than buy order amount
            else if( amount < result[0].amount ){
                //Get crypto balance from buy order account
                db.query("SELECT crypto_balance FROM account WHERE account_id = ?", [result[0].account], (err, result1) => {
                    if (err) {
                        return 1;
                    }
                    //Update crypto balance from buy order account
                    let balance = result1[0].crypto_balance + Number(amount);
                    db.query("UPDATE account SET crypto_balance = ? WHERE account_id = ?", [balance, result[0].account], (err) => {
                        if (err) {
                            return 1;
                        }
                        //Update buy order
                        db.query("UPDATE buy_order SET amount = ? WHERE buy_order_id = ?", [result[0].amount - Number(amount), result[0].buy_order_id], (err) => {
                            if (err) {
                                return 1;
                            }
                            //Get fiat balance from sell order account
                            db.query("SELECT fiat_balance FROM account WHERE account_id = ?", [account],(err, result2) => {
                                if (err) {
                                    return 1;
                                }
                                //Update fiat balance from sell order account
                                let balance = result2[0].fiat_balance + (Number(price) * Number(amount));
                                db.query("UPDATE account SET fiat_balance= ? WHERE account_id = ? ", [balance, account], (err,) => {
                                    if (err) {
                                        return 1;
                                    }
                                    console.log("Amount da sell order: " + (result[0].amount - amount));
                                    return 0;
                                });
                            });
                        });
                    });
                });
            }
        }

    });

}
