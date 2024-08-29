const readline = require('readline');
const { performance } = require('perf_hooks');

const wordListEasy = [
    "boolean", "case", "const", "do", "else", "for", "if", "let", "new", "null",
    "number", "string", "this", "try", "undefined", "var"
];
const wordListNormal = [
    "async", "await", "bigint", "break", "catch", "class", "constructor", "continue", "debugger", "default",
    "delete", "enum", "export", "extends", "finally", "import", "in", "package", "require", "return", 
    "static", "super", "switch", "symbol", "throw", "typeof", "void", "while","boolean", "case", "const", "do", "else", "for", "if", "let", "new", "null",
    "number", "string", "this", "try", "undefined", "var"
];
const wordListHard = [
    "implements", "instanceof", "interface", "private", "protected", "public", "yield","async", "await", "bigint", "break", "catch", "class", "constructor", "continue", "debugger", "default",
    "delete", "enum", "export", "extends", "finally", "import", "in", "package", "require", "return", 
    "static", "super", "switch", "symbol", "throw", "typeof", "void", "while","boolean", "case", "const", "do", "else", "for", "if", "let", "new", "null",
    "number", "string", "this", "try", "undefined", "var"
];

const rankings = {
    easy: Array(10).fill(9999999999),
    normal: Array(10).fill(9999999999),
    hard: Array(10).fill(9999999999)
};

let wordList = [];
let correctCount = 0;
let incorrectCount = 0;
let startTime, endTime;
let questionCount = 0; // 出題数を管理
let previousWord = null; // 前回の単語を記憶
let currentDifficulty = null; // 現在の難易度を記録
let rl; // readline インターフェース

function initializeReadline() {
    if (rl) rl.close(); // 既存の readline インターフェースを閉じる
    rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
}

process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.on('data', function(key) {
    if (key.toString() === '\u001b') { // 'Esc'キーを検出
        console.log("\nゲーム終了。難易度選択に戻ります。");
        resetGame();
        startGame();
    }
});

function startGame() {
    initializeReadline(); // 新しい readline インターフェースを初期化
    rl.question("難易度を選択してください (1: Easy, 2: Normal, 3: Hard): ", (difficulty) => {
        if (difficulty === '1') {
            wordList = wordListEasy;
            questionCount = 5;
            currentDifficulty = 'easy';
        } else if (difficulty === '2') {
            wordList = wordListNormal;
            questionCount = 10;
            currentDifficulty = 'normal';
        } else if (difficulty === '3') {
            wordList = wordListHard;
            questionCount = 15;
            currentDifficulty = 'hard';
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

    let word;
    do {
        word = wordList[Math.floor(Math.random() * wordList.length)];
    } while (word === previousWord); // 前回の単語と同じなら再抽選

    previousWord = word; // 現在の単語を記憶

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
    displayRanking(); // 選択された難易度のランキングのみ表示

    rl.question("もう一度プレイしますか？ (1: する, 2: しない): ", (answer) => {
        if (answer === '1') {
            resetGame();
            startGame();
        } else {
            console.log("プログラムを終了します。");
            rl.close();
        }
    });
}

function updateRanking(timeTaken) {
    let time = parseFloat(timeTaken);
    let currentRankings = rankings[currentDifficulty];
    for (let i = 0; i < currentRankings.length; i++) {
        if (time < currentRankings[i]) {
            currentRankings.splice(i, 0, time); // タイムを挿入
            currentRankings.pop(); // 最後の要素を削除してランキングを10位に維持
            break;
        }
    }
}

function displayRanking() {
    console.log("Ranking:");
    console.log(`${currentDifficulty.charAt(0).toUpperCase() + currentDifficulty.slice(1)}:`);
    rankings[currentDifficulty].forEach((time, index) => console.log(`${index + 1}: ${time}[ms]`));
}

function resetGame() {
    correctCount = 0;
    incorrectCount = 0;
    previousWord = null; // 前回の単語をリセット
    // currentDifficultyはリセットしない
}

// ゲームを開始
startGame();
