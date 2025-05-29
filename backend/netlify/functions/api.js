import serverless from 'serverless-http';
// The default export from server.js is the Express app
import app from '../../server.js'; 

// server.js now calls connectMongoDB() on load,
// so the database should be connected when this handler is initialized.

export const handler = serverless(app); 