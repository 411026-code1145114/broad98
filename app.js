const storageKey = 'vocabCardsData';
const defaultWords = [
  {
    word: 'adapt',
    translation: '適應，調整',
    pos: '動詞',
    example: 'We must adapt to the new schedule.',
    root: 'ad- (to) + apt (fit) = 適應',
  },
  {
    word: 'blend',
    translation: '混合，融合',
    pos: '動詞 / 名詞',
    example: 'The chef can blend many flavors smoothly.',
    root: 'blend = mix, 合併、混合',
  },
];

const elements = {
  tabButtons: document.querySelectorAll('.tab-btn'),
  flashcard: document.getElementById('flashcard'),
  cardWord: document.getElementById('card-word'),
  cardTranslation: document.getElementById('card-translation'),
  cardPos: document.getElementById('card-pos'),
  cardExample: document.getElementById('card-example'),
  cardRoot: document.getElementById('card-root'),
  prevCard: document.getElementById('prev-card'),
  nextCard: document.getElementById('next-card'),
  wordList: document.getElementById('word-list'),
  wordCount: document.getElementById('word-count'),
  managerList: document.getElementById('manager-list'),
  inputWord: document.getElementById('input-word'),
  inputTranslation: document.getElementById('input-translation'),
  inputPos: document.getElementById('input-pos'),
  inputExample: document.getElementById('input-example'),
  inputRoot: document.getElementById('input-root'),
  autoFill: document.getElementById('auto-fill'),
  saveWord: document.getElementById('save-word'),
  clearForm: document.getElementById('clear-form'),
  toast: document.getElementById('toast'),
};

let cards = [];
let currentIndex = 0;
let toastTimeout = null;

function loadCards() {
  const stored = localStorage.getItem(storageKey);
  if (!stored) {
    cards = [...defaultWords];
    return;
  }
  try {
    const parsed = JSON.parse(stored);
    cards = Array.isArray(parsed) && parsed.length ? parsed : [...defaultWords];
  } catch (error) {
    cards = [...defaultWords];
  }
}

function saveCards() {
  localStorage.setItem(storageKey, JSON.stringify(cards));
}

function showToast(message) {
  if (toastTimeout) {
    clearTimeout(toastTimeout);
  }
  elements.toast.textContent = message;
  elements.toast.classList.add('show');
  toastTimeout = setTimeout(() => {
    elements.toast.classList.remove('show');
  }, 2500);
}

function getCurrentCard() {
  if (!cards.length) return null;
  return cards[currentIndex];
}

function updateFlashcardView() {
  const card = getCurrentCard();
  const flashcard = elements.flashcard;
  flashcard.classList.remove('flipped');
  if (!card) {
    elements.cardWord.textContent = '尚無單字';
    elements.cardTranslation.textContent = '請新增單字。';
    elements.cardPos.textContent = '-';
    elements.cardExample.textContent = '-';
    elements.cardRoot.textContent = '-';
    elements.wordCount.textContent = '0 張';
    return;
  }
  elements.cardWord.textContent = card.word;
  elements.cardTranslation.textContent = card.translation || '無翻譯資料';
  elements.cardPos.textContent = card.pos || '無詞性資料';
  elements.cardExample.textContent = card.example || '無例句資料';
  elements.cardRoot.textContent = card.root || '無字根分析';
  elements.wordCount.textContent = `${cards.length} 張`;
}

function renderList() {
  elements.wordList.innerHTML = '';
  elements.managerList.innerHTML = '';

  cards.forEach((card, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = card.word;
    button.className = 'word-item-button';
    button.addEventListener('click', () => {
      currentIndex = index;
      updateFlashcardView();
      showToast(`已切換至「${card.word}」`);
    });

    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.textContent = '刪除';
    removeButton.addEventListener('click', (event) => {
      event.stopPropagation();
      cards.splice(index, 1);
      if (currentIndex >= cards.length) {
        currentIndex = Math.max(cards.length - 1, 0);
      }
      saveCards();
      updateFlashcardView();
      renderList();
      showToast(`已刪除「${card.word}」`);
    });

    const listItem = document.createElement('li');
    listItem.append(button, removeButton);
    elements.wordList.appendChild(listItem);

    const managerItem = listItem.cloneNode(true);
    const managerButton = managerItem.querySelector('button');
    managerButton.addEventListener('click', () => {
      currentIndex = index;
      updateFlashcardView();
      showToast(`已切換至「${card.word}」`);
    });
    const managerRemove = managerItem.querySelectorAll('button')[1];
    managerRemove.addEventListener('click', (event) => {
      event.stopPropagation();
      cards.splice(index, 1);
      if (currentIndex >= cards.length) {
        currentIndex = Math.max(cards.length - 1, 0);
      }
      saveCards();
      updateFlashcardView();
      renderList();
      showToast(`已刪除「${card.word}」`);
    });
    elements.managerList.appendChild(managerItem);
  });
}

