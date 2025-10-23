/**
 * js 语法高亮组件，适合在文章中演示代码片段
 */
import React from 'react'

import styles from './HighlightSyntax.module.css'

interface HighlightSyntaxProps {
	code: string
}

// JavaScript/TypeScript 关键字
const keywords =
	'async|await|function|const|let|var|if|else|for|while|return|try|catch|finally|class|extends|from|import|export|default|undefined|throw|break|continue|switch|case|do|with|yield|delete|typeof|void|static|get|set|super|debugger'

// TypeScript 特定关键字
const tsKeywords =
	'interface|type|enum|namespace|module|declare|abstract|implements|public|private|protected|readonly|as|satisfies|infer|keyof|is'

// 布尔值和空值
const literals = 'true|false|null|undefined|NaN|Infinity'

// TypeScript 内置类型
const tsTypes =
	'string|number|boolean|any|unknown|never|void|object|symbol|bigint|Array|Promise|Record|Partial|Required|Readonly|Pick|Omit|Exclude|Extract|NonNullable|ReturnType|Parameters|ConstructorParameters|InstanceType|ThisType|Uppercase|Lowercase|Capitalize|Uncapitalize'

// 语法高亮函数，先整体提取字符串/注释等token再高亮
function highlightSyntax(code: string): string {
	// 先转义HTML特殊字符
	const escaped = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

	// 构建正则模式，包含更多 token 类型
	const pattern = new RegExp(
		'(' +
			// 1. 字符串（双引号、单引号、模板字符串）
			'"([^"\\\\]|\\\\.)*"|' +
			"'([^'\\\\]|\\\\.)*'|" +
			'`([^`\\\\]|\\\\.)*`|' +
			// 2. 注释（单行和多行）
			'//[^\\n]*|' +
			'/\\*[\\s\\S]*?\\*/|' +
			// 3. JSX/TSX 标签
			'</?[A-Z][\\w.]*>|' +
			// 4. 装饰器
			'@[a-zA-Z_$][\\w$]*|' +
			// 5. 数字（包括小数、十六进制、科学计数法）
			'\\b0[xX][0-9a-fA-F]+\\b|' +
			'\\b\\d+\\.?\\d*(?:[eE][+-]?\\d+)?\\b|' +
			// 6. TypeScript/JavaScript 关键字
			'\\b(?:' +
			keywords +
			'|' +
			tsKeywords +
			'|' +
			literals +
			')\\b|' +
			// 7. TypeScript 内置类型
			'\\b(?:' +
			tsTypes +
			')\\b|' +
			// 8. 箭头函数
			'=>|' +
			// 9. 泛型尖括号（简化处理）
			'<[A-Z][\\w, ]*>|' +
			// 10. 函数调用（函数名后跟括号）
			'\\b[a-zA-Z_$][\\w$]*(?=\\()|' +
			// 11. 属性访问
			'\\.[a-zA-Z_$][\\w$]*|' +
			// 12. JSON 属性名（引号包裹的key）
			'"([^"\\\\]|\\\\.)*"(?=\\s*:)|' +
			// 13. 运算符和特殊符号
			'[+\\-*/%&|^!~<>=?:]+|' +
			'[{}\\[\\]();,.]' +
			')',
		'g'
	)

	const tokens: string[] = []
	let lastIndex = 0
	let match: RegExpExecArray | null
	while ((match = pattern.exec(escaped)) !== null) {
		if (match.index > lastIndex) {
			const gap = escaped.slice(lastIndex, match.index)
			// 将间隙按空白符分割，保留空白符
			tokens.push(...gap.split(/(\s+)/))
		}
		tokens.push(match[0])
		lastIndex = pattern.lastIndex
	}
	if (lastIndex < escaped.length) {
		tokens.push(...escaped.slice(lastIndex).split(/(\s+)/))
	}

	const highlighted = tokens
		.map((token) => {
			// 空白符直接返回
			if (/^\s+$/.test(token)) {
				return token
			}

			// 1. 注释（单行和多行）
			if (/^\/\/.*$/.test(token) || /^\/\*[\s\S]*?\*\/$/.test(token)) {
				return `<span class="${styles.comment}">${token}</span>`
			}

			// 2. 字符串（包括 JSON 属性名）
			if (
				/^"([^"\\]|\\.)*"$/.test(token) ||
				/^'([^'\\]|\\.)*'$/.test(token) ||
				/^`([^`\\]|\\.)*`$/.test(token)
			) {
				return `<span class="${styles.string}">${token}</span>`
			}

			// 3. 数字
			if (/^(0[xX][0-9a-fA-F]+|\d+\.?\d*(?:[eE][+-]?\d+)?)$/.test(token)) {
				return `<span class="${styles.number}">${token}</span>`
			}

			// 4. 布尔值和特殊字面量
			if (new RegExp(`^(?:${literals})$`).test(token)) {
				return `<span class="${styles.literal}">${token}</span>`
			}

			// 5. JavaScript/TypeScript 关键字
			if (new RegExp(`^(?:${keywords})$`).test(token)) {
				return `<span class="${styles.keyword}">${token}</span>`
			}

			// 6. TypeScript 特定关键字
			if (new RegExp(`^(?:${tsKeywords})$`).test(token)) {
				return `<span class="${styles.tsKeyword}">${token}</span>`
			}

			// 7. TypeScript 内置类型
			if (new RegExp(`^(?:${tsTypes})$`).test(token)) {
				return `<span class="${styles.type}">${token}</span>`
			}

			// 8. 装饰器
			if (/^@[a-zA-Z_$][\w$]*$/.test(token)) {
				return `<span class="${styles.decorator}">${token}</span>`
			}

			// 9. JSX/TSX 标签
			if (/^<\/?[A-Z][\w.]*>$/.test(token)) {
				return `<span class="${styles.jsxTag}">${token}</span>`
			}

			// 10. 箭头函数
			if (token === '=>') {
				return `<span class="${styles.arrow}">${token}</span>`
			}

			// 11. 函数调用
			if (/^[a-zA-Z_$][\w$]*$/.test(token)) {
				// 简单检测：如果下一个非空token是括号，可能是函数调用
				return `<span class="${styles.identifier}">${token}</span>`
			}

			// 12. 属性访问
			if (/^\.[a-zA-Z_$][\w$]*$/.test(token)) {
				return `<span class="${styles.property}">${token}</span>`
			}

			// 13. 运算符
			if (/^[+\-*/%&|^!~<>=?:]+$/.test(token)) {
				return `<span class="${styles.operator}">${token}</span>`
			}

			// 14. 其他符号直接返回
			return token
		})
		.join('')

	return highlighted
}

const HighlightSyntaxClient: React.FC<HighlightSyntaxProps> = ({ code }) => {
	const htmlContent = highlightSyntax(code)

	// eslint-disable-next-line react-dom/no-dangerously-set-innerhtml
	return <code className={styles.syntax} dangerouslySetInnerHTML={{ __html: htmlContent }} />
}

export default HighlightSyntaxClient
