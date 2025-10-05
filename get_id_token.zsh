#!/bin/zsh

# J-Quants APIからリフレッシュトークンを取得する関数
get_jquants_refresh_token() {
    local response=$(curl -s -X POST "https://api.jquants.com/v1/token/auth_user" \
        -H "Content-Type: application/json" \
        -d "{\"mailaddress\":\"$1\",\"password\":\"$2\"}")

    local token=$(echo "$response" | jq -r '.refreshToken // empty')

    if [[ -n "$token" ]]; then
        echo "$token"
    else
        echo "Error: リフレッシュトークンの取得に失敗しました" >&2
        echo "Response: $response" >&2
        return 1
    fi
}

# J-Quants APIからIDトークンを取得する関数
get_jquants_id_token() {
    local response=$(curl -s -X POST "https://api.jquants.com/v1/token/auth_refresh?refreshtoken=$1")
    local token=$(echo "$response" | jq -r '.idToken // empty')

    if [[ -n "$token" ]]; then
        echo "$token"
    else
        echo "Error: IDトークンの取得に失敗しました" >&2
        echo "Response: $response" >&2
        return 1
    fi
}

# メイン処理
main() {
    if ! command -v jq &> /dev/null; then
        echo "Error: jqがインストールされていません" >&2
        echo "Homebrewでインストールしてください: brew install jq" >&2
        return 1
    fi

    local id_token

    if [[ -n "$JQUANTS_REFRESH_TOKEN" ]]; then
        echo "リフレッシュトークンからIDトークンを取得中..." >&2
        id_token=$(get_jquants_id_token "$JQUANTS_REFRESH_TOKEN") || return 1
    elif [[ -n "$JQUANTS_EMAIL" && -n "$JQUANTS_PASSWORD" ]]; then
        echo "メールアドレスとパスワードから認証中..." >&2
        local refresh_token=$(get_jquants_refresh_token "$JQUANTS_EMAIL" "$JQUANTS_PASSWORD") || return 1
        export JQUANTS_REFRESH_TOKEN="$refresh_token"
        id_token=$(get_jquants_id_token "$refresh_token") || return 1
    else
        echo "Error: 認証情報が設定されていません" >&2
        echo "以下のいずれかの環境変数を設定してください:" >&2
        echo "  - JQUANTS_REFRESH_TOKEN" >&2
        echo "  - JQUANTS_EMAIL と JQUANTS_PASSWORD" >&2
        return 1
    fi

    echo "IDトークンの取得に成功しました" >&2
    export JQUANTS_ID_TOKEN="$id_token"
}

# スクリプトを直接実行した場合
if [[ "${(%):-%x}" == "${0}" ]]; then
    main
fi
