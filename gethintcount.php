<?php
session_start();
$hint_num_max = $_SESSION['hint_num_max'];
$hint_num = $_SESSION['hint_num'];

echo json_encode([$hint_num_max, $hint_num]);
