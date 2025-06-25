const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;
app.use(express.static('public'));

const url = 'mongodb://mongodb:27017';
const client = new MongoClient(url);
const dbName = 'myProject';
let db;

app.use(bodyParser.urlencoded({ extended: true }));

async function main() {
    await client.connect();
    console.log('Connected successfully to MongoDB');
    db = client.db(dbName);

    app.listen(port, () => {
        console.log(`App listening at http://localhost:${port}`);
    });
}

app.get('/', async (req, res) => {
    const collection = db.collection('documents');
    const documents = await collection.find({}).toArray();

    let html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Nodejs + MongoDB</title>
        <link rel="stylesheet" href="/styles.css">
    </head>
    <body>
        <header>
            <h1>MongoDB Items</h1>
            <form method="POST" action="/add">
                <input name="item" placeholder="Item" required />
                <input name="qty" placeholder="Quantity" type="number" required />
                <input name="status" placeholder="Status" required />
                <button type="submit">Add</button>
            </form>
        </header>

        <main>
            <ul>
    `;

    documents.forEach(doc => {
        html += `
            <li>
                <form method="POST" action="/update/${doc._id}" style="display:inline;">
                    <input name="item" value="${doc.item}" />
                    <input name="qty" type="number" value="${doc.qty}" />
                    <input name="status" value="${doc.status}" />
                    <button type="submit">Update</button>
                </form>
                <form method="POST" action="/delete/${doc._id}" style="display:inline;">
                    <button type="submit">Delete</button>
                </form>
            </li>
        `;
    });

    html += '</ul></main><footer><p>Node.js + MongoDB Example</p></footer></body></html>';
    res.send(html);
});

// Create
app.post('/add', async (req, res) => {
    const collection = db.collection('documents');
    await collection.insertOne({
        item: req.body.item,
        qty: parseInt(req.body.qty),
        status: req.body.status
    });
    res.redirect('/');
});

// Update
app.post('/update/:id', async (req, res) => {
    const collection = db.collection('documents');
    await collection.updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: {
            item: req.body.item,
            qty: parseInt(req.body.qty),
            status: req.body.status
        }}
    );
    res.redirect('/');
});

// Delete
app.post('/delete/:id', async (req, res) => {
    const collection = db.collection('documents');
    await collection.deleteOne({ _id: new ObjectId(req.params.id) });
    res.redirect('/');
});

main().catch(console.error);
