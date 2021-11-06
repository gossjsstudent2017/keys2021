const [{Server: h1}, x] = [require('http'), require('express')];
const {privateDecrypt: dec} = require('crypto');
const Busboy = require('busboy');

const Router = x.Router();
const PORT = process.env.PORT || 10001;
const hu = {'Content-Type': 'text/html; charset=utf-8'};

const app = x();
Router
    .route('/')
    .get(r => r.res.end('Привет мир!'))
    .post(async (req, res) => {
        console.log(req.headers);
        let o = {};
        const boy = new Busboy({headers: req.headers});
        boy.on('file', (fieldName, file) => file
            .on('data', data => (o[fieldName] = data))
            .on('end', () => console.log('File [' + fieldName + '] Finished')));
        boy.on('finish', () => {
            let result;
            try {
                result = dec(o.key, o.secret);
            } catch(e){
                result = 'ERROR';
            }  
            res.send(String(result));
        });
       req.pipe(boy);
    });
    
app
    .use((r, rs, n) => rs.status(200).set(hu) && n())
    .use('/', Router);

app.listen(PORT, () => {
console.log(`Server listening at http://localhost:${PORT}`);
 });
