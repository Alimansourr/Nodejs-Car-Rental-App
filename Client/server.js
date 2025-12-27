'use strict';
const bodyParser = require('body-parser');
const express = require('express');
const app = express();
app.use(express.static('PUBLIC'));
const users = [];
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const path = require('path');
const mysql = require('mysql');

const port = process.env.PORT || 1337;
const HTMLPath = path.join(__dirname, 'HTMLFILES');

app.use(express.urlencoded({ extended: true }));
app.use(express.static(HTMLPath));
const session = require('express-session');
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
    database: 'projectdb'
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
    const phonenb = req.body.phonenb;
    const username = req.body.username;
    const password = req.body.password;
    const Address = req.body.address;
    
    // Assuming you have an array or object like users with these attributes
    users.push({phonenb, username, password,Address });

    con.query(
        'INSERT INTO user (phonenb, fullname,Password, Address) VALUES (?, ?, ?, ?)',
        [phonenb, username,password, Address],
        function (err, result, fields) {
            if (err) {
                console.error(err);
                res.status(500).send("An error occurred while adding the user to the database.");
            } else {
                res.redirect('/OurCars.html')
                //res.status(200).send("User has been added to the database and the array.");
            }
        }
    );
});


app.get('/login', (req, res) => {
    res.sendFile(path.join(HTMLPath, 'index.html'));
});
app.post('/login', (req, res) => {
    const phonenb = req.body.phonenb; // Assuming the input field for phone number is named "phonenb"
    const password = req.body.password;

    con.query('SELECT * FROM user WHERE phonenb = ?', [phonenb], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            res.send('An error occurred while authenticating.');
        } else if (results.length === 1) {
            const user = results[0];
          

            if (user.Password === password) {
                //res.send('Login successful.');
               // res.send('<script>window.location.href = "/PUBLIC/HTMLFILES/index.html";</script>');
                res.redirect('/OurCars.html');
            } else {
                res.send('Incorrect password.');
            }
        } else {
            res.send('User not found.');
        }
    });
});


app.get('/reservecar', (req, res) => {
    res.sendFile(path.join(HTMLPath, 'OurCars.html'));

});



app.post('/reservecar', (req, res) => {
    const from = req.body.from;
    const to = req.body.to;
    const color = req.body.color;
    const door = req.body.door;
    const phonenb = req.body.phonenb;

    // Assuming you have an array or object like users with these attributes
    users.push({ from, to, color, door, phonenb});

    con.query(
        'INSERT INTO reserveddcars (date1, date2, color, door, phonenb) VALUES (?, ?, ?, ?, ?)',
        [from, to, color, door, phonenb],
        function (err, result, fields) {
            if (err) {
                console.error(err);
                res.status(500).send("An error occurred while adding the user to the database.");
            } else {
                res.redirect('/Reservation.html')
               // res.status(200).send("User has been added to the database and the array.");
            }
        }
    );
});


app.get('/ordercar', (req, res) => {
    res.sendFile(path.join(HTMLPath, 'OurCars.html'));

});



app.post('/ordercar', (req, res) => {
    const phonenb = req.body.phonenb;
    const address = req.body.address;
    const color = req.body.color;
    const door = req.body.door;
   

    // Assuming you have an array or object like users with these attributes
    users.push({ phonenb,address ,color, door });

    con.query(
        'INSERT INTO ordereddcar (phonenb, address, color, door) VALUES ( ?, ?, ?, ?)',
        [phonenb,address, color, door],
        function (err, result, fields) {
            if (err) {
                console.error(err);
                res.status(500).send("An error occurred while adding the user to the database.");
            } else {
                res.redirect('/Order.html')
                // res.status(200).send("User has been added to the database and the array.");
            }
        }
    );
});


app.get('/contactus', (req, res) => {
    res.sendFile(path.join(HTMLPath, 'Contactus.html'));

});



app.post('/contactus', (req, res) => {
    const firstname = req.body.firstname;
    const lastname = req.body.lastname;
    const subject = req.body.subject;
   


    // Assuming you have an array or object like users with these attributes
    users.push({ firstname,lastname,subject });

    con.query(
        'INSERT INTO feedback (firstname,lastname,subject) VALUES ( ?, ?, ?)',
        [firstname,lastname,subject],
        function (err, result, fields) {
            if (err) {
                console.error(err);
                res.status(500).send("An error occurred while adding the user to the database.");
            } else {
                res.redirect('/Feedback.html')
                // res.status(200).send("User has been added to the database and the array.");
            }
        }
    );
});

app.get('/update-password', (req, res) => {
    res.sendFile(path.join(HTMLPath, 'UpdateProfile.html'));
});

app.post('/update-password', (req, res) => {
    const phonenumber = req.body.phonenumber;
    const newpassword = req.body.newpassword;

    con.query('SELECT * FROM user WHERE phonenb = ?', [phonenumber], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            res.status(500).send('An error occurred while updating the user.');
        } else if (results.length === 1) {
            // User found, update the information
            con.query(
                'UPDATE user SET Password = ? WHERE phonenb = ?',
                [newpassword, phonenumber],
                (updateErr, updateResult) => {
                    if (updateErr) {
                        console.error('Database error:', updateErr);
                        res.status(500).send('An error occurred while updating the user.');
                    } else {
                        res.redirect('/UpdateProfile.html')
                       // res.status(200).send('User information updated successfully.');

                    }
                }
            );
        } else {
            // User not found
            res.status(404).send('User not found.');
        }
    });
});



app.get('/delete-profile', (req, res) => {
    res.sendFile(path.join(HTMLPath, 'DeleteProfile.html'));
});

app.post('/delete-profile', (req, res) => {
    const phonenbToDelete = req.body.phonenumber;
    const passwordToDelete = req.body.password;

    con.query('SELECT * FROM user WHERE phonenb = ? AND Password = ?', [phonenbToDelete, passwordToDelete], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            res.status(500).send('An error occurred while deleting the user.');
        } else if (results.length === 1) {
            // User found, delete the user
            con.query(
                'DELETE FROM user WHERE phonenb = ?',
                [phonenbToDelete],
                (deleteErr, deleteResult) => {
                    if (deleteErr) {
                        console.error('Database error:', deleteErr);
                        res.status(500).send('An error occurred while deleting the user.');
                    } else {
                        res.redirect('Removal.html');
                       // res.status(200).send('User deleted successfully.');
                    }
                }
            );
        } else {
            // User not found or authentication failed
            res.status(404).send('User not found or authentication failed.');
        }
    });
});




app.listen(port, () => {
    console.log('Server is running on port', port);
});


