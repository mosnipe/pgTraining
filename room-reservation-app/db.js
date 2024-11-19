const sqlite3 = require('sqlite3').verbose();

// データベース接続
const db = new sqlite3.Database('./reservation_system.db', (err) => {
    if (err) {
        console.error('データベース接続エラー:', err.message);
    } else {
        console.log('SQLite データベースに接続しました。');
    }
});

module.exports = db;
