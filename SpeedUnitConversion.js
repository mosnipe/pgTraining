console.log("**** 速度の変換 ****");

const readline = require('readline'); 

const rl = readline.createInterface({ 

  input: process.stdin, 

  output: process.stdout 

}); 

rl.question('時速[km/h]: ', (answer) => { 

  const S = answer/60|0;
    console.log('秒速[m/s]:',S); 

  rl.close(); 

}); 