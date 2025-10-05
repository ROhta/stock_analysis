#!/bin/zsh

# 使い方: ./analyze_stocks.zsh input.csv
# 環境変数: JQUANTS_REFRESH_TOKEN または JQUANTS_EMAIL と JQUANTS_PASSWORD が必要

set -e

# 引数チェック
if [[ $# -ne 1 ]]; then
    echo "使い方: $0 <CSVファイル>" >&2
    exit 1
fi

CSV_FILE="$1"

if [[ ! -f "$CSV_FILE" ]]; then
    echo "エラー: ファイル '$CSV_FILE' が見つかりません" >&2
    exit 1
fi

# jqがインストールされているか確認
if ! command -v jq &> /dev/null; then
    echo "エラー: jqがインストールされていません" >&2
    echo "インストール: brew install jq" >&2
    exit 1
fi

# IDトークンの存在確認
if [[ -z "$JQUANTS_ID_TOKEN" ]]; then
    echo "エラー: JQUANTS_ID_TOKEN環境変数が設定されていません" >&2
    echo "" >&2
    echo "以下のコマンドを実行してIDトークンを取得してください:" >&2
    echo "  source ./get_id_token.zsh" >&2
    echo "" >&2
    echo "または、JQUANTS_REFRESH_TOKEN環境変数を設定してから:" >&2
    echo "  JQUANTS_ID_TOKEN=\$(./get_id_token.zsh && echo \$JQUANTS_ID_TOKEN)" >&2
    exit 1
fi

echo "J-Quants APIのIDトークンを確認しました" >&2

# 営業日を取得する関数（土日祝日を除外）
get_trading_days() {
    local start_date="$1"
    local num_days="$2"

    # 日付を YYYY-MM-DD 形式に変換
    local base_date=$(date -j -f "%Y/%m/%d" "$start_date" "+%Y-%m-%d" 2>/dev/null)
    if [[ $? -ne 0 ]]; then
        base_date=$(date -j -f "%Y-%m-%d" "$start_date" "+%Y-%m-%d" 2>/dev/null)
    fi

    local trading_days=()
    local current_date="$base_date"
    local count=0

    # 最大50日まで検索（営業日が見つからない場合の無限ループ防止）
    for i in {1..50}; do
        if [[ $count -ge $num_days ]]; then
            break
        fi

        # 曜日を取得（0=日曜, 6=土曜）
        local day_of_week=$(date -j -f "%Y-%m-%d" "$current_date" "+%w" 2>/dev/null)

        # 土日でない場合は営業日とみなす（祝日は考慮しない簡易版）
        if [[ $day_of_week != "0" && $day_of_week != "6" ]]; then
            trading_days+=("$current_date")
            ((count++))
        fi

        # 次の日へ
        current_date=$(date -j -v+1d -f "%Y-%m-%d" "$current_date" "+%Y-%m-%d" 2>/dev/null)
    done

    echo "${trading_days[@]}"
}

# レート制限エラーをチェックする関数
check_rate_limit_error() {
    local response="$1"

    # レート制限のエラーメッセージをチェック
    if echo "$response" | jq -e '.message' > /dev/null 2>&1; then
        local error_msg=$(echo "$response" | jq -r '.message')
        if [[ "$error_msg" =~ "rate limit" ]] || [[ "$error_msg" =~ "Too Many Requests" ]]; then
            echo "" >&2
            echo "========================================" >&2
            echo "エラー: J-Quants APIのレート制限に達しました" >&2
            echo "しばらく時間をおいてから再度実行してください。" >&2
            echo "========================================" >&2
            exit 1
        fi
    fi

    # HTTPステータスコード429もチェック
    if echo "$response" | grep -qi "429"; then
        echo "" >&2
        echo "========================================" >&2
        echo "エラー: J-Quants APIのレート制限に達しました" >&2
        echo "しばらく時間をおいてから再度実行してください。" >&2
        echo "========================================" >&2
        exit 1
    fi
}

# 株価データを取得する関数
get_stock_price() {
    local code="$1"
    local date="$2"

    # YYYY/MM/DD または YYYY-MM-DD 形式を YYYYMMDD に変換
    local query_date=$(echo "$date" | sed 's/[\/\-]//g')

    # 期間指定のAPIを使用（前後1日含める）
    local date_obj=$(date -j -f "%Y%m%d" "$query_date" "+%Y-%m-%d" 2>/dev/null)
    local from_date=$(date -j -v-1d -f "%Y-%m-%d" "$date_obj" "+%Y%m%d" 2>/dev/null)
    local to_date=$(date -j -v+1d -f "%Y-%m-%d" "$date_obj" "+%Y%m%d" 2>/dev/null)

    local url="https://api.jquants.com/v1/prices/daily_quotes?code=${code}&from=${from_date}&to=${to_date}"

    local response=$(curl -s -X GET "$url" \
        -H "Authorization: Bearer ${JQUANTS_ID_TOKEN}")

    # レート制限エラーをチェック
    check_rate_limit_error "$response"

    # データ取得の確認
    if echo "$response" | jq -e '.daily_quotes' > /dev/null 2>&1; then
        # 指定日付のデータを検索（YYYY-MM-DD形式に変換）
        local search_date=$(echo "$query_date" | sed 's/\(....\)\(..\)\(..\)/\1-\2-\3/')
        local close_price=$(echo "$response" | jq -r ".daily_quotes[] | select(.Date == \"$search_date\") | .Close // empty" | head -1)
        if [[ -n "$close_price" && "$close_price" != "null" ]]; then
            echo "$close_price"
            return 0
        fi
    fi

    # デバッグ用（エラー時のみ）
    # echo "Debug: code=$code, date=$query_date, search_date=$search_date" >&2
    # echo "Debug: from=$from_date, to=$to_date" >&2
    # echo "Debug response: ${response:0:300}..." >&2
    return 1
}

# 10営業日の株価を取得して最安値を見つける関数
get_min_price_in_period() {
    local code="$1"
    local start_date="$2"

    # 開始日から10営業日分の日付を取得
    local trading_days=($(get_trading_days "$start_date" 10))

    local min_price=""
    local prices=()

    echo "  10営業日の株価を取得中..." >&2
    for date in "${trading_days[@]}"; do
        local price=$(get_stock_price "$code" "$date")
        if [[ -n "$price" && "$price" != "0" ]]; then
            prices+=("$price")
            echo "    $date: $price 円" >&2

            if [[ -z "$min_price" ]] || (( $(echo "$price < $min_price" | bc -l) )); then
                min_price="$price"
            fi
        fi
    done

    if [[ ${#prices[@]} -gt 0 ]]; then
        echo "  取得した株価: ${prices[@]}" >&2
        echo "  期間内最安値: $min_price 円" >&2
    fi

    echo "$min_price"
}

echo "========================================" >&2
echo "株価分析を開始します" >&2
echo "========================================" >&2
echo "" >&2

# 結果ファイルの初期化
> /tmp/stock_analysis_results_$$.txt

# CSVを1行ずつ処理（ヘッダー行をスキップ）
while IFS=, read -r code name market ex_date; do
    echo "----------------------------------------" >&2
    echo "銘柄: $name ($code)" >&2
    echo "市場: $market" >&2
    echo "権利付最終日: $ex_date" >&2

    # プライムとスタンダードのみ対象
    if [[ "$market" != "プライム" && "$market" != "スタンダード" ]]; then
        echo "対象外の市場区分です（スキップ）" >&2
        continue
    fi

    # 権利付最終日の株価を取得
    echo "権利付最終日の株価を取得中..." >&2
    local ex_date_price=$(get_stock_price "$code" "$ex_date")

    if [[ -z "$ex_date_price" ]]; then
        echo "エラー: 権利付最終日の株価が取得できませんでした" >&2
        continue
    fi

    echo "権利付最終日の株価: $ex_date_price 円" >&2

    # 10営業日の最安値を取得
    local min_price=$(get_min_price_in_period "$code" "$ex_date")

    if [[ -z "$min_price" ]]; then
        echo "エラー: 10営業日の株価データが取得できませんでした" >&2
        continue
    fi

    # 下落率を計算
    local drop_rate=$(echo "scale=4; ($min_price / $ex_date_price) * 100" | bc)
    echo "最安値/権利付最終日: ${drop_rate}%" >&2

    # 95%未満かチェック
    if (( $(echo "$drop_rate < 95" | bc -l) )); then
        echo "★ 95%未満の銘柄です！" >&2
        # 結果を一時ファイルに保存
        echo "$code|$name|$ex_date_price|$min_price|$drop_rate" >> /tmp/stock_analysis_results_$$.txt
    fi

    echo "" >&2
done < <(tail -n +2 "$CSV_FILE")

echo "========================================" >&2
echo "分析結果" >&2
echo "========================================" >&2
echo "" >&2

if [[ -f /tmp/stock_analysis_results_$$.txt ]]; then
    echo "権利付最終日から10営業日で95%未満まで下落した銘柄:" >&2
    echo "" >&2

    while IFS='|' read -r code name ex_price min_price rate; do
        echo "銘柄コード: $code" >&2
        echo "銘柄名: $name" >&2
        echo "権利付最終日株価: $ex_price 円" >&2
        echo "期間内最安値: $min_price 円" >&2
        echo "最安値率: ${rate}%" >&2
        echo "" >&2
    done < /tmp/stock_analysis_results_$$.txt

    rm -f /tmp/stock_analysis_results_$$.txt
else
    echo "95%未満まで下落した銘柄は見つかりませんでした。" >&2
fi

echo "分析完了" >&2
