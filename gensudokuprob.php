<?php
session_start();
session_unset();
define("BOARD_SIZE", 9);
define("HINT_NUM", 3);
//ヒントの使用可能回数を決定
$_SESSION['hint_num_max'] = HINT_NUM;
$_SESSION['hint_num'] = HINT_NUM;

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

//数独の盤面が解け、かつ解が一意になっているかどうか調べる
function hasSudokuBoardUniqueSolution($sudoku_board){
    //解けるか解けなくなるまで繰り返し候補を埋めていく
    while(true){
        //穴がある箇所の配列
        $array_hole = [];
        //解くことができないことを示すフラグ
        $flg_impossible = true;
        //盤面から穴の箇所を生成
        for($i = 0; $i < BOARD_SIZE; $i++){
            for($j = 0; $j < BOARD_SIZE; $j++){
                //0であれば穴として数値に変換して追加
                if($sudoku_board[$i][$j] == 0) array_push($array_hole, $i * BOARD_SIZE + $j);
            }
        }
        //穴を順に調べていく
        for($i = 0; $i < count($array_hole); $i++){
            $hor_index = intdiv($array_hole[$i], BOARD_SIZE);
            $ver_index = $array_hole[$i] % BOARD_SIZE;
            //穴に埋められる候補を計算
            $array_candidate = generateTargetCoordCandidate($sudoku_board, $hor_index, $ver_index);
            //候補が1個であればまだ解けるとみなし、穴を埋める
            if(count($array_candidate) == 1){
                $flg_impossible = false;
                $sudoku_board[$hor_index][$ver_index] = $array_candidate[0];
            }
        }

        //解けていればtrueを返す
        if(count($array_hole) == 0) return true;
        //解けなければfalseを返す
        if($flg_impossible) return false;
    }
}

//盤面に穴をあけていく処理
function generateHoleOnBoardRecursive(&$sudoku_board, int $empty_num){
    //穴をあける箇所の候補
    $array_candidate = [];
    //盤面から候補を生成
    for($i = 0; $i < BOARD_SIZE; $i++){
        for($j = 0; $j < BOARD_SIZE; $j++){
             //0は空白なのでそれ以外であれば候補として数値に変換して追加
             if($sudoku_board[$i][$j] != 0) array_push($array_candidate, $i * BOARD_SIZE + $j);
        }
    }
    //候補をランダムにシャッフルする
    $array_candidate = shuffleArrayRandom($array_candidate);
    //穴を開け終わったかどうかのフラグ
    $flg_success = false;
    //候補が存在する場合for文を実行
    for($i = 0; $i < count($array_candidate); $i++){
        //目標の数まで穴をあけ終えたら再帰処理を終了
        if($empty_num <= 0) return true;
        $hor_index = intdiv($array_candidate[$i], BOARD_SIZE);
        $ver_index = $array_candidate[$i] % BOARD_SIZE;
        //穴を開ける処理（開ける前の数値は記憶しておく）
        $temp = $sudoku_board[$hor_index][$ver_index];
        $sudoku_board[$hor_index][$ver_index] = 0;
        //解が一つであると同時に解くことができる問題かどうか調べる
        if(hasSudokuBoardUniqueSolution($sudoku_board)){
            //目標の数まで穴をあける再帰処理を実行
            $flg_success = generateHoleOnBoardRecursive($sudoku_board, $empty_num - 1);
        }
        //穴を開け終わっていたら終了
        if($flg_success) return true;
        //開けた数値を元の数値に戻す
        $sudoku_board[$hor_index][$ver_index] = $temp;
    }

    return false;
}

//数独の盤面（問題）を生成する関数
function generateSudokuBoardProb($sudoku_board_ans, int $empty_num){
    //穴をあける処理
    generateHoleOnBoardRecursive($sudoku_board_ans, $empty_num);

    return $sudoku_board_ans;
}

//一連の数独生成、保存処理
function generateSudoku(int $empty_num){
    //解答用の盤面の定義
    $sudoku_board_ans = generateSudokuBoardAns();
    $_SESSION['sudoku_board_ans'] = $sudoku_board_ans;
    //問題用の盤面の定義
    $sudoku_board_prob = generateSudokuBoardProb($sudoku_board_ans, $empty_num);
    //Javascript側にデータを送信
    header("Content-Type: text/javascript; charset=utf-8");
    echo json_encode(['sudoku' => $sudoku_board_prob,
                      'hint_num_max' => $_SESSION['hint_num_max'],
                      'hint_num' => $_SESSION['hint_num']]);
}

$hole_num = $_POST['hole_num'];
if($hole_num >= 0 && $hole_num <= 50){
    generateSudoku($_POST['hole_num']);
}