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

import { SDKSchemeAdapter } from '@mojaloop/api-snippets';
import { IHTTPClient, ILogger, THttpResponse } from '../interfaces';
import { components } from '@mojaloop/api-snippets/lib/sdk-scheme-adapter/v2_0_0/outbound/openapi';

export type TSDKSchemeAdapterConfig = {
    SDK_BASE_URL: string;
};

export type TFineractTransferParty = {
    fineractAccountId: number;
    payer: components['schemas']['transferParty'];
};

export type TFineractOutboundTransferRequest = {
    homeTransactionId: string;
    from: TFineractTransferParty;
    to: components['schemas']['transferParty'];
    amountType: components['schemas']['AmountType'];
    currency: components['schemas']['Currency'];
    amount: components['schemas']['Amount'];
    transactionType: components['schemas']['transferTransactionType'];
    subScenario?: components['schemas']['TransactionSubScenario'];
    note?: components['schemas']['Note'];
    quoteRequestExtensions?: components['schemas']['extensionListEmptiable'];
    transferRequestExtensions?: components['schemas']['extensionListEmptiable'];
    skipPartyLookup?: boolean;
};

export type TSDKOutboundTransferRequest = SDKSchemeAdapter.V2_0_0.Outbound.Types.transferRequest;

export type TFineractOutboundTransferResponse = {
    totalAmountFromFineract: number;
    transferResponse: SDKSchemeAdapter.V2_0_0.Outbound.Types.transferResponse;
};

export type TFineractTransferContinuationRequest = {
    transferContinuationAccept:
        | SDKSchemeAdapter.V2_0_0.Outbound.Types.transferContinuationAcceptParty
        | SDKSchemeAdapter.V2_0_0.Outbound.Types.transferContinuationAcceptQuote;
    fineractAccountId: number;
};

export type TSDKTransferContinuationRequest =
    | SDKSchemeAdapter.V2_0_0.Outbound.Types.transferContinuationAcceptParty
    | SDKSchemeAdapter.V2_0_0.Outbound.Types.transferContinuationAcceptQuote;

export type TUpdateTransferDeps = {
    fineractTransaction: {
        fineractAccountId: number | string;
        totalAmount: number;
        routingCode: string;
        receiptNumber: string;
        bankNumber: string;
    };
    sdkTransferId: number | string;
};

export type TtransferContinuationResponse =
    | SDKSchemeAdapter.V2_0_0.Outbound.Types.transferResponse
    | SDKSchemeAdapter.V2_0_0.Outbound.Types.errorTransferResponse;

export type TSDKClientDeps = {
    logger: ILogger;
    httpClient: IHTTPClient;
    schemeAdapterUrl: string;
};

export interface ISDKClient {
    initiateTransfer(transfer: TSDKOutboundTransferRequest): Promise<THttpResponse<TFineractOutboundTransferResponse>>;
    updateTransfer(
        transferAccept: TSDKTransferContinuationRequest,
        id: number,
    ): Promise<THttpResponse<TtransferContinuationResponse>>;
}
