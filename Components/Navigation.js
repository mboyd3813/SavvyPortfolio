import { lowerCase } from 'lodash';

function reduceLinkToHTML(links, link){
    var href = '/';

        if(link !== 'Home'){
            href += lowercase(link)
        }

        return `
            ${links}
            <li>
            <a href="/${href}" data-navigo>${link}</a>
            </li>
        `;
}

function buildLinks(links){
    return links.reduce(reduceLinkToHTML, '');
}

 
export default function Navigation(state){
   return `
        <div id="navigation">
            <ul class="container">
                ${buildLinks(state.link)}
            </ul>

        <a href="/projects/">projects</a>
         <ul>
            <li>
                <a href="http://10.42.31.123:8080/Jun20th/">Jun20th</a></li>
            <li>
                <a href="/blog">Blog</a>
            </li>
            <li>
                 <a href="http://10.42.31.123:8080">Portfolio</a>
            </li>
        </ul>
    </li>
    </ul>
</div>
`;
}
