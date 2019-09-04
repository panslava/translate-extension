const axios = require('axios')

axios.defaults.baseURL = 'https://translate.yandex.net'
const APIKey =
    'trnsl.1.1.20190827T013052Z.fc995532fe1d5637.e7909fc0a3b9099a6cb7cc8e6e86ce71d7a559ce'

async function getLangs() {
    let path = '/api/v1.5/tr.json/getLangs'
    let data = {
        key: APIKey,
        ui: 'en'
    }
    let str = `${path}?key=${data.key}&ui=${data.ui}`
    let response = await axios.get(str)

    console.log(response.data)
}

function makeReqString(path, data) {
    let str = `${path}?`
    for (let item in data) {
        str += `${item}=${data[item]}&`
    }
    str = encodeURI(str)
    return str
}

async function detectLang(text) {
    let path = '/api/v1.5/tr.json/detect'
    let data = {
        key: APIKey,
        text: text
    }

    let str = makeReqString(path, data)

    let response = await axios.post(str)

    return response.data
}

async function translate(text, dest) {
    if (text.length > 1000) {
        console.error(
            'Хуйня, текст не может быть больше 1000 знаков, иначе платить придется'
        )
        return
    }
    let path = '/api/v1.5/tr.json/translate'
    let data = {
        key: APIKey,
        text: text,
        lang: dest
    }

    let str = makeReqString(path, data)

    let response = await axios.post(str)

    return response.data
}

async function main() {
    console.log(await translate('hello, how are u doing?', 'ru'))
}

main()
