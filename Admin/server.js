'use strict';
const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const users = [];
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('PUBLIC'));
const path = require('path');
const mysql = require('mysql');
const session = require('express-session');
const port = process.env.PORT || 1337;
const HTMLPath = path.join(__dirname, 'HTMLFILES');

app.use(express.urlencoded({ extended: true }));
app.use(express.static(HTMLPath));
app.use(express.json());
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
}));




const con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'project'
});

con.connect(function (err) {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        process.exit(1);
    }
    console.log('Connected to MySQL!');
});

app.get('/adduser', (req, res) => {
    res.sendFile(path.join(HTMLPath, 'index.html'));

});

app.post('/adduser', (req, res) => {
    const { username, password } = req.body;

    // Check if the user already exists
    con.query('SELECT * FROM Users WHERE email = ?', [username], (err, result) => {
        if (err) {
            console.error('Error checking for existing username:', err);
            res.status(500).json({ message: 'Error adding user' });
        } else if (result.length > 0) {
            // User with the same username already exists
            res.json({ message: 'Username already exists. Please choose a different username.' });
        } else {
            // Add the new user to the database
            con.query(
                'INSERT INTO users (email, password) VALUES (?, ?)',
                [username, password],
                (err, result) => {
                    if (err) {
                        console.error('Error adding user to the database:', err);
                        res.status(500).json({ message: 'Error adding user' });
                    } else {
                        // Get the userId of the newly added user
                        const userId = result.insertId;

                        // Set the userId in the session
                        req.session.userId = userId;

                        res.redirect('/product.html');
                    }
                }
            );
        }
    });


});







app.get('/login', (req, res) => {
    res.sendFile(path.join(HTMLPath, 'index.html'));
});


app.post('/login', (req, res) => {
    const { username, password } = req.body; //req la2ano post method

    con.query('SELECT * FROM Users WHERE email = ? AND password = ?', [username, password], (err, result) => {
        if (err) {
            console.error('Error checking for existing email:', err);
            res.status(500).json({ message: 'Error logging in' });
        } else if (result.length > 0) {
            const userId = result[0].Id;

            req.session.userId = userId;

            res.sendFile(path.join(HTMLPath, 'product.html'));
        } else {
            res.json({ message: 'Invalid email or password' });
        }
    });
});

app.get('/search/:keyword', (req, res) => {
    const keyword = req.params.keyword; //route parameter
    const userId = req.session.userId;

    if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
    }

    if (!isNaN(keyword)) { //ezza ken nb l search befatesh 3al cost bel tasble
        con.query('SELECT * FROM products WHERE cost = ?', [parseInt(keyword)], (err, results) => {
            if (err) throw err;
            res.status(200).json(results);
        });
    } else {
        con.query('SELECT * FROM products WHERE name LIKE ?', [`%${keyword}%`], (err, results) => {
            if (err) throw err;
            res.status(200).json(results);
        });
    }
});

app.get('/user', (req, res) => {
    const userId = req.session.userId; //check if the userid was found in the session
    if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
    } else {
        res.json({ userId }); //get the result in json format
    }
});

app.post('/buy', (req, res) => {
    const userId = req.session.userId;
    const { productId } = req.body;

    if (!userId) { //if the userid was not found
        return res.status(401).json({ message: 'User not authenticated' });
    }

    con.query('INSERT INTO orders (userID, productID) VALUES (?, ?)', [userId, productId], (err) => {
        if (err) {
            console.error('Error adding purchase to order table:', err);
            return res.status(500).json({ message: 'Error adding purchase' });
        }
        res.status(200).json({ message: 'Purchase successful' });
    });
});


app.get('/additem', (req, res) => {
    res.sendFile(path.join(HTMLPath, 'AddItem.html'));

});

app.post('/additem', (req, res) => {
    const carname = req.body.carname;
    const carprice = req.body.carprice;


    // Assuming you have an array or object like users with these attributes
    users.push({ carname, carprice });

    con.query(
        'INSERT INTO addcar (name, cost) VALUES (?, ?)',
        [carname, carprice],
        function (err, result, fields) {
            if (err) {
                console.error(err);
                res.status(500).send("An error occurred while adding the user to the database.");
            } else {
                res.redirect('/addingcar.html')
                //res.status(200).send("User has been added to the database and the array.");
            }
        }
    );
});





app.listen(port, () => {
    console.log('Server is running on port', port);
});