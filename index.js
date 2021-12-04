const [{ Server: h1 }, x] = [require('http'), require('express')];
const { privateDecrypt: dec } = require('crypto');
const Busboy = require('busboy');
const sizeOf = require('image-size');

const Router = x.Router();
const PORT = 10001;

const CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,OPTIONS",
    "Access-Control-Allow-Headers":
    "Content-Type,Accept,Access-Control-Allow-Headers",
};

const { log } = console;
const app = x();
Router
  .route('/decypher')
  .get(r => r.res.end('Привет мир!'))
  .post(async (req, res) => {
    console.log(req.headers);
    let o = {key: '', secret: []};
    const boy = new Busboy({ headers: req.headers });
    boy.on('file', (fieldname, file) => file
      .on('data', data => {
             if (fieldname == 'key') {
                 o[fieldname] += data;
             } else {
                 o[fieldname].push(data);
             }
       }));
    boy.on('finish', () => {
      o.secret = Buffer.concat(o.secret);
      let result;
      try {
           result = dec(o.key, o.secret);
      } catch(e) {
           result = 'ERROR!';
      }
      res
      /* .set(CORS) */
      .send(String(result));
    });
    req.pipe(boy);

  });

  Router
  .route('/size2json')
  .get(r => r.res.end('Привет мир!'))
  .post(async (req, res) => {
    let o = {image: []};
    const boy = new Busboy({ headers: req.headers });
    boy.on('file', (fieldname, file) => file
      .on('data', data => {
             if (fieldname == 'image') {
               o[fieldname].push(data);
             } 
       }));
    boy.on('finish', () => {
      o.image = Buffer.concat(o.image);
      let width, height;
      try {
        ({width, height} = sizeOf(o.image));
      } catch(e) {
        result = 'ERROR!';
      }      
      res
      /* .set(CORS) */
      .send(JSON.stringify({width, height}));
    });
    req.pipe(boy);

  });    


Router
.route('/makeimage')
.all(async (req, res) => {

  const { createCanvas } = require('canvas');

  const width = Number(req.query.width);
  const height = Number(req.query.height);

  console.log(width);
  console.log(height);

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#222222';
  ctx.fillRect(0, 0, width, height);
  //ctx.fillStyle = '#f2f2f2';
  //ctx.font = '32px Arial';
  //ctx.fillText('Hello', 13, 35);

  const buffer = canvas.toBuffer('image/png');
  console.log(req.url);
  res.send(buffer);
});


// https://wordpress.kodaktor.ru/wp-json/jwt-auth/v1/token -d "username=gossjsstudent2017&password=|||123|||456"

Router
.route('/wordpress')
.all(async (req, res) => {
  const URL1 = 'https://wordpress.kodaktor.ru/wp-json/jwt-auth/v1/token';
  const { get, post } = require('axios');

  const { content = 'undefined' } = req.query;
   
  const { data: { token } } = await post(URL1, { username: 'gossjsstudent2017', password: '|||123|||456' });
    
    
  // curl https://wordpress.kodaktor.ru/wp-json/wp/v2/posts/ -X POST -d "title=greetings&content=123&status=publish" -H "Authorization: Bearer $Z" 
  const URL2 = 'https://wordpress.kodaktor.ru/wp-json/wp/v2/posts/'; 
  const headers = { Authorization: `Bearer ${token}` };   
  const  { data: { id } } = await post(URL2, { title: 'admin', content, status: 'publish' }, { headers });
   
  res.send(`ID: ${id}`);
});


app
  .use('/', Router)
  .get('/login', (req, res) => res.set(CORS).send('admin'))
  .use(({ res: r }) => r.status(404).send('Пока нет!'))
  .use((e, r, rs, n) => rs.status(500).send(`Ошибка: ${e}`))
  .set('x-powered-by', false);
module.exports = h1(app)
  .listen(process.env.PORT || PORT, () => log(process.pid));
