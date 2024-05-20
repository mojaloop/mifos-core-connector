/*****
 License
 --------------
 Copyright © 2017 Bill & Melinda Gates Foundation
 The Mojaloop files are made available by the Bill & Melinda Gates Foundation under the Apache License, Version 2.0 (the "License") and you may not use these files except in compliance with the License. You may obtain a copy of the License at
 http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, the Mojaloop files are distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

 Contributors
 --------------
 This is the official list of the Mojaloop project contributors for this file.
 Names of the original copyright holders (individuals or organizations)
 should be listed with a '*' in the first column. People who have
 contributed from an organization can be listed under the organization
 that actually holds the copyright for their contributions (see the
 Gates Foundation organization for an example). Those individuals should have
 their names indented and be marked with a '-'. Email address can be added
 optionally within square brackets <email>.
 * Gates Foundation
 - Name Surname <name.surname@gatesfoundation.com>

 * Eugen Klymniuk <eugen.klymniuk@infitx.com>
 --------------
 **********/

import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import {CoreConnectorAggregate, ValidationError} from '../../../src/domain';
import { FineractClientFactory } from '../../../src/domain/FineractClient';
import {SDKClientError, SDKClientFactory} from '../../../src/domain/SDKClient';
import { AxiosClientFactory } from '../../../src/infra/axiosHttpClient';
import { loggerFactory } from '../../../src/infra/logger';
import config from '../../../src/config';
import * as fixtures from '../../fixtures';

const mockAxios = new MockAdapter(axios);
const logger = loggerFactory({ context: 'ccAgg tests' });
const fineractConfig = config.get('fineract');
const SDK_URL = 'http://localhost:4040';

describe('CoreConnectorAggregate Tests -->', () => {
  let ccAggregate: CoreConnectorAggregate;
  let fineractClient: any;

  beforeEach(() => {
    mockAxios.reset();
    const httpClient = AxiosClientFactory.createAxiosClientInstance();
    const sdkClient = SDKClientFactory.getSDKClientInstance(logger, httpClient, SDK_URL);
    fineractClient = FineractClientFactory.createClient({
      fineractConfig,
      httpClient,
      logger,
    });
    ccAggregate = new CoreConnectorAggregate(fineractConfig, fineractClient, sdkClient, logger);
  });

  describe('updateSentTransfer Method Tests -->', () => {
    beforeEach(() => {
      fineractClient.getSavingsAccount = jest.fn().mockResolvedValue({
        statusCode: 200,
        data: fixtures.fineractGetAccountResponseDto(),
      });
      fineractClient.sendTransfer = jest.fn().mockResolvedValue({
        statusCode: 200,
        data: fixtures.fineractTransactionResponseDto(),
      });
    });

    test('should re-throw SDKClientError if sdkClient.updateTransfer() fails', async () => {
      fineractClient.receiveTransfer = jest.fn().mockResolvedValue({
        statusCode: 200,
      });
      const httpCode = 500;
      mockAxios.onAny().reply(httpCode, {}); // mocking sdkClient.updateTransfer() failure

      try {
        await ccAggregate.updateSentTransfer(fixtures.transferAcceptDto());
        throw new Error('Test failed');
      } catch (err) {
        expect(err).toBeInstanceOf(SDKClientError);
        expect((err as SDKClientError).httpCode).toBe(httpCode);
      }
    });

    test('should re-throw refundFailedError if fineractClient.receiveTransfer() fails', async () => {
      fineractClient.receiveTransfer = jest.fn().mockResolvedValue({
        statusCode: 500,
      });

      const transferAccept = fixtures.transferAcceptDto();
      try {
        await ccAggregate.updateSentTransfer(transferAccept);
        throw new Error('Test failed');
      } catch (err: any) {
        expect(err).toBeInstanceOf(ValidationError);
        const refundFailedError = ValidationError.refundFailedError({
          amount: transferAccept.fineractTransaction.totalAmount,
          fineractAccountId: transferAccept.fineractTransaction.fineractAccountId,
        });
        expect(err).toEqual(refundFailedError);
      }
    });
  });
});
