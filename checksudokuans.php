<?php
session_start();
$sudoku_matrix = $_POST['sudoku_matrix'];
$sudoku_board_ans = [];
if(isset($_SESSION['sudoku_board_ans'])){
    $sudoku_board_ans = $_SESSION['sudoku_board_ans'];
}

$collect_flg = true;
for($i = 0; $i < count($sudoku_board_ans); $i++){
    for($j = 0; $j < count($sudoku_board_ans[$i]); $j++){
        if(intval($sudoku_board_ans[$i][$j]) != intval($sudoku_matrix[$i][$j * 2])){
            $collect_flg = false;
            break;
        }
    }
}

header("Content-Type: text/javascript; charset=utf-8");
echo json_encode($collect_flg);