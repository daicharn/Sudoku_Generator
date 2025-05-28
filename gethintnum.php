<?php
session_start();
$selected_matrix = $_POST['selected_matrix'];
$sudoku_board_ans = [];
if(isset($_SESSION['sudoku_board_ans'])){
    $sudoku_board_ans = $_SESSION['sudoku_board_ans'];
}

echo json_encode($sudoku_board_ans[$selected_matrix[0]][$selected_matrix[2]]);