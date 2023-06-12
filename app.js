"use strict";
(()=>{
const sw=async()=>{
  console.log("[sw]start")
  importScripts("https://syamcspublic.github.io/ConsoleJS/Console.js")

  const cacheName = registration.scope
  const cacheItems = [
    "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-solid-900.woff2",
    "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-solid-900.ttf",
    "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",
    "https://syamcspublic.github.io/ConsoleJS/Console.js",
    "./manifest.json",
    "./icon.png",
    "./app.js",
    "./index.html",
    "./",
  ]

  self.addEventListener("install", (event)=>{
    console.log("[sw]install start")
    event.waitUntil((async()=>{
      self.skipWaiting()
      const cache = await caches.open(cacheName)
      const res = await cache.addAll(cacheItems)
      console.log("[sw]install end")
      return res
    })())
  })

  self.addEventListener("activate", (event)=>{
    console.log("[sw]activate start")
    event.waitUntil((async()=>{
      const res = await self.clients.claim()
      console.log("[sw]activate end")
      return res
    })())
  })

  self.addEventListener("fetch", (event)=>{
    if (event.request.method == "POST") return
    event.respondWith((async()=>{
      const cacheres = await caches.match(event.request)
      if (cacheres) return cacheres
      return fetch(event.request)
    })())
  })

  console.log("[sw]end")
}

const win=async()=>{
  console.log("[win]start")
  navigator.serviceWorker.register("./app.js")

  await Console.promise
  await Console.settings({storage:true, show:false, pos:"right-top", posx:65, posy:-65})
  const app = Console.storage
  await app.set("version", "1.0.0")

  let app_url = await app.get("url")

  //let app_words = await app.get("words")
  let app_startOK = await app.get("startOK")
  let app_wordsOK = await app.get("wordsOK")
  let app_wordsNG = await app.get("wordsNG")

  let app_hist = await app.get("hist")
  if(typeof(app_hist)==="undefined") app_hist=[]

  let canButtons = {
    "renew": false,
    "cspeak": true,
    "uspeak": false,
    "ukeybd": false,
  }

  let canRecognition = (typeof(webkitSpeechRecognition)!=="undefined" || typeof(SpeechRecognition)!=="undefined")





  document.body.insertAdjacentHTML("beforeend", String.raw`
<span id="app_container">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw==" crossorigin="anonymous" referrerpolicy="no-referrer" />

<style>
#container {
  background: #000000;
  display: flex;
  position: fixed;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
}
#container > *, #container > * > * {
  font-family: "Hiragino Kaku Gothic ProN", "Meiryo", sans-serif;
  /* font-size:16px; */
}
#disp_container {
  /* background: #111111; */
  width: 85%;
  height: 85%;
  margin: auto;
  padding: 0;
}
/*
#uspeak_disp {
  color: #ffffff;
  font-size:24px;
}
*/
#cspeak_info {
  /* background: #111111; */
  color: #ffffff;
  font-size:32px;
}
#cspeak_normal {
  width: 95%;
  height: 85%;
  margin: auto;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
#cspeak_normal_box {
  position: relative;
  top: -50px;
}
#cspeak_word {
  color: #ffffff;
  font-size:48px;
  display: flex;
  align-items: center;
  justify-content: center;
}
#cspeak_kana, #cspeak_next {
  color: #ffffff;
  font-size:12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
#uspeakfix_container, #uspeak_container, #ukeybd_container {
  /* background: #111111; */
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 80px;
  margin: 0;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: space-around;
}
#button_container, #renew_container {
  /* background: #111111; */
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 80px;
  margin: 0;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: space-around;
}
#renew_area {
  color: #808080
}
.uspeak {
  display: block;
  margin: 7px auto 7px auto;
  padding: 1px 6px 1px 6px;
  border: none;
  border-radius: 5px;
  width: 90%;
  font-size:18px;
}
#uspeakfix_area {
  background: #000000;
  color: #ffffff;
}
#uspeak_area, #ukeybd_area {
  background: #ffffff;
  color: #000000;
}
#ukeybd_area:focus {
  outline: none;
}
</style>

<div id="container">
  <div id="uspeakfix_container">
    <div class="uspeak" id="uspeakfix_area"></div>
  </div>
  <div id="uspeak_container">
    <div class="uspeak" id="uspeak_area"></div>
  </div>
  <div id="ukeybd_container">
    <input type="text" class="uspeak" id="ukeybd_area" placeholder="書いてください..."></input>
  </div>

  <div id="disp_container">
    <!-- <div id="uspeak_disp"></div> -->
    <div id="cspeak_info"></div>
    <div id="cspeak_normal">
      <div id="cspeak_normal_box">
        <div id="cspeak_word"></div>
        <div id="cspeak_kana"></div>
        <div id="cspeak_next"></div>
      </div>
    </div>
  </div>

  <div id="button_container">
    <div id="renew"><i class="fa-solid fa-arrows-rotate fa-xl" style="color: #ffffff;"></i></div>
    <div id="cspeak"><i class="fa-solid fa-volume-xmark fa-xl" style="color: #ffffff;"></i></div>
    <div id="uspeak"><i class="fa-solid fa-microphone fa-xl" style="color: #ffffff;"></i></div>
    <div id="ukeybd"><i class="fa-solid fa-keyboard fa-xl" style="color: #ffffff;"></i></div>
  </div>

  <div id="renew_container">
    <div id="renew_area">データ更新中...</div>
  </div>
</div>

</span>
  `)





  const doGet=async(url)=>{
    let res
    if(navigator.onLine){
      const js = await fetch(url)
      const jo = await js.json()
      if(jo.status=="OK") res = jo.data
    }
    return res
  }

  const adddisp=async(who, what)=>{
    switch(who){
/*
      case "uspeak_disp":
        document.querySelector("#uspeak_disp").style.visibility="visible"
        document.querySelector("#uspeak_disp").innerHTML=what
        document.querySelector("#cspeak_info").style.visibility="hidden"
        document.querySelector("#cspeak_info").innerHTML=""
        break
*/

      case "uspeak_fix":
        document.querySelector("#uspeakfix_container").style.visibility="visible"
        document.querySelector("#uspeakfix_area").innerHTML=what
        document.querySelector("#cspeak_info").style.visibility="hidden"
        document.querySelector("#cspeak_info").innerHTML=""
        break

      case "cspeak_info":
        //document.querySelector("#uspeak_disp").style.visibility="hidden"
        //document.querySelector("#uspeak_disp").innerHTML=""
        document.querySelector("#uspeakfix_container").style.visibility="hidden"
        document.querySelector("#uspeakfix_area").innerHTML=""

        document.querySelector("#cspeak_info").style.visibility="visible"
        document.querySelector("#cspeak_info").innerHTML=what

        document.querySelector("#cspeak_normal").style.visibility="hidden"
        document.querySelector("#cspeak_word").innerHTML=""
        document.querySelector("#cspeak_kana").innerHTML=""
        document.querySelector("#cspeak_next").innerHTML=""
        break

      case "cspeak_normal":
        document.querySelector("#cspeak_info").style.visibility="hidden"
        document.querySelector("#cspeak_info").innerHTML=""

        document.querySelector("#cspeak_normal").style.visibility="visible"
        document.querySelector("#cspeak_word").innerHTML=what.word
        document.querySelector("#cspeak_kana").innerHTML=what.kana
        document.querySelector("#cspeak_next").innerHTML=what.next
        break
  
      default:
        break
    }
  }

  const dispContainer=(args)=>{
    document.querySelector("#button_container").style.display="none"
    document.querySelector("#renew_container").style.display="none"
    document.querySelector("#uspeakfix_container").style.display="none"
    document.querySelector("#uspeak_container").style.display="none"
    document.querySelector("#ukeybd_container").style.display="none"
    switch(args){
      case "button":
        document.querySelector("#cspeak_info").style.visibility="visible"
        document.querySelector("#uspeakfix_container").style.visibility="visible"
        document.querySelector("#button_container").style.display="flex"
        document.querySelector("#uspeakfix_container").style.display="flex"
        break
      case "renew":
        document.querySelector("#cspeak_info").style.visibility="visible"
        document.querySelector("#uspeakfix_container").style.visibility="visible"
        document.querySelector("#renew_container").style.display="flex"
        document.querySelector("#uspeakfix_container").style.display="flex"
        break
      case "uspeak":
        document.querySelector("#cspeak_info").style.visibility="hidden"
        document.querySelector("#uspeakfix_container").style.visibility="hidden"
        document.querySelector("#uspeak_container").style.display="flex"
        break
      case "ukeybd":
        document.querySelector("#cspeak_info").style.visibility="hidden"
        document.querySelector("#uspeakfix_container").style.visibility="hidden"
        document.querySelector("#ukeybd_container").style.display="flex"
        break
      default:
        document.querySelector("#cspeak_info").style.visibility="visible"
        document.querySelector("#uspeakfix_container").style.visibility="visible"
        document.querySelector("#button_container").style.display="flex"
        break
    }
  }

  const setButtonsOpacity=()=>{

    if(typeof(app_wordsOK)==="undefined"){
      document.querySelector("#uspeak").style.opacity=0.15
      canButtons.uspeak = false
      document.querySelector("#ukeybd").style.opacity=0.15
      canButtons.ukeybd = false
    } else {
      if(canRecognition){
        document.querySelector("#uspeak").style.opacity=1
        canButtons.uspeak = true
      } else {
        document.querySelector("#uspeak").style.opacity=0.15
        canButtons.uspeak = false
      }
      document.querySelector("#ukeybd").style.opacity=1
      canButtons.ukeybd = true
    }
    if(navigator.onLine){
      document.querySelector("#renew").style.opacity=1
      canButtons.renew = true
    } else {
      document.querySelector("#renew").style.opacity=0.15
      canButtons.renew = false
    }
  }

  let iscspeak = false
  const cspeak=(text)=>{
    if (iscspeak) {
      const voice = new SpeechSynthesisUtterance();
      voice.volume = 1;
      voice.rate = 1;
      voice.pitch = 1;
      voice.lang = "ja-JP";
      voice.text = text;
      speechSynthesis.speak(voice);
    }
  }

  let recognition, uspeak_status, uspeak_isstart = false
  const uspeak=(text)=>{
    const SpeechRecognition = webkitSpeechRecognition || SpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.lang = "ja-JP";
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onstart = (event) => {
      uspeak_isstart = true
      document.querySelector("#uspeak_area").innerHTML = `<span style="color:#808080">喋ってください...</span>`
      dispContainer("uspeak")
      uspeak_status="onstart"
    }

    recognition.onend = (event) => {
      dispContainer("button")
      uspeak_status="onend"
    }

    recognition.onerror = (event) => {
      if(!uspeak_isstart){
        console.log(`recognition.onerror:${JSON.stringify(event)}`)
        document.querySelector("#uspeak").style.opacity=0.15
        canRecognition = false
        uspeak_status="onerror"
      }
    }

    let finalTranscript=""
    recognition.onresult=async(event)=>{
      uspeak_status="onresult"
      let isend = false, interimTranscript=""
      for (let i = event.resultIndex; i < event.results.length; i++) {
        let transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          isend = true;
        } else {
          interimTranscript = transcript;
        }
      }
      if (interimTranscript.length>0) {
        document.querySelector("#uspeak_area").innerHTML = `<span style="color:#000000">${interimTranscript}</span>`
        finalTranscript = interimTranscript
      } else {
        adddisp("uspeak_fix", finalTranscript)
      }
      //console.log(`確定:${finalTranscript}, 仮:${interimTranscript}`)
      if (isend) {
        recognition.stop();
        fixword(finalTranscript)
      }
    }

    recognition.start();
  }

  const setExit=()=>{
    const exit=()=>{
      if(typeof(recognition)!=="undefined" && typeof(recognition.stop)!=="undefined") recognition.stop()
      document.querySelector("#disp_container").removeEventListener("click", exit)
      dispContainer("button")
    }
    document.querySelector("#disp_container").addEventListener("click", exit)
  }





  const hira = "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふえほまみむめもやゆよらりるれろわをんがぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽ"

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

  const fixword=async(word)=>{
    //console.log(word)

    const cspeakConv=(msg)=>{
      const speak_msg = msg.split("<br>").join("。")
      cspeak(speak_msg)
      return
    }

    const dispEnd=async(msg)=>{
      cspeakConv(msg)
      adddisp("cspeak_info", msg)
      await app.set("hist", [])
      await app.set("last", {})
      return false
    }

    const outmsg=(msg)=>{
      if(msg!==""){
        cspeakConv(msg)
        adddisp("cspeak_normal", {word:"", kana:msg, next:""})
        return false
      }
      return true
    }

    const checkWord=async(word)=>{
      let msg=""
      const last = await app.get("last")

      if(typeof(last)!=="undefined" && typeof(last.end)!=="undefined"){
        if(word=="") msg = `聞き取れませんでした<br>「${last.end}」で始まる言葉でもう一度お願いします`
      } else {
        if(word=="") msg = `聞き取れませんでした<br>もう一度お願いします`
      }

      if(!outmsg(msg)) return false
      return true
    }

    const getKana=(word)=>{
      if(typeof(app_wordsOK[word])!=="undefined") return app_wordsOK[word]
      if(typeof(app_wordsNG[word])!=="undefined") return app_wordsNG[word]
      return undefined
      //for(let app_word of app_words) if(app_word.word===word) return app_word.kana
    }

    const checkHist=async(word)=>{
      app_hist = await app.get("hist")
      if(typeof(app_hist)==="undefined") app_hist=[]
      //for(let hist of app_hist) if(hist===word) return false
      return app_hist.includes(word)
    }

    let intervalID
    const doThink=(msg)=>{
      adddisp("cspeak_normal", {word:"", kana:msg, next:""})
      let timeoutCnt=0
      intervalID = setInterval(()=>{
        msg += "."
        adddisp("cspeak_normal", {word:"", kana:msg, next:""})
        timeoutCnt++
        if(timeoutCnt>10) clearInterval(intervalID)
      }, 1000)
    }

    const checkKana=async(kana)=>{
      let msg=""
      const last = await app.get("last")

      if(typeof(last)!=="undefined" && typeof(last.end)!=="undefined"){
        if(typeof(kana)==="undefined" || kana===null || kana===""){
          msg = `読めませんでした<br>「${last.end}」で始まる別の言葉でお願いします`
        }
      } else {
        if(typeof(kana)==="undefined" || kana===null || kana===""){
          msg = "読めませんでした<br>別の言葉でお願いします"
        }
      }
      if(!outmsg(msg)) return false

      document.querySelector("#uspeakfix_area").innerHTML += "（" + kana + "）"

      if(typeof(last)!=="undefined" && typeof(last.end)!=="undefined"){
        if(kana.slice(-1)==="ん") msg = `「ん」で終わる言葉のようです<br>「${last.end}」で始まる別の言葉でお願いします`
        if(last.end!=kana.substring(0,1)) msg = `「${last.end}」から始まっていないようです<br>別の言葉でお願いします`
      } else {
        if(kana.slice(-1)==="ん") msg = `「ん」で終わる言葉のようです<br>別の言葉でお願いします`
      }
      if(!outmsg(msg)) return false

      return true
    }

    const getWordc=async(kana)=>{
      let start = getEnd(kana)
      if(start=="ぢ") start="じ"
      if(start=="づ") start="ず"
      const starts=app_startOK[start]
      const startsdiff = starts.filter(i=>app_hist.indexOf(i)==-1)
      if(startsdiff.length<1) return undefined
      const i = Math.floor(Math.random(startsdiff.length)*startsdiff.length)
      const wordc = startsdiff[i]
      const kanac = getKana(wordc)
      const startc = getStart(kanac)
      const endc = getEnd(kanac)
      return {"word":wordc,"kana":kanac,"start":startc,"end":endc}
    }

    const setHist=async(word)=>{
      app_hist = await app.get("hist")
      if(typeof(app_hist)==="undefined") app_hist=[]
      app_hist.push(word)
      await app.set("hist", app_hist)
    }



    doThink("言葉を確認しています")
    const checkWord_result = await checkWord(word)
    if(!checkWord_result) return
    clearInterval(intervalID)

    doThink("読み方を考えています")
    let kana = getKana(word)
    if(typeof(kana)==="undefined") kana = await doGet(`${app_url}?action=kana&text=${word}`)
    clearInterval(intervalID)

    const checkKana_result = await checkKana(kana)
    if(!checkKana_result) return

    if(await checkHist(word)){
      let app_hist = await app.get("hist")
      app_hist = (typeof(app_hist)==="undefined")?[]:app_hist
      let msg = `「${word}」は前に使った言葉です…<br>今回は${app_hist.length}回続きました<br>再開するには最初の言葉を決めてください`
      dispEnd(msg)
      return
    }

    await setHist(word)
    console.log(document.querySelector("#uspeakfix_area").innerHTML)

    doThink("次の言葉を考えています")
    const wordc = await getWordc(kana)
    clearInterval(intervalID)

    if(typeof(wordc)==="undefined"){
      let app_hist = await app.get("hist")
      app_hist = (typeof(app_hist)==="undefined")?[]:app_hist
      let msg = `思い付きませんでした<br>今回は${app_hist.length}回続きました<br>再開するには最初の言葉を決めてください`
      dispEnd(msg)
      return
    }

    await setHist(wordc.word)
    await app.set("last", wordc)
    await nextWord()
  }

/*
  const setNext=async(word)=>{
    app_hist = await app.get("hist")
    if(typeof(app_hist)==="undefined") app_hist=[]
    app_hist.push(word)
    await app.set("hist", app_hist)
  }
*/

  const nextWord=async()=>{
    let msg
    const last = await app.get("last")
    if(typeof(last)==="undefined" || typeof(last.word)==="undefined"){
      msg = "最初の言葉を決めてください"
      cspeak(msg)
      adddisp("cspeak_info", msg)
    } else {
      cspeak(last.kana)
      msg={}
      msg.word = last.word
      msg.kana = last.kana
      msg.next = ""
      if(last.end==="ぢ") last.end="じ"
      if(last.end==="づ") last.end="ず"
      if (last.kana.slice(-1)!==last.end) {
        msg.next = `次は「${last.end}」から始まる言葉です`
        cspeak(`次は。`)
        cspeak(`${last.end}。`)
        cspeak(`から始まる言葉です。`)
      }
      await app.set("last", last)
      console.log(JSON.stringify(msg))
      adddisp("cspeak_normal", msg)
    }
  }

  const checkWords=async()=>{
    let msg
    if(typeof(app_wordsOK)==="undefined"){
      if(navigator.onLine){
        msg = "左下のボタンでデータを更新してください"
      } else {
        msg = "ネットワークに接続して左下のボタンでデータを更新してください"
      }
      adddisp("cspeak_info", msg)
      cspeak(msg)
    } else {
      await nextWord()
    }
  }





  document.querySelector("#renew").addEventListener("click", async(e)=>{
    if(canButtons.renew){
      //console.log("click renew")

/*
//for test - start
        app_url = "xxx"
        await app.set("url", app_url)
        //await app.set("words", {})
        app_words = [
          {"word":"試行","kana":"しこう","start":"し","end":"う"},
        ]
        await app.set("words", app_words)
        dispContainer("button")
        setButtonsOpacity()
        checkWords()
//for test - end
*/

      //let url = prompt("APIのURLを入力してください", (app_url==undefined)?"":app_url)
      let url = "https://script.google.com/macros/s/AKfycbwUb_rQOHvE_OHBe_hpwE4U3b0uESidec77KbMKMxbqGjwMyNYyWoFCaJnHvbdC5JKU/exec"

      if(typeof(url)!=="undefined" && url!==null && url!==""){
        console.log("renew start")
        dispContainer("renew")
        app_url = url
        await app.set("url", app_url)
        const datas = await doGet(`${app_url}?action=words`)
        app_wordsOK = datas.wordsOK
        await app.set("wordsOK", app_wordsOK)
        app_wordsNG = datas.wordsNG
        await app.set("wordsNG", app_wordsNG)
        app_startOK={}
        for(let word in app_wordsOK){
          const start = getStart(app_wordsOK[word])
          if (typeof(app_startOK[start])==="undefined") app_startOK[start] = []
          app_startOK[start].push(word)
        }
        await app.set("startOK", app_startOK)

        dispContainer("button")
        setButtonsOpacity()
        checkWords()
        console.log("renew end")

        const getDataSize=async()=>{
          let jo = await app()
          const js=JSON.stringify(jo)
          let size = js.length
          let sizestr=""
          if (size>1000000) {
            size = Math.ceil(size / 100000) / 10
            sizestr = size + "MB"
          } else if (size>1000) {
            size = Math.ceil(size / 100) / 10
            sizestr = size + "KB"
          } else {
            sizestr = size + "byte"
          }
          return sizestr
        }

        let dataSize = await getDataSize()
        let wordsLen = Object.keys(app_wordsOK).length + Object.keys(app_wordsNG).length
        let msg = "データ更新完了\n語彙数：" + wordsLen + "(" + dataSize + ")"
        console.log(msg)
        alert(msg)
      }

    } else {
      console.log("not active renew")
    }
  })

  document.querySelector("#cspeak").addEventListener("click", async(e)=>{
    if(canButtons.cspeak){
      //console.log("click cspeak")

      let msg
      if (iscspeak) {
        iscspeak = false;
        document.querySelector("#cspeak").innerHTML=`<i class="fa-solid fa-volume-xmark fa-xl" style="color: #ffffff;"></i>`
        msg="スピーカーをオフにしました"
      } else {
        iscspeak = true;
        document.querySelector("#cspeak").innerHTML=`<i class="fa-solid fa-volume-high fa-xl" style="color: #ffffff;"></i>`
        msg="スピーカーをオンにしました"
      }

      let iscspeakBackup
      iscspeakBackup = iscspeak
      iscspeak = true
      console.log(msg)
      cspeak(msg)
      iscspeak = iscspeakBackup

    } else {
      console.log("not active cspeak")
    }
  })

  document.querySelector("#uspeak").addEventListener("click", async(e)=>{
    if(canButtons.uspeak){
      //console.log("click uspeak")

      if (canRecognition) {
        setExit()
        uspeak()
      }

      //await new Promise(resolve => setTimeout(resolve, 5000));
      //dispContainer("button")

    } else {
      console.log("not active uspeak")
    }
  })





  window.addEventListener("scroll", async(e)=>{
    document.querySelector("#ukeybd_container").style.top = window.scrollY + "px"
  })

  document.querySelector("#ukeybd_container").style.display="none";

  document.querySelector("#ukeybd_area").addEventListener("blur",async(e)=>{
    dispContainer("button")
  })

  document.querySelector("#ukeybd_area").addEventListener("keydown",async(e)=>{
    if (e.key=="Enter") {
      document.querySelector("#ukeybd_area").blur();
      const word=document.querySelector("#ukeybd_area").value
      if (word!=="") {
        adddisp("uspeak_fix", word)
        fixword(word)
        document.querySelector("#ukeybd_area").value=""
      }
    }
  })

/*
  if(typeof(visualViewport)!=="undefined"){
    visualViewport.addEventListener("resize", async(e)=>{
      const info = document.querySelector("#cspeak_info").textContent
      let elem = document.querySelector("#cspeak_info")
      if(info==="") elem = document.querySelector("#cspeak_normal_box")
      let clientRect = elem.getBoundingClientRect()
      let pageY = window.pageYOffset + clientRect.top - 40
      pageY = pageY < 0 ? 0 : pageY
      window.scrollTo(0, pageY)
      const top = pageY + visualViewport.height - 70
      document.querySelector("#ukeybd_container").style.top = top + "px"
    })
  } else {
    console.log("visualViewport nothing")
  }
*/

  document.querySelector("#ukeybd").addEventListener("click", async(e)=>{
    if(canButtons.ukeybd){
      //console.log("click ukeybd")
      dispContainer("ukeybd")

      setExit()
      document.querySelector("#ukeybd_container").style.display="flex";
      document.querySelector("#ukeybd_area").focus();

    } else {
      console.log("not active ukeybd")
    }
  })

  document.addEventListener("dblclick", (e)=>{
    e.preventDefault()
  }, { passive: false })



  dispContainer("button")
  setButtonsOpacity()
  checkWords()

  console.log("[win]end")
}

if(typeof(window)==="undefined"){
  sw()
}else{
  win()
}
})()
