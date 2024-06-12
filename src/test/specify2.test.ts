import chai from 'chai';
import { CompletionContext } from '@codemirror/autocomplete';
import { createEditorState, mockPrometheusServer } from './utils.test';
import { newCompleteStrategy } from '../index';

describe('labelMatchers 关联', () => {
  beforeEach(() => {
    mockPrometheusServer();
  });
  const testCases = [
    {
      title: 'ident 的 values 应该受到 busigroup 的影响',
      expr: "cpu_usage_idle{busigroup='defaultbusigroup',}",
      pos: 44,
      conf: { remote: { url: 'http://10.99.1.107:9090' } },
      expectedResult: {
        options: [
          {
            label: 'cpu',
            type: 'constant',
          },
          {
            label: 'ident',
            type: 'constant',
          },
        ],
        from: 44,
        to: 44,
        span: /^[a-zA-Z0-9_:]+$/,
      },
    },
    // {
    //   title: 'ident 的 values 应该受到 busigroup 的影响',
    //   expr: "cpu_usage_idle{busigroup='defaultbusigroup',ident=''}",
    //   pos: 51,
    //   conf: { remote: { url: 'http://10.99.1.107:9090' } },
    //   expectedResult: {
    //     options: [
    //       {
    //         label: 'dev-backup-01',
    //         type: 'text',
    //       },
    //     ],
    //     from: 51,
    //     to: 51,
    //     span: /^[a-zA-Z0-9_:]+$/,
    //   },
    // },
  ];
  testCases.forEach((value) => {
    it(value.title, async () => {
      const state = createEditorState(value.expr);
      const context = new CompletionContext(state, value.pos, true);
      const completion = newCompleteStrategy(value.conf);
      const result = await completion.promQL(context);
      chai.expect(value.expectedResult).to.deep.equal(result);
    });
  });
});
