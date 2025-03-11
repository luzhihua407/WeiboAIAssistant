import express from 'express';
import bodyParser from 'body-parser';
import apiRoutes from '#root/routes/apiRoutes.js';
import { createServer } from 'http';
import { initializeSocket } from '#root/utils/socket.js';
const app = express();

// Middleware
// Set the maximum payload size to 5MB
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));

// Routes
app.use('/api', apiRoutes);
const server = createServer(app);
// Initialize Socket.IO on the server
initializeSocket(server);

// Global error handler
app.use((err, req, res, next) => {
  if (err.code === 'PAYLOAD_TOO_LARGE') {
    return res.status(413).send('Payload too large');
  }
  // Handle other errors
  res.status(500).send('Something went wrong!');
});

// Start the serverd
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
