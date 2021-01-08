$(document).ready(() => {

    const clientId = "827930320434-jun1dkcvitm47195pda9mmt4kn24ck4n.apps.googleusercontent.com";
    // redirect_uri of the project
    const redirect_uri = "http://localhost:5500/upload.html";
    // scope of the project
    const scope = "https://www.googleapis.com/auth/drive";
    // the url to which the user is redirected to
    const url = "";

    // this is event click listener for the button
    $("#login").click(() => {
        signIn(clientId, redirect_uri, scope, url);
    });

    function signIn(clientId, redirect_uri, scope, url) {
        url = `https://accounts.google.com/o/oauth2/v2/auth?redirect_uri=${redirect_uri}&prompt=consent&response_type=code&client_id=${clientId}&scope=${scope}&access_type=offline`;
        // this line makes the user redirected to the url
        window.location = url;
    }
});
