import { parseFile } from 'music-metadata';
import { inspect } from 'util';

(async () => {
  try {
    const metadata = await parseFile('./export-qwerty-kaiyi.mp3');
    console.log(inspect(metadata, { showHidden: false, depth: null }));
  } catch (error) {
    console.error(error.message);
  }
})();