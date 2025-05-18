
// import type { Track, Segment } from '@prisma/client';


// export function renderSegmentBackend(segment: Segment) {
  
//   const prefix = 'segment';
  
//   if (segment.type === 'text') {
//     return `<form on:submit={segmentSubmit}>
    
//       ${prefix}

//     Text:

//     <textarea bind:value={segment.text}></textarea>
//     <button type="submit">Save</button>

//     </form>`;
//   } else if (segment.type === 'ai') {
//     return `<div>
//     Text: ${segment.text}
//     User Question: ${segment.userQuestion}
//     </div>`;
//   }
// }