$(document).ready(() => {
    $('#logout').on('click', async () => { // Logout
        await $.get("/logout");
        location.reload();
    });

    $('#back').on('click', () => { // Back to previous folder
        currentPath = $('#currentPath').html();
        if (currentPath.search('/') != -1) {
            lastSlash = currentPath.lastIndexOf('/');
            newPath = currentPath.substring(0, lastSlash);
            $('#currentPath').html(newPath);
            listFolder();
        }
    });

    $('#createFolder').on('click', () => { // Opens PopUp Window for Inputing Folder Name
        $('#bigPopUp')[0].style.display = 'block';
    });

    $('#closePopUp').on('click', () => { // Close pop up window when clicked close button
        $('#bigPopUp')[0].style.display = 'none';
        $('#folderInput').value = "";
    });

    $(document).on('click', (e) => { // Close pop up window when clicked outside
        if (e.target == $('#bigPopUp')[0]) {
            $('#bigPopUp')[0].style.display = 'none';
            $('#folderInput').value = "";
        }
    });

    $('#create').on('click', async () => { // Confirm create folder
        var foldername = $('#folderInput')[0].value;
        await createFolder(foldername);
        $('#folderInput')[0].value = "";
        $('#bigPopUp')[0].style.display = 'none';
        listFolder();
    });

    $('#uploadFile').on('change', async (e) => { // Upload files from computer
        await uploadFile(e.target.files);
        listFolder();
        // Avoid no response if the same file is chosen
        $('#uploadFile')[0].value = "";
    });

    $(document).on('click', '.Directory .name', (e) => { // Move to selected folder
        folderName = e.currentTarget.innerHTML;
        currentPath = $('#currentPath').html();
        $('#currentPath').html(currentPath + '/' + folderName);
        listFolder();
    });

    $(document).on('click', '.delete', async (e) => { // Delete selected file or folder
        folderName = $(e.target).parent().parent().children()[0].innerHTML;
        await deleteFolder(folderName);
        listFolder();
    });

    $(document).on('click', '.preview', (e) => { // Preview image or text files
        fileName = $(e.target).parent().parent().children()[0].innerHTML;
        preview(fileName);
    });

    $(document).on('click', '.download', (e) => { // Download a file
        fileName = $(e.target).parent().parent().children()[0].innerHTML;
        downloadFolder(fileName);
    });

    // List folder when the page is loaded
    listFolder();
});

async function listFolder() { // Gets all folders and files under the current directory and list them out in the table
    let path = $('#currentPath').html();
    // Only files with extensions below will have the preview option. More text or image file formats can be added if needed.
    const allowedFormat = ['.txt', '.jpg', '.jpeg', '.png', '.gif'];
    // Get folders and files
    await $.get("/listFolder/" + path, (data) => {
        $('#fileTable tbody').empty();
        data.forEach((file) => {
            let name = file['name'];
            let type = file['isDir'] ? "Directory" : "File";
            let size = file['isDir'] ? '-' : Math.round(file['size'] / 1000) + "KB";
            let ext = file['ext'];
            let previewButton = allowedFormat.includes(ext) ? '<td><button class="preview">Preview</button></td>' : '<td></td>';
            let downloadButton = file['isDir'] ? "<td></td>" : '<td><button class="download">Download</button></td>';
            $('#fileTable tbody').append(`
                <tr class="${type}">
                    <td class="name">${name}</td>
                    <td>${type}</td>
                    <td>${size}</td>
                    ${previewButton}
                    ${downloadButton}
                    <td><button class="delete">Delete</button></td>
                </tr>
            `);
        });
    });
}

async function uploadFile(files) { // Upload files to server
    var path = $('#currentPath').html();
    // Append all files to FormData
    var data = new FormData();
    [...files].forEach(file => {
        data.append(file.name, file);
    });
    // Upload
    await $.ajax({
        url: "/uploadFile/" + path,
        data: data,
        type: 'POST',
        contentType: false,
        processData: false,
        success: (res) => { console.log(res); },
        error: (err) => { console.log(err); }
    });
}

async function createFolder(folderName) { // Create Empty Folder
    var path = $('#currentPath').html() + "/" + folderName;
    await $.get("/createFolder/" + path, (res) => {
        console.log(res);
    });
}

async function deleteFolder(folderName) { // Delete folder or file
    var path = $('#currentPath').html() + "/" + folderName;
    await $.ajax({
        url: "/delete/" + path,
        type: 'DELETE',
        success: (res) => {
            console.log(res);
        },
        error: (err) => {
            console.log(err);
        }
    });
}

function downloadFolder(folderName) { // Download a file
    var path = $('#currentPath').html() + '/' + folderName;
    window.open("/download/" + path);
}

function preview(fileName) { // Show contents in text or image file
    var path = $('#currentPath').html() + '/' + fileName;
    var ext = path.substring(path.lastIndexOf('.'), path.length);
    const imageFormat = ['.jpg', '.jpeg', '.png', '.gif'];

    // Clear previous preview
    $('#previewImage')[0].style.display = "none";
    $('#previewText')[0].style.display = "none";
    
    // Check if file is image or text
    if (imageFormat.includes(ext)) {
        $('#previewImage')[0].src = '/preview/' + path;
        $('#previewImage')[0].style.display = "inline";
    }
    else {
        $.get('/preview/' + path, (file) => {
            $('#previewText')[0].innerHTML = file;
            $('#previewText')[0].style.display = "inline";
        });
    }
}