import 'dotenv/config';
import { connectDB } from './config/db.js';
import app from './app.js';

const PORT = process.env.PORT || 5000;
connectDB()
  .then(() => app.listen(PORT, () => console.log(`[api] listening on http://localhost:${PORT}`)))
  .catch((err) => {
    console.error('[startup] failed:', err.message);
    process.exit(1);
  });
