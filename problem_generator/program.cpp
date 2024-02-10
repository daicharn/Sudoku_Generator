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
            if(target_num == 0) continue;
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
            if(target_num == 0) continue;
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
            if(target_num == 0) continue;
            else array_box.push_back(target_num);
        }

        return array_box;
    }
    //条件を満たさない場合、空の配列を返す
    return vector<int>();
}

//指定した行列に埋められる数値の候補を縦、横、3×3のみを基準に計算する
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

//指定された行列に埋められる候補を計算、できるだけ候補を一つに絞るように解析を行う（ソルバー）
vector<int> analyseAndSolveTargetCoordCandidate(vector<vector<int>>& sudoku_board, int hor_index, int ver_index){
    //解析結果の配列
    vector<int> analyse_result;
    //最初は行、列、3×3から候補を計算
    vector<int> candidate_basic = generateTargetCoordCandidate(sudoku_board, hor_index, ver_index);
    copy(candidate_basic.begin(), candidate_basic.end(), back_inserter(analyse_result));

    return analyse_result;
}

//数独の盤面が解け、かつ解が一意になっているかどうか調べる
bool hasSudokuBoardUniqueSolution(vector<vector<int>> sudoku_board){
    //解けるか解けなくなるまで繰り返し候補を埋めていく
    while(true){
        //穴がある箇所の配列
        vector<int> array_hole;
        //解くことができないことを示すフラグ
        bool flg_impossible = true;
        //盤面から穴の箇所を生成
        for(int i = 0; i < BOARD_SIZE; i++){
            for(int j = 0; j < BOARD_SIZE; j++){
                //0であれば穴として数値に変換して追加
                if(sudoku_board[i][j] == 0) array_hole.push_back(i * BOARD_SIZE + j);
            }
        }
        //穴を順に調べていく
        for(int i = 0; i < array_hole.size(); i++){
            int hor_index = array_hole[i] / BOARD_SIZE;
            int ver_index = array_hole[i] % BOARD_SIZE;
            //穴に埋められる候補を計算
            vector<int> array_candidate = analyseAndSolveTargetCoordCandidate(sudoku_board, hor_index, ver_index);
            //候補が1個であればまだ解けるとみなし、穴を埋める
            if(array_candidate.size() == 1){
                flg_impossible = false;
                sudoku_board[hor_index][ver_index] = array_candidate[0];
            }
        }

        //解けていればtrueを返す
        if(array_hole.size() == 0) return true;
        //解けなければfalseを返す
        if(flg_impossible) return false;
    }
}

//盤面に穴をあけていく処理
bool generateHoleOnBoardRecursive(vector<vector<int>>& sudoku_board, int empty_num){
    //穴をあける箇所の候補
    vector<int> array_candidate;
    //盤面から候補を生成
    for(int i = 0; i < BOARD_SIZE; i++){
        for(int j = 0; j < BOARD_SIZE; j++){
            //0は空白なのでそれ以外であれば候補として数値に変換して追加
            if(sudoku_board[i][j] != 0) array_candidate.push_back(i * BOARD_SIZE + j);
        }
    }
    //候補をランダムにシャッフルする
    array_candidate = shuffleArrayRandom(array_candidate);
    //穴を開け終わったかどうかのフラグ
    bool flg_success = false;
    //候補が存在する場合for文を実行
    for(int i = 0; i < array_candidate.size(); i++){
        //目標の数まで穴をあけ終えたら再帰処理を終了
        if(empty_num <= 0) return true;
        int hor_index = array_candidate[i] / BOARD_SIZE;
        int ver_index = array_candidate[i] % BOARD_SIZE;
        //穴を開ける処理（開ける前の数値は記憶しておく）
        int temp = sudoku_board[hor_index][ver_index];
        sudoku_board[hor_index][ver_index] = 0;
        //解が一つであると同時に解くことができる問題かどうか調べる
        if(hasSudokuBoardUniqueSolution(sudoku_board)){
            //目標の数まで穴をあける再帰処理を実行
            flg_success = generateHoleOnBoardRecursive(sudoku_board, empty_num - 1);
        }
        //穴を開け終わっていたら終了
        if(flg_success) return true;
        //開けた数値を元の数値に戻す
        sudoku_board[hor_index][ver_index] = temp;
    }

    return false;
}

//盤面を出力する関数
void outputSudokuBoard(vector<vector<int>> sudoku_board){
    for(int i = 0; i < BOARD_SIZE; i++){
        string str;
        for(int k = 0; k < BOARD_SIZE + 4; k++) str += "* ";
        if(i % 3 == 0) cout << str << endl;
        for(int j = 0; j < BOARD_SIZE; j++){
            if(j % 3 == 0) cout << "* ";
            cout << sudoku_board[i][j] << " ";
            if(j == BOARD_SIZE - 1) cout << "*";
        }
        cout << endl;
        if(i == BOARD_SIZE - 1) cout << str << endl;
    }
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
    //解答用の盤面の定義
    vector<vector<int>> sudoku_board_ans;
    sudoku_board_ans.assign(BOARD_SIZE, vector<int>(BOARD_SIZE, 0));
    //盤面のベースの生成
    //最上段横1列をランダム配列に基づいて埋めて確定する
    vector<int> array_rand = generateRandomArray1to9();
    for(int i = 0; i < BOARD_SIZE; i++){
        sudoku_board_ans[0][i] = array_rand[i];
    }
    //2列目以降の盤面を生成
    generateSudokuNumRecursive(sudoku_board_ans, 1, 0);
    //問題用の盤面の定義
    vector<vector<int>> sudoku_board_prob = sudoku_board_ans;
    //穴をあける処理
    generateHoleOnBoardRecursive(sudoku_board_prob, 50);

    //解答を出力
    outputSudokuBoard(sudoku_board_ans);
    //問題を出力
    outputSudokuBoard(sudoku_board_prob);

    return 0;
}