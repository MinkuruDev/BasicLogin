const cookie = parseCookie(document.cookie);
if(cookie["userauth"]){
    window.location.replace("./index.html");
}

const specialCharRegex = /[!-"#\$%&'\(\)*+,-./:;<=>?@\[\\\]^_`{|}~]/;
const loginForm = document.querySelector("#login_form");
const loginMessage = document.querySelector("#loginMessage");

loginForm.addEventListener("submit", e => {
    e.preventDefault();

    if(loginForm.elements["username"].value == ""){
        loginMessage.innerHTML = "Username cannot empty";
        return;
    }
    if(specialCharRegex.test(loginForm.elements["username"].value)){
        loginMessage.innerHTML = "Username cannot have special character";
        return;
    }
    if(loginForm.elements["password"].value == ""){
        loginMessage.innerHTML = "Password cannot empty";
        return;
    }

    const http = new XMLHttpRequest();
    http.open('POST', "/login", true);
    http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    
    http.onreadystatechange = function() {
        //Call a function when the state changes.
        console.log("code: ", http.status);
        if(http.readyState == 4 && http.status == 200) {
            window.location.replace(http.responseURL);
        }else if(http.status == 401){
            loginMessage.innerHTML = http.responseText;
        }
    }
    
    const data = {
        username: loginForm.elements["username"].value,
        password: loginForm.elements["password"].value
    };
    
    const urlEncodedData = encodeUrlData(data);

    http.send(urlEncodedData);
    
});
