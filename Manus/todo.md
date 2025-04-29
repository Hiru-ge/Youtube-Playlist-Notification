# YouTubeプレイリスト更新通知システム構築タスク

- [x] 003: 開発環境のセットアップ
    - [x] プロジェクトディレクトリ作成 (`/home/ubuntu/youtube_line_notifier`)
    - [x] `todo.md` ファイル作成
    - [x] GASコードファイル (`Code.gs`) の雛形作成
    - [x] 設定ファイル (`config.gs`) の雛形作成（APIキー等を格納）
- [x] 004: YouTube API連携実装
    - [x] YouTube Data APIからプレイリスト情報を取得する関数 (`getPlaylistInfo`) 作成
    - [x] プレイリストURLからプレイリストIDを抽出するヘルパー関数作成
- [x] 005: LINE Messaging API連携実装
    - [x] LINE Messaging APIへ通知を送信する関数 (`sendLineNotification`) 作成
- [x] 006: スプレッドシート管理システム作成
    - [x] スプレッドシートからプレイリスト情報を読み込む関数 (`getPlaylistsFromSheet`) 作成
    - [x] スプレッドシートの動画数を更新する関数 (`updateVideoCountInSheet`) 作成
- [x] 007: 通知ロジック実装
    - [x] メイン処理関数 (`checkPlaylists`) 作成
    - [x] 動画数比較と通知実行のロジック実装
- [x] 008: トリガー設定手順作成
    - [x] GASの時間主導型トリガー設定方法をドキュメント化
- [x] 009: テストとデバッグ手順作成
    - [x] テストケースとデバッグ方法をドキュメント化
- [x] 010: ドキュメント作成と納品
    - [x] README.md に設定手順、コード説明、運用方法を記述
    - [x] コードファイル (`Code.gs`, `config.gs`) とドキュメント (`README.md`) を納品

