const express = require('express');
const app = express()
const cors = require('cors');
const port = process.env.port || 5000;
const jwt = require('jsonwebtoken');
require("dotenv").config();
app.use(cors())
app.use(express.json())

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cmcdv.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        // aita use kore connect korar jnno 
        await client.connect();
        console.log('db connect')
        const inventoryCollection = client.db("warehouseManagement").collection("inventory")
        const reviewCollection = client.db("warehouseManagement").collection("review")

        app.get('/inventory', async (req, res) => {
            const query = {}
            const inventories = await inventoryCollection.find(query).toArray()
            res.send(inventories)
        });
        app.get('/review', async (req, res) => {
            const query = {}
            const reviews = await reviewCollection.find(query).toArray()
            res.send(reviews)
        });

        // To get one item hello
        //hello
        app.get('/inventory/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            // ekta hoile cursor mara lagena 
            const inventory = await inventoryCollection.findOne(query);
            res.send(inventory)
        })

        // post one  
        app.post('/inventory', async (req, res) => {
            const newService = req.body;
            const tokenInfo = req.headers.authorization
            // console.log(tokenInfo)
            const [email, accessToken] = tokenInfo.split(" ");
            const decoded = verifyToken(accessToken)
            console.log(decoded)
            if (email === decoded.email) {
                const result = await inventoryCollection.insertOne(newService);
                res.send({ success: 'Product Upload Succesfully' });
            }
            else {
                res.send({ success: 'UnAuthorized Access' });
            }
        })

        //DELETE 
        app.delete('/inventory/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await inventoryCollection.deleteOne(query);
            res.send(result)
        })

        // update stock
        app.put('/inventory/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updateUser = req.body
            const updateDoc = {
                $set: {
                    quantity: updateUser.quantity
                }
            }
            const result = await inventoryCollection.updateOne(filter, updateDoc, options)
            res.send(result)
        })

        // restock 
        app.put('/inventory/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updateUser = req.body
            const updateDoc = {
                $set: {
                    quantity: updateUser.quantity
                }
            }
            const result = await inventoryCollection.updateOne(filter, updateDoc, options)
            res.send(result)
        })
        // jwt token 
        app.post('/login', (req, res) => {
            const email = req.body;
            const token = jwt.sign(email, process.env.ACCESS_TOKEN_SECRET);
            res.send({ token })

        })
        // // additems
        // app.post('/additems', async (req, res) => {
        //     const orderInfo = req.body;
        //     console.log(orderInfo)
        //     const result = await itemCollection.insertOne(orderInfo);
        //     res.send({ success: "Order Complete" })
        // })

        // show the items related to gmail 
        app.get('/itemList', async (req, res) => {
            const tokenInfo = req.headers.authorization
            // console.log(tokenInfo)
            const [email, accessToken] = tokenInfo.split(" ");
            console.log(tokenInfo)
            const decoded = verifyToken(accessToken)
            if (email === decoded.email) {
                const orders = await inventoryCollection.find({ email: email }).toArray()
                res.send(orders)
            }
            else {
                res.send({ success: 'UnAuthorized Access' });
            }
        })

        app.delete('/itemList/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await inventoryCollection.deleteOne(query);
            res.send(result)
        })

        // deleteItems 


    } finally {
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => res.send('Hello Worlds!'))

app.listen(port, () => console.log(`listening to ${port}`))


// username = farhan
//password = 6Jr66WvX1JB0QBhK

function verifyToken(token) {
    let email;
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            email = 'Invalid email'
        }
        if (decoded) {
            console.log(decoded)
            email = decoded
        }
    });

    return email;
}