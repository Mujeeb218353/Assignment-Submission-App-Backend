import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

const corsOptions = {
    origin: [process.env.CORS_ORIGIN, 'http://localhost:5173'],
    credentials: true
}

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.static('public'));
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

import studentRouter from './routes/student.routes.js';
import teacherRouter from './routes/teacher.routes.js';
import adminRouter from './routes/admin.routes.js';

// routes 
app.use("/api/student", studentRouter);
app.use("/api/teacher", teacherRouter);
app.use("/api/admin", adminRouter);

export default app;