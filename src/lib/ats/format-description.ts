/**
 * Descrição/requisitos de vaga são texto livre digitado ou colado num
 * `<textarea>` — cada quebra de linha é um Enter real da pessoa que
 * escreveu, não quebra visual do navegador. Markdown padrão só separa
 * parágrafos com LINHA EM BRANCO; uma quebra simples vira só um espaço
 * (soft break), o que colapsava a formatação original em texto corrido.
 *
 * Força cada linha não vazia a virar seu próprio parágrafo/item — linhas de
 * lista (`- `, `* `, `1. `) continuam formando UMA lista só mesmo com linha
 * em branco entre elas (CommonMark trata isso como "loose list", não como
 * listas separadas), então marcadores de lista no texto original ainda
 * renderizam como lista de verdade.
 */
export function toMarkdownParagraphs(text: string): string {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n\n");
}
