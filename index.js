
import Navigation from './Components/Navigation';
import Header from './Components/Header';
import Content from './Components/Content';
import Footer from './Components/Footer';
import * as State from './store';
import axios from 'axios';
import navigo from 'navigo';
import { capitalize } from 'lodash';

var root = document.querySelector('#root');
var router = new Navigo(location.origin);

State.posts = [];

function render(state){
    var greeting;
    var input;

root.innerHTML = `
    ${Navigation(state)}
    ${Header(state)}
    ${Content(state, State.post)}
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
}

function handleRoute(params){
    var page = capitalize(params.page);

    console.log(params);
    console.log(page);

    render(State[page]);

}
router.updatePageLinks();

router
    .on('/:page', handleRoute({ 'page': 'home' }))
    .resolve();


axios('https://jsonplaceholder.typicoe.com/posts').then((response) => {
    var params = router.lastRouteResolved().params;

    State.post = response.data;

    if(params){
        handleRoute(params);
    }
});
