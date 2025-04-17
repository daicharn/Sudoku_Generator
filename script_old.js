//盤面の縦横の数（どちらも9）
const BOARD_SIZE = 9;

//HTMLの生成（必ずあらかじめ実行しておくこと）
generateSudokuTableHTML();

//盤面の定義
let sudoku_board_ans = new Array(BOARD_SIZE);
//オブジェクトをfillの引数に与えないこと
for(let i = 0; i < BOARD_SIZE; i++){
    sudoku_board_ans[i] = new Array(BOARD_SIZE).fill(0);
}

//盤面のベースの生成
//最上段横1列をランダム配列に基づいて埋めて確定する
let array_rand = generateRandomArray1to9();
for(let i = 0; i < BOARD_SIZE; i++){
    sudoku_board_ans[0][i] = array_rand[i];
}
//2列目以降を再帰処理で生成
generateSudokuNumRecursive(1, 0);

//穴をあける処理を実行する予定の箇所

//生成が完了したらHTMLに配置
putsSudokuBoardinTable();

//html上の数独のテーブルを生成
function generateSudokuTableHTML(){
    let sudoku_table_div = document.getElementById('sudoku_table_div');
    let sudoku_table = document.createElement('table');
    sudoku_table.id = "sudoku_table";
    for(let i = 0; i < BOARD_SIZE; i++){
        let tr = document.createElement('tr');
        tr.className = "sudoku_table_row";
        for(let j = 0; j < BOARD_SIZE; j++){
            let td = document.createElement('td');
            td.className = "sudoku_table_cell";
            //3、6列目の場合テーブルの右を太くするためのクラス名を指定
            if((j + 1) % 3 == 0 && Math.floor((j + 1) / BOARD_SIZE) < 1){
                td.classList.add('cell_bold_right');
            }
            //3、6行目の場合は下を太くするクラス名
            if((i + 1) % 3 == 0 && Math.floor((i + 1) / BOARD_SIZE) < 1){
                td.classList.add('cell_bold_bottom');
            }
            tr.appendChild(td);
        }
        sudoku_table.appendChild(tr);
    }

    sudoku_table_div.appendChild(sudoku_table);
}

//生成した数独の配列をHTMLのテーブルに配置する
function putsSudokuBoardinTable(){
    let sudoku_table_rows = document.getElementsByClassName('sudoku_table_row');
    for(let i = 0; i < BOARD_SIZE; i++){
        let sudoku_table_cells = sudoku_table_rows[i].children;
        for(let j = 0; j < BOARD_SIZE; j++){
            sudoku_table_cells[j].innerText = sudoku_board_ans[i][j];
        }
    }
}

//数字が盤面の添え字に該当するか調べる（0から8であるかどうか）
function isBoardIndex(num_index){
    if(num_index >= 0 && num_index < BOARD_SIZE){
        return true;
    }
    else{
        return false;
    }
}

//配列をランダムにシャッフルする
function shuffleArrayRandom(array){
    for(let i = array.length - 1; i > 0; i--){
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }

    return array;
}

//1から9の数字のランダムな配列を生成する
function generateRandomArray1to9(){
    let array_result = [];
    //1から9の順番の配列をベースとして生成
    for(let i = 0; i < BOARD_SIZE; i++){
        array_result.push(i + 1);
    }

    return shuffleArrayRandom(array_result);
}

//指定した行に存在する数値の配列を生成
function generateTargetHorNumArray(sudoku_board, hor_index){
    if(isBoardIndex(hor_index)){
        let array_hor = [];
        for(let i = 0; i < BOARD_SIZE; i++){
            let target_num = sudoku_board[hor_index][i];
            if(target_num == 0) break;
            else array_hor.push(target_num);
        }

        return array_hor;
    }
}

//指定した列に存在する数値の配列を生成
function generateTargetVerNumArray(sudoku_board, ver_index){
    if(isBoardIndex(ver_index)){
        let array_ver = [];
        for(let i = 0; i < BOARD_SIZE; i++){
            let target_num = sudoku_board[i][ver_index];
            if(target_num == 0) break;
            else array_ver.push(target_num);
        }

        return array_ver;
    }
}

//指定した行列に該当するブロック内の数値の配列を生成
function generateTargetBlockNumArray(sudoku_board, hor_index, ver_index){
    if(isBoardIndex(hor_index) && isBoardIndex(ver_index)){
        let array_box = [];
        for(let i = 0; i < BOARD_SIZE; i++){
            let hor_loc = Math.floor(hor_index / 3) * 3 + Math.floor(i / 3);
            let ver_loc = Math.floor(ver_index / 3) * 3 + i % 3;
            let target_num = sudoku_board[hor_loc][ver_loc];
            if(target_num == 0) break;
            else array_box.push(target_num);
        }

        return array_box;
    }
}

