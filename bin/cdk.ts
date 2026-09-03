#!/usr/bin/env node
import { App } from 'aws-cdk-lib/core';
import { Environments } from '../config/environments';
import { PipelineStack } from '../lib/pipeline-stack';

const app = new App();

const pipelineStack = new PipelineStack(app, 'WorkbenchggPipelineStack', {
  env: {
    account: Environments.Root.id,
    region: Environments.Root.region,
  },
});

app.synth();