<?php
define("BOARD_SIZE", 9);

//数字が盤面の添え字に該当するか調べる（0から8であるかどうか）
function isBoardIndex(int $num_index){
    if($num_index >= 0 && $num_index < BOARD_SIZE){
        return true;
    }
    else{
        return false;
    }
}

//配列をランダムにシャッフルする
function shuffleArrayRandom($arr){
    for($i = count($arr) - 1; $i > 0; $i--){
        $j = rand(0, $i);
        $temp = $arr[$i];
        $arr[$i] = $arr[$j];
        $arr[$j] = $temp;
    }

    return $arr;
}

//1から9の数字のランダムな配列を生成する
function generateRandomArray1to9(){
    $arr_result = [];
    for($i = 0; $i < BOARD_SIZE; $i++){
        array_push($arr_result, $i + 1);
    }

    return shuffleArrayRandom($arr_result);
}

//ランダムシャッフルのランダム性チェック用のテスト関数
function testShuffleArray(int $n, int $num){
    $arr_result = array_fill(0, 9, 0);
    for($i = 0; $i < $n; $i++){
        $arr_rand = generateRandomArray1to9();
        for($j = 0; $j < count($arr_rand); $j++){
            if($num == $arr_rand[$j]){
                $arr_result[$j]++;
                break;
            }
        }
    }

    return $arr_result;
}

//指定した行に存在する数値の配列を生成
function generateTargetHorNumArray($sudoku_board, int $hor_index){
    if(isBoardIndex($hor_index)){
        $array_hor = [];
        for($i = 0; $i < BOARD_SIZE; $i++){
            $target_num = $sudoku_board[$hor_index][$i];
            if($target_num == 0) continue;
            else array_push($array_hor, $target_num);
        }

        return $array_hor;
    }

    //条件を満たさない場合、空の配列を返す
    return [];
}

//指定した列に存在する数値の配列を生成
function generateTargetVerNumArray($sudoku_board, int $ver_index){
    if(isBoardIndex($ver_index)){
        $array_ver = [];
        for($i = 0; $i < BOARD_SIZE; $i++){
            $target_num = $sudoku_board[$i][$ver_index];
            if($target_num == 0) continue;
            else array_push($array_ver, $target_num);
        }

        return $array_ver;
    }
    //条件を満たさない場合、空の配列を返す
    return [];
}

//指定した行列に該当するブロック内の数値の配列を生成
function generateTargetBlockNumArray($sudoku_board, int $hor_index, int $ver_index){
    if(isBoardIndex($hor_index) && isBoardIndex($ver_index)){
        $array_box = [];
        for($i = 0; $i < BOARD_SIZE; $i++){
            $hor_loc = intdiv($hor_index, 3) * 3 + intdiv($i, 3);
            $ver_loc = intdiv($ver_index, 3) * 3 + $i % 3;
            $target_num = $sudoku_board[$hor_loc][$ver_loc];
            if($target_num == 0) continue;
            else array_push($array_box, $target_num);
        }
        
        return $array_box;
    }
    //条件を満たさない場合、空の配列を返す
    return [];
}

//指定した行列に埋められる数値の候補を縦、横、3×3のみを基準に計算する
function generateTargetCoordCandidate($sudoku_board, int $hor_index, int $ver_index){
    if(isBoardIndex($hor_index) && isBoardIndex($ver_index)){
        //削除する数値の配列
        $array_delete = [];
        //埋められる候補の数値の配列（初期値は1～9のランダム配列）
        $array_candidate = generateRandomArray1to9();
        //行、列、3×3の範囲を調べてそれぞれについて配列を生成
        $array_hor = generateTargetHorNumArray($sudoku_board, $hor_index);
        $array_ver = generateTargetVerNumArray($sudoku_board, $ver_index);
        $array_box = generateTargetBlockNumArray($sudoku_board, $hor_index, $ver_index);
        //上3つの配列を削除候補として追加
        $array_delete = array_merge($array_delete, $array_hor);
        $array_delete = array_merge($array_delete, $array_ver);
        $array_delete = array_merge($array_delete, $array_box);
        //重複を削除する
        sort($array_delete);
        $array_delete = array_unique($array_delete);
        //array_deleteに含まれる数値をarray_candidateから削除することで候補を計算
        $array_candidate = array_diff($array_candidate, $array_delete);
        //歯抜けになった要素を連番に戻す処理
        $array_candidate = array_merge($array_candidate);

        return $array_candidate;
    }

    //条件を満たさない場合、空の配列を返す
    return [];
}

//数値を埋めて数独の盤面を生成するための再帰関数
function generateSudokuNumRecursive(&$sudoku_board, int $hor_index, int $ver_index){
    //該当する行、列、3×3の範囲を調べて埋められる数値の候補を出す
    $array_candidate = generateTargetCoordCandidate($sudoku_board, $hor_index, $ver_index);
    //盤面が完成したかどうかのフラグ
    $flg_found = false;
    for($i = 0; $i < count($array_candidate); $i++){
        //候補となる数値を指定された座標に埋める
        $sudoku_board[$hor_index][$ver_index] = $array_candidate[$i];
        //次の座標に移動し再帰処理を行う
        //右下まで到達した場合、再帰処理を終了
        if($hor_index >= BOARD_SIZE - 1 && $ver_index >= BOARD_SIZE - 1){
            return true;
        }
        //右端まで到達した場合
        else if($ver_index >= BOARD_SIZE - 1){
            //一段下の左端へ移動
            $flg_found = generateSudokuNumRecursive($sudoku_board, $hor_index + 1, 0);
        }
        //それ以外の場合は一つ右に移動
        else $flg_found = generateSudokuNumRecursive($sudoku_board, $hor_index, $ver_index + 1);
        //盤面が完成していたら終了
        if($flg_found) return true;
        //埋めた数値をゼロに戻す
        $sudoku_board[$hor_index][$ver_index] = 0;
    }

    return false;
}

//数独の盤面（解答）を生成する関数
function generateSudokuBoardAns(){
    //解答用の盤面の定義
    $sudoku_board_ans = array_fill(0, BOARD_SIZE, array_fill(0, BOARD_SIZE, 0));
    //盤面のベースの生成
    //最上段横1列をランダム配列に基づいて埋めて確定する
    $array_rand = generateRandomArray1to9();
    for($i = 0; $i < BOARD_SIZE; $i++){
        $sudoku_board_ans[0][$i] = $array_rand[$i];
    }
    //2列目以降の盤面を生成
    generateSudokuNumRecursive($sudoku_board_ans, 1, 0);

    return $sudoku_board_ans;
}

header("Content-Type: text/javascript; charset=utf-8");
echo json_encode(generateSudokuBoardAns());
