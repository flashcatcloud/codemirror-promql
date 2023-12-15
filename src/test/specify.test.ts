import chai from 'chai';
import { Completion, CompletionContext } from '@codemirror/autocomplete';
import { createEditorState, mockedMetricsTerms, mockPrometheusServer } from './utils.test';
import {
  aggregateOpModifierTerms,
  aggregateOpTerms,
  atModifierTerms,
  binOpModifierTerms,
  binOpTerms,
  durationTerms,
  variableTerms,
  functionIdentifierTerms,
  matchOpTerms,
  numberTerms,
  snippets,
} from '../complete/promql.terms';
import { newCompleteStrategy } from '../index';

describe('autocomplete promQL test', () => {
  beforeEach(() => {
    mockPrometheusServer();
  });
  const testCases = [
    {
      title: 'offline autocomplete variable for a variable selector',
      expr: 'go[$]',
      pos: 4,
      expectedResult: {
        options: variableTerms,
        from: 4,
        to: 4,
        span: undefined,
      },
    },
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
