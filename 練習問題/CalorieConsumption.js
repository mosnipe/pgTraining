console.log("**** 消費カロリー計算 ****");

const readline = require('readline'); 

const rl = readline.createInterface({ 

  input: process.stdin, 

  output: process.stdout 

}); 

rl.question('体重[kg] :', (answer) => { 

    const BasedKcal = answer*24
    const ActiveKcal = BasedKcal*1.3
    console.log('基礎代謝による消費カロリー[kcal/日]:',BasedKcal); 
    console.log('活動による消費カロリー[kcal/日]:',ActiveKcal)

  rl.close(); 

}); 