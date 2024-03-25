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

 "use strict";

import { IHttpClient, ILogger, THttpResponse } from "../interfaces";
import {
    TLookupResponseInfo,
    TFineractConfig,
    TFineractSearchResponse,
    TFineractGetAccountResponse,
    TFineractGetClientResponse,
    IFineractClient,
    FineractLookupStage,
    TCalculateQuoteDeps,
    TCalculateQuoteResponse,
    TFineracttransferDeps,
    TFineractTransactionResponse,
} from "./types";


export const ROUTES = Object.freeze({
    search: "search",
    savingsAccount: "savingsaccounts",
    clients: "clients"
});

export class FineractClient implements IFineractClient{
    fineractConfig: TFineractConfig;
    httpClient: IHttpClient;
    logger: ILogger;

    constructor(
        fineractConfig: TFineractConfig,
        httpClient: IHttpClient,
        logger: ILogger
    ){
        this.fineractConfig = fineractConfig;
        this.httpClient = httpClient;
        this.logger = logger;
    }

    // todo:  refactor - function is too big (hard to read), lots of code duplication
    async lookupPartyInfo(accountNo: string):Promise<TLookupResponseInfo | undefined>{
        this.logger.info(`Looking up party with account ${accountNo}`);
        const res = await this.getAccountFineractIdWithAccountNo(accountNo);
        return res;
    }

    async calculateQuote(quoteDeps: TCalculateQuoteDeps): Promise<TCalculateQuoteResponse | undefined>{
        // Fineract has no fees for deposits
        const accountNo = quoteDeps.accountNo.toString();
        this.logger.info(`Calcuating quote for party with account ${accountNo}`);
        const res = this.getAccountFineractIdWithAccountNo(quoteDeps.accountNo);
        return res;

    }

    async transfer(transferDeps: TFineracttransferDeps): Promise<TFineractTransactionResponse | undefined>{
        const accountNo = transferDeps.transaction.accountNumber.toString();
        const amount = transferDeps.transaction.transactionAmount.toString();
        this.logger.info(`Transaction for party with account ${accountNo} worth ${amount}`);

        try {
            const transferRes = await this.sendTransfer(transferDeps);
            if(!transferRes){
                return;
            }

            return transferRes.data;

        } catch (error) {
            this.logger.error((error as Error).message);
            return;
        }

    }

    public async getAccountFineractIdWithAccountNo(accountNo: string): Promise<TLookupResponseInfo | undefined>{
        let stage = FineractLookupStage.SEARCH;
        try {
            const res = await this.searchAccount(accountNo);
            // check if res is defined
            if(!res){
                this.logger.error(`Search Account threw an Exception`);
                return {
                    data: undefined,
                    status: 0,
                    message: "Search Account threw an Exception",
                    stage: FineractLookupStage.SEARCH,
                    accountStatus: false,
                };
            }
            // check status code
            if(res.statusCode == 200 && res.data.length > 0){
                stage = FineractLookupStage.SAVINGSACCOUNT; // todo: where do you use it?
                const returnedEntity = res.data[0];
                if(!returnedEntity){
                    this.logger.warn(`Account Search in Fineract for account ${accountNo} Returned no Account`);
                    return {
                        data: undefined,
                        message: `Account Search in Fineract for account ${accountNo} Returned no Account`,
                        status: res.statusCode,
                        stage: FineractLookupStage.SEARCH,
                        accountStatus: false
                    };
                }
                const getAccountRes = await this.getSavingsAccount(returnedEntity.entityId);
                // check if res is defined
                if(!getAccountRes){
                    this.logger.error("Get Account threw an Exception");
                    return {
                        data: undefined,
                        status: 0,
                        message: "Get Account threw an Exception",
                        stage: FineractLookupStage.SAVINGSACCOUNT,
                        accountStatus: false
                    };
                }
                if(getAccountRes.statusCode == 200){
                    stage = FineractLookupStage.CLIENT; // todo: where do you use it?
                    const currency = getAccountRes.data.currency.code;
                    if(getAccountRes.data.status.active){
                        const getClientRes = await this.getClient(getAccountRes.data.clientId);
                        // check if res is defined
                        if(!getClientRes){
                            this.logger.error(`Get Client threw an Exception`);
                            return {
                                data: undefined,
                                status: 0,
                                message: "Get Client threw an Exception",
                                stage: FineractLookupStage.CLIENT,
                                accountStatus: false
                            };
                        }

                        if(getClientRes.statusCode == 200){
                            this.logger.info(`Got Client Details for account ${accountNo}`);
                            return {
                                accountId: returnedEntity.entityId,
                                data: getClientRes.data,
                                status: getClientRes.statusCode,
                                message: `Got Client Details for account ${accountNo}`,
                                stage: FineractLookupStage.CLIENT,
                                currency: currency,
                                accountStatus: true
                            };
                        }else{
                            this.logger.error(`StatusCode not 200 for get ${ROUTES.clients}. Returned ${getClientRes.statusCode}`);
                            return {
                                data: undefined,
                                message: `StatusCode not 200 for get ${ROUTES.clients}. Returned ${getClientRes.statusCode}`,
                                status: getClientRes.statusCode,
                                stage: FineractLookupStage.CLIENT,
                                accountStatus: false
                            };
                        }
                    }else{
                        this.logger.error(`Account with Acc No ${getAccountRes.data.accountNo} not active`);
                        return {
                            data: undefined,
                            message: `Account with Acc No ${getAccountRes.data.accountNo} not active`,
                            status: getAccountRes.statusCode,
                            stage: FineractLookupStage.SAVINGSACCOUNT,
                            accountStatus: false
                        };
                    }
                }else{
                    this.logger.error(`StatusCode not 200 for get ${ROUTES.savingsAccount}. Returned ${getAccountRes.statusCode}`);
                    return {
                        data: undefined,
                        message: `StatusCode not 200 for get ${ROUTES.savingsAccount}. Returned ${getAccountRes.statusCode}`,
                        status: getAccountRes.statusCode,
                        stage: FineractLookupStage.SAVINGSACCOUNT,
                        accountStatus: false
                    };
                }

            }else{
                this.logger.error(`StatusCode not 200 or is empty for ${ROUTES.search}. Returned ${res.statusCode}`);
                return {
                    data: undefined,
                    message: `StatusCode not 200 or is empty for ${ROUTES.search}. Returned ${res.statusCode}`,
                    status: res.statusCode,
                    stage: FineractLookupStage.SEARCH,
                    accountStatus: false
                };
            }
        } catch (error) {
            const { message, stack } = error as Error;
            // todo: always add your own log message
            this.logger.error(`error on lookupPartyInfo: ${message}`, { stack });
            return {
                data: undefined,
                message: (error as Error).message,
                status: 0, // todo: what does it mean - status: 0?
                stage: stage,
                accountStatus: false
            };
        }
    }

