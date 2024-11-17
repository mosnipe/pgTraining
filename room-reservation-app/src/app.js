const readlineSync = require('readline-sync');
const fs = require('fs');
const csv = require('csv-parser');

const USERS_CSV_PATH = './src/data/userAccount.csv';
const EQUIPMENT_CSV_PATH = './src/data/equipment.csv';
let currentUser = null;

// 文字化け対策
process.stdout.write('\u001b[0m');

/**
 * CSVファイルからデータを読み込む
 * @param {string} filePath - 読み込むCSVファイルのパス
 * @returns {Promise<Array>}
 */
async function loadCsv(filePath) {
  const data = [];
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => data.push(row))
      .on('end', () => resolve(data))
      .on('error', (err) => reject(err));
  });
}

/**
 * ユーザーのログイン処理
 */
async function loginUser() {
  const users = await loadCsv(USERS_CSV_PATH);
  while (true) {
    console.log('＝＝＝施設予約システム－認証画面＝＝＝');
    const userId = readlineSync.question('ログイン名：');
    if (userId === '-1') process.exit(0);
    const password = readlineSync.question('パスワード：', { hideEchoBack: true });

    const user = users.find(u => u.user_id === userId && u.password === password);
    if (user) {
      currentUser = user;
      console.log(`ログイン成功: ようこそ ${user.user_id} さん\n`);
      user.role === 'admin' ? adminMenu() : userMenu();
      break;
    } else {
      console.log('ログイン失敗: ユーザーIDまたはパスワードが間違っています\n');
    }
  }
}

/**
 * 一般ユーザー用メニュー
 */
function userMenu() {
  console.log('＝＝＝施設予約システム－予約者サービスメニュー画面＝＝＝');
  console.log('[1]予約照会\n[2]施設予約\n[3]終了');
  const choice = readlineSync.question('選択番号：');

  switch (choice) {
    case '1':
      showReservations();
      break;
    case '2':
      reserveFacility();
      break;
    case '3':
      process.exit(0);
    default:
      console.log('無効な選択です。');
      userMenu();
  }
}

/**
 * 予約照会機能
 */
async function showReservations() {
    console.log('＝＝＝施設予約システム－予約照会画面＝＝＝');
    console.log(`ユーザ名：${currentUser.user_id}`);
    console.log('施設番号と日付を入力してください。');
    console.log('予約者用メニュー画面へ戻る場合は、-1を入力してください。');
  
    // `equipment.csv` から施設情報を取得
    const facilities = await loadCsv(EQUIPMENT_CSV_PATH);
    facilities.forEach(f => console.log(`[${f.room_id}]${f.name} 定員：${f.capacity} 内線番号：${f.tel}`));
  
    // 施設番号の入力
    let facilityId;
    while (true) {
      facilityId = readlineSync.question('施設番号：');
      if (facilityId === '-1') return userMenu();
      if (!/^\d+$/.test(facilityId) || !facilities.find(f => f.room_id === facilityId)) {
        console.log('無効な施設番号です。再入力してください。');
      } else {
        break;
      }
    }
  
    // 日付の入力
    let date;
    while (true) {
      date = readlineSync.question('日付 (YYYY-MM-DD)：');
      if (date === '-1') return userMenu();
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        console.log('無効な日付形式です。再入力してください。');
      } else {
        break;
      }
    }
  
    // `reservation.csv` から予約情報を取得
    const reservations = await loadCsv('./src/data/reservation.csv');
  
    // 入力された施設IDと日付に一致する予約を検索
    const matchingReservations = reservations.filter(reservation => {
      return (
        reservation.room_id === facilityId &&
        reservation.start.startsWith(date)
      );
    });
  
    // 一致する予約があれば表示、なければメッセージを表示
    if (matchingReservations.length > 0) {
      console.log(`\n＝＝＝ ${facilities.find(f => f.room_id === facilityId).name}の予約一覧 (${date}) ＝＝＝`);
      matchingReservations.forEach(res => {
        console.log(`予約ID: ${res.id}`);
        console.log(`利用開始: ${res.start}`);
        console.log(`利用終了: ${res.end}`);
        console.log(`予約者: ${res.user_id}`);
        console.log(`目的: ${res.purpose || 'なし'}`);
        console.log('--------------------------------');
      });
    } else {
      console.log(`\n指定した施設ID「${facilityId}」の${date}の予約はありません。`);
    }
  
    // 照会完了後、メニューに戻る
    userMenu();
  }
  

/**
 * 施設予約機能
 */
async function reserveFacility() {
  const facilities = await loadCsv(EQUIPMENT_CSV_PATH);
  console.log('＝＝＝施設予約システム－施設予約画面＝＝＝');
  facilities.forEach(f => console.log(`[${f.room_id}]${f.name} 定員：${f.capacity} 内線番号：${f.tel}`));

  let facilityId;
  while (true) {
    facilityId = readlineSync.question('施設番号：');
    if (!/^\d+$/.test(facilityId) || !facilities.find(f => f.room_id === facilityId)) {
      console.log('無効な施設番号です。再入力してください。');
    } else {
      break;
    }
  }

  let startTime;
  while (true) {
    startTime = readlineSync.question('利用開始日時 (YYYY-MM-DD HH:mm)：');
    if (!isValidDateTime(startTime)) {
      console.log('無効な日時形式です。再入力してください。');
    } else {
      break;
    }
  }

  let endTime;
  while (true) {
    endTime = readlineSync.question('利用終了日時 (YYYY-MM-DD HH:mm)：');
    if (!isValidDateTime(endTime) || new Date(endTime) <= new Date(startTime)) {
      console.log('無効な終了日時です。再入力してください。');
    } else {
      break;
    }
  }

  const purpose = readlineSync.question('利用目的 (任意)：');
  console.log('予約が完了しました。');
}

/**
 * 管理者用メニュー
 */
function adminMenu() {
  console.log('＝＝＝施設予約システム－管理者サービスメニュー画面＝＝＝');
  console.log('[1]施設登録\n[2]ユーザ登録\n[3]終了');
  const choice = readlineSync.question('選択番号：');

  switch (choice) {
    case '1':
      registerFacility();
      break;
    case '2':
      registerUser();
      break;
    case '3':
      process.exit(0);
    default:
      console.log('無効な選択です。');
      adminMenu();
  }
}

/**
 * 日時のバリデーション
 */
function isValidDateTime(dateTime) {
  return /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(dateTime);
}

// アプリの起動
loginUser();
