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
    console.log('GETリクエスト: /');
    res.send('施設予約システム API');
});

app.listen(PORT, () => {
    console.log(`サーバーが起動しました: http://localhost:${PORT}`);
});

// ログインAPI
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    console.log('POSTリクエスト: /api/login');
    console.log('リクエストボディ:', req.body);

    if (!username || !password) {
        console.log('ログイン失敗: 入力データが不完全');
        return res.status(400).json({
            success: false,
            message: 'ユーザーIDとパスワードを入力してください'
        });
    }

    const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
    db.get(query, [username, password], (err, row) => {
        if (err) {
            console.error('ログインエラー:', err.message);
            return res.status(500).json({
                success: false,
                message: 'サーバーエラーが発生しました'
            });
        }

        if (row) {
            console.log('ログイン成功:', row);
            return res.json({
                success: true,
                message: 'ログイン成功',
                role: row.role
            });
        } else {
            console.log('ログイン失敗: ユーザーIDまたはパスワードが間違っています');
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
    console.log('POSTリクエスト: /api/reservations');
    console.log('リクエストボディ:', req.body);

    // 入力チェック
    if (!facility_id || !user_id || !start_time || !end_time) {
        console.log('予約失敗: 必須項目が不足');
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
    console.log('予約の衝突チェック開始:', { facility_id, start_time, end_time });
    db.get(checkQuery, [facility_id, end_time, start_time, start_time, end_time], (err, row) => {
        if (err) {
            console.error('予約衝突チェックエラー:', err.message);
            return res.status(500).json({
                success: false,
                message: 'サーバーエラーが発生しました'
            });
        }

        if (row) {
            console.log('予約失敗: 時間帯の重複', row);
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
        console.log('予約データ挿入開始:', { facility_id, user_id, start_time, end_time, purpose });
        db.run(insertQuery, [facility_id, user_id, start_time, end_time, purpose], function (err) {
            if (err) {
                console.error('予約挿入エラー:', err.message);
                return res.status(500).json({
                    success: false,
                    message: '予約の登録中にエラーが発生しました'
                });
            }

            console.log('予約成功: ID=', this.lastID);
            res.json({
                success: true,
                message: '予約が完了しました',
                reservation_id: this.lastID
            });
        });
    });
});

// 予約確認API
app.get('/api/reservations/search', (req, res) => {
    const { facility_id, user_id, date } = req.query;
    console.log('GETリクエスト: /api/reservations/search');
    console.log('リクエストパラメータ:', { facility_id, user_id, date });

    let query = `SELECT * FROM reservations WHERE 1=1`;
    const params = [];

    if (facility_id) {
        query += ` AND facility_id = ?`;
        params.push(facility_id);
    }

    if (user_id) {
        query += ` AND user_id = ?`;
        params.push(user_id);
    }

    if (date) {
        query += ` AND date(start_time) = ?`;
        params.push(date);
    }

    db.all(query, params, (err, rows) => {
        if (err) {
            console.error('予約確認エラー:', err.message);
            return res.status(500).json({
                success: false,
                message: '予約確認中にエラーが発生しました'
            });
        }

        res.json({
            success: true,
            reservations: rows
        });
    });
});
// 会議室登録API
app.post('/api/facilities', (req, res) => {
    const { name, capacity, tel } = req.body;
    console.log('POSTリクエスト: /api/facilities');
    console.log('リクエストボディ:', req.body);

    if (!name || !capacity) {
        return res.status(400).json({
            success: false,
            message: '会議室名と収容人数は必須です'
        });
    }

    const query = `
        INSERT INTO facilities (name, capacity, tel)
        VALUES (?, ?, ?)
    `;
    db.run(query, [name, capacity, tel], function (err) {
        if (err) {
            console.error('会議室登録エラー:', err.message);
            return res.status(500).json({
                success: false,
                message: '会議室登録中にエラーが発生しました'
            });
        }

        res.json({
            success: true,
            message: '会議室が登録されました',
            facility_id: this.lastID
        });
    });
});
// ユーザー登録API
app.post('/api/users', (req, res) => {
    const { username, password, role } = req.body;
    console.log('POSTリクエスト: /api/users');
    console.log('リクエストボディ:', req.body);

    if (!username || !password || !role) {
        return res.status(400).json({
            success: false,
            message: 'ユーザー名、パスワード、役割は必須です'
        });
    }

    const query = `
        INSERT INTO users (username, password, role)
        VALUES (?, ?, ?)
    `;
    db.run(query, [username, password, role], function (err) {
        if (err) {
            console.error('ユーザー登録エラー:', err.message);
            return res.status(500).json({
                success: false,
                message: 'ユーザー登録中にエラーが発生しました'
            });
        }

        res.json({
            success: true,
            message: 'ユーザーが登録されました',
            user_id: this.lastID
        });
    });
});

