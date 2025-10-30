import 'dotenv/config';
import app from './app.js';
import { initDB } from './db/lifecycle.js';   
import './models/index.js';                   

const PORT = Number(process.env.PORT || 3000);

(async () => {
  try {
    await initDB();
    app.listen(PORT, () => console.log(`🚀 http://localhost:${PORT}`));
  } catch (err) {
    console.error('❌ Avvio server fallito:', err);
    process.exit(1);
  }
})();