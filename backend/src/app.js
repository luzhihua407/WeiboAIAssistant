import express from 'express';
import bodyParser from 'body-parser';
import apiRoutes from '#root/routes/apiRoutes.js';
import { createServer } from 'http';
import { initializeSocket } from '#root/utils/socket.js';

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api', apiRoutes);
const server = createServer(app);
// Initialize Socket.IO on the server
initializeSocket(server);
// Start the serverd
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
