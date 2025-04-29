// 設定情報を記述するファイル
// このファイルは使用せず、スクリプトプロパティに設定を保存することを推奨します。
// スクリプトエディタの「プロジェクト設定」>「スクリプト プロパティ」で設定してください。

/*
// スクリプトプロパティに保存するキーの例

PropertiesService.getScriptProperties().setProperty('YOUTUBE_API_KEY', 'ここにYouTube APIキーを入力');
PropertiesService.getScriptProperties().setProperty('LINE_ACCESS_TOKEN', 'ここにLINE Messaging APIのアクセストークンを入力');
PropertiesService.getScriptProperties().setProperty('LINE_USER_ID', 'ここに通知を送りたいLINEユーザーIDまたはグループIDを入力');
PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', 'ここに管理用スプレッドシートのIDを入力');
PropertiesService.getScriptProperties().setProperty('SHEET_NAME', '監視対象のシート名'); // 例: 'プレイリスト一覧'

// Code.gs から設定を読み込むための関数 (Code.gs内に記述済みのものを再掲)
function getConfig() {
  return {
    YOUTUBE_API_KEY: PropertiesService.getScriptProperties().getProperty('YOUTUBE_API_KEY'),
    LINE_ACCESS_TOKEN: PropertiesService.getScriptProperties().getProperty('LINE_ACCESS_TOKEN'),
    LINE_USER_ID: PropertiesService.getScriptProperties().getProperty('LINE_USER_ID'),
    SPREADSHEET_ID: PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID'),
    SHEET_NAME: PropertiesService.getScriptProperties().getProperty('SHEET_NAME') || 'シート1' // デフォルトシート名
  };
}
*/

// 注意: このファイル (config.gs) は実際にはGASプロジェクトに含めず、
// 上記コメントのようにスクリプトプロパティを使用してください。
// このファイルは設定項目をメモしておくための参考用です。