function switchView(viewId) {
  document.querySelectorAll('.view').forEach((section) => {
    section.classList.toggle('active', section.id === viewId);
  });
  elements.tabButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.view === viewId);
  });
}

function analyzeRoot(word) {
  const normalized = word.toLowerCase().trim();
  if (!normalized) return '';
  const common = {
    adapt: 'ad- (to) + apt (fit) = 適應',
    learn: 'learn = 學習',
    blend: 'blend = mix = 混合',
  };
  if (common[normalized]) return common[normalized];
  if (normalized.length <= 6) return `${normalized}：此單字較短，直接記憶詞義即可。`;
  const suffixes = ['ing', 'ion', 'ment', 'able', 'ious', 'ise', 'ize'];
  const found = suffixes.find((suffix) => normalized.endsWith(suffix));
  if (found) {
    return `${normalized.slice(0, -found.length)} + ${found}`;
  }
  return `${normalized[0]}... = 無法自動推斷字根，建議自行補充。`;
}

function fillForm(card) {
  elements.inputWord.value = card.word || '';
  elements.inputTranslation.value = card.translation || '';
  elements.inputPos.value = card.pos || '';
  elements.inputExample.value = card.example || '';
  elements.inputRoot.value = card.root || '';
}

async function autoFillFields() {
  const word = elements.inputWord.value.trim();
  if (!word) {
    showToast('請先輸入英文單字再自動填入。');
    return;
  }

  const defaultRoot = analyzeRoot(word);
  elements.inputRoot.value = defaultRoot;
  showToast('正在自動填入資料，請稍候...');

  const [dictionary, translation] = await Promise.allSettled([
    fetchDictionary(word),
    fetchTranslation(word),
  ]);

  if (dictionary.status === 'fulfilled') {
    const { pos, example } = dictionary.value;
    if (pos) elements.inputPos.value = pos;
    if (example) elements.inputExample.value = example;
  }

  if (translation.status === 'fulfilled' && translation.value) {
    elements.inputTranslation.value = translation.value;
  }

  showToast('自動填入完成，請確認欄位內容。');
}

async function fetchDictionary(word) {
  const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('查無詞典資料');
  }
  const results = await response.json();
  if (!Array.isArray(results) || !results.length) {
    throw new Error('查無詞典資料');
  }
  const entry = results[0];
  const meaning = entry.meanings?.[0];
  const definition = meaning?.definitions?.[0];
  return {
    pos: meaning?.partOfSpeech || '',
    example: definition?.example || '',
  };
}

async function fetchTranslation(word) {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=en|zh-CN`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('翻譯服務錯誤');
  }
  const data = await response.json();
  const translation = data.responseData?.translatedText || '';
  if (!translation) throw new Error('無翻譯結果');
  return translation;
}

function saveFormWord() {
  const word = elements.inputWord.value.trim();
  if (!word) {
    showToast('請輸入英文單字。');
    return;
  }

  const newCard = {
    word,
    translation: elements.inputTranslation.value.trim() || '暫無翻譯',
    pos: elements.inputPos.value.trim() || '暫無詞性',
    example: elements.inputExample.value.trim() || '暫無例句',
    root: elements.inputRoot.value.trim() || analyzeRoot(word),
  };

  const existingIndex = cards.findIndex((item) => item.word.toLowerCase() === word.toLowerCase());
  if (existingIndex >= 0) {
    cards[existingIndex] = newCard;
    currentIndex = existingIndex;
    showToast(`已更新單字「${word}」。`);
  } else {
    cards.push(newCard);
    currentIndex = cards.length - 1;
    showToast(`已新增單字「${word}」。`);
  }

  saveCards();
  updateFlashcardView();
  renderList();
}

function clearForm() {
  elements.inputWord.value = '';
  elements.inputTranslation.value = '';
  elements.inputPos.value = '';
  elements.inputExample.value = '';
  elements.inputRoot.value = '';
}

function initializeEventListeners() {
  elements.tabButtons.forEach((button) => {
    button.addEventListener('click', () => {
      switchView(`${button.dataset.view}-view`);
    });
  });

  elements.flashcard.addEventListener('click', () => {
    elements.flashcard.classList.toggle('flipped');
  });

  elements.flashcard.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      elements.flashcard.classList.toggle('flipped');
    }
  });

  elements.prevCard.addEventListener('click', () => {
    if (cards.length === 0) return;
    currentIndex = (currentIndex - 1 + cards.length) % cards.length;
    updateFlashcardView();
  });

  elements.nextCard.addEventListener('click', () => {
    if (cards.length === 0) return;
    currentIndex = (currentIndex + 1) % cards.length;
    updateFlashcardView();
  });

  elements.autoFill.addEventListener('click', autoFillFields);
  elements.saveWord.addEventListener('click', saveFormWord);
  elements.clearForm.addEventListener('click', clearForm);
}

function init() {
  loadCards();
  initializeEventListeners();
  updateFlashcardView();
  renderList();
}

init();
