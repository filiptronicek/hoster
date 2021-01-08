$(document).ready(() => {

    const loadingEmojis = ['😴', '🥱', '😯',  '🤨', '🤔', '🙄', '🙂', '😏', '😀', '😎'];

    function uuidv4() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
                const r = Math.random() * 16 | 0,
                    v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
    }

    function copyToClipboard(text) {
        if (navigator.clipboard) { // default: modern asynchronous API
            return navigator.clipboard.writeText(text);
        } else if (window.clipboardData && window.clipboardData.setData) { // for IE11
            window.clipboardData.setData('Text', text);
            return Promise.resolve();
        } else { // workaround: create dummy input
            const input = h('input', {type: 'text'});
            input.value = text;
            document.body.append(input);
            input.focus();
            input.select();
            document.execCommand('copy');
            input.remove();
            return Promise.resolve();
        }
    }

    const paste = async () => {
        try {
            const clipboardItems = await navigator.clipboard.read();
            for (const clipboardItem of clipboardItems) {
                for (const type of clipboardItem.types) {
                    if (type !== "text/html") {
                    const blob = await clipboardItem.getType(type);
                    console.log(type);
                    const upload = new Upload(blob);
                    // maby check size or type here with upload.getSize() and upload.getType()
                    // execute upload
                    upload.doUpload();
                    }
                }
            }
        } catch (err) {
            console.error(err.name, err.message);
        }
    };
    document.onpaste = () => {
        paste();
    };

    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const redirect_uri = "https://img.fufu.wtf/upload.html"; // replace with your redirect_uri;
    const client_secret = "YHU5NJtVa8jVnN4PBTeO4rYr"; // replace with your client secret
    const scope = "https://www.googleapis.com/auth/drive";
    var access_token = "";
    const client_id = "827930320434-jun1dkcvitm47195pda9mmt4kn24ck4n.apps.googleusercontent.com"; // replace it with your client id;


    $.ajax({
        type: 'POST',
        url: "https://www.googleapis.com/oauth2/v4/token",
        data: {
            code: code,
            redirect_uri: redirect_uri,
            client_secret: client_secret,
            client_id: client_id,
            scope: scope,
            grant_type: "authorization_code"
        },
        dataType: "json",
        success: (resultData) => {
            localStorage.setItem("accessToken", resultData.access_token);
            localStorage.setItem("refreshToken", resultData.refreshToken);
            localStorage.setItem("expires_in", resultData.expires_in);
            window.history.pushState({}, document.title, "upload.html");
        }
    });

    function stripQueryStringAndHashFromPath(url) {
        return url.split("?")[0].split("#")[0];
    }

    var Upload = function (file) {
        this.file = file;
    };

    Upload.prototype.getType = function () {
        localStorage.setItem("type", this.file.type);
        return this.file.type;
    };
    Upload.prototype.getSize = function () {
        localStorage.setItem("size", this.file.size);
        return this.file.size;
    };
    Upload.prototype.getName = function () {
        return this.file.name;
    };
    Upload.prototype.doUpload = function () {
        var that = this;
        var formData = new FormData();

        const filename = this.getName() || "untitled.png";
        // add assoc key values, this will be posts values
        formData.append("file", this.file, filename);
        formData.append("upload_file", true);

        console.log(filename);
        const folderId = '1lJ5qK652a9GOBOMtxOmpNHDyF5wQ1THG';
        const extension = filename.split(".")[filename.split(".").length - 1] || 'png';
        const fileMetadata = {
            'name': `${
                uuidv4()
            }.${extension}`,
            'parents': [folderId]
        };
        formData.append('metadata', new Blob([JSON.stringify(fileMetadata)], {type: 'application/json'}));
        console.log(fileMetadata);

        $.ajax({
            type: "POST",
            beforeSend: (request) => {
                request.setRequestHeader("Authorization", `Bearer ${
                    localStorage.getItem("accessToken")
                }`);

            },
            url: "https://www.googleapis.com/upload/drive/v3/files",
            data: {
                uploadType: "media"
            },
            xhr: () => {
                var myXhr = $.ajaxSettings.xhr();
                if (myXhr.upload) {
                    myXhr.upload.addEventListener('progress', that.progressHandling, false);
                }
                return myXhr;
            },
            success: (data) => {
                console.log(data);
                const url = `https://trnck.dev/0:/uploads/${
                    fileMetadata.name
                }`;
                document.querySelector("#result").innerHTML = url;
                copyToClipboard(url);


            },
            error: (error) => {
                console.log(error);
            },
            async: true,
            data: formData,
            cache: false,
            contentType: false,
            processData: false,
            timeout: 60000
        });
    };

    Upload.prototype.progressHandling = (event) => {
        let percent = 0;
        const position = event.loaded || event.position;
        const total = event.total;
        const progress_bar_id = "#progress-wrp";
        if (event.lengthComputable) {
            percent = Math.ceil(position / total * 100);
        }
        // update progressbars classes so it fits your code
        $(`${progress_bar_id} .progress-bar`).css(
            "width",
            `${ + percent
            }%`
        );
        $(`${progress_bar_id} .status`).text(`${percent}% ${loadingEmojis[Math.round(percent / (loadingEmojis.length + 1))]}`);
    };

    $("#upload").on("click", (e) => {
        const file = $("#files")[0].files[0];
        const upload = new Upload(file);
        // maby check size or type here with upload.getSize() and upload.getType()
        // execute upload
        upload.doUpload();
    });


});
