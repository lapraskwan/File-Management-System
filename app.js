// Express
const express = require('express');
const app = express();

// Body Parser
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ extended: true }));

// File Upload
const fileUpload = require('express-fileupload');
app.use(fileUpload());

// Utils functions
const utils = require('./utils.js');

// Serve static files
app.use('/src', express.static(__dirname + '/src'));
app.use(express.static(__dirname + '/storage'));

// Session
const session = require('express-session');
app.use(session({
    secret: 'filemanagement',
    saveUninitialized: true,
    resave: true, 
    name: 'userinfo'
}));

// Sample Users
const users = [{ 'username': 'user1', 'password': 'pw1' }, { 'username': 'user2', 'password': 'pw2' }];

/******************************** Routes *************************************** */
app.get('/', function (req, res) { // Route to access the system
    var sess = req.session;
    
    if (!sess.username) {
        return res.sendFile(__dirname + '/src/login.html');
    }
    res.sendFile(__dirname + '/src/index.html');
});

app.post('/login', function (req, res) { // Handle Login
    var sess = req.session;
    var found = false;
    users.forEach(user => {
        if (user.username == req.body.username) {
            found = true;
            if (user.password == req.body.password) {
                // Create session
                sess.username = user.username;
                res.redirect('/');
            }
            else {
                res.redirect('/');
            }
        }
    });
    if (found == false) {
        res.redirect('/');
    }
});

app.get('/logout', function (req, res) { // Handle Logout
    // Destroy session
    req.session.destroy((err) => {
        if (err) {
            return console.log(err);
        }
        else {
            res.clearCookie('randomName');
            res.redirect('/');
        }
    });
});

app.get('/listFolder/:path(*)', function (req, res) { // List all folders and files in directory
    var sess = req.session;

    if (!sess.username) {
        return res.redirect('/');
    }

    var path = __dirname + '/storage/' + sess.username + req.params.path;
    listOfFiles = utils.listFolder(path);
    res.send(listOfFiles);
});

app.get('/createFolder/:path(*)', function (req, res) { // Create empty folder
    var sess = req.session;

    if (!sess.username) {
        return res.redirect('/');
    }

    var path = __dirname + '/storage/' + sess.username + req.params.path;

    res.send(utils.createFolder(path));
});

app.post('/uploadFile/:path(*)', async function (req, res) { // Handle files uploaded
    var sess = req.session;

    if (!sess.username) {
        return res.redirect('/');
    }

    var files = req.files;
    var path = __dirname + '/storage/' + sess.username + req.params.path;
    
    res.send(await utils.uploadFiles(path, files));
});

app.delete('/delete/:path(*)', function (req, res) { // Delete file
    var sess = req.session;

    if (!sess.username) {
        return res.redirect('/');
    }
    
    var path = __dirname + '/storage/' + sess.username + req.params.path;

    try {
        utils.deleteFolderRecursive(path);
        res.send("Folder deleted.");
    }
    catch (err) {
        console.log(err);
        res.send("Folder cannot be deleted.");
    }
});

app.get('/download/:path(*)', function (req, res) { // Download file
    var sess = req.session;

    if (!sess.username) {
        return res.redirect('/');
    }

    var path = __dirname + '/storage/' + sess.username + req.params.path;

    res.download(path, (err) => {
        if (err) {
            console.log(err);
        }
        else {
            console.log("Downloaded");
        }
    });
});

app.get('/preview/:path(*)', function (req, res) { // Send file for preview
    var fs = require('fs');
    var sess = req.session;

    if (!sess.username) {
        return res.redirect('/');
    }

    var path = __dirname + '/storage/' + sess.username + req.params.path;
    try {
        var file = fs.readFileSync(path);
        res.send(file);
    }
    catch (err) {
        console.log(err);
    }
});

/**************************************************************************** */
app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});