//穴の数が範囲外の時に警告を出すイベント
document.getElementById('hole_num').addEventListener('blur', () => {
    let num = Number(document.getElementById('hole_num').value);
    if(num < 0 || num > 50) {
        alert("0から50の範囲で入力してください");
        document.getElementById('hole_num').value = "0";
    }
});

//生成するボタンを推したとき
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

    getData(hole_num);
    switchView();
});

//生成ダイアログを閉じて数独の盤面を表示する
function switchView(){
    document.getElementById('modal_generate').style.display = "none";
    document.getElementById('sudoku_table_div').style.display = "block";
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
async function getData(hole_num){
    const url = 'gensudokuprob.php';
    try{
        const postData = new FormData();
        postData.set('hole_num', hole_num);
        const response = await fetch(url, {
            method: "POST",
            body: postData
        });
        if(!response.ok){
            throw new Error('レスポンスステータス: ${response.status}');
        }

        const json = await response.json();

        let sudoku_table_rows = document.getElementsByClassName('sudoku_table_row');
        for(let i = 0; i < 9; i++){
            let sudoku_table_cells = sudoku_table_rows[i].children;
            for(let j = 0; j < 9; j++){
                let sudoku_table_cell = sudoku_table_cells[j];
                if(json[i][j] != 0) sudoku_table_cell.innerText = json[i][j];
                else sudoku_table_cell.innerText = '';
                //0（穴の箇所）は非表示にする
                if(JSON.parse(json[i][j] == 0)){
                    sudoku_table_cell.style.opacity = '0';
                }
                //数字がある箇所は太字にする
                else{
                    sudoku_table_cell.style.fontWeight = 'bold';
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
                    target_cell_hor.style.opacity = '1';
                    target_cell_var.style.backgroundColor = 'rgb(200, 229, 248)';
                    target_cell_var.style.opacity = '1';
                    target_cell_box.style.backgroundColor = 'rgb(200, 229, 248)';
                    target_cell_box.style.opacity = '1';
                }
                //同じ数値の箇所を選択状態にする
                
            }

            sudoku_table_cell.style.opacity = '1';
            sudoku_table_cell.style.backgroundColor = 'rgb(107, 188, 241)';
        });
    }
};

//指定したセルの選択状態を削除する
function deleteTargetCellStyle(cell){
    if(cell.innerText == '') cell.style.opacity = '0';
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