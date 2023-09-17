const cookie = parseCookie(document.cookie);
if(cookie["userauth"]){
    window.location.replace("./index.html");
}
const passwordInput = document.querySelector("#password");
const rateMessage = document.querySelector("#rate-message");

const guesses = 1_000_000; // guess per seconds
const times_unit = 60 * 60 * 24 * 180; // 180 days

const specialCharRegex = /[!-"#\$%&'\(\)*+,-./:;<=>?@\[\\\]^_`{|}~]/;
const uniqueSpecialCharacters = Array.from(new Set(specialCharRegex.source.match(/(?<=\[).+?(?=\])/)[0])).length;

passwordInput.onchange = function(){
    let pass = passwordInput.value;
    let totalCharacters = 0;
    if(/[A-Z]/.test(pass)){
        console.log("has Uppercase");
        totalCharacters += 26;
    }
    if(/[a-z]/.test(pass)){
        console.log("has Lowercase");
        totalCharacters += 26;
    }
    if(/[0-9]/.test(pass)){
        console.log("has Number");
        totalCharacters += 10;
    }
    if(specialCharRegex.test(pass)){
        console.log("has Special");
        totalCharacters += uniqueSpecialCharacters;
    }
    if(totalCharacters == 0){
        rateMessage.innerHTML = "";
        return;
    }

    let probarity = (guesses * times_unit) / Math.pow(totalCharacters, pass.length);
    if(probarity < 0.1){
        rateMessage.innerHTML = "Strong"
    }else if(probarity < 0.5){
        rateMessage.innerHTML = "Medium"
    }else{
        rateMessage.innerHTML = "Weak"
    }
}

const registerForm = document.querySelector("#registerForm");
const registerMessage = document.querySelector("#registerMessage");

registerForm.addEventListener("submit", e => {
    e.preventDefault();

    if(registerForm.elements["username"].value == ""){
        registerMessage.innerHTML = "Username cannot empty";
        return;
    }
    if(specialCharRegex.test(registerForm.elements["username"].value)){
        registerMessage.innerHTML = "Username cannot have special character";
        return;
    }
    if(registerForm.elements["password"].value == ""){
        registerMessage.innerHTML = "Password cannot empty";
        return;
    }
    if(registerForm.elements["password"].value != registerForm.elements["repassword"].value){
        registerMessage.innerHTML = "Password not match";
        return;
    }

    const http = new XMLHttpRequest();
    http.open('POST', "/register", true);
    http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    
    http.onreadystatechange = function() {
        //Call a function when the state changes.
        console.log("code: ", http.status);
        if(http.readyState == 4 && http.status == 200) {
            window.location.replace(http.responseURL);
        }else if(http.status == 401){
            registerMessage.innerHTML = http.responseText;
        }
    }
    
    const data = {
        username: registerForm.elements["username"].value,
        password: registerForm.elements["password"].value
    };
    
    const urlEncodedData = encodeUrlData(data);

    http.send(urlEncodedData);    
});

