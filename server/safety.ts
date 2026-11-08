// A deliberately small arithmetic language, never JavaScript evaluation.
// Supports numeric literals, post.likes/index/logLikes, + - * / % and parentheses.
export function compileExpression(expression: unknown): (post: Record<string, unknown>) => number {
  if (typeof expression !== 'string' || !expression.trim() || expression.length > 256) {
    throw new Error('Expression must contain 1–256 characters');
  }
  const tokens: string[] = [];
  let offset = 0;
  while (offset < expression.length) {
    if (/\s/.test(expression[offset])) { offset++; continue; }
    const match = /^(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?|^post\.(?:likes|index|logLikes)\b|^[()+\-*/%]/.exec(expression.slice(offset));
    if (!match) throw new Error('Unsupported expression syntax');
    tokens.push(match[0]);
    offset += match[0].length;
    if (tokens.length > 128) throw new Error('Expression is too complex');
  }
  type Evaluate = (post: Record<string, unknown>) => number;
  let cursor = 0;
  const finite = (value: number) => {
    if (!Number.isFinite(value)) throw new Error('Expression must produce a finite number');
    return value;
  };
  function primary(depth: number): Evaluate {
    if (depth > 32) throw new Error('Expression nesting is too deep');
    const token = tokens[cursor++];
    if (token === '+' || token === '-') {
      const operand = primary(depth + 1);
      return post => finite((token === '-' ? -1 : 1) * operand(post));
    }
    if (token === '(') {
      const inner = sum(depth + 1);
      if (tokens[cursor++] !== ')') throw new Error('Missing closing parenthesis');
      return inner;
    }
    if (token?.startsWith('post.')) {
      const key = token.slice(5);
      return post => {
        const value = post[key];
        if (typeof value !== 'number') throw new Error('Invalid post field');
        return finite(value);
      };
    }
    if (!token || !/^(?:\d|\.)/.test(token)) throw new Error('Expected a number or post field');
    const value = finite(Number(token));
    return () => value;
  }
  function product(depth: number): Evaluate {
    let left = primary(depth);
    while (['*', '/', '%'].includes(tokens[cursor])) {
      const operator = tokens[cursor++];
      const right = primary(depth);
      const previous = left;
      left = post => {
        const a = previous(post), b = right(post);
        return finite(operator === '*' ? a * b : operator === '/' ? a / b : a % b);
      };
    }
    return left;
  }
  function sum(depth: number): Evaluate {
    let left = product(depth);
    while (['+', '-'].includes(tokens[cursor])) {
      const operator = tokens[cursor++];
      const right = product(depth);
      const previous = left;
      left = post => finite(operator === '+' ? previous(post) + right(post) : previous(post) - right(post));
    }
    return left;
  }
  const evaluate = sum(0);
  if (cursor !== tokens.length) throw new Error('Unexpected expression token');
  return evaluate;
}

export const MAX_SIMULATED_POSTS = 100;
export function validateSimulation(body: unknown) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('Expected a JSON object');
  const input = body as Record<string, unknown>;
  function numeric(key: string, fallback: number, min: number, max: number): number {
    const value = input[key] === undefined ? fallback : input[key];
    if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) {
      throw new Error(`${key} must be a finite number between ${min} and ${max}`);
    }
    return value;
  }
  const postingFrequencyPerWeek = numeric('postingFrequencyPerWeek', 1.7, 0.2, 7);
  const baselineMedian = numeric('baselineMedian', 145, 10, 1000);
  const includeViralSpike = input.includeViralSpike === undefined ? false : input.includeViralSpike;
  if (typeof includeViralSpike !== 'boolean') throw new Error('includeViralSpike must be a boolean');
  return { postingFrequencyPerWeek, baselineMedian, includeViralSpike };
}
