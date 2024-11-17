const readlineSync = require('readline-sync');
const fs = require('fs');
const csv = require('csv-parser');

const USERS_CSV_PATH = './src/data/userAccount.csv';

// 文字化け対策として出力エンコーディングの設定
process.stdout.write('\u001b[0m');

/**
 * ユーザーの入力を促し、ログイン処理を行う
 * @returns {Object} - 入力されたユーザーIDとパスワード
 */
function promptUserLogin() {
  console.log('=== 会議室予約アプリ ===');
  const userId = readlineSync.question('ユーザーIDを入力してください: '.toString('utf8'));
  const password = readlineSync.question('パスワードを入力してください: '.toString('utf8'), { hideEchoBack: true });
  return { userId, password };
}

/**
 * CSVからユーザーアカウントを読み込む
 * @returns {Promise<Array>} - ユーザーアカウントの配列
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
 * @returns {Promise<boolean>} - ログインの成否
 */
async function loginUser() {
  const { userId, password } = promptUserLogin();
  const users = await loadUserAccounts();

  const user = users.find((user) => user.user_id === userId && user.password === password);

  if (user) {
    console.log(`ログイン成功: ようこそ ${userId} さん`);
    return true;
  } else {
    console.log('ログイン失敗: ユーザーIDまたはパスワードが間違っています');
    return false;
  }
}

/**
 * アプリのメインメニュー
 */
async function mainMenu() {
  process.stdout.write('=== 会議室予約アプリ ===\n');
  process.stdout.write('1. ユーザーでログイン\n');
  process.stdout.write('2. アプリを終了\n');

  const choice = readlineSync.question('選択してください (1または2): '.toString('utf8'));

  if (choice === '1') {
    const isLoggedIn = await loginUser();
    if (isLoggedIn) {
      console.log('次の操作を選択してください...');
      // TODO: 次の機能を実装
    } else {
      mainMenu();
    }
  } else if (choice === '2') {
    console.log('アプリを終了します。');
    process.exit(0);
  } else {
    console.log('無効な選択です。');
    mainMenu();
  }
}

// アプリの起動
mainMenu();
