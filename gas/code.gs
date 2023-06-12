// const sheetid = "xxxx"
// const spreadsheet = SpreadsheetApp.openById(sheetid)

const spreadsheet = SpreadsheetApp.getActiveSpreadsheet()

const hira = "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふえほまみむめもやゆよらりるれろわをがぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽ"
const hira_all = "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふえほまみむめもやゆよらりるれろわをがぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽーぁぃぅぇぉっゃゅょ"

const ngwords = [
  "死","性","卑","猥","禁","アダルト","エッチ","えっち","H","18",
]

const getStart=(kana)=>{
  return kana.charAt(0)
}

const getEnd=(kana)=>{
  for(let i=kana.length-1; i>=0; i--){
    if(hira.indexOf(kana.charAt(i))>=0){
      return kana.charAt(i)
    }
  }
}

const addWord=(sheetName, word)=>{
  const sheet = spreadsheet.getSheetByName(sheetName)
  const range = sheet.getRange("A:A")
  const rowvalues = range.getValues()
  const lastrow = rowvalues.filter(String).length
  let col = 1
  for(let key in word){
    sheet.getRange(lastrow+1, col).setValue(word[key])
    col++
  }
}

const existWord=(sheetName, word)=>{
  const sheet = spreadsheet.getSheetByName(sheetName)
  const range = sheet.getRange("A:A")
  const finder = range.createTextFinder(word).matchCase(true).matchEntireCell(true).findNext()
  if(finder===null) return {}
  const col = finder.getRowIndex()
  const header = sheet.getRange(`1:1`).getValues()[0]
  const rows = sheet.getRange(`${col}:${col}`).getValues()
  const arr = rows.map((row) =>
    row.reduce((acc, cell, i) => ({ ...acc, [header[i]]: cell }), {})
  )
  return arr[0]
}

const getKanaYomitan=(text)=>{
  text = text.replace(/[\r\n\t\s]+/g, "")
  const url = `https://yomi-tan.jp/api/yomi.php?ic=UTF-8&oc=UTF-8&k=h&n=1&t=${text}`
  console.log(url)
  try {
    return UrlFetchApp.fetch(url).getContentText().split(",")[0]
  } catch(e) {
    console.log(text)
    return undefined
  }
}

const addSheets=(word, kana, time)=>{

  //カナチェック、文字数チェック、終了文字前提チェック
  if(typeof(kana)==="undefined" || kana.length===1 || hira_all.indexOf(kana.slice(-1))<0) {
    addWord("不採用", {"word":word, "kana":kana, "time":time})
    return
  }

  //終了文字取得
  const end = getEnd(kana)

  //終了文字チェック、開始文字チェック
  const start = getStart(kana)
  if(end==="" || hira.indexOf(start)<0){
    addWord("不採用", {"word":word, "kana":kana, "time":time})
    return
  }

  //NGワードチェック
  const checkNG=(word)=>{
    for(let w of ngwords){
      if(word.indexOf(w)>=0) return true
    }
    return false
  }
  if(checkNG(word)){
    addWord("不採用", {"word":word, "kana":kana, "time":time})
    return
  }

  addWord("採用", {"word":word, "kana":kana, "time":time})
}

const getKana=(text)=>{
  let res={}
  const wordOK = existWord("採用", text)
  if(typeof(wordOK.word)!=="undefined"){
    res = {"status": "OK", "data": wordOK.kana}
    return res
  }
  const wordNG = existWord("不採用", text)
  if(typeof(wordNG.word)!=="undefined"){
    res = {"status": "OK", "data": wordNG.kana}
    return res
  }
  res.data = getKanaYomitan(text)
  if (typeof(res.data)==="undefined"){
    res = {"status": "NG", "data": "kana api error"};
    return res
  } else {
    const time = Utilities.formatDate(new Date(), "JST", "yyyy/MM/dd-HH:mm:ss")
    addSheets(text, res.data, time)
    res.status = "OK"
    return res
  }
}

