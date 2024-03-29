﻿# Master Dissertation Project

### Related repositories

Support tools: https://github.com/joaocarduarte/diss-supporttools

Cold-start and low trading volume solution: https://github.com/joaocarduarte/diss-cryptotank

## How to run

Create a MySQL database named `exchange-db` following the design specified in the dissertation document.

Create a new pair of stellar testnet keys using `creatAccount.js` from the dissertation support tools repository and update them to the `\routes\stellar.js` file under "_Config your server_".

#### Install
`npm install`

#### Run
`nodemon app.js`

## Set up the testing environment

Create two instances following the "_How to run_" instructions above.

**Attention**: Both instances should have different databases and a pair of stellar keys. Update `app.js` and `\routes\stellar.js` files with the right database name.

#### Testing

1. Change the iterations number from the for loop from "sendMoney" function in `\routes\send.js`.

2. Through the Send page, make a simple transaction to the receiving bank that will be replicated the times specified in the previous step.
