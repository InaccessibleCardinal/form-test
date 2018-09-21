const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const updateJobsFile = require('./update');
const app = express();


app.use(express.static('public'));

app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.sendFile(__dirname, path.join('/public', 'index.html'));
});

app.post('/jobs', (req, res) => {
    let body = req.body;
    console.log('jobs received: ', body);
    updateJobsFile(body);
    res.status(201).json({message: 'Successfully posted jobs.'});
});


app.listen(9191, () => console.log('App is listening on 9191...'));