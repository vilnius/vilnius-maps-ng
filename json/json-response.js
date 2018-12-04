const http = require('http');
let url = require('url');
const request = require('request');

const host = '127.0.0.1';
const path = '/oembed'
const port = 8080;
const options = {
 port,
 host,
 path
}

const server = http.createServer((req, res) => {
 const url_parts = url.parse(req.url, true);
 const query = url_parts.query;
 const responseJSON = {
  "type": "photo",
  "version": "1.0",
  "provider_name": "asd",
  "provider_url": "https://maps.vilnius.lt",
  "height": "600",
  "width": "1024",
  "title": "Vilniaus interaktyvūs žemėlapiai",
  "description": "Vilniaus miesto interaktyvūs žemėlapiai www.maps.vilnius.lt",
  //"thumbnail_url": "http://i1.sndcdn.com/artworks-000017079411-pgm0ii-t500x500.jpg",
  "html": `<iframe width=\"1024\" height=\"600\" scrolling=\"yes\" frameborder=\"no\" src=\"http://127.0.0.1:3000/darzeliai\"></iframe>`,
  "author_name": "AG",
  //"author_url": "https://soundcloud.com/the-bugle"
 }
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  //res.end('Hello World!\n');
  res.end(JSON.stringify(responseJSON));
});

server.listen(options, () => {
  console.log(`Server running at http://${host}${path}:${port}`);
});
