const dotenv = require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();

console.log(process.env.API_KEY)
app.use(express.static(path.join(__dirname, 'public')));
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));

var subscribers = []

var FCM = require('fcm-node');
var serverKey = 'fxKSEC4Ebk8liF2rntofb_:APA91bEsExhLruVI-kS8FlWFgGRfJucxp45Mz7dG4lIyC-vu9XpFI-X-wRrMEFykUCqF_U4QbMUPd0ObAd02pND9NXkaaGBg8_boDLBGMy8TgqzpEQfR1tCNb0vLzlDek2pvMpupECJ5';
var fcm = new FCM(serverKey);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
    var message = {
        // for multiple recipients
        registration_ids: subscribers,
        // for single recipient
        // to: subscribers[0],
        collapse_key: 'your_collapse_key',
    };
    fcm.send(message, function(err, response){
        if (err) {
            console.log("Something has gone wrong!");
            console.log(err)
        } else {
            console.log("Successfully sent with response: ",
                response);
        }
    });
    res.sendStatus(200)
});

app.get('/new_event', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages/new_event.html'));
});

app.get('/event', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages/event_page.html'));
});

app.get('/edit-transaction', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages/edit_transaction.html'));
});

app.get('/edit-event', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages/edit_event.html'));
});

app.listen(8080, () => console.log('Server listening on port 8080'));