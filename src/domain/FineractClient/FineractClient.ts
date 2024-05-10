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

import { IHTTPClient, ILogger, THttpResponse } from '../interfaces';
import {
    TLookupResponseInfo,
    TFineractConfig,
    TFineractSearchResponse,
    TFineractGetAccountResponse,
    TFineractGetClientResponse,
    IFineractClient,
    TCalculateQuoteDeps,
    TCalculateQuoteResponse,
    TFineractTransferDeps,
    TFineractTransactionResponse,
    TFineractTransactionPayload,
    TFineractGetChargeResponse,
} from './types';
import {
    FineractAccountNotActiveError,
    FineractAccountNotFoundError,
    FineractDepositFailedError,
    FineractGetAccountWithIdError,
    FineractGetChargesError,
    FineractGetClientWithIdError,
    FineractWithdrawFailedError,
    SearchFineractAccountError,
} from './errors';

export const ROUTES = Object.freeze({
    search: 'search',
    savingsAccount: 'savingsaccounts',
    clients: 'clients',
    charges: 'charges',
});

export class FineractClient implements IFineractClient {
    fineractConfig: TFineractConfig;
    httpClient: IHTTPClient;
    logger: ILogger;

    constructor(fineractConfig: TFineractConfig, httpClient: IHTTPClient, logger: ILogger) {
        this.fineractConfig = fineractConfig;
        this.httpClient = httpClient;
        this.logger = logger;
    }

    async lookupPartyInfo(accountNo: string): Promise<TLookupResponseInfo> {
        this.logger.info(`Looking up party with account ${accountNo}`);
        return await this.getAccountId(accountNo);
    }

    async calculateWithdrawQuote(quoteDeps: TCalculateQuoteDeps): Promise<TCalculateQuoteResponse> {
        // Check this for documentation on charge schema. https://demo.mifos.io/api-docs/apiLive.htm#charges
        this.logger.info(`Calculating quote `);
        const charges = await this.getCharges();

        let fee = 0;

        charges.data.forEach((charge) => {
            if (charge.chargeAppliesTo.id == 2 && charge.chargeTimeType.id == 5) {
                if (charge.chargeCalculationType.id == 1) {
                    fee = fee + charge.amount;
                } else {
                    fee = fee + (charge.amount / 100) * quoteDeps.amount;
                }
            }
        });

        return {
            feeAmount: fee,
        };
    }

    async verifyBeneficiary(accountNo: string): Promise<TLookupResponseInfo> {
        // Fineract has no fees for deposits. Only calculating for withdraws.
        this.logger.info(`Calculating quote for party with account ${accountNo}`);
        return await this.getAccountId(accountNo);
    }

    async receiveTransfer(transferDeps: TFineractTransferDeps): Promise<THttpResponse<TFineractTransactionResponse>> {
        const accountNo = transferDeps.transaction.accountNumber.toString();
        const amount = transferDeps.transaction.transactionAmount.toString();
        this.logger.info(`Transaction for party with account ${accountNo} worth ${amount}`);

        try {
            const url = `${this.fineractConfig.FINERACT_BASE_URL}/${ROUTES.savingsAccount}/${transferDeps.accountId}/transactions?command=deposit`;
            this.logger.info(`Request to fineract ${url}`);
            return await this.httpClient.send<TFineractTransactionResponse>({
                url: url,
                method: 'POST',
                headers: {
                    ...this.getDefaultHeaders(),
                    'Content-Type': 'application/json',
                },
                data: transferDeps.transaction,
            });
        } catch (error) {
            this.logger.error((error as Error).message);
            throw new FineractDepositFailedError((error as Error).message, 'FIN');
        }
    }

