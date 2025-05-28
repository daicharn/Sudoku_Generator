let Selected_Matrix = [-1, -1];

//穴の数が範囲外の時に警告を出すイベント
document.getElementById('hole_num').addEventListener('blur', () => {
    let num = Number(document.getElementById('hole_num').value);
    if(num < 0 || num > 50) {
        alert("0から50の範囲で入力してください");
        document.getElementById('hole_num').value = "0";
    }
});

//生成するボタンを押したとき
document.getElementById('btn_gen').addEventListener('click', () => {
    let radio_gen_method = document.getElementsByName('gen_method');
    let hole_num = 0;
    //難易度で指定が選択されている場合
    if(radio_gen_method[0].checked){
        let radio_difficulty = document.getElementsByName('difficulty');
        if(radio_difficulty[0].checked) hole_num = Math.floor(Math.random() * 11) + 10;
        else if (radio_difficulty[1].checked) hole_num = Math.floor(Math.random() * 11) + 20;
        else if (radio_difficulty[2].checked) hole_num = Math.floor(Math.random() * 21) + 30;
    }
    //穴の数で指定が選択されている場合
    else if(radio_gen_method[1].checked){
        hole_num = Number(document.getElementById('hole_num').value);
    }

    getSudokuData(hole_num);
    switchView();
});

//生成ダイアログを閉じて数独の盤面を表示する
function switchView(){
    document.getElementById('modal_generate').style.display = "none";
    document.getElementById('sudoku_div').style.display = "flex";
}

//html上の数独のテーブルを生成
function generateSudokuTableHTML(){
    let sudoku_table_div = document.getElementById('sudoku_table_div');
    let sudoku_table = document.createElement('table');
    sudoku_table.id = "sudoku_table";
    for(let i = 0; i < 9; i++){
        let tr = document.createElement('tr');
        tr.className = "sudoku_table_row";
        for(let j = 0; j < 9; j++){
            let td = document.createElement('td');
            td.className = "sudoku_table_cell";
            //3、6列目の場合テーブルの右を太くするためのクラス名を指定
            if((j + 1) % 3 == 0 && Math.floor((j + 1) / 9) < 1){
                td.classList.add('cell_bold_right');
            }
            //3、6行目の場合は下を太くするクラス名
            if((i + 1) % 3 == 0 && Math.floor((i + 1) / 9) < 1){
                td.classList.add('cell_bold_bottom');
            }
            tr.appendChild(td);
        }
        sudoku_table.appendChild(tr);
    }

    sudoku_table_div.appendChild(sudoku_table);
}

//PHPから数独のデータを取得する
async function getSudokuData(hole_num){
    const url = 'gensudokuprob.php';
    try{
        const postData = new FormData();
        postData.set('hole_num', hole_num);
        const response = await fetch(url, {
            method: "POST",
            body: postData
        });
        if(!response.ok){
            throw new Error(`レスポンスステータス: ${response.status}`);
        }

        const json = await response.json();

        let sudoku_table_rows = document.getElementsByClassName('sudoku_table_row');
        for(let i = 0; i < 9; i++){
            let sudoku_table_cells = sudoku_table_rows[i].children;
            for(let j = 0; j < 9; j++){
                let sudoku_table_cell = sudoku_table_cells[j];
                if(json[i][j] != 0) sudoku_table_cell.innerText = json[i][j];
                else sudoku_table_cell.innerText = '';
                //数字がある箇所は太字にする
                if(JSON.parse(json[i][j] != 0)){
                    sudoku_table_cell.style.fontWeight = 'bold';
                }
                //数値がない箇所はクラスを追加する
                else{
                    const baseClass = sudoku_table_cell.className;
                    const addClass = 'cell_hole';
                    sudoku_table_cell.className = baseClass + ' ' + addClass;
                }
            }
        }

    } catch (error){
        console.log(error);
    }
}

generateSudokuTableHTML();

//空いたマスをクリックした時のイベント
let sudoku_table_cells = Array.from(document.getElementsByClassName('sudoku_table_cell'));
const sudoku_matrix = [];
while(sudoku_table_cells.length) sudoku_matrix.push(sudoku_table_cells.splice(0, 9));

for(let i = 0; i < sudoku_matrix.length; i++){
    for(let j = 0; j < sudoku_matrix[i].length; j++){
        let sudoku_table_cell = sudoku_matrix[i][j];
        sudoku_table_cell.addEventListener('click', () => {
            deleteTargetCellStyleAll();

            //選択した数値と同じ数値を探索する
            if(sudoku_table_cell.innerText != ''){
                //縦、横、3*3の範囲を選択状態にする
                for(let k = 0; k < 9; k++){
                    let target_cell_hor = sudoku_matrix[i][k];
                    let target_cell_var = sudoku_matrix[k][j];
                    let target_cell_box = sudoku_matrix[Math.floor(i % 9 / 3) * 3 + Math.floor(k / 3)][Math.floor(j % 9 / 3) * 3 + k % 3];
                    target_cell_hor.style.backgroundColor = 'rgb(200, 229, 248)';
                    target_cell_var.style.backgroundColor = 'rgb(200, 229, 248)';
                    target_cell_box.style.backgroundColor = 'rgb(200, 229, 248)';
                }
                //同じ数値の箇所を選択状態にする
                for(let k = 0; k < sudoku_matrix.length; k++){
                    for(let l = 0; l < sudoku_matrix[k].length; l++){
                        if(sudoku_table_cell.innerText == sudoku_matrix[k][l].innerText){
                            sudoku_matrix[k][l].style.backgroundColor = 'rgb(162, 218, 255)';
                        }
                    }
                }
            }
            //選択した箇所の色の変更
            sudoku_table_cell.style.backgroundColor = 'rgb(107, 188, 241)';
            //太字でない箇所であれば行列を記憶
            if(sudoku_table_cell.classList.contains('cell_hole')) Selected_Matrix = [i, j];
            //太字の箇所であれば行列を初期化
            else Selected_Matrix = [-1, -1];
        });
        //ダブルクリックされた時のイベント
        sudoku_table_cell.addEventListener('dblclick', () =>{
            deleteCellNum();
        });
    }
};

