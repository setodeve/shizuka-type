// ひらがな・カタカナ→ローマ字変換マップ（複数パターン対応）
const HIRAGANA_TO_ROMAJI: Record<string, string[]> = {
  あ: ['a'],
  い: ['i'],
  う: ['u'],
  え: ['e'],
  お: ['o'],
  か: ['ka'],
  き: ['ki'],
  く: ['ku'],
  け: ['ke'],
  こ: ['ko'],
  が: ['ga'],
  ぎ: ['gi'],
  ぐ: ['gu'],
  げ: ['ge'],
  ご: ['go'],
  さ: ['sa'],
  し: ['shi', 'si'], // 複数パターン対応
  す: ['su'],
  せ: ['se'],
  そ: ['so'],
  ざ: ['za'],
  じ: ['ji', 'zi'], // 複数パターン対応
  ず: ['zu'],
  ぜ: ['ze'],
  ぞ: ['zo'],
  た: ['ta'],
  ち: ['chi', 'ti'], // 複数パターン対応
  つ: ['tsu', 'tu'], // 複数パターン対応
  て: ['te'],
  と: ['to'],
  だ: ['da'],
  ぢ: ['ji', 'zi'], // 複数パターン対応
  づ: ['zu', 'du'], // 複数パターン対応
  で: ['de'],
  ど: ['do'],
  な: ['na'],
  に: ['ni'],
  ぬ: ['nu'],
  ね: ['ne'],
  の: ['no'],
  は: ['ha'],
  ひ: ['hi'],
  ふ: ['fu', 'hu'], // 複数パターン対応
  へ: ['he'],
  ほ: ['ho'],
  ば: ['ba'],
  び: ['bi'],
  ぶ: ['bu'],
  べ: ['be'],
  ぼ: ['bo'],
  ぱ: ['pa'],
  ぴ: ['pi'],
  ぷ: ['pu'],
  ぺ: ['pe'],
  ぽ: ['po'],
  ま: ['ma'],
  み: ['mi'],
  む: ['mu'],
  め: ['me'],
  も: ['mo'],
  や: ['ya'],
  ゆ: ['yu'],
  よ: ['yo'],
  ら: ['ra'],
  り: ['ri'],
  る: ['ru'],
  れ: ['re'],
  ろ: ['ro'],
  わ: ['wa'],
  ゐ: ['wi'],
  ゑ: ['we'],
  を: ['wo'],
  ん: ['n', 'nn'], // 複数パターン対応

  // 拗音
  きゃ: ['kya'],
  きゅ: ['kyu'],
  きょ: ['kyo'],
  しゃ: ['sha', 'sya'], // 複数パターン対応
  しゅ: ['shu', 'syu'], // 複数パターン対応
  しょ: ['sho', 'syo'], // 複数パターン対応
  ちゃ: ['cha', 'tya'], // 複数パターン対応
  ちゅ: ['chu', 'tyu'], // 複数パターン対応
  ちょ: ['cho', 'tyo'], // 複数パターン対応
  にゃ: ['nya'],
  にゅ: ['nyu'],
  にょ: ['nyo'],
  ひゃ: ['hya'],
  ひゅ: ['hyu'],
  ひょ: ['hyo'],
  みゃ: ['mya'],
  みゅ: ['myu'],
  みょ: ['myo'],
  りゃ: ['rya'],
  りゅ: ['ryu'],
  りょ: ['ryo'],
  ぎゃ: ['gya'],
  ぎゅ: ['gyu'],
  ぎょ: ['gyo'],
  じゃ: ['ja', 'jya', 'zya'], // 複数パターン対応
  じゅ: ['ju', 'jyu', 'zyu'], // 複数パターン対応
  じょ: ['jo', 'jyo', 'zyo'], // 複数パターン対応
  びゃ: ['bya'],
  びゅ: ['byu'],
  びょ: ['byo'],
  ぴゃ: ['pya'],
  ぴゅ: ['pyu'],
  ぴょ: ['pyo'],

  // 特殊文字
  ー: ['-'],
  '。': ['.'],
  '、': [','],
  '！': ['!'],
  '？': ['?'],
  '（': ['('],
  '）': [')'],
  '「': ['"'],
  '」': ['"'],
  ' ': [' '],
  '　': [' '], // 半角・全角スペース
}

