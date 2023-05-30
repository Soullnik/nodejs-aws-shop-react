#!/usr/bin/env node
import 'source-map-support/register';
import { App, Stack } from 'aws-cdk-lib';
import { StaticSite } from './static-site';


class StaticSiteStack extends Stack {
    constructor(parent: App, name: string) {
        super(parent, name)

        new StaticSite(this, name)
    }
}

const app = new App();

new StaticSiteStack(app, 'StaticSiteStack');

app.synth();