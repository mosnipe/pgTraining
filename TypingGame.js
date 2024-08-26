const readline = require('readline');
const { performance } = require('perf_hooks');

const wordListEasy = [
    "boolean", "case", "const", "do", "else", "for", "if", "let", "new", "null",
    "number", "string", "this", "try", "undefined", "var"
];
const wordListNormal = [
    "async", "await", "bigint", "break", "catch", "class", "constructor", "continue", "debugger", "default",
    "delete", "enum", "export", "extends", "finally", "import", "in", "package", "require", "return", 
    "static", "super", "switch", "symbol", "throw", "typeof", "void", "while"
];
const wordListHard = [
    "implements", "instanceof", "interface", "private", "protected", "public", "yield"
];

const rankings = Array(10).fill(9999999999); // 初期ランキング（すべて最大値）

let wordList = [];
let correctCount = 0;
let incorrectCount = 0;
let startTime, endTime;
let questionCount = 0; // 出題数を管理

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function startGame() {
    rl.question("難易度を選択してください (1: Easy, 2: Normal, 3: Hard): ", (difficulty) => {
        if (difficulty === '1') {
            wordList = wordListEasy;
            questionCount = 5; // Easyモードの出題数
        } else if (difficulty === '2') {
            wordList = wordListNormal;
            questionCount = 10; // Normalモードの出題数
        } else if (difficulty === '3') {
            wordList = wordListHard;
            questionCount = 20; // Hardモードの出題数
        } else {
            console.log("無効な選択です。もう一度お試しください。");
            startGame();
            return;
        }

        console.log("カウントダウン開始…");
        countdown(3);
    });
}

function countdown(seconds) {
    if (seconds > 0) {
        console.log(seconds + "...");
        setTimeout(() => countdown(seconds - 1), 1000);
    } else {
        console.log("Start!");
        startTime = performance.now();  // ゲーム開始時間を記録
        startTyping();
    }
}

function startTyping() {
    if (correctCount + incorrectCount === questionCount) {
        endTime = performance.now();  // ゲーム終了時間を記録
        console.log("全ての単語を入力しました。ゲーム終了です。");
        endGame();
        return;
    }

    let word = wordList[Math.floor(Math.random() * wordList.length)];
    rl.question(`入力してください: ${word}\n`, (answer) => {
        if (answer === word) {
            console.log("OK!");
            correctCount++;
        } else {
            console.log("Miss...");
            incorrectCount++;
        }

        startTyping();
    });
}

function endGame() {
    let timeTaken = ((endTime - startTime) / 1000).toFixed(2);  // 経過時間を秒で計算
    console.log(`結果: 正解 ${correctCount}, 間違い ${incorrectCount}`);
    console.log(`経過時間: ${timeTaken} 秒`);

    updateRanking(timeTaken);
    displayRanking();

    rl.question("もう一度プレイしますか？ (1: する, 2: しない): ", (answer) => {
        if (answer === '1') {
            correctCount = 0;
            incorrectCount = 0;
            startGame();
        } else {
            console.log("プログラムを終了します。");
            rl.close();
        }
    });
}

function updateRanking(timeTaken) {
    let time = parseFloat(timeTaken);
    for (let i = 0; i < rankings.length; i++) {
        if (time < rankings[i]) {
            rankings.splice(i, 0, time); // タイムを挿入
            rankings.pop(); // 最後の要素を削除してランキングを10位に維持
            break;
        }
    }
}

function displayRanking() {
    console.log("Ranking:");
    for (let i = 0; i < rankings.length; i++) {
        console.log(`${i + 1}: ${rankings[i]}[ms]`);
    }
}

// ゲームを開始
startGame();
