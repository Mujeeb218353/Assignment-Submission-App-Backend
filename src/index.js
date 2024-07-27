import dotenv from 'dotenv';
import app from './app.js';
import { connectDB } from "./db/index.js";
dotenv.config({ 
    path: './.env' 
});

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(PORT, () => {
    console.log(`Server started on port http://localhost:${PORT}`);
});

connectDB();