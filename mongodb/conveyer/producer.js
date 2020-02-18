const app = require('express')();
const kafka = require('kafka-node');
const bodyParser = require('body-parser');

const port = 5001;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const Producer = kafka.Producer,
    client = new kafka.KafkaClient(),
    producer = new Producer(client);

producer.on('ready', function () {
    console.log('Producer is ready');
});

producer.on('error', function (err) {
    console.log(err);
    console.log('Producer is in error state!');
});

app.get('/', function(req, res){
    res.json({greeting:'Kafka Consumer'});
});

app.post('/conveyer/post/new', function(req, res){
    //var sentMessage = JSON.stringify(req.body);

    const data = {
        body: req.body,
        user: req.user,
        headers: req.headers
    };

    const payloads = [
        {topic: 'Posts', messages: JSON.stringify(data), partition: 0}
    ];
    producer.send(payloads, function(err, data){
        res.json(data);
    });
});

app.listen(port, () => console.log(`Kafka producer running on port ${port}!`));