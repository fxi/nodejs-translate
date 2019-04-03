/**
 * Copyright 2019, Google, Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const {assert} = require('chai');
const {TranslationServiceClient} = require('@google-cloud/translate').v3beta1;
const {Storage} = require('@google-cloud/storage');
const execa = require('execa');
const uuid = require('uuid');
const exec = async cmd => (await execa.shell(cmd)).stdout;

const REGION_TAG = 'translate_batch_translate_text_beta';

describe(REGION_TAG, () => {
  const translationClient = new TranslationServiceClient();
  const location = 'us-central1';
  const bucketUuid = uuid.v4();

  it('should batch translate the input text', async () => {
    const projectId = await translationClient.getProjectId();
    const inputUri = `gs://cloud-samples-data/translation/text.txt`;
    const bucketName = `translation-${bucketUuid}/BATCH_TRANSLATION_OUTPUT/`;
    const outputUri = `gs://${projectId}/${bucketName}`;
    const output = await exec(
      `node v3beta1/${REGION_TAG}.js ${projectId} ${location} ${inputUri} ${outputUri}`
    );
    assert.match(output, /Total Characters: 13/);
    assert.match(output, /Translated Characters: 13/);
  }).timeout(90000);

  // Delete the folder from GCS for cleanup
  after(async function() {
    this.timeout(10000);
    const projectId = await translationClient.getProjectId();
    const options = {
      prefix: `translation-${bucketUuid}`,
    };
    const storage = new Storage();
    const bucket = await storage.bucket(projectId);
    const [files] = await bucket.getFiles(options);
    await Promise.all(files.map(file => file.delete()));
  });
});
