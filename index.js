const [{ Server: h1 }, x] = [require('http'), require('express')];
const { privateDecrypt: dec } = require('crypto');
const Busboy = require('busboy');

const Router = x.Router();
const PORT = 10001;
/*
const CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,OPTIONS",
    "Access-Control-Allow-Headers":
    "Content-Type,Accept,Access-Control-Allow-Headers",
};
*/
const { log } = console;
const app = x();
Router
  .route('/')
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
app
  .use('/', Router)
  .use(({ res: r }) => r.status(404).send('Пока нет!'))
  .use((e, r, rs, n) => rs.status(500).send(`Ошибка: ${e}`))
  .set('x-powered-by', false);
module.exports = h1(app)
  .listen(process.env.PORT || PORT, () => log(process.pid));
