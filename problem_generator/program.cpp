#include <iostream>
#include <array>
#include <vector>
#include <math.h>
#include <time.h>
#include <algorithm>

using namespace std;
//盤面の縦横の数（どちらも9）
const int BOARD_SIZE = 9;

//数字が盤面の添え字に該当するか調べる（0から8であるかどうか）
bool isBoardIndex(int num_index){
    if(num_index >= 0 && num_index < BOARD_SIZE){
        return true;
    }
    else{
        return false;
    }
}

//配列をランダムにシャッフルする
vector<int> shuffleArrayRandom(vector<int> arr){
    for(int i = arr.size() - 1; i > 0; i--){
        int j = rand() % (i + 1);
        int temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }

    return arr;
}

//1から9の数字のランダムな配列を生成する
vector<int> generateRandomArray1to9(){
    vector<int> arr_result;
    for(int i = 0; i < BOARD_SIZE; i++){
        arr_result.push_back(i + 1);
    }

    return shuffleArrayRandom(arr_result);
}

//指定した行に存在する数値の配列を生成
vector<int> generateTargetHorNumArray(vector<vector<int>>& sudoku_board, int hor_index){
    if(isBoardIndex(hor_index)){
        vector<int> array_hor;
        for(int i = 0; i < BOARD_SIZE; i++){
            int target_num = sudoku_board[hor_index][i];
            if(target_num == 0) break;
            else array_hor.push_back(target_num);
        }

        return array_hor;
    }
    //条件を満たさない場合、空の配列を返す
    return vector<int>();
}

//指定した列に存在する数値の配列を生成
vector<int> generateTargetVerNumArray(vector<vector<int>>& sudoku_board, int ver_index){
    if(isBoardIndex(ver_index)){
        vector<int> array_ver;
        for(int i = 0; i < BOARD_SIZE; i++){
            int target_num = sudoku_board[i][ver_index];
            if(target_num == 0) break;
            else array_ver.push_back(target_num);
        }

        return array_ver;
    }
    //条件を満たさない場合、空の配列を返す
    return vector<int>();
}

//指定した行列に該当するブロック内の数値の配列を生成
vector<int> generateTargetBlockNumArray(vector<vector<int>>& sudoku_board, int hor_index, int ver_index){
    if(isBoardIndex(hor_index) && isBoardIndex(ver_index)){
        vector<int> array_box;
        for(int i = 0; i < BOARD_SIZE; i++){
            int hor_loc = (hor_index / 3) * 3 + (i / 3);
            int ver_loc = (ver_index / 3) * 3 + (i % 3);
            int target_num = sudoku_board[hor_loc][ver_loc];
            if(target_num == 0) break;
            else array_box.push_back(target_num);
        }

        return array_box;
    }
    //条件を満たさない場合、空の配列を返す
    return vector<int>();
}

//指定した行列に埋められる数値の候補を計算する
vector<int> generateTargetCoordCandidate(vector<vector<int>>& sudoku_board, int hor_index, int ver_index){
    if(isBoardIndex(hor_index) && isBoardIndex(ver_index)){
        //削除する数値の配列
        vector<int> array_delete;
        //埋められる候補の数値の配列（初期値は1～9のランダム配列）
        vector<int> array_candidate = generateRandomArray1to9();
        //行、列、3×3の範囲を調べてそれぞれについて配列を生成
        vector<int> array_hor = generateTargetHorNumArray(sudoku_board, hor_index);
        vector<int> array_ver = generateTargetVerNumArray(sudoku_board, ver_index);
        vector<int> array_box = generateTargetBlockNumArray(sudoku_board, hor_index, ver_index);
        //上3つの配列を削除候補として追加
        copy(array_hor.begin(), array_hor.end(), back_inserter(array_delete));
        copy(array_ver.begin(), array_ver.end(), back_inserter(array_delete));
        copy(array_box.begin(), array_box.end(), back_inserter(array_delete));
        //重複を削除する
        sort(array_delete.begin(), array_delete.end());
        array_delete.erase(unique(array_delete.begin(), array_delete.end()), array_delete.end());
        //array_deleteに含まれる数値をarray_candidateから削除することで候補を計算
        for(int i = 0; i < array_delete.size(); i++){
            array_candidate.erase(remove(array_candidate.begin(), array_candidate.end(), array_delete[i]), array_candidate.end());
        }

        return array_candidate;
    }
    //条件を満たさない場合、空の配列を返す
    return vector<int>();
}

//数値を埋めて数独の盤面を生成するための再帰関数
bool generateSudokuNumRecursive(vector<vector<int>>& sudoku_board, int hor_index, int ver_index){
    //該当する行、列、3×3の範囲を調べて埋められる数値の候補を出す
    vector<int> array_candidate = generateTargetCoordCandidate(sudoku_board, hor_index, ver_index);
    //盤面が完成したかどうかのフラグ
    bool flg_found = false;
    //候補が存在する場合for文を実行
    for(int i = 0; i < array_candidate.size(); i++){
        //候補となる数値を指定された座標に埋める
        sudoku_board[hor_index][ver_index] = array_candidate[i];
        //次の座標に移動し再帰処理を行う
        //右下まで到達した場合、再帰処理を終了
        if(hor_index >= BOARD_SIZE - 1 && ver_index >= BOARD_SIZE - 1){
            return true;
        }
        //右端まで到達した場合
        else if(ver_index >= BOARD_SIZE - 1){
            //一段下の左端へ移動
            flg_found = generateSudokuNumRecursive(sudoku_board, hor_index + 1, 0);
        }
        //それ以外の場合
        else{
            //一つ右に移動
            flg_found = generateSudokuNumRecursive(sudoku_board, hor_index, ver_index + 1);
        }
        //盤面が完成していたら終了
        if(flg_found) return true;
        //埋めた数値をゼロに戻す
        sudoku_board[hor_index][ver_index] = 0;
    }

    return false;
}

//ランダム配列のランダム性テスト
void testRandomArrayNumCount(int try_num, int target_num){
    //少なくとも試行回数は一回以上
    if(try_num <= 0){
        cout << "try_num must be 1 or more" << endl;
        return;
    }
    //対象の数字は1から9
    if(target_num <= 0 || target_num > 9){
        cout << "target_num must be between 1 to 9" << endl;
        return;
    }

    vector<int> arr_sum;
    arr_sum.assign(BOARD_SIZE, 0);
    for(int i = 0; i < try_num; i++){
        vector<int> arr_rand = generateRandomArray1to9();
        for(int j = 0; j < arr_rand.size(); j++){
            if(arr_rand[j] == target_num) arr_sum[j]++;
        }
    }
    for(int i = 0; i < arr_sum.size(); i++){
        cout << i + 1 << ":" << arr_sum[i] << endl;
    }
}

int main(){
    //疑似乱数ののシード値を設定
    srand((unsigned int)time(NULL));
    //盤面の定義
    vector<vector<int>> sudoku_board_ans;
    sudoku_board_ans.assign(BOARD_SIZE, vector<int>(BOARD_SIZE, 0));
    //盤面のベースの生成
    //最上段横1列をランダム配列に基づいて埋めて確定する
    vector<int> array_rand = generateRandomArray1to9();
    for(int i = 0; i < BOARD_SIZE; i++){
        sudoku_board_ans[0][i] = array_rand[i];
    }
    generateSudokuNumRecursive(sudoku_board_ans, 1, 0);

    //盤面の表示
    for(int i = 0; i < BOARD_SIZE; i++){
        for(int j = 0; j < BOARD_SIZE; j++){
            cout << sudoku_board_ans[i][j] << " ";
        }
        cout << endl;
    }

    return 0;
}