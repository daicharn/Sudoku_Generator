<?php
session_start();
$hint_num = $_SESSION['hint_num'];
$selected_matrix = $_POST['selected_matrix'];
$sudoku_board_ans = [];
if(isset($_SESSION['sudoku_board_ans'])){
    $sudoku_board_ans = $_SESSION['sudoku_board_ans'];
}

if($hint_num > 0){
    echo json_encode($sudoku_board_ans[$selected_matrix[0]][$selected_matrix[2]]);
    $_SESSION['hint_num'] = $hint_num - 1;
}
else{
    echo -1;
}
