//字符串预处理，解析驼峰命名法和下划线命名法的单词、词组
function preprocessWord (originWord) {
    if (originWord.indexOf(" ") === -1) {
        originWord = originWord.replace(/_/g, " ");
        if (/[a-z]+/.test(originWord)) {
            originWord = trim(originWord.replace(/([A-Z])/g, " $1"));
        }
    }
    return originWord;
}

/*
ChaZD.prototype.parsePhrase = function (queryWord, key) {
    var words = [];
    words = queryWord.split(/\s+/);
}
*/
window.Notifications = window.Notifications || window.webkitNotifications;

function showNotification(note) {
    if (!Notifications) {
        //console.log("[ChaZD] Your browse don't support notification.");
        return;
    }
    var notification = null, havePermission = Notifications.checkPermission();
    if (havePermission === 0) {
        notification = Notifications.createNotification(
            note.icon || chrome.extension.getURL("icons/icon128.png"),
            note.title || "ChaZD 查字典",
            note.content
        );
        notification.onclick = function () {
            window.open("https://chrome.google.com/webstore/detail/chazd/nkiipedegbhbjmajlhpegcpcaacbfggp");
        };
        notification.show();
    } else {
        Notifications.requestPermission();
    }

    return notification;
}

chrome.runtime.onInstalled.addListener(
    function (details) {
        if (details.reason === "install") {
            //console.log("[ChaZD] first install.");
            showNotification({
                title : "shanbay test！",
                content : "欢迎提出您的意见或建议。" + 
                    "如果觉得还不错，记得给好评哦"
            });
            //alert("Thank you for install my app:)");
        } else if (details.reason === "update") {
            //console.log("[ChaZD] update from version " + details.previousVersion);
            //alert("New version has updated!");
            chrome.storage.sync.set({"showTips" : true}, function() {
                //console.log("[ChaZD] Success update settings selectMode = mouseSelect");
            });
            showNotification({
                title : "ChaZD 更新到五版！",
                content : "修复若干 bug，如出现无法查词的问题，请在设置中关闭使用 HTTPS 接口"                          
            });
        }
    }
);


chrome.storage.sync.get(null,function (items) {
    //console.log(JSON.stringify(items));
    if (items.showTips === undefined ) {
        //console.log("storage 是空的");
        chrome.storage.sync.set(settings);
    } else {
        //console.log("[ChaZD][Current Settings]");
        for (var key in items) {
            if (settings[key] === undefined) {
                chrome.storage.sync.remove(key);
                //console.log("Remove setting item '%s'", key);
            } else {
                settings[key] = items[key];
            }
        }
        chrome.storage.sync.set(settings);
    }
});

chrome.runtime.onMessage.addListener(
    function (message, sender, sendResponse) {
        var a = new api[currentSettings.apiName]();
        a.Query(preprocessWord(message.queryWord), message.source, sendResponse);
        return true;
});
