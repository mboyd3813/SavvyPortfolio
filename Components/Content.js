import * as Pages from './Pages'

export default function Content(state){
    return `
<div id="Content">
       <div class="container">
        ${Pages[state.body]}
        </div>
      </div>  
    `;
}