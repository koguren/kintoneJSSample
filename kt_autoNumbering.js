/**
 * @author koguren <guresanshop@gmail.com>
 */
(function() {
    "use strict";

    // 管理番号を自動採番します。
    // <仕様>
    // アプリ内の過去レコードから最も大きな採番値を取得し+1した番号をセットします。
    // 管理番号の接頭辞は「従業員ID」の情報を付与します。「従業員ID」が設定されていない場合はユーザーIDを設定します。
    // 
    // <前提条件>
    // ・採番値をセットする「文字列」フィールドが設定されていること　※本サンプルでは"管理番号"というフィールドを想定
    // ・「ユーザー選択」フィールドが設定されていること　※本サンプルでは"担当者"というフィールドコードを想定
    // ・「数値」フィールドが設定されていること　※本サンプルでは"採番値"というフィールドコードを想定
    // ・kintoneアカウントの「従業員ID」が設定されていること
    // ・レコード新規作成イベントで動作します
    kintone.events.on(["app.record.create.show"], (event) => {

        // ログインユーザー情報を取得
        const user = kintone.getLoginUser();

        // 検索条件
        let params = {
            app: '{targetAppID}', //アプリID
            fields: ['担当者', '採番値'],
            query: '担当者 in ("' + user.code + '") order by 採番値 desc limit 1' //1件だけ取れれば良いのでlimit1
        };

        // 現在表示しているレコードを取得
        const record = event.record;

        // 検索処理
        return getMaxNumberRecord(params)
                .then(function(maxCount){
                    // 管理番号に値を設定
                    record.管理番号.value = user.employeeNumber ?  user.employeeNumber + "-" + String(maxCount + 1) : user.id + "-" + String(maxCount + 1);
                    record.採番値.value = Number(maxCount + 1);
                    return event;
                });

    });

    async function getMaxNumberRecord (params) {
        return await kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', params).then( function(resp) {
            const searchResults = resp.records;
            let maxCount = 1;
            for (var i = 0; i < searchResults.length; i++) {
                if (searchResults[i].採番値.value) {
                    maxCount = Number(searchResults[i].採番値.value);
                    break;
                }
            }

            return maxCount;
        }).catch(function(error) {
            alert(error);
        });
    }

})();