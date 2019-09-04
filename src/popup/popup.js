const translateAPIKey =
    'trnsl.1.1.20190827T013052Z.fc995532fe1d5637.e7909fc0a3b9099a6cb7cc8e6e86ce71d7a559ce'
const dictAPIKey =
    'dict.1.1.20190828T045207Z.9df10385c39e4a37.26f69c63a2ee4615aa599b7f757823cb86c83238'

const yandexTranslateOrigin = 'https://translate.yandex.net'
const yandexDictOrigin = 'https://dictionary.yandex.net'

const definitionAPIOrigin = ' https://googledictionaryapi.eu-gb.mybluemix.net'

const supportedLanguagesDefinitions = [
    'en',
    'hi', // Hindi
    'es',
    'fr',
    'ru',
    'de',
    'it',
    'ko', // Korean
    'pt-BR', // Brazilian Portuguese
    'zh-CN', // Chinese (Simplified)
    'ar', // Arabic
    'tr' // Turkish
]

function countWords(str) {
    return str.trim().split(/\s+/).length
}

function withCors(url) {
    return `https://cors-anywhere.herokuapp.com/${url}`
}
// async function getLangs() {
//     let path = '/api/v1.5/tr.json/getLangs'
//     let data = {
//         key: translateAPIKey,
//         ui: 'en'
//     }
//     let str = `${path}?key=${data.key}&ui=${data.ui}`

//     let response = await fetch(yandexTranslateOfficial + str)
// }

function makeReqString(path, data) {
    let str = `${path}?`
    for (let item in data) {
        str += `${item}=${data[item]}&`
    }
    return str
}

async function detectLang(text) {
    let path = '/api/v1.5/tr.json/detect'
    let data = {
        key: translateAPIKey,
        text: encodeURIComponent(text)
    }

    let str = makeReqString(path, data)

    let response = await fetch(withCors(yandexTranslateOrigin + str), {
        method: 'POST',
        headers: {
            Origin: yandexTranslateOrigin
        }
    })
    return await response.json()
}

async function translateQuery(text, dest, src) {
    if (text.length > 1000) {
        console.error('Text can not be longer than 1000 symbols')
        return
    }
    let path = '/api/v1.5/tr.json/translate'
    let data = {
        key: translateAPIKey,
        text: encodeURIComponent(text),
        lang: src ? `${src}-${dest}` : dest
    }
    let str = makeReqString(path, data)

    let response = await fetch(withCors(yandexTranslateOrigin + str), {
        method: 'POST',
        headers: {
            Origin: yandexTranslateOrigin
        }
    })

    return await response.json()
}

async function processDictionary(text, srcLanguage, destLanguage) {
    let dict = await dictQuery(text, srcLanguage, destLanguage)
    console.log(dict)
    if (!dict.def) return
    for (let item of dict.def[0].tr) {
        let curStr = item.text
        if (item.syn) {
            for (let syn of item.syn) {
                curStr += `, ${syn.text}`
            }
        }
        if (curStr) {
            let $listItem = document.createElement('li')
            $listItem.classList.add('translation__result__more__dict__item')
            $listItem.textContent = curStr
            document
                .querySelector('.translation__result__more__dict')
                .appendChild($listItem)
        }
    }
    // let otherTranslations = dict.def[]
    // document.querySelector(
    //     '.textTranslation__translatedText'
    // ).textContent =
}

async function dictQuery(text, src, dest) {
    let path = '/api/v1/dicservice.json/lookup'
    let data = {
        key: dictAPIKey,
        text: encodeURIComponent(text),
        lang: src ? `${src}-${dest}` : dest
    }
    let str = makeReqString(path, data)
    let response = await fetch(withCors(yandexDictOrigin + str), {
        method: 'POST',
        headers: {
            Origin: yandexDictOrigin
        }
    })

    let dict = await response.json()
    return dict
}

async function getDefinition(text, lang) {
    try {
        if (!lang) {
            lang = (await detectLang(text)).lang
        }
        let path = '/'
        let data = {
            define: encodeURIComponent(text),
            lang: lang
        }
        let str = makeReqString(path, data)
        let response = await fetch(definitionAPIOrigin + str)
        let definition = await response.json()

        return definition
    } catch (err) {
        console.log(err)
        return {}
    }
}

async function processTranslation(text, srcLanguage, destLanguage) {
    let translation = (await translateQuery(text, destLanguage, srcLanguage))
        .text[0]
    document.querySelector(
        '.translation__result__text'
    ).textContent = translation

    let definition = await getDefinition(translation, destLanguage)

    let tmp = Object.values(definition[0].meaning)
    let randomDefinition = tmp[Math.floor(tmp.length * Math.random())][0]
    console.log(randomDefinition)

    document.querySelector(
        '.translation__result__more__definition__text'
    ).textContent = randomDefinition.definition
    document.querySelector(
        '.translation__result__more__definition__example'
    ).textContent = randomDefinition.example

    processDictionary(text, srcLanguage, destLanguage)
}

async function processSource(text, srcLanguage) {
    try {
        let definition = await getDefinition(text, srcLanguage)
        let definitionWord = definition[0].word
        let tmp = Object.values(definition[0].meaning)
        let randomDefinition = tmp[Math.floor(tmp.length * Math.random())][0]

        document.querySelector(
            '.translation__source__more__definition__text'
        ).textContent = `${definitionWord} : ${randomDefinition.definition}`
        document.querySelector(
            '.translation__source__more__definition__example'
        ).textContent = randomDefinition.example
    } catch (err) {
        console.log(err)
    }
}

function waitingForTranslation() {
    document.querySelector('.translation__result__text').textContent =
        'Loading...'
    let fieldsToEmpty = [
        '.translation__source__more__definition__text',
        '.translation__source__more__definition__example',
        '.translation__result__more__definition__text',
        '.translation__result__more__definition__example'
    ]
    for (let item of fieldsToEmpty) {
        document.querySelector(item).textContent = ''
    }
    document.querySelector('.translation__result__more__dict').innerHTML = ''
}

async function doJob() {
    let text = document.querySelector('.translation__source__text').value
    let srcLanguage = (await detectLang(text)).lang
    let destLanguage = srcLanguage == 'ru' ? 'en' : 'ru'

    processTranslation(text, srcLanguage, destLanguage)
    processSource(text, srcLanguage)
    // let sourceDefinition = await getDefinition(text, srcLanguage)
    // let translatedDefinition = await getDefinition()
}

document
    .querySelector('.translation__source__text')
    .addEventListener('keypress', async function(event) {
        if (event.keyCode == 13 && event.shiftKey) {
            event.preventDefault()
            waitingForTranslation()
            doJob()
        }
    })

document.querySelector('.translation__source__text').focus()
// https://cors-anywhere.herokuapp.com/https://translate.yandex.net/api/v1.5/tr.json/translate?key=trnsl.1.1.20190308T095934Z.95ae5cf4e28588ea.9d108fb6e768af347464925e4e98b91edb0013f5&lang=nl-en&text=in%20de%20grimmige%20donkere%20toekomst%20is%20er%20alleen%20oorlog
// https://cors-anywhere.herokuapp.com/https://translate.yandex.net/api/v1.5/tr.json/translate?key=trnsl.1.1.20190827T013052Z.fc995532fe1d5637.e7909fc0a3b9099a6cb7cc8e6e86ce71d7a559ce&text=&
