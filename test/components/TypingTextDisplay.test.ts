import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import TypingTextDisplay from '~/components/TypingTextDisplay.vue'
import type { CharacterWithRomaji } from '~/utils/romajiConverter'

describe('TypingTextDisplay', () => {
  const mockCharacters: CharacterWithRomaji[] = [
    { hiragana: 'こ', romaji: ['ko'], primaryRomaji: 'ko' },
    { hiragana: 'ん', romaji: ['n'], primaryRomaji: 'n' },
    { hiragana: 'に', romaji: ['ni'], primaryRomaji: 'ni' },
    { hiragana: 'ち', romaji: ['chi'], primaryRomaji: 'chi' },
    { hiragana: 'は', romaji: ['ha'], primaryRomaji: 'ha' },
  ]

  const createWrapper = (props = {}) => {
    return mount(TypingTextDisplay, {
      props: {
        sampleCharacters: mockCharacters,
        typedText: '',
        currentCharacterIndex: 0,
        currentRomajiPosition: 0,
        hasInputError: false,
        isVisible: true,
        ...props,
      },
    })
  }

  describe('表示制御', () => {
    it('isVisibleがfalseの場合、コンポーネントが表示されない', () => {
      const wrapper = createWrapper({ isVisible: false })
      expect(wrapper.find('.bg-gray-50').exists()).toBe(false)
    })

    it('isVisibleがtrueの場合、コンポーネントが表示される', () => {
      const wrapper = createWrapper({ isVisible: true })
      expect(wrapper.find('.bg-gray-50').exists()).toBe(true)
    })
  })

  describe('進捗表示', () => {
    it('初期状態で進捗が0%になる', () => {
      const wrapper = createWrapper()
      const progressText = wrapper.find(
        '.text-xs.text-gray-500 span:last-child',
      )
      expect(progressText.text()).toBe('0%')
    })

    it('文字を入力すると進捗が更新される', () => {
      const wrapper = createWrapper({
        currentCharacterIndex: 2,
        sampleCharacters: mockCharacters,
      })
      const progressText = wrapper.find(
        '.text-xs.text-gray-500 span:last-child',
      )
      expect(progressText.text()).toBe('40%') // 2/5 = 40%
    })

    it('全ての文字を入力すると進捗が100%になる', () => {
      const wrapper = createWrapper({
        currentCharacterIndex: 5,
        sampleCharacters: mockCharacters,
      })
      const progressText = wrapper.find(
        '.text-xs.text-gray-500 span:last-child',
      )
      expect(progressText.text()).toBe('100%')
    })

    it('進捗バーが正しく表示される', () => {
      const wrapper = createWrapper({
        currentCharacterIndex: 2,
        sampleCharacters: mockCharacters,
      })
      const progressBar = wrapper.find('.bg-blue-500.h-2')
      expect(progressBar.exists()).toBe(true)
      expect(progressBar.attributes('style')).toContain('width: 40%')
    })
  })

  describe('文字の状態表示', () => {
    it('正しく入力された文字が緑色で表示される', () => {
      const wrapper = createWrapper({
        currentCharacterIndex: 2,
        sampleCharacters: mockCharacters,
      })

      const correctCharacters = wrapper.findAll('.bg-green-200')
      expect(correctCharacters).toHaveLength(2) // こ、ん
    })

    it('現在入力中の文字が青色で表示される', () => {
      const wrapper = createWrapper({
        currentCharacterIndex: 2,
        sampleCharacters: mockCharacters,
      })

      const currentCharacters = wrapper.findAll('.bg-blue-200')
      expect(currentCharacters).toHaveLength(1) // に
    })

    it('未入力の文字がグレーで表示される', () => {
      const wrapper = createWrapper({
        currentCharacterIndex: 2,
        sampleCharacters: mockCharacters,
      })

      const untypedCharacters = wrapper.findAll('.text-gray-600')
      expect(untypedCharacters.length).toBeGreaterThan(0)
    })
  })

  describe('ローマ字表示', () => {
    it('ローマ字が正しく表示される', () => {
      const wrapper = createWrapper()
      const romajiElements = wrapper.findAll('.text-sm.text-gray-500 span')

      expect(romajiElements[0]?.text()).toBe('ko')
      expect(romajiElements[1]?.text()).toBe('n')
      expect(romajiElements[2]?.text()).toBe('ni')
    })

    it('複数パターンがある場合、他の入力方法が表示される', () => {
      const charactersWithMultiplePatterns: CharacterWithRomaji[] = [
        { hiragana: 'し', romaji: ['shi', 'si'], primaryRomaji: 'shi' },
        { hiragana: 'じ', romaji: ['ji', 'zi'], primaryRomaji: 'ji' },
      ]

      const wrapper = createWrapper({
        sampleCharacters: charactersWithMultiplePatterns,
        currentCharacterIndex: 0,
      })

      const otherPatterns = wrapper.find('.text-gray-500.ml-2')
      expect(otherPatterns.text()).toContain('si')
    })
  })

  describe('入力内容表示', () => {
    it('入力されたテキストが表示される', () => {
      const wrapper = createWrapper({
        typedText: 'kon',
      })

      const typedTextElement = wrapper.find('.text-base.font-mono')
      expect(typedTextElement.text()).toBe('kon')
    })

    it('入力がない場合、プレースホルダーが表示される', () => {
      const wrapper = createWrapper({
        typedText: '',
      })

      const typedTextElement = wrapper.find('.text-base.font-mono')
      expect(typedTextElement.text()).toBe('（ローマ字で入力してください）')
    })
  })

  describe('次の文字のヒント', () => {
    it('現在の文字のヒントが表示される', () => {
      const wrapper = createWrapper({
        currentCharacterIndex: 0,
      })

      const hintElement = wrapper.find('.text-xs.mt-2')
      expect(hintElement.text()).toContain('次の文字: こ')
      expect(hintElement.text()).toContain('ko')
    })

    it('最後の文字の場合はヒントが表示されない', () => {
      const wrapper = createWrapper({
        currentCharacterIndex: 5,
      })

      const hintElement = wrapper.find('.text-xs.mt-2')
      expect(hintElement.exists()).toBe(false)
    })
  })

  describe('エラー表示', () => {
    it('エラーがない場合、エラーメッセージが表示されない', () => {
      const wrapper = createWrapper({
        hasInputError: false,
      })

      const errorMessage = wrapper.find('.text-red-600.mt-1')
      expect(errorMessage.exists()).toBe(false)
    })

    it('エラーがある場合、エラーメッセージが表示される', () => {
      const wrapper = createWrapper({
        hasInputError: true,
      })

      const errorMessage = wrapper.find('.text-red-600.mt-1')
      expect(errorMessage.exists()).toBe(true)
      expect(errorMessage.text()).toContain('❌ 正しい文字を入力してください')
    })

    it('エラー時にヒントが赤色で表示される', () => {
      const wrapper = createWrapper({
        hasInputError: true,
        currentCharacterIndex: 0,
      })

      const hintElement = wrapper.find('.text-xs.mt-2')
      expect(hintElement.classes()).toContain('text-red-600')
    })
  })

  describe('カーソル表示', () => {
    it('現在入力中の位置にカーソルが表示される', () => {
      const wrapper = createWrapper({
        currentCharacterIndex: 0,
      })

      const cursor = wrapper.find('.animate-pulse.bg-blue-500')
      expect(cursor.exists()).toBe(true)
    })

    it('最後の文字の場合はカーソルが表示されない', () => {
      const wrapper = createWrapper({
        currentCharacterIndex: 5,
      })

      const cursor = wrapper.find('.animate-pulse.bg-blue-500')
      expect(cursor.exists()).toBe(false)
    })
  })

  describe('注意事項', () => {
    it('注意事項が表示される', () => {
      const wrapper = createWrapper()

      const notice = wrapper.find('.text-xs.text-gray-500.text-center')
      expect(notice.exists()).toBe(true)
      expect(notice.text()).toContain('この文章は参考用です')
    })
  })

  describe('空のデータ', () => {
    it('空の文字配列の場合、進捗が0%になる', () => {
      const wrapper = createWrapper({
        sampleCharacters: [],
        currentCharacterIndex: 0,
      })

      const progressText = wrapper.find(
        '.text-xs.text-gray-500 span:last-child',
      )
      expect(progressText.text()).toBe('0%')
    })
  })
})
