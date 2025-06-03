const NodeID3Promise = require('node-id3').Promise

const filepath = './export-qwerty-kaiyi.mp3'

const tags = {
  title: '和 Qwerty Learner 的开翼聊技术优化、产品运营和前端感悟',
  artist: 'webworker.tech',
  album: 'Web Worker',
  APIC: './logo-small.png',
  TRCK: '27',
  year: '2023',
  date: '20230420',
}

function writeMeta() {
  NodeID3Promise.write(tags, filepath).then((res) => {
    console.log(res)
  })
}
function readMeta() {
  NodeID3Promise.read(filepath).then((res) => {
    console.log(res)
  })
}

readMeta()
