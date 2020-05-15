var listFolder = function (path) { // List folders and files under a directory
    var fs = require('fs');
    var Path = require('path');
    var json = []; 
    var files;
    try {
        files = fs.readdirSync(path);
    }
    catch (err) {
        return console.log("Unable to scan " + path + ": " + err);
    }

    // Get the details of the files/folders
    files.forEach((file) => {
        var fileStat = fs.lstatSync(Path.join(path, file));
        var isDir = fileStat.isDirectory();
        var size = fileStat.size;
        var ext = Path.extname(file);
        var obj = { 'name': file, 'isDir': isDir, 'size': size, 'ext': ext };
        json.push(obj);
    });
    return json;
}

var createFolder = function (path) { // Create empty folder
    var fs = require('fs');
    try {
        fs.mkdirSync(path);
        return "Folder successfully created.";
    }
    catch (err) {
        console.log(err);
        return "Folder cannot be created.";
    }
}

var uploadFiles = async function (path, files) { // Upload files
    var count = 0; // Count of successful uploads
    var responseString = "";

    for (let filename in files) {
        var file = files[filename];
        try {
            await file.mv(path + "/" + filename);
            count++;
        }
        catch (err) {
            console.log(err);
            responseString += file.name + " cannot be uploaded\n";
        }
    }
    responseString += count + " file(s) uploaded.";
    return responseString;
}

var deleteFolderRecursive = function (path) { // Recursively delete folder
    var fs = require('fs');
    var Path = require('path');
    if (fs.existsSync(path)) {
        if (fs.lstatSync(path).isDirectory()) {
            fs.readdirSync(path).forEach((file, index) => {
                var curPath = Path.join(path, file);
                if (fs.lstatSync(curPath).isDirectory()) {
                    deleteFolderRecursive(curPath);
                } else { // delete file
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(path);
        } else { // delete file
            fs.unlinkSync(path);
        }
    }
};

exports.listFolder = listFolder;
exports.createFolder = createFolder;
exports.uploadFiles = uploadFiles;
exports.deleteFolderRecursive = deleteFolderRecursive;