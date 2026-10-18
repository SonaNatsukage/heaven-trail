import http from 'node:http'
import {readFile} from 'node:fs/promises'
const root=new URL('../outputs/voice-audition/',import.meta.url)
const server=http.createServer(async(req,res)=>{
 const name=new URL(req.url,'http://localhost').pathname.slice(1)||'index.html'
 if(!/^(index\.html|(?:yu|mahiru|yume)-(?:daily|hesitation|resolve)\.wav)$/.test(name)){res.writeHead(404);res.end();return}
 try{const data=await readFile(new URL(name,root));res.writeHead(200,{'Content-Type':name.endsWith('.wav')?'audio/wav':'text/html; charset=utf-8','Content-Length':data.length,'Cache-Control':'no-store'});res.end(data)}catch{res.writeHead(404);res.end('Not generated yet')}
})
server.listen(5176,'127.0.0.1',()=>console.log('Voice audition: http://127.0.0.1:5176/'))
