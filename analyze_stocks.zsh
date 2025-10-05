#!/bin/zsh

# J-Quants APIを使用して株価を分析するスクリプト

# 引数チェック
if [[ $# -ne 1 ]]; then
    echo "Error: CSVファイルのパスを引数に指定してください" >&2
    echo "使用方法: $0 <csvファイルのパス>" >&2
    exit 1
fi

CSV_FILE="$1"

# CSVファイルの存在確認
if [[ ! -f "$CSV_FILE" ]]; then
    echo "Error: CSVファイルが見つかりません: $CSV_FILE" >&2
    exit 1
fi

# jqのインストール確認
if ! command -v jq &> /dev/null; then
    echo "Error: jqがインストールされていません" >&2
    echo "Homebrewでインストールしてください: brew install jq" >&2
    exit 1
fi

# 1. 環境変数JQUANTS_ID_TOKENの取得
if [[ -z "$JQUANTS_ID_TOKEN" ]]; then
    echo "Error: 環境変数JQUANTS_ID_TOKENが設定されていません" >&2
    echo "get_id_token.zshを実行して、IDトークンを取得してください" >&2
    exit 1
fi

# 2. CSVヘッダーの確認
REQUIRED_HEADERS=("証券コード" "銘柄名" "市場区分" "権利付最終日")
HEADER=$(head -n 1 "$CSV_FILE")

for required in "${REQUIRED_HEADERS[@]}"; do
    if [[ ! "$HEADER" =~ "$required" ]]; then
        echo "Error: CSVファイルに必須カラム「$required」が含まれていません" >&2
        exit 1
    fi
done

# 日付フォーマット変換関数（YYYY/MM/DD -> YYYYMMDD）
convert_date_format() {
    local date_str="$1"
    # スラッシュで分割して年月日を取得
    local year=$(echo "$date_str" | cut -d'/' -f1)
    local month=$(echo "$date_str" | cut -d'/' -f2 | awk '{printf "%02d", $1}')
    local day=$(echo "$date_str" | cut -d'/' -f3 | awk '{printf "%02d", $1}')
    echo "${year}${month}${day}"
}

# 日付加算関数（YYYYMMDD + N日 -> YYYYMMDD）
add_days() {
    local date="$1"
    local days="$2"
    local year="${date:0:4}"
    local month="${date:4:2}"
    local day="${date:6:2}"

    # dateコマンドを使用（macOS対応）
    date -j -f "%Y%m%d" -v+${days}d "$date" +"%Y%m%d" 2>/dev/null || \
    date -d "$year-$month-$day $days days" +"%Y%m%d" 2>/dev/null
}

# J-Quants APIコール関数（レート制限チェック付き）
call_jquants_api() {
    local url="$1"
    local temp_file=$(mktemp)
    local http_code=$(curl -s -o "$temp_file" -w "%{http_code}" -H "Authorization: Bearer $JQUANTS_ID_TOKEN" "$url")
    local body=$(cat "$temp_file")
    rm -f "$temp_file"

    # HTTPステータスコードチェック
    if [[ "$http_code" == "429" ]]; then
        echo "Error: レート制限に達しました" >&2
        echo "APIレスポンス: $body" >&2
        exit 1
    elif [[ "$http_code" != "200" ]]; then
        echo "Error: APIリクエストが失敗しました (HTTPステータス: $http_code)" >&2
        echo "URL: $url" >&2
        echo "APIレスポンス: $body" >&2
        exit 1
    fi

    # エラーメッセージの確認
    if echo "$body" | jq -e '.error' > /dev/null 2>&1; then
        echo "Error: APIがエラーを返しました" >&2
        echo "APIレスポンス: $body" >&2
        exit 1
    fi

    echo "$body"
}

# 結果格納用配列
typeset -a results

# 3. CSVファイルを1行ずつ処理（ヘッダー行をスキップ）
tail -n +2 "$CSV_FILE" | while IFS=',' read -r code name market ex_date; do
    # 改行コードや余分な空白を削除
    code=$(echo "$code" | tr -d '\r\n' | xargs)
    name=$(echo "$name" | tr -d '\r\n' | xargs)
    market=$(echo "$market" | tr -d '\r\n' | xargs)
    ex_date=$(echo "$ex_date" | tr -d '\r\n' | xargs)

    # 市場区分のチェック（プライムまたはスタンダードのみ）
    if [[ "$market" != "プライム" && "$market" != "スタンダード" ]]; then
        continue
    fi

    echo "処理中: $code ($name) - $market - 権利付最終日: $ex_date" >&2

    # 日付フォーマット変換
    ex_date_api=$(convert_date_format "$ex_date")

    # 4. 権利付最終日の株価を取得
    ex_day_response=$(call_jquants_api "https://api.jquants.com/v1/prices/daily_quotes?code=$code&date=$ex_date_api")

    # レスポンスから終値を取得
    ex_day_close=$(echo "$ex_day_response" | jq -r '.daily_quotes[0].Close // empty')

    if [[ -z "$ex_day_close" ]]; then
        echo "  警告: 権利付最終日($ex_date)の株価データが取得できませんでした。スキップします。" >&2
        sleep 0.3
        continue
    fi

    echo "  権利付最終日の終値: $ex_day_close" >&2

    # 5. 権利確定日（翌日）から余裕を持って20日分のデータを取得
    ex_rights_date=$(add_days "$ex_date_api" 1)
    end_date=$(add_days "$ex_date_api" 21)

    # 期間の株価データを取得
    period_response=$(call_jquants_api "https://api.jquants.com/v1/prices/daily_quotes?code=$code&from=$ex_rights_date&to=$end_date")

    # 営業日のデータを取得し、最初の10営業日の最安値を計算
    min_close=$(echo "$period_response" | jq -r '[.daily_quotes[0:10][].Close] | min')

    if [[ -z "$min_close" || "$min_close" == "null" ]]; then
        echo "  警告: 権利確定日以降の株価データが取得できませんでした。スキップします。" >&2
        sleep 0.3
        continue
    fi

    echo "  10営業日間の最安値: $min_close" >&2

    # 6. 最安値が権利付最終日の株価の95%未満かチェック
    threshold=$(echo "$ex_day_close * 0.95" | bc)

    if (( $(echo "$min_close < $threshold" | bc -l) )); then
        echo "  ✓ 条件該当: 最安値($min_close) < 95%閾値($threshold)" >&2
        echo "$code,$name"
    else
        echo "  条件非該当: 最安値($min_close) >= 95%閾値($threshold)" >&2
    fi

    # レート制限対策のため少し待機
    sleep 0.3
done

echo "" >&2
echo "=== 分析完了 ===" >&2
