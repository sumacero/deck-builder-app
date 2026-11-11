import { KEYWORDS } from '../data/glossary';
import type { KeywordId } from '../domain/glossary';

export type KeywordPiece = {
  text: string;
  keywordId?: KeywordId;
};

/** 長い名前を先に当てる。ブロック保持が、ブロックと保持に割れないようにする。 */
const TERMS = Object.values(KEYWORDS).sort((a, b) => b.name.length - a.name.length);

const CJK = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u;

function isCjk(char: string | undefined): boolean {
  return char !== undefined && CJK.test(char);
}

/**
 * 1 文字の用語（段・矢）は、直前が漢字や仮名なら単語の途中なので色を付けない。
 * 「矢を」のように助詞が続くときは色を付ける。
 * 長い用語の途中（矢筒の備え、の中の矢）も、その用語が続いていれば色を付けない。
 */
function rejected(text: string, index: number, name: string): boolean {
  if (name.length === 1 && isCjk(text[index - 1])) return true;
  return TERMS.some(
    (other) =>
      other.name.length > name.length &&
      other.name.startsWith(name) &&
      text.startsWith(other.name.slice(0, name.length + 1), index),
  );
}

/** 説明文を、普通の文と専門用語の断片に分ける。 */
export function splitKeywordText(text: string): KeywordPiece[] {
  const pieces: KeywordPiece[] = [];
  let plain = '';
  let index = 0;
  while (index < text.length) {
    const hit = TERMS.find((entry) => text.startsWith(entry.name, index) && !rejected(text, index, entry.name));
    if (!hit) {
      plain += text[index];
      index += 1;
      continue;
    }
    if (plain) {
      pieces.push({ text: plain });
      plain = '';
    }
    pieces.push({ text: hit.name, keywordId: hit.id });
    index += hit.name.length;
  }
  if (plain) pieces.push({ text: plain });
  return pieces;
}
