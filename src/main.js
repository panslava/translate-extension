function onClickContextMenu(selectionText) {
    console.log(selectionText)
}

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        contexts: ['selection'],
        title: 'Translate "%s" to {smth}',
        id: 'YandexTranslateExt'
    })
})

chrome.contextMenus.onClicked.addListener(function(itemData) {
    if (itemData.menuItemId == 'YandexTranslateExt') {
        console.log(itemData)
        onClickContextMenu(itemData.selectionText)
    }
})
