export default function(express, bodyParser, createReadStream, crypto, http) {
  const app = express();

  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());

  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,OPTIONS,DELETE');
    if (!req.path.endsWith('/')) {
      res.redirect(301, req.path + '/');
    } else {
      next();
    }
  });

  app.get('/login/', (req, res) => {
    res.send('45cf3a7d-a058-4ede-a03c-2c98a130021d');
  });

  app.get('/code/', (req, res) => {
    const path = decodeURI(import.meta.url.substring(7));
    createReadStream(path).pipe(res);
  });

  app.get('/sha1/:input/', (req, res) => {
    const hash = crypto.createHash('sha1').update(req.params.input).digest('hex');
    res.send(hash);
  });

  const handleReq = (req, res, addr) => {
    if (!addr) return res.send('No addr provided');
    http.get(addr, r => {
      let data = '';
      r.on('data', chunk => data += chunk);
      r.on('end', () => res.send(data));
    }).on('error', () => res.send('Error fetching URL'));
  };

  app.get('/req/', (req, res) => handleReq(req, res, req.query.addr));
  app.post('/req/', (req, res) => handleReq(req, res, req.body.addr));

  app.all('*', (req, res) => {
    res.send('45cf3a7d-a058-4ede-a03c-2c98a130021d');
  });

  return app;
}
