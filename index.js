
import Navigation from './Components/Navigation';
import Header from './Components/Header';
import Content from './Components/Content';
import Footer from './Components/Footer';

var Home = {
    'title': 'Marcus Boyd Projects'
};

var Blog = {
    'title': 'Welcome to my Blog'
}

var Contact = {
    'title': 'Contact Me'
}

var Projects = {
    'title': 'My Projects'
}

var root = document.querySelector('#root');

var title = 'My New Title'

function render(state){
    var greeting;
    var input;
    var links;

root.innerHTML = `
    ${Navigation}
    ${Header(state)}
    ${Content}
    ${Footer}
    `;

    greeting = document.querySelector('#greeting');
    input = document.querySelector('#header input');

    input = addEventListener( 
        'keyup', 
        (event) => greeting.innerHTML= `
        <div>
            <h3>Welcome to my world,</h3>
            <h4>${event.target.value}</h4>
        </div>
    `
    );

    links = document.querySelectorAll('navigation a')

    links[0].addEventListener(
        'click',
        (event) => {
            event.preventDefault();

            console.log('first link clicked');
        }
    );
}   

render(Home)