//指定した行列に埋められる数値の候補を計算する
function generateTargetCoordCandidate(hor_index, ver_index){
    if(isBoardIndex(hor_index) && isBoardIndex(ver_index)){
        //削除する数値の配列
        let array_delete = [];
        //埋められる候補の数値の配列（初期値は1～9のランダム配列）
        let array_candidate = generateRandomArray1to9();
        //行、列、3×3の範囲を調べて配列として出す
        let array_hor = generateTargetHorNumArray(sudoku_board_ans, hor_index);
        let array_ver = generateTargetVerNumArray(sudoku_board_ans, ver_index);
        let array_box = generateTargetBlockNumArray(sudoku_board_ans, hor_index, ver_index);
        array_delete = array_delete.concat(array_hor, array_ver, array_box);
        //重複を削除する
        array_delete = Array.from(new Set(array_delete));
        //array_deleteに含まれる数値をarray_candidateから削除することで候補を計算
        array_candidate = array_candidate.filter((value) => !array_delete.includes(value));
        
        return array_candidate;
    }
}

//数値を埋めて数独の盤面を生成するための再帰関数
function generateSudokuNumRecursive(hor_index, ver_index){
    //console.log(hor_index.toString() + " " + ver_index.toString());

    //該当する行、列、3×3の範囲を調べて埋められる数値の候補を出す
    let array_candidate = generateTargetCoordCandidate(hor_index, ver_index);

    //console.log(array_candidate);

    //盤面が完成したかどうかのフラグ
    let flg_found = false;

    //候補が存在する場合
    for(let i = 0; i < array_candidate.length; i++){
        //候補となる数値を指定された座標に埋める
        sudoku_board_ans[hor_index][ver_index] = array_candidate[i];
        //次の座標に移動し再帰処理を行う
        //右下まで到達した場合、再帰処理を終了
        if(hor_index >= BOARD_SIZE - 1 && ver_index >= BOARD_SIZE - 1){
            return true;
        }
        //右端まで到達した場合
        else if(ver_index >= BOARD_SIZE - 1){
            //一段下の左端へ移動
            flg_found = generateSudokuNumRecursive(hor_index + 1, 0);
        }
        //それ以外の場合
        else{
            //一つ右に移動
            flg_found = generateSudokuNumRecursive(hor_index, ver_index + 1);
        }

        //盤面が完成していたら終了
        if(flg_found) return true;

        //埋めた数値をゼロに戻す
        sudoku_board_ans[hor_index][ver_index] = 0;
    } 

    return false;
}

//指定した行の数値の合計を求める
function calcTargetHorSum(sudoku_board, hor_index){
    //有効な行かどうか調べる
    if(isBoardIndex(hor_index)){
        let result_sum = 0;
        let console_str = "";
        for(let ver_index = 0; ver_index < BOARD_SIZE; ver_index++){
            let result_num = sudoku_board[hor_index][ver_index];
            result_sum += result_num;
            console_str += result_num.toString() + " ";
        }

        //console.log(console_str);

        return result_sum;
    }
}
//指定した列の数値の合計を求める
function calcTargetVerSum(sudoku_board, ver_index){
    //有効な列かどうか調べる
    if(isBoardIndex(ver_index)){
        let result_sum = 0;
        let console_str = "";
        for(let hor_index = 0; hor_index < BOARD_SIZE; hor_index++){
            let result_num = sudoku_board[hor_index][ver_index];
            result_sum += result_num;
            console_str += result_num.toString() + " ";
        }

        //console.log(console_str);

        return result_sum;
    }
}

//指定したブロック内の数値の合計を求める
function calcTargetBlockSum(sudoku_board, hor3_index, ver3_index){
    //有効なブロックかどうか調べる
    if((hor3_index >= 0 && hor3_index <= 2) && (ver3_index >= 0 && ver3_index <= 2)){
        let result_sum = 0;
        let console_str = "";
        for(let i = 0; i < BOARD_SIZE; i++){
            let hor_index = hor3_index * 3 + Math.floor(i / 3);
            let ver_index = ver3_index * 3 + i % 3;
            let result_num = sudoku_board[hor_index][ver_index];
            result_sum += result_num;

            console_str += result_num.toString() + " ";
            //3区切りでコンソール出力
            if((i + 1) % 3 == 0){
                //console.log(console_str);
                console_str = "";
            }
        }

        return result_sum;
    }
}

//ランダム配列のランダム性テスト
function testRandomArrayNumCount(try_num, target_num){
    //少なくとも試行回数は一回以上
    if(try_num <= 0){
        console.log('%c' + "try_num must be 1 or more", 'color: red;');
        return;
    }
    //対象の数字は1から9
    if(target_num <= 0 || target_num > 9){
        console.log('%c' + "target_num must be between 1 to 9", 'color: red;');
        return;
    }

    let array_count = new Array(BOARD_SIZE).fill(0);
    for(let i = 0; i < try_num; i++){
        let array_generated = generateRandomArray1to9();
        for(let j = 0; j < array_generated.length; j++){
            if(array_generated[j] == target_num){
                array_count[j]++;
            }
        }
    }

    return array_count;
}