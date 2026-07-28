// recharts をテスト環境（jsdom）で描画させるための最小セットアップ。
//
// 全チャートが <ResponsiveContainer width="100%" height={350}> を使うが、jsdom は
// レイアウトを計算しないため要素の寸法が常に 0 になる。recharts は幅 0 を「描画不能」と
// みなして中身を出さないので、そのままだとチャートが空になりテストが常に落ちる。
// 実ブラウザ相当の寸法を返すよう ResizeObserver と寸法系プロパティを差し替える。

const WIDTH = 800;
const HEIGHT = 350;

// recharts の ResponsiveContainer は ResizeObserver で寸法を取得する。
// jsdom には実装が無いため、observe された時点で固定サイズを 1 度通知するだけのものを置く。
globalThis.ResizeObserver = class ResizeObserver {
  constructor(callback) {
    this.callback = callback;
  }

  observe(target) {
    this.callback([{ target, contentRect: { width: WIDTH, height: HEIGHT } }], this);
  }

  unobserve() {}

  disconnect() {}
};

// ResponsiveContainer は offsetWidth / getBoundingClientRect も参照する。
for (const [prop, value] of [
  ['offsetWidth', WIDTH],
  ['offsetHeight', HEIGHT],
  ['clientWidth', WIDTH],
  ['clientHeight', HEIGHT],
]) {
  Object.defineProperty(HTMLElement.prototype, prop, { configurable: true, value });
}

HTMLElement.prototype.getBoundingClientRect = function getBoundingClientRect() {
  return {
    width: WIDTH,
    height: HEIGHT,
    top: 0,
    left: 0,
    right: WIDTH,
    bottom: HEIGHT,
    x: 0,
    y: 0,
    toJSON() {},
  };
};
