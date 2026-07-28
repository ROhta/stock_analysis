// recharts が 3 タブすべてで描画されることを確認する最小の回帰テスト。
//
// 目的は網羅ではなく「チャートが出なくなったことに気付ける」こと。react / react-is /
// recharts の版の組み合わせが壊れると描画が止まりうるが、vite build は通ってしまうため
// ビルド成功では検知できない（react-is が react と版ズレしていた期間もビルドは通っていた）。
//
// jsdom の制約（実測で確認済み）:
// - `.recharts-surface` の数はブラウザと一致する（P/L 5 / B/S 9 / C/F 8）
// - `.recharts-reference-line` も C/F で 4 と一致する
// - 一方 `.recharts-line` と、棒の塗り（Cell）を持つ実体はアニメーション依存のため
//   jsdom では描画されない。ここをアサートすると常に落ちるため対象外とし、
//   ブラウザでの目視確認で担保する
// - `.recharts-bar-rectangle` は描画されるが数はブラウザと異なる（P/L 20 → 5 等）
//
// 以上より「要素種別ごとに 1 つ以上あるか」で判定する。件数を固定するとチャートの
// 体裁変更で落ちて維持されなくなるため、あえて緩めている。
//
// なお jsdom での recharts の描画は 1 回あたり数秒かかる。レンダー回数を増やすと
// テスト時間が線形に伸びるので、1 度描画してタブを巡回する形にまとめている。

import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { FinancialStatements } from '../financialStatements';
import companyData from '../public/kakiyasu2026.json';

// FinancialStatements は companyData を props で受け取るため、?companyData= を解決する
// useCompanyData（fetch 依存）を経由せずに描画できる。テストデータは実データを流用する。
const renderApp = () => render(<FinancialStatements companyData={companyData} />);

const count = (container, selector) => container.querySelectorAll(selector).length;

const expectChartsRendered = (container, tabLabel) => {
  expect(count(container, '.recharts-surface'), `${tabLabel}: surface`).toBeGreaterThan(0);
  expect(count(container, '.recharts-bar-rectangle'), `${tabLabel}: bar`).toBeGreaterThan(0);
  expect(count(container, '.recharts-cartesian-axis'), `${tabLabel}: axis`).toBeGreaterThan(0);
};

afterEach(cleanup);

describe('FinancialStatements のチャート描画', () => {
  it('3 タブすべてでチャートが描画され、C/F では ReferenceLine も出る', () => {
    const { container } = renderApp();
    const clickTab = (name) => fireEvent.click(screen.getByRole('button', { name }));

    // 既定タブは C/F。ReferenceLine は C/F にしか無い。
    expectChartsRendered(container, 'C/F（既定）');
    expect(count(container, '.recharts-reference-line')).toBeGreaterThan(0);

    clickTab('損益計算書 (P/L)');
    expectChartsRendered(container, 'P/L');
    expect(count(container, '.recharts-reference-line')).toBe(0);

    clickTab('貸借対照表 (B/S)');
    expectChartsRendered(container, 'B/S');

    // C/F に戻したときに ReferenceLine が復帰することまで見る。
    clickTab('C/F計算書 (C/F)');
    expectChartsRendered(container, 'C/F（復帰）');
    expect(count(container, '.recharts-reference-line')).toBeGreaterThan(0);
  });

  it('企業名の見出しが表示される', () => {
    renderApp();

    expect(screen.getByRole('heading', { name: companyData.name })).toBeTruthy();
  });
});
