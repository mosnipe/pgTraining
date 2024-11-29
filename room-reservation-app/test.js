const db = require('./db');

// ユーザーデータを取得
db.all('SELECT * FROM users', [], (err, rows) => {
    if (err) {
        console.error('データ取得エラー:', err.message);
    } else {
        console.log('ユーザーデータ:', rows);
    }
});

// データベース接続を閉じる
db.close((err) => {
    if (err) {
        console.error('データベース切断エラー:', err.message);
    } else {
        console.log('データベース接続を閉じました。');
    }
});
