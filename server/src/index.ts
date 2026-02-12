import express from "express";
import cors from "cors";
import goalRouter from "./routes/goals";
import taskRouter from "./routes/tasks";
import versionRouter from "./routes/version";
import todoRouter from "./routes/todos";
import clearDataRouter from "./routes/clear-data";
import clearDatabaseRouter from "./routes/clear-database";
import testDataRouter from "./routes/test-data";

const app = express();
const port = process.env.PORT || 9091;

// Middleware
app.use(cors({
  origin: '*', // 开发环境允许所有源
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health check
app.get('/api/v1/health', (req, res) => {
  console.log('Health check success');
  res.status(200).json({ status: 'ok' });
});

// Routes
app.use('/api/v1/goals', goalRouter);
app.use('/api/v1/tasks', taskRouter);
app.use('/api/v1/todos', todoRouter);
app.use('/api/v1/version', versionRouter);
app.use('/api/v1/clear-data', clearDataRouter);
app.use('/api/v1/clear-database', clearDatabaseRouter);
app.use('/api/v1/test-data', testDataRouter);

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}/`);
});
