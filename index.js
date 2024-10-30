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
    origin: ['http://127.0.0.1:5500','https://shu12388y.github.io/crypto-api']
  },
});

let data = JSON.parse(fs.readFileSync('./crypto-db/data.json', 'utf-8'));
let Db = data;

setInterval(() => {
  for (let i = 0; i < Db.length; i++) {
    Db[i].price_usd = (Math.random() * 1000).toFixed(2);
  }
  io.emit('price', Db);
}, 1000);

io.use((socket, next) => {
  const headers = socket.handshake.headers;
  const authToken = headers['authorization'];

  if (!authToken || authToken.split(' ')[1] !== 'shubham') {
    return next(new Error('Authentication error')); // Reject the connection
  }

  next(); // Allow the connection if the token is valid
});

io.on('connection', (socket) => {
  socket.emit('price', Db);

  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});

app.use(express.json());
app.use(cors());
app.use(helmet());

app.use('/api/v1', AuthRouter);
app.get("/health",(req,res)=>{
  return res.status(200).json({message:"Healthy"})
  
})

server.listen(process.env.PORT, () => {
  console.log('Server is running on port ' + process.env.PORT);
});