const getJson=(sheetName)=>{
  const sheet = spreadsheet.getSheetByName(sheetName)
  const range = sheet.getRange("A:A")
  const rowvalues = range.getValues()
  const lastrow = rowvalues.filter(String).length
  const arrays = sheet.getRange(`A2:B${lastrow}`).getValues()
  return arrays.reduce((obj, [key, value]) => Object.assign(obj, {[key]: value}), {});
}

const getStarts=(sheetName)=>{
  let res={}
  const sheet = spreadsheet.getSheetByName(sheetName)
  const range = sheet.getRange("A:A")
  const rowvalues = range.getValues()
  const lastrow = rowvalues.filter(String).length
  for(let row=2; row <= lastrow; row++){
    let kana = sheet.getRange(row, 2).getValue()
    let start = getStart(kana)
    if (typeof(res[start])==="undefined") res[start] = []
    res[start].push(sheet.getRange(row,1).getValue())
  }
  return res
}

const getWords=()=>{
  let res={}
  res.data = {}
  //res.data.startsOK = getStarts("採用")
  res.data.wordsOK = getJson("採用")
  res.data.wordsNG = getJson("不採用")
  if (typeof(res.data)==="undefined"){
    res = {"status": "NG", "data": "words error"};
  } else {
    res.status = "OK"
  }
  return res
}

const main=(args)=>{
  console.log("main: start, args:" + JSON.stringify(args))
  let res={};
  switch (args.action) {
    case "kana":
      res = getKana(args.text)
      break
    case "words":
      res = getWords()
      break
    default:
      res = {"status": "NG", "data": "action error"};
  }
  return res
}

/*
const reqJson = {
  action: "kana",
  //text: "井上真央",
  text: "花瓶",
}

const reqJson = {
  action: "words",
}

const doGetTest=()=>{
  console.log("doGetTest: start")
  let resJson = main(reqJson)
  console.log(JSON.stringify(resJson))
}
*/

const doGet=(e)=>{
  console.log("doGet: start")
  console.log(e.parameter)
  //let reqJson = JSON.parse(e.parameter);
  //let resJson = main(reqJson)
  let resJson = main(e.parameter)
  return ContentService.createTextOutput(JSON.stringify(resJson)).setMimeType(ContentService.MimeType.JSON);
}



//---- 毎時定期
const periodicHour=()=>{
  const hira = [
    "あいうえ","おかき",
    "くけこさ","しすせ",
    "そたちつ","てとな",
    "にぬねの","はひふ",
    "へほまみ","むめも",
    "やゆよら","りるれ",
    "ろわをが","ぎぐげ",
    "ござじず","ぜぞだ",
    "ぢづでど","ばびぶ",
    "べぼぱぴ","ぷぺぽ",
  ]
  const h = Number(Utilities.formatDate(new Date(), "JST", "HH"))
  if(h>19) return
  const str = hira[h]
  if(typeof(str)==="undefined") return
  for(let i=0; i<str.length; i++){
    const key = str.substring(i, i+1)
    const requestURL = `https://www.google.com/complete/search?hl=en&output=toolbar&q=${key}`
    const suggestXML = UrlFetchApp.fetch(requestURL).getContentText()
    const suggestions = XmlService.parse(suggestXML).getRootElement().getChildren("CompleteSuggestion")
    let words =[]
    suggestions.forEach(e => words.push(e.getChild("suggestion").getAttribute("data").getValue()))
    console.log(`getGoogle:${words}`)
    words.forEach(word=>getKana(word.split(" ")[0]))
  }
}



//---- 単独：カナセット
const addKana=(sheetName)=>{
  sheetName="不採用"
  const sheet = spreadsheet.getSheetByName(sheetName)
  const range = sheet.getRange("A:A")
  const rowvalues = range.getValues()
  const lastrow = rowvalues.filter(String).length
  for(let row=23; row <= lastrow; row++){
    let word = sheet.getRange(row, 1).getValue()
    //console.log(word)
    let kana = getKanaYomitan(word)
    sheet.getRange(row, 2).setValue(kana)
  }
}