    private async searchAccount(accountNo: string): Promise<THttpResponse<TFineractSearchResponse> | undefined>{
        const url = `${this.fineractConfig.FINERACT_BASE_URL}/${ROUTES.search}?query=${accountNo}&resource=savingsaccount`;
        this.logger.info(`Request to fineract ${url}`);
        const res = await this.httpClient.send<TFineractSearchResponse>(
            url,
            {
                method: "GET",
                headers: {
                    "fineract-platform-tenantId": this.fineractConfig.FINERACT_TENTANT_ID,
                    "Authorization": this.getAuthHeader()
                }
            }
        );
        return res;
    }

    private async getSavingsAccount(accountId: number): Promise<THttpResponse<TFineractGetAccountResponse> | undefined>{
        const url = `${this.fineractConfig.FINERACT_BASE_URL}/${ROUTES.savingsAccount}/${accountId}`;
        this.logger.info(`Request to fineact ${url}`);
        const res = await this.httpClient.send<TFineractGetAccountResponse >(
            url,
            {
                method: "GET",
                headers: {
                    "fineract-platform-tenantId": this.fineractConfig.FINERACT_TENTANT_ID,
                    "Authorization": this.getAuthHeader()
                }
            }
        );
        return res;
    }

    private getAuthHeader():string{
        if(this.fineractConfig.FINERACT_AUTH_MODE == "oauth"){
            // return oauth request header
        }
        return `Basic ${Buffer.from(`${this.fineractConfig.FINERACT_USERNAME}:${this.fineractConfig.FINERACT_PASSWORD}`).toString("base64")}`;
    }

    private async getClient(clientId: number): Promise<THttpResponse<TFineractGetClientResponse> | undefined>{
        const url = `${this.fineractConfig.FINERACT_BASE_URL}/${ROUTES.clients}/${clientId}`;
        this.logger.info(`Request to fineract ${url}`);
        const res = await this.httpClient.send<TFineractGetClientResponse>(
            url,
            {
                method: "GET",
                headers: {
                    "fineract-platform-tenantId": this.fineractConfig.FINERACT_TENTANT_ID,
                    "Authorization": this.getAuthHeader()
                }
            }
        );
        return res;
    }

    private async sendTransfer(transactionPayload: TFineracttransferDeps ): Promise<THttpResponse<TFineractTransactionResponse> | undefined>{
        const url = `${this.fineractConfig.FINERACT_BASE_URL}/${ROUTES.savingsAccount}/${transactionPayload.accountId}/transactions?command=deposit`;
        this.logger.info(`Request to fineract ${url}`);
        const res = await this.httpClient.send<TFineractTransactionResponse>(
            url,
            {
                method:"POST",
                headers: {
                    "fineract-platform-tenantId": this.fineractConfig.FINERACT_TENTANT_ID,
                    "Authorization": this.getAuthHeader(),
                    "Content-Type": "application/json"
                },
                payload: transactionPayload.transaction
            }
        );
        return res;
    }
}
