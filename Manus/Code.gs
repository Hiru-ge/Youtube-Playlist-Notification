// メインの処理を記述するファイル

// スクリプトプロパティから設定を読み込む
const CONFIG = {
  YOUTUBE_API_KEY: PropertiesService.getScriptProperties().getProperty("YOUTUBE_API_KEY"),
  LINE_ACCESS_TOKEN: PropertiesService.getScriptProperties().getProperty("LINE_ACCESS_TOKEN"),
  LINE_USER_ID: PropertiesService.getScriptProperties().getProperty("LINE_USER_ID"),
  SPREADSHEET_ID: PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID"),
  SHEET_NAME: PropertiesService.getScriptProperties().getProperty("SHEET_NAME") || "シート1" // デフォルトシート名
};

/**
 * メイン関数：定期実行トリガーから呼び出される
 */
function checkPlaylists() {
  Logger.log("プレイリストチェック処理を開始します。");
  const playlists = getPlaylistsFromSheet();

  if (playlists.length === 0) {
    Logger.log("監視対象のプレイリストがスプレッドシートに見つかりませんでした。");
    return;
  }

  playlists.forEach(playlist => {
    Logger.log(`処理中のプレイリスト: ${playlist.name} (Row: ${playlist.row})`);
    const playlistId = extractPlaylistIdFromUrl(playlist.url);
    if (!playlistId) {
      Logger.log(`プレイリストIDの抽出に失敗しました。URL: ${playlist.url}`);
      return; // 次のプレイリストへ
    }

    const currentInfo = getPlaylistInfo(playlistId);
    if (!currentInfo) {
      Logger.log(`YouTube APIから情報を取得できませんでした。PlaylistID: ${playlistId}`);
      return; // 次のプレイリストへ
    }

    const currentVideoCount = currentInfo.videoCount;
    const previousVideoCount = playlist.count;
    const playlistTitle = currentInfo.title || playlist.name; // APIからタイトル取れなければシートの名前を使う

    Logger.log(` - 以前の動画数: ${previousVideoCount}, 現在の動画数: ${currentVideoCount}`);

    // 動画数が増加した場合のみ通知
    if (currentVideoCount > previousVideoCount) {
      Logger.log(`   -> 動画数が増加しました。LINE通知を送信します。`);
      const message = `YouTubeプレイリストに新しい動画が追加されました！\n` +
                      `\n` +
                      `プレイリスト名: ${playlistTitle}\n` +
                      `URL: ${playlist.url}\n` +
                      `\n` +
                      `以前の動画数: ${previousVideoCount}\n` +
                      `現在の動画数: ${currentVideoCount}`;
      
      sendLineNotification(message);
      updateVideoCountInSheet(playlist.row, currentVideoCount);

    } else if (currentVideoCount < previousVideoCount) {
       Logger.log(`   -> 動画数が減少しました。スプレッドシートの値を更新します。`);
       // 動画数が減った場合も、シートの値を最新に更新する
       updateVideoCountInSheet(playlist.row, currentVideoCount);
    } else {
      Logger.log(`   -> 動画数に変更はありませんでした。`);
    }
    
    // API負荷軽減のため少し待機 (必要に応じて調整)
    Utilities.sleep(1000); // 1秒待機

  });

  Logger.log("プレイリストチェック処理が完了しました。");
}

/**
 * YouTube Data APIを使用してプレイリスト情報を取得する関数
 * @param {string} playlistId プレイリストID
 * @return {object | null} プレイリスト情報（動画数、タイトル）を含むオブジェクト、またはエラー時にnull
 */
function getPlaylistInfo(playlistId) {
  if (!CONFIG.YOUTUBE_API_KEY) {
    Logger.log("YouTube APIキーが設定されていません。スクリプトプロパティを確認してください。");
    return null;
  }
  if (!playlistId) {
    Logger.log("プレイリストIDが指定されていません。");
    return null;
  }

  const apiUrl = `https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&id=${playlistId}&key=${CONFIG.YOUTUBE_API_KEY}`;
  
  try {
    const response = UrlFetchApp.fetch(apiUrl, {
      "muteHttpExceptions": true // エラー時にもレスポンスを取得するため
    });
    const jsonResponse = JSON.parse(response.getContentText());

    if (response.getResponseCode() !== 200 || !jsonResponse.items || jsonResponse.items.length === 0) {
      Logger.log(`YouTube APIからのプレイリスト情報取得に失敗しました。PlaylistID: ${playlistId}, Status: ${response.getResponseCode()}, Response: ${response.getContentText()}`);
      return null;
    }

    const playlistData = jsonResponse.items[0];
    const videoCount = playlistData.contentDetails.itemCount;
    const title = playlistData.snippet.title;
    
    Logger.log(`プレイリスト情報取得成功: ${title} (ID: ${playlistId}), 動画数: ${videoCount}`);
    return {
      videoCount: videoCount,
      title: title
    };

  } catch (e) {
    Logger.log(`YouTube API呼び出し中にエラーが発生しました。PlaylistID: ${playlistId}, Error: ${e}`);
    return null;
  }
}

/**
 * LINE Messaging APIを使用して通知を送信する関数
 * @param {string} message 送信するメッセージ
 */
