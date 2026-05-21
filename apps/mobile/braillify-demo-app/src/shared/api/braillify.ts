import { translateToUnicode, translateToBrailleFont } from "braillify";

export function translate(text: string): string {
  return translateToUnicode(text);
}

export function translateToFont(text: string): string {
  return translateToBrailleFont(text);
}
