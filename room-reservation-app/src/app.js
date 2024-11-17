const readlineSync = require('readline-sync');
const fs = require('fs');
const csv = require('csv-parser');

const USERS_CSV_PATH = './src/data/userAccount.csv';
const FACILITIES = [
  { id: 1, name: '大会議室', capacity: 40, tel: 2110 },
  { id: 2, name: '第1会議室', capacity: 10, tel: 2111 },
  { id: 3, name: 'ミーティングスペースA', capacity: 4, tel: 4210 },
  { id: 4, name: 'ミーティングスペースB', capacity: 6, tel: 4211 }
];

let currentUser = null;

// 文字化け対策
process.stdout.write('\u001b[0m');

/**
 * ユーザーの入力を促し、ログイン処理を行う
 */
function promptUserLogin() {
  console.log('＝＝＝施設予約システム－認証画面＝＝＝\n');
  console.log('ログイン名とパスワードを入力してください。');
  console.log('終了する場合は、ログイン名に-1を入力してください。\n');

  const userId = readlineSync.question('ログイン名：'.toString('utf8'));
  if (userId === '-1') {
    console.log('アプリを終了します。');
    process.exit(0);
  }
  
  const password = readlineSync.question('パスワード：'.toString('utf8'), { hideEchoBack: true });
  return { userId, password };
}

/**
 * CSVからユーザーアカウントを読み込む
 */
async function loadUserAccounts() {
  const users = [];
  return new Promise((resolve, reject) => {
    fs.createReadStream(USERS_CSV_PATH)
      .pipe(csv())
      .on('data', (row) => users.push(row))
      .on('end', () => resolve(users))
      .on('error', (err) => reject(err));
  });
}

/**
 * ユーザーが正しくログインできるかを確認する
 */
async function loginUser() {
  const { userId, password } = promptUserLogin();
  const users = await loadUserAccounts();

  const user = users.find((user) => user.user_id === userId && user.password === password);

  if (user) {
    currentUser = user;
    console.log(`ログイン成功: ようこそ ${user.user_id} さん\n`);
    if (user.role === 'admin') {
      adminMenu();
    } else {
      userMenu();
    }
  } else {
    console.log('ログイン失敗: ユーザーIDまたはパスワードが間違っています\n');
    await loginUser();
  }
}

/**
 * 一般ユーザー用メニュー
 */
function userMenu() {
  console.log('＝＝＝施設予約システム－予約者サービスメニュー画面＝＝＝');
  console.log(`ユーザ名：${currentUser.user_id}\n`);
  console.log('メニュー番号を入力してください。\n');
  console.log('[1]予約照会\n[2]施設予約\n[3]終了');
  
  const choice = readlineSync.question('選択番号：'.toString('utf8'));
  
  switch (choice) {
    case '1':
      showReservations();
      break;
    case '2':
      reserveFacility();
      break;
    case '3':
      console.log('アプリを終了します。');
      process.exit(0);
    default:
      console.log('無効な選択です。');
      userMenu();
  }
}

/**
 * 予約照会画面
 */
function showReservations() {
  console.log('＝＝＝施設予約システム－予約照会画面＝＝＝');
  console.log(`ユーザ名：${currentUser.user_id}\n`);
  console.log('施設番号と日付を入力してください。\n予約者用メニュー画面へ戻る場合は、-1を入力してください。\n');
  FACILITIES.forEach(f => console.log(`[${f.id}]${f.name} 定員：${f.capacity} 内線番号：${f.tel}`));
  const facilityId = readlineSync.question('施設番号：'.toString('utf8'));
  
  if (facilityId === '-1') {
    userMenu();
  }
}

/**
 * 施設予約画面
 */
function reserveFacility() {
  console.log('＝＝＝施設予約システム－施設予約画面＝＝＝');
  console.log(`ユーザ名：${currentUser.user_id}\n`);
  console.log('施設番号、利用開始日時、利用終了日時、利用目的(空白可)を入力してください。\n予約者用メニュー画面へ戻る場合は、-1を入力してください。\n');
  FACILITIES.forEach(f => console.log(`[${f.id}]${f.name} 定員：${f.capacity} 内線番号：${f.tel}`));
  const facilityId = readlineSync.question('施設番号：'.toString('utf8'));
  
  if (facilityId === '-1') {
    userMenu();
  }
}

/**
 * 管理者用メニュー
 */
function adminMenu() {
  console.log('＝＝＝施設予約システム－管理者サービスメニュー画面＝＝＝\n');
  console.log('メニュー番号を入力してください。\n');
  console.log('[1]施設登録\n[2]ユーザ登録\n[3]終了');

  const choice = readlineSync.question('選択番号：'.toString('utf8'));

  switch (choice) {
    case '1':
      registerFacility();
      break;
    case '2':
      registerUser();
      break;
    case '3':
      console.log('アプリを終了します。');
      process.exit(0);
    default:
      console.log('無効な選択です。');
      adminMenu();
  }
}

/**
 * 施設登録画面
 */
function registerFacility() {
  console.log('＝＝＝施設予約システム－施設登録画面＝＝＝\n');
  console.log('施設名、定員、内線番号を入力してください。管理者用メニュー画面へ戻る場合は、-1 を入力してください。\n');
}

/**
 * ユーザ登録画面
 */
function registerUser() {
  console.log('＝＝＝施設予約システム－ユーザ登録画面＝＝＝\n');
  console.log('ログイン名、パスワード、ユーザの実名、内線番号、部署名、権限を入力してください。管理者用メニュー画面へ戻る場合は、-1 を入力してください。\n');
}

// アプリの起動
loginUser();
