// Copyright 2021 The Prometheus Authors
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { HybridComplete } from './hybrid';
import { CachedPrometheusClient, HTTPPrometheusClient, PrometheusClient, PrometheusConfig } from '../client/prometheus';
import { CompletionContext, CompletionResult } from '@codemirror/autocomplete';

// Complete is the interface that defines the simple method that returns a CompletionResult.
// Every different completion mode must implement this interface.
export interface CompleteStrategy {
  promQL(context: CompletionContext): Promise<CompletionResult | null> | CompletionResult | null;
}

// CompleteConfiguration should be used to customize the autocompletion.
export interface CompleteConfiguration {
  remote?: PrometheusConfig | PrometheusClient;
  // maxMetricsMetadata is the maximum number of metrics in Prometheus for which metadata is fetched.
  // If the number of metrics exceeds this limit, no metric metadata is fetched at all.
  maxMetricsMetadata?: number;
  // When providing this custom CompleteStrategy, the settings above will not be used.
  completeStrategy?: CompleteStrategy;
  // Extended tag values, such as dashboard variables
  extraLabelValues?: string[];
  // Whether to enable built-in range vector variables, such as `$__interval`
  rangeVectorCompletion?: boolean;
}

function isPrometheusConfig(remoteConfig: PrometheusConfig | PrometheusClient): remoteConfig is PrometheusConfig {
  const cfg = remoteConfig as PrometheusConfig;
  return (
    cfg.url !== undefined ||
    cfg.lookbackInterval !== undefined ||
    cfg.httpErrorHandler !== undefined ||
    cfg.fetchFn !== undefined ||
    cfg.cache !== undefined ||
    cfg.httpMethod !== undefined ||
    cfg.apiPrefix !== undefined
  );
}

export function newCompleteStrategy(conf?: CompleteConfiguration): CompleteStrategy {
  if (conf?.completeStrategy) {
    return conf.completeStrategy;
  }
  if (conf?.remote) {
    if (!isPrometheusConfig(conf.remote)) {
      return new HybridComplete(conf.remote, conf.maxMetricsMetadata);
    }
    return new HybridComplete(
      new CachedPrometheusClient(new HTTPPrometheusClient(conf.remote), conf.remote.cache),
      conf.maxMetricsMetadata,
      conf.extraLabelValues,
      conf.rangeVectorCompletion
    );
  }
  return new HybridComplete(undefined, conf?.maxMetricsMetadata, conf?.extraLabelValues, conf?.rangeVectorCompletion);
}
