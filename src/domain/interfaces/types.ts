/*****
 License
 --------------
 Copyright © 2020-2025 Mojaloop Foundation
 The Mojaloop files are made available by the Mojaloop Foundation under the Apache License, Version 2.0 (the "License") and you may not use these files except in compliance with the License. You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, the Mojaloop files are distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

 Contributors
 --------------
 This is the official list of the Mojaloop project contributors for this file.
 Names of the original copyright holders (individuals or organizations)
 should be listed with a '*' in the first column. People who have
 contributed from an organization can be listed under the organization
 that actually holds the copyright for their contributions (see the
 Mojaloop Foundation for an example). Those individuals should have
 their names indented and be marked with a '-'. Email address can be added
 optionally within square brackets <email>.

 * Mojaloop Foundation
 - Name Surname <name.surname@mojaloop.io>



 - Okello Ivan Elijah <elijahokello90@gmail.com>

 --------------
 ******/

'use strict';

import { SDKSchemeAdapter } from '@mojaloop/api-snippets';
import { AxiosRequestConfig, CreateAxiosDefaults } from 'axios';
import { ILogger } from './infrastructure';
import { components } from '@mojaloop/api-snippets/lib/sdk-scheme-adapter/v2_1_0/backend/openapi';
import {components as OutboundComponents } from "@mojaloop/api-snippets/lib/sdk-scheme-adapter/v2_1_0/outbound/openapi";
import { components as fspiopComponents } from '@mojaloop/api-snippets/lib/fspiop/v2_0/openapi';

export type TJson = string | number | boolean | { [x: string]: TJson } | Array<TJson>;

export type THttpRequestOptions = Omit<AxiosRequestConfig, 'url' | 'method'>;

export type THttpClientDeps = {
    options: CreateAxiosDefaults;
    logger: ILogger;
};

export type TQuoteRequest = SDKSchemeAdapter.V2_0_0.Backend.Types.quoteRequest;

export type TQuoteResponse = {
    expiration?: components['schemas']['timestamp'];
    extensionList?: components['schemas']['extensionList'];
    geoCode?: components['schemas']['geoCode'];
    payeeFspCommissionAmount?: components['schemas']['money'];
    payeeFspCommissionAmountCurrency?: components['schemas']['currency'];
    payeeFspFeeAmount: components['schemas']['money'];
    payeeFspFeeAmountCurrency?: components['schemas']['currency'];
    payeeReceiveAmount: components['schemas']['money'];
    payeeReceiveAmountCurrency?: components['schemas']['currency'];
    quoteId: components['schemas']['quoteId'];
    transactionId: components['schemas']['transactionId'];
    transferAmount: components['schemas']['money'];
    transferAmountCurrency: components['schemas']['currency'];
};

export type TtransferRequest = {
    /** @description Linked homeR2PTransactionId which was generated as part of POST /requestToPay to SDK incase of requestToPay transfer. */
    homeR2PTransactionId?: string;
    amount: components['schemas']['money'];
    amountType: components['schemas']['amountType'];
    currency: components['schemas']['currency'];
    from: components['schemas']['transferParty'];
    ilpPacket: {
        data: components['schemas']['ilpPacketData'];
    };
    note?: string;
    quote: TQuoteResponse;
    quoteRequestExtensions?: components['schemas']['extensionList'];
    subScenario?: components['schemas']['TransactionSubScenario'];
    to: components['schemas']['transferParty'];
    transactionType: components['schemas']['transactionType'];
    transferId: components['schemas']['transferId'];
    transactionRequestId?: components['schemas']['transactionRequestId'];
};

export type THttpResponse<R> = {
    data: R;
    statusCode: number;
    error?: Error;
};

export type TRequestOptions = {
    payload?: unknown | undefined;
    timeout_ms?: number;
    method?: string;
    headers?: unknown | undefined;
};

export type TtransferResponse = SDKSchemeAdapter.V2_0_0.Backend.Types.transferResponse;

export type Payee = {
    dateOfBirth?: string;
    displayName: string;
    extensionList?: unknown[];
    firstName: string;
    fspId?: string;
    idSubValue?: string;
    idType: string;
    idValue: string;
    lastName: string;
    merchantClassificationCode?: string;
    middleName: string;
    type: string;
    supportedCurrencies: string;
    kycInformation: string;
};

export type Transfer = {
    completedTimestamp: string;
    fulfilment: string;
    homeTransactionId: string;
    transferState: string;
};

export type TLookupPartyInfoResponse = THttpResponse<Payee>;

export type TtransferPatchNotificationRequest = {
    currentState?: OutboundComponents['schemas']['transferStatus'];
    /** @enum {string} */
    direction?: 'INBOUND';
    finalNotification?: {
        completedTimestamp: components['schemas']['timestamp'];
        extensionList?: components['schemas']['extensionList'];
        transferState: components['schemas']['transferState'];
    };
    fulfil?: {
        body?: Record<string, never>;
        headers?: Record<string, never>;
    };
    initiatedTimestamp?: components['schemas']['timestamp'];
    lastError?: components['schemas']['transferError'];
    prepare?: {
        body?: Record<string, never>;
        headers?: Record<string, never>;
    };
    quote?: {
        fulfilment?: string;
        internalRequest?: Record<string, never>;
        mojaloopResponse?: Record<string, never>;
        request?: Record<string, never>;
        response?: Record<string, never>;
    };
    quoteRequest?: {
        body: fspiopComponents['schemas']['QuotesPostRequest'];
        headers?: Record<string, never>;
    };
    quoteResponse?: {
        body?: Record<string, never>;
        headers?: Record<string, never>;
    };
    transferId?: components['schemas']['transferId'];
};
