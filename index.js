var title = document.querySelector('h1');
var originalText = title.textContent;

console.log(title.textContent);

var greetUser = function greetUser(){
    var userName = prompt('What is your name?');

    if(userName !== ''){
        title.textContent = originalText + 'Hello ' +  userName;
    }
    else{
        greetUser();
    }
} 

greetUser()