    async getAccountId(accountNo: string): Promise<TLookupResponseInfo> {
        this.logger.info(`Searching for Account with account number ${accountNo}`);
        const res = await this.searchAccount(accountNo);
        if (res.statusCode != 200) {
            throw new SearchFineractAccountError('Search for Account Failed', 'FIN');
        } else if (!(res.data.length > 0) && res.data[0] != undefined) {
            throw new FineractAccountNotFoundError(`Account number ${accountNo} not found`, 'FIN');
        }
        const returnedEntity = res.data[0];
        const getAccountRes = await this.getSavingsAccount(returnedEntity.entityId);
        if (getAccountRes.statusCode != 200) {
            throw new FineractGetAccountWithIdError(
                `Get Account for entity ${JSON.stringify(returnedEntity)} failed`,
                'FIN',
            );
        } else if (!getAccountRes.data.status.active) {
            throw new FineractAccountNotActiveError(
                `Fineract Account not active ${JSON.stringify(getAccountRes)}`,
                'FIN',
            );
        }
        const currency = getAccountRes.data.currency.code;
        const getClientRes = await this.getClient(getAccountRes.data.clientId);
        if (getClientRes.statusCode != 200) {
            throw new FineractGetClientWithIdError(
                `Failed to get client with Id ${getAccountRes.data.clientId}`,
                'FIN',
            );
        }
        const lookUpRes = {
            accountId: returnedEntity.entityId,
            data: getClientRes.data,
            status: getClientRes.statusCode,
            currency: currency,
        };
        this.logger.info(`Client details found ${lookUpRes}`);
        return lookUpRes;
    }

    private async searchAccount(accountNo: string): Promise<THttpResponse<TFineractSearchResponse>> {
        const url = `${this.fineractConfig.FINERACT_BASE_URL}/${ROUTES.search}?query=${accountNo}&resource=savingsaccount`;
        this.logger.info(`Request to fineract ${url}`);
        return await this.httpClient.send<TFineractSearchResponse>({
            url: url,
            method: 'GET',
            headers: {
                ...this.getDefaultHeaders(),
            },
        });
    }

    async getSavingsAccount(accountId: number): Promise<THttpResponse<TFineractGetAccountResponse>> {
        const url = `${this.fineractConfig.FINERACT_BASE_URL}/${ROUTES.savingsAccount}/${accountId}`;
        this.logger.info(`Request to fineract ${url}`);
        return await this.httpClient.send<TFineractGetAccountResponse>({
            url: url,
            method: 'GET',
            headers: {
                ...this.getDefaultHeaders(),
            },
        });
    }

    private getDefaultHeaders() {
        return {
            'fineract-platform-tenantId': this.fineractConfig.FINERACT_TENANT_ID,
            Authorization: this.getAuthHeader(),
        };
    }

    private getAuthHeader(): string {
        if (this.fineractConfig.FINERACT_AUTH_MODE == 'oauth') {
            // return oauth request header
        }
        return `Basic ${Buffer.from(`${this.fineractConfig.FINERACT_USERNAME}:${this.fineractConfig.FINERACT_PASSWORD}`).toString('base64')}`;
    }

    private async getClient(clientId: number): Promise<THttpResponse<TFineractGetClientResponse>> {
        const url = `${this.fineractConfig.FINERACT_BASE_URL}/${ROUTES.clients}/${clientId}`;
        this.logger.info(`Request to fineract ${url}`);
        return await this.httpClient.send<TFineractGetClientResponse>({
            url: url,
            method: 'GET',
            headers: {
                ...this.getDefaultHeaders(),
            },
        });
    }

    async sendTransfer(
        transactionPayload: TFineractTransferDeps,
    ): Promise<THttpResponse<TFineractTransactionResponse>> {
        this.logger.info('Request to fineract. Withdraw');
        const url = `${this.fineractConfig.FINERACT_BASE_URL}/${ROUTES.savingsAccount}/${transactionPayload.accountId}/transactions?command=withdrawal`;
        try {
            return await this.httpClient.post<TFineractTransactionPayload, TFineractTransactionResponse>(
                url,
                transactionPayload.transaction,
                {
                    headers: {
                        ...this.getDefaultHeaders(),
                        'Content-Type': 'application/json',
                    },
                },
            );
        } catch (error) {
            this.logger.error(error as Error);
            throw new FineractWithdrawFailedError((error as Error).message, 'FIN');
        }
    }

    async getCharges(): Promise<THttpResponse<TFineractGetChargeResponse>> {
        this.logger.info('Request to get charges. Quote');
        const url = `${this.fineractConfig.FINERACT_BASE_URL}/${ROUTES.charges}`;

        try {
            return await this.httpClient.get<TFineractGetChargeResponse>(url, {
                headers: {
                    ...this.getDefaultHeaders(),
                    'Content-Type': 'application/json',
                },
            });
        } catch (error) {
            this.logger.error(error as Error);
            throw new FineractGetChargesError((error as Error).message, 'FIN');
        }
    }
}
