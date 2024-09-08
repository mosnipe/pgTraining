const readline = require('readline');
const { performance } = require('perf_hooks');
const wordList = require('./wordList');

const RANKING_SIZE = 10; // ランキングの上限
const MAX_TIME = 9999999999;
const MIN_DIFFICULTY = 1;
const MAX_DIFFICULTY = 3;

class TypingGame {
    constructor() {
        this.rankings = {
            easy: Array(RANKING_SIZE).fill(MAX_TIME),
            normal: Array(RANKING_SIZE).fill(MAX_TIME),
            hard: Array(RANKING_SIZE).fill(MAX_TIME)
        };
        this.resetGame();
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        this.isInterrupted = false; // 中断フラグを追加
        this.setupExitKeyListener();
    }

    setupExitKeyListener() {
        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.on('data', (key) => {
            if (key.toString() === '\u001b') { // 'Esc'キーで終了
                console.log("\nゲーム終了。難易度選択に戻ります。");
                this.isInterrupted = true; // 中断フラグを立てる
                this.resetGame();
                this.startGame();
            }
        });
    }

    resetGame() {
        this.correctCount = 0;
        this.incorrectCount = 0;
        this.questionCount = 0;
        this.previousWord = null;
        this.currentWord = null; // 現在の出題単語
        this.startTime = null;
        this.endTime = null;
        // currentDifficulty はリセットしないで保持する
    }

    startGame() {
        this.rl.question("難易度を選択してください (1: Easy, 2: Normal, 3: Hard): ", (difficulty) => {
            if (difficulty >= MIN_DIFFICULTY && difficulty <= MAX_DIFFICULTY) {
                this.isInterrupted = false; // 中断フラグをリセット
                this.setDifficulty(difficulty);
                console.log("カウントダウン開始…");
                this.countdown(3);
            } else {
                console.log("無効な選択です。もう一度お試しください。");
                this.startGame();
            }
        });
    }

    setDifficulty(difficulty) {
        switch (difficulty) {
            case '1':
                this.wordList = wordList.easy;
                this.questionCount = 5;
                this.currentDifficulty = 'easy';
                break;
            case '2':
                this.wordList = wordList.normal;
                this.questionCount = 10;
                this.currentDifficulty = 'normal';
                break;
            case '3':
                this.wordList = wordList.hard;
                this.questionCount = 15;
                this.currentDifficulty = 'hard';
                break;
        }
    }

    countdown(seconds) {
        if (this.isInterrupted) return; // 中断された場合は終了
        if (seconds > 0) {
            console.log(seconds + "...");
            setTimeout(() => this.countdown(seconds - 1), 1000);
        } else {
            console.log("Start!");
            this.startTime = performance.now();  // ゲーム開始時間を記録
            this.startTyping();
        }
    }

    startTyping() {
        if (this.isInterrupted) return; // 中断された場合は終了

        if (this.correctCount + this.incorrectCount === this.questionCount) {
            this.endGame();
            return;
        }

        if (!this.currentWord) {
            // 初回もしくは正解後に新しい単語を出題
            let word;
            do {
                word = this.wordList[Math.floor(Math.random() * this.wordList.length)];
            } while (word === this.previousWord); // 前回の単語と同じなら再抽選

            this.previousWord = word;
            this.currentWord = word; // 現在の単語を記憶
        }

        this.rl.question(`入力してください: ${this.currentWord}\n`, (answer) => {
            if (this.isInterrupted) return; // 中断された場合は終了

            if (answer === this.currentWord) {
                console.log("OK!");
                this.correctCount++;
                this.currentWord = null; // 正解したので次回は新しい単語を出題
            } else {
                console.log("Miss... 再度入力してください。");
                this.incorrectCount++;
                // currentWordはリセットしないので、同じ単語を再出題
            }
            this.startTyping();
        });
    }

    endGame() {
        if (this.isInterrupted) return; // 中断された場合は終了
        this.endTime = performance.now();
        let timeTaken = ((this.endTime - this.startTime) / 1000).toFixed(2);  // 経過時間を秒で計算
        console.log(`結果: 正解 ${this.correctCount}, 間違い ${this.incorrectCount}`);
        console.log(`経過時間: ${timeTaken} 秒`);

        this.updateRanking(timeTaken);
        this.displayRanking();
        this.askRetry();
    }

    updateRanking(timeTaken) {
        let time = parseFloat(timeTaken);
        let currentRankings = this.rankings[this.currentDifficulty];
        for (let i = 0; i < currentRankings.length; i++) {
            if (time < currentRankings[i]) {
                currentRankings.splice(i, 0, time); // タイムを挿入
                currentRankings.pop(); // 最後の要素を削除してランキングを10位に維持
                break;
            }
        }
    }

    displayRanking() {
        console.log(`${this.currentDifficulty.charAt(0).toUpperCase() + this.currentDifficulty.slice(1)}ランキング:`);
        this.rankings[this.currentDifficulty].forEach((time, index) => console.log(`${index + 1}: ${time}[s]`));
    }

    askRetry() {
        this.rl.question("もう一度プレイしますか？ (1: する, 2: しない): ", (answer) => {
            if (answer === '1') {
                this.resetGame();
                this.startGame();
            } else if (answer === '2') {
                console.log("プログラムを終了します。");
                this.rl.close();
            } else {
                console.log("無効な入力です。もう一度入力してください。");
                this.askRetry();
            }
        });
    }
}

const game = new TypingGame();
game.startGame();
