
// import type { Episode, EpisodeElement } from '@prisma/client';


// export function renderEpisodeElementBackend(element: EpisodeElement) {
  
//   const prefix = 'element';
  
//   if (element.type === 'text') {
//     return `<form on:submit={elementSubmit}>
    
//       ${prefix}

//     Text:

//     <textarea bind:value={element.text}></textarea>
//     <button type="submit">Save</button>

//     </form>`;
//   } else if (element.type === 'ai') {
//     return `<div>
//     Text: ${element.text}
//     User Question: ${element.userQuestion}
//     </div>`;
//   }
// }