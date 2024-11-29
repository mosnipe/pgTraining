const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// サーバー動作確認
app.get('/', (req, res) => {
    res.send('施設予約システム API');
});

app.listen(PORT, () => {
    console.log(`サーバーが起動しました: http://localhost:${PORT}`);
});

// ログインAPI
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            success: false,
            message: 'ユーザーIDとパスワードを入力してください'
        });
    }

    const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
    db.get(query, [username, password], (err, row) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'サーバーエラーが発生しました'
            });
        }

        if (row) {
            return res.json({
                success: true,
                message: 'ログイン成功',
                role: row.role
            });
        } else {
            return res.status(401).json({
                success: false,
                message: 'ログイン失敗: ユーザーIDまたはパスワードが間違っています'
            });
        }
    });
});
