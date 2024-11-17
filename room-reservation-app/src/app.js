const readlineSync = require('readline-sync');
const fs = require('fs');
const csv = require('csv-parser');

function mainMenu() {
  console.log('=== 会議室予約アプリ ===');
  console.log('1. ユーザーでログイン');
  console.log('2. アプリを終了');
  const choice = readlineSync.question('選択してください: ');

  switch (choice) {
    case '1':
      login();
      break;
    case '2':
      console.log('アプリを終了します。');
      process.exit();
      break;
    default:
      console.log('無効な選択です。');
      mainMenu();
  }
}

function login() {
  const users = [];
  fs.createReadStream('./src/data/userAccount.csv')
    .pipe(csv())
    .on('data', (row) => users.push(row))
    .on('end', () => {
      const userId = readlineSync.question('ユーザーIDを入力してください: ');
      const password = readlineSync.question('パスワードを入力してください: ', { hideEchoBack: true });

      const user = users.find(user => user.user_id === userId && user.password === password);
      
      if (user) {
        console.log(`ログイン成功: ようこそ ${userId} さん`);
      } else {
        console.log('ログイン失敗: ユーザーIDまたはパスワードが間違っています');
      }
      mainMenu();
    });
}

// アプリの起動
mainMenu();
