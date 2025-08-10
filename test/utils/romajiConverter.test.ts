import { describe, expect, it } from 'vitest'
import {
  type CharacterWithRomaji,
  convertTextToCharactersWithRomaji,
  convertToRomaji,
} from '~/utils/romajiConverter'

describe('romajiConverter', () => {
  describe('convertToRomaji', () => {
    it('ひらがなをローマ字に変換する', () => {
      expect(convertToRomaji('あいうえお')).toBe('aiueo')
      expect(convertToRomaji('かきくけこ')).toBe('kakikukeko')
      expect(convertToRomaji('さしすせそ')).toBe('sashisuseso')
    })

    it('カタカナをローマ字に変換する', () => {
      expect(convertToRomaji('アイウエオ')).toBe('aiueo')
      expect(convertToRomaji('カキクケコ')).toBe('kakikukeko')
      expect(convertToRomaji('サシスセソ')).toBe('sashisuseso')
    })

    it('濁音・半濁音を正しく変換する', () => {
      expect(convertToRomaji('がぎぐげご')).toBe('gagigugego')
      expect(convertToRomaji('ざじずぜぞ')).toBe('zajizuzezo')
      expect(convertToRomaji('だぢづでど')).toBe('dajizudedo')
      expect(convertToRomaji('ばびぶべぼ')).toBe('babibubebo')
      expect(convertToRomaji('ぱぴぷぺぽ')).toBe('papipupepo')
    })

    it('拗音を正しく変換する', () => {
      expect(convertToRomaji('きゃきゅきょ')).toBe('kyakyukyo')
      expect(convertToRomaji('しゃしゅしょ')).toBe('shashusho')
      expect(convertToRomaji('ちゃちゅちょ')).toBe('chachucho')
      expect(convertToRomaji('にゃにゅにょ')).toBe('nyanyunyo')
      expect(convertToRomaji('ひゃひゅひょ')).toBe('hyahyuhyo')
      expect(convertToRomaji('みゃみゅみょ')).toBe('myamyumyo')
      expect(convertToRomaji('りゃりゅりょ')).toBe('ryaryuryo')
      expect(convertToRomaji('ぎゃぎゅぎょ')).toBe('gyagyugyo')
      expect(convertToRomaji('じゃじゅじょ')).toBe('jajujo')
      expect(convertToRomaji('びゃびゅびょ')).toBe('byabyubyo')
      expect(convertToRomaji('ぴゃぴゅぴょ')).toBe('pyapyupyo')
    })

    it('特殊文字を正しく変換する', () => {
      expect(convertToRomaji('ー')).toBe('-')
      expect(convertToRomaji('。')).toBe('.')
      expect(convertToRomaji('、')).toBe(',')
      expect(convertToRomaji('！')).toBe('!')
      expect(convertToRomaji('？')).toBe('?')
      expect(convertToRomaji('（')).toBe('(')
      expect(convertToRomaji('）')).toBe(')')
      expect(convertToRomaji('「')).toBe('"')
      expect(convertToRomaji('」')).toBe('"')
      expect(convertToRomaji(' ')).toBe(' ')
      expect(convertToRomaji('　')).toBe(' ')
    })

    it('変換できない文字はそのまま返す', () => {
      expect(convertToRomaji('abc123')).toBe('abc123')
      expect(convertToRomaji('あaいbう')).toBe('aaibu')
    })

    it('空文字列を処理する', () => {
      expect(convertToRomaji('')).toBe('')
    })

    it('長い文章を正しく変換する', () => {
      const text = 'こんにちは、お元気ですか？'
      const expected = 'konnichiha,o元気desuka?'
      expect(convertToRomaji(text)).toBe(expected)
    })
  })

  describe('convertTextToCharactersWithRomaji', () => {
    it('文字列を文字単位に分割してローマ字情報を付与する', () => {
      const result = convertTextToCharactersWithRomaji('あいう')
      expect(result).toHaveLength(3)
      expect(result[0]).toEqual({
        hiragana: 'あ',
        romaji: ['a'],
        primaryRomaji: 'a',
      })
      expect(result[1]).toEqual({
        hiragana: 'い',
        romaji: ['i'],
        primaryRomaji: 'i',
      })
      expect(result[2]).toEqual({
        hiragana: 'う',
        romaji: ['u'],
        primaryRomaji: 'u',
      })
    })

    it('複数パターンがある文字を正しく処理する', () => {
      const result = convertTextToCharactersWithRomaji('しじ')
      expect(result[0]).toEqual({
        hiragana: 'し',
        romaji: ['shi', 'si'],
        primaryRomaji: 'shi',
      })
      expect(result[1]).toEqual({
        hiragana: 'じ',
        romaji: ['ji', 'zi'],
        primaryRomaji: 'ji',
      })
    })

    it('拗音を正しく処理する', () => {
      const result = convertTextToCharactersWithRomaji('きゃきゅきょ')
      expect(result).toHaveLength(3)
      expect(result[0]).toEqual({
        hiragana: 'きゃ',
        romaji: ['kya'],
        primaryRomaji: 'kya',
      })
      expect(result[1]).toEqual({
        hiragana: 'きゅ',
        romaji: ['kyu'],
        primaryRomaji: 'kyu',
      })
      expect(result[2]).toEqual({
        hiragana: 'きょ',
        romaji: ['kyo'],
        primaryRomaji: 'kyo',
      })
    })

    it('カタカナを正しく処理する', () => {
      const result = convertTextToCharactersWithRomaji('アイウ')
      expect(result).toHaveLength(3)
      expect(result[0]).toEqual({
        hiragana: 'ア',
        romaji: ['a'],
        primaryRomaji: 'a',
      })
      expect(result[1]).toEqual({
        hiragana: 'イ',
        romaji: ['i'],
        primaryRomaji: 'i',
      })
      expect(result[2]).toEqual({
        hiragana: 'ウ',
        romaji: ['u'],
        primaryRomaji: 'u',
      })
    })

    it('変換できない文字はそのまま返す', () => {
      const result = convertTextToCharactersWithRomaji('あaい')
      expect(result).toHaveLength(3)
      expect(result[0]).toEqual({
        hiragana: 'あ',
        romaji: ['a'],
        primaryRomaji: 'a',
      })
      expect(result[1]).toEqual({
        hiragana: 'a',
        romaji: ['a'],
        primaryRomaji: 'a',
      })
      expect(result[2]).toEqual({
        hiragana: 'い',
        romaji: ['i'],
        primaryRomaji: 'i',
      })
    })

    it('空文字列を処理する', () => {
      const result = convertTextToCharactersWithRomaji('')
      expect(result).toEqual([])
    })

    it('長い文章を正しく処理する', () => {
      const text = 'こんにちは'
      const result = convertTextToCharactersWithRomaji(text)
      expect(result).toHaveLength(5)
      expect(result[0]).toEqual({
        hiragana: 'こ',
        romaji: ['ko'],
        primaryRomaji: 'ko',
      })
      expect(result[4]).toEqual({
        hiragana: 'は',
        romaji: ['ha'],
        primaryRomaji: 'ha',
      })
    })
  })
})
