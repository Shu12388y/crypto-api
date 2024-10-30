import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

import express from 'express';
import http from 'node:http';
import { Server } from 'socket.io';
import fs from 'node:fs';
import { AuthRouter } from './routes/Auth.routes.js';
import helmet from 'helmet';
import cors from 'cors';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://127.0.0.1:5500', 'https://shu12388y.github.io']
  },
});

// Load initial data
let data = JSON.parse(fs.readFileSync('./crypto-db/data.json', 'utf-8'));
let Db = data;

setInterval(() => {
  for (let i = 0; i < Db.length; i++) {
    // Randomly fluctuate the price within a range
    const priceFluctuation = Db[i].price_usd * (Math.random() ); // +/- 1% fluctuation
    Db[i].price_usd = parseFloat((Db[i].price_usd + priceFluctuation).toFixed(2));

    // Calculate new market cap based on updated price and a random fluctuation factor
    const marketCapFluctuation = Db[i].market_cap_usd * (Math.random() * 0.02 - 0.01); // +/- 1% fluctuation
    Db[i].market_cap_usd = parseFloat((Db[i].market_cap_usd + marketCapFluctuation).toFixed(2));

    // Randomly set 24h_change to a value between -5% and +5%
    Db[i]["24h_change"] = parseFloat((Math.random() * 10 - 5).toFixed(2));
  }

  // Emit the updated data to clients every second
  io.emit("price", Db);
}, 1000);

// Authentication Middleware
io.use((socket, next) => {
  const headers = socket.handshake.headers;
  const authToken = headers['authorization'];

  if (!authToken || authToken.split(' ')[1] !== 'shubham') {
    return next(new Error('Authentication error')); // Reject the connection
  }

  next(); // Allow the connection if the token is valid
});

// Handle connections and initial data
io.on('connection', (socket) => {
  socket.emit('price', Db); // Send current data immediately on connection

  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});

app.use(express.json());
app.use(cors());
app.use(helmet());

app.use('/api/v1', AuthRouter);
app.get("/health", (req, res) => {
  return res.status(200).json({ message: "Healthy" });
});

server.listen(process.env.PORT, () => {
  console.log('Server is running on port ' + process.env.PORT);
});