// カタカナ→ひらがな変換
const katakanaToHiragana = (text: string): string => {
  return text.replace(/[\u30a1-\u30f6]/g, (match) => {
    const char = match.charCodeAt(0)
    return String.fromCharCode(char - 0x60)
  })
}

// ひらがな・カタカナをローマ字に変換（第一候補を使用）
export const convertToRomaji = (text: string): string => {
  // カタカナをひらがなに変換
  const hiraganaText = katakanaToHiragana(text)

  let result = ''
  let i = 0

  while (i < hiraganaText.length) {
    // 3文字の拗音を先にチェック
    if (i + 2 < hiraganaText.length) {
      const threeChar = hiraganaText.slice(i, i + 3)
      if (HIRAGANA_TO_ROMAJI[threeChar]) {
        result += HIRAGANA_TO_ROMAJI[threeChar][0] // 第一候補を使用
        i += 3
        continue
      }
    }

    // 2文字の拗音をチェック
    if (i + 1 < hiraganaText.length) {
      const twoChar = hiraganaText.slice(i, i + 2)
      if (HIRAGANA_TO_ROMAJI[twoChar]) {
        result += HIRAGANA_TO_ROMAJI[twoChar][0] // 第一候補を使用
        i += 2
        continue
      }
    }

    // 1文字をチェック
    const oneChar = hiraganaText[i]
    if (oneChar && HIRAGANA_TO_ROMAJI[oneChar]) {
      result += HIRAGANA_TO_ROMAJI[oneChar][0] // 第一候補を使用
    } else {
      // 変換できない文字はそのまま
      result += oneChar
    }
    i += 1
  }

  return result
}

// 文字列を文字単位に分割（ローマ字変換も含む）
export interface CharacterWithRomaji {
  hiragana: string
  romaji: string[] // 複数パターン対応
  primaryRomaji: string // 表示用のメインパターン
}

export const convertTextToCharactersWithRomaji = (
  text: string,
): CharacterWithRomaji[] => {
  const characters: CharacterWithRomaji[] = []
  let i = 0

  while (i < text.length) {
    // 3文字の拗音を先にチェック
    if (i + 2 < text.length) {
      const threeChar = text.slice(i, i + 3)
      const hiraganaThree = katakanaToHiragana(threeChar)
      const romajiPatterns = HIRAGANA_TO_ROMAJI[hiraganaThree]
      if (romajiPatterns && romajiPatterns.length > 0) {
        characters.push({
          hiragana: threeChar,
          romaji: romajiPatterns,
          primaryRomaji: romajiPatterns[0] || '',
        })
        i += 3
        continue
      }
    }

    // 2文字の拗音をチェック
    if (i + 1 < text.length) {
      const twoChar = text.slice(i, i + 2)
      const hiraganaTwo = katakanaToHiragana(twoChar)
      const romajiPatterns = HIRAGANA_TO_ROMAJI[hiraganaTwo]
      if (romajiPatterns && romajiPatterns.length > 0) {
        characters.push({
          hiragana: twoChar,
          romaji: romajiPatterns,
          primaryRomaji: romajiPatterns[0] || '',
        })
        i += 2
        continue
      }
    }

    // 1文字をチェック
    const oneChar = text[i]
    const hiraganaOne = katakanaToHiragana(oneChar || '')
    const romajiPatterns = HIRAGANA_TO_ROMAJI[hiraganaOne]

    characters.push({
      hiragana: oneChar || '',
      romaji:
        romajiPatterns && romajiPatterns.length > 0
          ? romajiPatterns
          : [oneChar || ''],
      primaryRomaji:
        romajiPatterns && romajiPatterns.length > 0
          ? romajiPatterns[0] || ''
          : oneChar || '',
    })
    i += 1
  }

  return characters
}
