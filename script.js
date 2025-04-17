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
async function getData(){
    const url = 'gensudokuprob.php';
    try{
        const response = await fetch(url);
        if(!response.ok){
            throw new Error('レスポンスステータス: ${response.status}');
        }

        const json = await response.json();

        let sudoku_table_rows = document.getElementsByClassName('sudoku_table_row');
        for(let i = 0; i < 9; i++){
            let sudoku_table_cells = sudoku_table_rows[i].children;
            for(let j = 0; j < 9; j++){
                sudoku_table_cells[j].innerText = json[i][j];
            }
        }
    } catch (error){
        console.log(error);
    }
}

generateSudokuTableHTML();

getData();