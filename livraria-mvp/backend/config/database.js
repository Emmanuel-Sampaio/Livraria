const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'livraria.db');
const db = new Database(dbPath);

// Habilitar chaves estrangeiras
db.pragma('foreign_keys = ON');

module.exports = db;