function sendLineNotification(message) {
  if (!CONFIG.LINE_ACCESS_TOKEN || !CONFIG.LINE_USER_ID) {
    Logger.log("LINEのアクセストークンまたはユーザーIDが設定されていません。スクリプトプロパティを確認してください。");
    return;
  }

  const lineApiUrl = "https://api.line.me/v2/bot/message/push";
  const headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer " + CONFIG.LINE_ACCESS_TOKEN
  };

  const payload = JSON.stringify({
    "to": CONFIG.LINE_USER_ID,
    "messages": [
      {
        "type": "text",
        "text": message
      }
    ]
  });

  const options = {
    "method": "post",
    "headers": headers,
    "payload": payload,
    "muteHttpExceptions": true // エラー時にもレスポンスを取得するため
  };

  try {
    const response = UrlFetchApp.fetch(lineApiUrl, options);
    const responseCode = response.getResponseCode();
    const responseBody = response.getContentText();

    if (responseCode === 200) {
      Logger.log("LINE通知の送信に成功しました。");
    } else {
      Logger.log(`LINE通知の送信に失敗しました。Status: ${responseCode}, Response: ${responseBody}`);
    }
  } catch (e) {
    Logger.log(`LINE API呼び出し中にエラーが発生しました。Error: ${e}`);
  }
}

/**
 * スプレッドシートからプレイリスト情報を読み込む関数
 * @return {Array<object>} プレイリスト情報の配列 [{name: string, url: string, count: number, row: number}]
 */
function getPlaylistsFromSheet() {
  if (!CONFIG.SPREADSHEET_ID) {
    Logger.log("スプレッドシートIDが設定されていません。スクリプトプロパティを確認してください。");
    return [];
  }
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
    if (!sheet) {
      Logger.log(`シートが見つかりません: ${CONFIG.SHEET_NAME}`);
      return [];
    }
    // ヘッダー行を除き、2行目から最終行まで取得 (A列からC列)
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) {
       Logger.log("スプレッドシートにデータがありません（ヘッダー行を除く）。");
       return [];
    }
    const dataRange = sheet.getRange(2, 1, lastRow - 1, 3);
    const values = dataRange.getValues();
    
    const playlists = [];
    values.forEach((row, index) => {
      const playlistName = row[0];
      const playlistUrl = row[1];
      const videoCount = parseInt(row[2], 10); // C列は数値として解釈
      const rowIndex = index + 2; // スプレッドシートの行番号 (1-based、ヘッダー除く)

      // プレイリスト名とURLが両方存在する場合のみ処理
      if (playlistName && playlistUrl) {
        playlists.push({
          name: playlistName,
          url: playlistUrl,
          count: isNaN(videoCount) ? 0 : videoCount, // 数値でない場合は0をセット
          row: rowIndex
        });
      } else {
         Logger.log(`${rowIndex}行目: プレイリスト名またはURLが空のためスキップします。`);
      }
    });
    Logger.log(`${playlists.length}件のプレイリスト情報をスプレッドシートから読み込みました。`);
    return playlists;
  } catch (e) {
    Logger.log(`スプレッドシートからのデータ読み込み中にエラーが発生しました。Error: ${e}`);
    return [];
  }
}

/**
 * スプレッドシートの動画数を更新する関数
 * @param {number} rowIndex 更新対象の行番号 (1-based)
 * @param {number} newCount 新しい動画数
 */
function updateVideoCountInSheet(rowIndex, newCount) {
  if (!CONFIG.SPREADSHEET_ID) {
    Logger.log("スプレッドシートIDが設定されていません。スクリプトプロパティを確認してください。");
    return;
  }
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
     if (!sheet) {
      Logger.log(`シートが見つかりません: ${CONFIG.SHEET_NAME}`);
      return;
    }
    // C列の指定された行に新しい動画数を書き込む
    sheet.getRange(rowIndex, 3).setValue(newCount);
    Logger.log(`${rowIndex}行目の動画数を ${newCount} に更新しました。`);
  } catch (e) {
    Logger.log(`スプレッドシートの動画数更新中にエラーが発生しました。Row: ${rowIndex}, Error: ${e}`);
  }
}

/**
 * プレイリストURLからプレイリストIDを抽出するヘルパー関数
 * @param {string} url プレイリストURL
 * @return {string | null} プレイリストID、または抽出失敗時にnull
 */
function extractPlaylistIdFromUrl(url) {
  if (!url) return null;
  try {
    // URLオブジェクトが使えない場合があるため、より堅牢な正規表現を使用
    const regex = /[?&]list=([^&]+)/;
    const match = url.match(regex);
    if (match && match[1]) {
      return match[1];
    } else {
      // URL自体がプレイリストIDの場合（共有リンクなど）
      if (url.includes("youtube.com/playlist?list=")) {
         const parts = url.split("list=");
         if (parts.length > 1) return parts[1].split("&")[0];
      }
      Logger.log("URLからプレイリストIDを抽出できませんでした: " + url);
      return null;
    }
  } catch (e) {
    Logger.log("プレイリストIDの抽出中にエラーが発生しました: " + url + ", Error: " + e);
    return null;
  }
}

// --- 設定読み込み --- 
// スクリプトプロパティから読み込むように修正 (ファイルの先頭に移動)

