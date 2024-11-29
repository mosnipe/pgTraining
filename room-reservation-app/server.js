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
// 会議室予約API
app.post('/api/reservations', (req, res) => {
    const { facility_id, user_id, start_time, end_time, purpose } = req.body;

    // 入力チェック
    if (!facility_id || !user_id || !start_time || !end_time) {
        return res.status(400).json({
            success: false,
            message: '予約データが不正です。必須項目をすべて入力してください。'
        });
    }

    // 予約の衝突チェック
    const checkQuery = `
        SELECT * FROM reservations
        WHERE facility_id = ?
        AND (
            (start_time <= ? AND end_time > ?) OR
            (start_time < ? AND end_time >= ?)
        )
    `;
    db.get(checkQuery, [facility_id, end_time, start_time, start_time, end_time], (err, row) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'サーバーエラーが発生しました'
            });
        }

        if (row) {
            return res.status(409).json({
                success: false,
                message: '指定された時間帯には既に予約が入っています'
            });
        }

        // 予約の挿入
        const insertQuery = `
            INSERT INTO reservations (facility_id, user_id, start_time, end_time, purpose)
            VALUES (?, ?, ?, ?, ?)
        `;
        db.run(insertQuery, [facility_id, user_id, start_time, end_time, purpose], function (err) {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: '予約の登録中にエラーが発生しました'
                });
            }

            res.json({
                success: true,
                message: '予約が完了しました',
                reservation_id: this.lastID
            });
        });
    });
});
