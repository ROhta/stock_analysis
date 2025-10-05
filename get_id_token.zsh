#!/bin/zsh

# J-Quants APIからリフレッシュトークンを取得する関数
get_jquants_refresh_token() {
    local email="$1"
    local password="$2"
    local url="https://api.jquants.com/v1/token/auth_user"
    
    local response=$(curl -s -X POST "$url" \
        -H "Content-Type: application/json" \
        -d "{\"mailaddress\":\"$email\",\"password\":\"$password\"}")
    
    local refresh_token=$(echo "$response" | jq -r '.refreshToken // empty')
    
    if [[ -n "$refresh_token" ]]; then
        echo "$refresh_token"
        return 0
    else
        echo "Error: リフレッシュトークンの取得に失敗しました" >&2
        echo "Response: $response" >&2
        return 1
    fi
}

# J-Quants APIからIDトークンを取得する関数
get_jquants_id_token() {
    local refresh_token="$1"
    local url="https://api.jquants.com/v1/token/auth_refresh?refreshtoken=${refresh_token}"
    
    local response=$(curl -s -X POST "$url")
    
    local id_token=$(echo "$response" | jq -r '.idToken // empty')
    
    if [[ -n "$id_token" ]]; then
        echo "$id_token"
        return 0
    else
        echo "Error: IDトークンの取得に失敗しました" >&2
        echo "Response: $response" >&2
        return 1
    fi
}

# メイン処理
main() {
    # jqがインストールされているか確認
    if ! command -v jq &> /dev/null; then
        echo "Error: jqがインストールされていません" >&2
        echo "Homebrewでインストールしてください: brew install jq" >&2
        return 1
    fi
    
    local id_token=""
    
    # リフレッシュトークンが環境変数に設定されている場合
    if [[ -n "$JQUANTS_REFRESH_TOKEN" ]]; then
        echo "リフレッシュトークンからIDトークンを取得中..." >&2
        id_token=$(get_jquants_id_token "$JQUANTS_REFRESH_TOKEN")

    # メールアドレスとパスワードが設定されている場合
    elif [[ -n "$JQUANTS_EMAIL" && -n "$JQUANTS_PASSWORD" ]]; then
        echo "メールアドレスとパスワードからリフレッシュトークンを取得中..." >&2
        local refresh_token=$(get_jquants_refresh_token "$JQUANTS_EMAIL" "$JQUANTS_PASSWORD")

        if [[ $? -eq 0 ]]; then
            echo "リフレッシュトークン取得成功" >&2
            # リフレッシュトークンも環境変数に設定
            export JQUANTS_REFRESH_TOKEN="$refresh_token"
            echo "IDトークンを取得中..." >&2
            id_token=$(get_jquants_id_token "$refresh_token")
        else
            echo "Error: リフレッシュトークンの取得に失敗しました" >&2
            return 1
        fi
    else
        echo "Error: 認証情報が設定されていません" >&2
        echo "以下のいずれかの環境変数を設定してください:" >&2
        echo "  - JQUANTS_REFRESH_TOKEN" >&2
        echo "  - JQUANTS_EMAIL と JQUANTS_PASSWORD" >&2
        return 1
    fi
    
    if [[ -n "$id_token" ]]; then
        echo "IDトークンの取得に成功しました" >&2
        # 環境変数として設定（出力はしない）
        export JQUANTS_ID_TOKEN="$id_token"
        return 0
    else
        return 1
    fi
}

# スクリプトを直接実行した場合
if [[ "${(%):-%x}" == "${0}" ]]; then
    main
fi
