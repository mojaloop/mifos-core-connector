/*****
 License
 --------------
 Copyright © 2017 Bill & Melinda Gates Foundation
 The Mojaloop files are made available by the Bill & Melinda Gates Foundation under the Apache License, Version 2.0 (the "License") and you may not use these files except in compliance with the License. You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, the Mojaloop files are distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

 Contributors
 --------------
 This is the official list (alphabetical ordering) of the Mojaloop project contributors for this file.
 Names of the original copyright holders (individuals or organizations)
 should be listed with a '*' in the first column. People who have
 contributed from an organization can be listed under the organization
 that actually holds the copyright for their contributions (see the
 Gates Foundation organization for an example). Those individuals should have
 their names indented and be marked with a '-'. Email address can be added
 optionally within square brackets <email>.


 - Okello Ivan Elijah <elijahokello90@gmail.com>

 --------------
 ******/
'use strict';

import {
    ISDKClient,
    TSDKClientDeps,
    TtransferContinuationRequest,
    TtransferContinuationResponse,
    TtransferRequest,
    TtransferResponse,
} from './types';
import { IHTTPClient, ILogger, THttpResponse } from '../interfaces';
import { SDKClientContinueTransferError, SDKClientInitiateTransferError } from './errors';

export class SDKClient implements ISDKClient {
    private readonly logger: ILogger;
    private readonly httpClient: IHTTPClient;
    private readonly SDK_SCHEME_ADAPTER_BASE_URL: string;

    constructor(deps: TSDKClientDeps) {
        this.logger = deps.logger;
        this.httpClient = deps.httpClient;
        this.SDK_SCHEME_ADAPTER_BASE_URL = deps.schemeAdapterUrl;
    }

    async initiateTransfer(transfer: TtransferRequest): Promise<THttpResponse<TtransferResponse>> {
        this.logger.info('SDKClient initiate transfer %s', transfer);
        try {
            const res = await this.httpClient.post<TtransferRequest, TtransferResponse>(
                `${this.SDK_SCHEME_ADAPTER_BASE_URL}/transfers`,
                transfer,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                },
            );
            if (res.statusCode != 200) {
                this.logger.error('SDKClient initiate transfer failed.', res);
                throw new SDKClientInitiateTransferError();
            }
            return res;
        } catch (error) {
            this.logger.error(error as Error);
            throw new SDKClientInitiateTransferError();
        }
    }

    async updateTransfer(
        transferAccept: TtransferContinuationRequest,
        id: number,
    ): Promise<THttpResponse<TtransferContinuationResponse>> {
        this.logger.info('SDKClient initiate update transfer %s', transferAccept);
        try {
            const res = await this.httpClient.put<TtransferContinuationRequest, TtransferContinuationResponse>(
                `${this.SDK_SCHEME_ADAPTER_BASE_URL}/transfers/${id}`,
                transferAccept,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                },
            );
            if (res.statusCode != 200) {
                this.logger.error('SDKClient initiate update transfer failed.', res);
                throw new SDKClientInitiateTransferError();
            }
            return res;
        } catch (error) {
            this.logger.error(error as Error);
            throw new SDKClientContinueTransferError();
        }
    }
}
