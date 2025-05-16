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
                sudoku_table_cells[j].innerText = json[i][j];
                //0（穴の箇所）は非表示にする
                if(JSON.parse(json[i][j] == 0)) sudoku_table_cells[j].style.visibility = 'hidden';
            }
        }

    } catch (error){
        console.log(error);
    }
}

generateSudokuTableHTML();