//削除ボタンを押したとき
document.getElementById('btn_delete').addEventListener('click', () => {
    deleteCellNum();
});

//セルの数値を削除する
function deleteCellNum(){
    if(Selected_Matrix[0] != -1 && Selected_Matrix[1] != -1){
        let target_cell = sudoku_matrix[Selected_Matrix[0]][Selected_Matrix[1]];
        if(target_cell.classList.contains('cell_hole')){
            target_cell.innerText = '';
            deleteTargetCellStyleAll();
            target_cell.style.backgroundColor = 'rgb(107, 188, 241)';
        }
    }
}

//指定したセルの選択状態を削除する
function deleteTargetCellStyle(cell){
    cell.style.backgroundColor = 'white';
}
//全てのセルの選択状態を削除する
function deleteTargetCellStyleAll(){
    const sudoku_table_cells = document.getElementsByClassName('sudoku_table_cell');
    for(let i = 0; i < sudoku_table_cells.length; i++){
        let sudoku_table_cell = sudoku_table_cells[i];
        deleteTargetCellStyle(sudoku_table_cell);
    }
}

//完成した数独のデータの答え合わせをする
async function checkSudokuAns(){
    const url = 'checksudokuans.php';
    try{
        const postData = new FormData();
        let sudoku_num_matrix = [];
        sudoku_matrix.forEach((sudoku_row) =>{
            let sudoku_row_matrix = [];
            sudoku_row.forEach((sudoku_cell) =>{
                sudoku_row_matrix.push(Number(sudoku_cell.innerText));
            });
            sudoku_num_matrix.push(sudoku_row_matrix);
        });

        sudoku_num_matrix.forEach((sudoku_row_matrix) =>{
            postData.append('sudoku_matrix[]', sudoku_row_matrix);
        });
        const response = await fetch(url, {
            method: "POST",
            body: postData
        });
        if(!response.ok){
            throw new Error(`レスポンスステータス: ${response.status}`);
        }

        const json = await response.json();

        return json;

    } catch (error){
        console.log(error);
    }
}

//数字のボタンをクリックしたときのイベント
let btns_num = Array.from(document.getElementsByClassName('btn_num'));
for(let i = 0; i < btns_num.length; i++){
    btns_num[i].addEventListener('click', async() =>{
        //選択状態であるとき
        if(Selected_Matrix[0] != -1 && Selected_Matrix[1] != -1){
            let target_cell = sudoku_matrix[Selected_Matrix[0]][Selected_Matrix[1]];
            target_cell.innerText = i + 1;
            target_cell.click();

            //全ての数値が埋まっている場合
            let success_flg = true;
            sudoku_matrix.forEach((sudoku_row) =>{
                sudoku_row.forEach((sudoku_cell) =>{
                    if(sudoku_cell.innerText == '') success_flg = false;
                });
                    
            });

            if(success_flg && await checkSudokuAns()){
                //数独のテーブルにアニメーションを加える
                animateSudokuDiagonal();
                //cell_holeクラスを削除する
                Array.from(document.getElementsByClassName('cell_hole')).forEach((cell_hole) =>{
                    cell_hole.classList.remove('cell_hole');
                });
                Selected_Matrix = [-1, -1];
            }
        }
    });
}

//斜めにセルの背景色を描画していくアニメーション
function animateSudokuDiagonal() {
    const delayBase = 100; // 各斜めラインに対する遅延
    for (let sum = 0; sum <= 16; sum++) {
        setTimeout(() => {
            for (let i = 0; i <= sum; i++) {
                const j = sum - i;
                if (i < 9 && j < 9) {
                    const cell = sudoku_matrix[i][j];
                    cell.animate(
                        {
                            backgroundColor: ['white', 'rgba(111, 238, 238, 0.71)']
                        },
                        {
                            duration: 300,
                            fill: 'forwards'
                        }
                    );
                }
            }
        }, delayBase * sum);
    }
}

//選択したセルのヒント（答え）を得る
async function getHintNum(){
    if(Selected_Matrix[0] != -1 && Selected_Matrix[1] != -1){
        const url = 'gethintnum.php';
        try{
            const postData = new FormData();
            postData.set('selected_matrix', Selected_Matrix);
            const response = await fetch(url, {
                method: "POST",
                body: postData
            });
            if(!response.ok){
                throw new Error(`レスポンスステータス: ${response.status}`);
            }

            const json = await response.json();

            return json;

        } catch (error){
            console.log(error);
        }
    }
    else{
        return -1;
    }
}

//ヒントボタンをクリックしたときのイベント
document.getElementById('btn_hint').addEventListener('click', async() => {
    let answer_num = await getHintNum();
    if(answer_num != -1) btns_num[answer_num - 1].click();
});