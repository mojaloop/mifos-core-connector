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
    TCalculateQuoteResponse
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

    async lookupPartyInfo(accountNo: string):Promise<TLookupResponseInfo | undefined>{
        this.logger.info(`Looking up party with account ${accountNo}`);
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
                    stage: FineractLookupStage.SEARCH
                };
            }
            // check status code
            if(res.statusCode == 200 && res.data.length > 0){
                stage = FineractLookupStage.SAVINGSACCOUNT;
                const returnedEntity = res.data[0];
                if(!returnedEntity){
                    this.logger.warn(`Account Search in Fineract for account ${accountNo} Returned no Account`);
                    return {
                        data: undefined, 
                        message: `Account Search in Fineract for account ${accountNo} Returned no Account`,
                        status: res.statusCode,
                        stage: FineractLookupStage.SEARCH
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
                        stage: FineractLookupStage.SAVINGSACCOUNT
                    };
                }
                if(getAccountRes.statusCode == 200){
                    stage = FineractLookupStage.CLIENT;
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
                                stage: FineractLookupStage.CLIENT
                            };
                        }

                        if(getClientRes.statusCode == 200){
                            this.logger.info(`Got Client Details for account ${accountNo}`);
                            return {
                                data: getClientRes.data,
                                status: getClientRes.statusCode,
                                message: `Got Client Details for account ${accountNo}`,
                                stage: FineractLookupStage.CLIENT,
                                currency: currency
                            };
                        }else{
                            this.logger.error(`StatusCode not 200 for get ${ROUTES.clients}. Returned ${getClientRes.statusCode}`);
                            return {
                                data: undefined, 
                                message: `StatusCode not 200 for get ${ROUTES.clients}. Returned ${getClientRes.statusCode}`,
                                status: getClientRes.statusCode,
                                stage: FineractLookupStage.CLIENT
                            };
                        }
                    }else{
                        this.logger.error(`Account with Acc No ${getAccountRes.data.accountNo} not active`);
                        return {
                            data: undefined, 
                            message: `Account with Acc No ${getAccountRes.data.accountNo} not active`,
                            status: getAccountRes.statusCode,
                            stage: FineractLookupStage.SAVINGSACCOUNT
                        };
                    }
                }else{
                    this.logger.error(`StatusCode not 200 for get ${ROUTES.savingsAccount}. Returned ${getAccountRes.statusCode}`);
                    return {
                        data: undefined, 
                        message: `StatusCode not 200 for get ${ROUTES.savingsAccount}. Returned ${getAccountRes.statusCode}`,
                        status: getAccountRes.statusCode,
                        stage: FineractLookupStage.SAVINGSACCOUNT
                    };
                }
                
            }else{
                this.logger.error(`StatusCode not 200 or is empty for ${ROUTES.search}. Returned ${res.statusCode}`);
                return {
                    data: undefined, 
                    message: `StatusCode not 200 or is empty for ${ROUTES.search}. Returned ${res.statusCode}`,
                    status: res.statusCode,
                    stage: FineractLookupStage.SEARCH
                };
            }
        } catch (error) {
            this.logger.error((error as Error).message);
            return {
                data: undefined, 
                message: (error as Error).message, 
                status: 0, 
                stage: stage
            };
        }
    }

    async calculateQuote(quoteDeps: TCalculateQuoteDeps): Promise<TCalculateQuoteResponse | undefined>{
        // Fineract has no fees for deposits
        const accountNo = quoteDeps.accountNo.toString();
        this.logger.info(`Calcuating quote for party with account ${accountNo}`);

        let stage = FineractLookupStage.SEARCH;

        try{
            const res = await this.searchAccount(accountNo);
            // check if res is defined
            if(!res){
                this.logger.error(`Search Account threw an Exception`);
                return {
                    accountStatus: false,
                    stage: stage
                };
            }
            // check status code
            if(res.statusCode == 200 && res.data.length > 0){
                stage = FineractLookupStage.SAVINGSACCOUNT;
                const returnedEntity = res.data[0];
                if(!returnedEntity){
                    this.logger.warn(`Account Search in Fineract for account ${accountNo} Returned no Account`);
                    return {
                        accountStatus: false,
                        stage: stage
                    };
                }
                const getAccountRes = await this.getSavingsAccount(returnedEntity.entityId);
                // check if res is defined
                if(!getAccountRes){
                    this.logger.error("Get Account threw an Exception");
                    return {
                        accountStatus: false,
                        stage: stage
                    };
                }
                if(getAccountRes.statusCode == 200){
                    stage = FineractLookupStage.CLIENT;
                    if(getAccountRes.data.status.active){
                        const getClientRes = await this.getClient(getAccountRes.data.clientId);
                        // check if res is defined
                        if(!getClientRes){
                            this.logger.error(`Get Client threw an Exception`);
                            return {
                                accountStatus: false,
                                stage: stage
                            };
                        }

                        if(getClientRes.statusCode == 200){
                            this.logger.info(`Got Client Details for account ${accountNo}`);
                            return {
                                accountStatus: true,
                                stage: stage
                            };
                        }else{
                            this.logger.error(`StatusCode not 200 for get ${ROUTES.clients}. Returned ${getClientRes.statusCode}`);
                            return {
                                accountStatus: false,
                                stage: stage
                            };
                        }
                    }else{
                        this.logger.error(`Account with Acc No ${getAccountRes.data.accountNo} not active`);
                        return {
                            accountStatus: false,
                            stage: stage
                        };
                    }
                }else{
                    this.logger.error(`StatusCode not 200 for get ${ROUTES.savingsAccount}. Returned ${getAccountRes.statusCode}`);
                    return {
                        accountStatus: false,
                        stage: stage
                    };
                }
                
            }else{
                this.logger.error(`StatusCode not 200 or is empty for ${ROUTES.search}. Returned ${res.statusCode}`);
                return {
                    accountStatus: false,
                    stage: stage
                };
            }
        }catch (error) {
            this.logger.error((error as Error).message);
            return {
                accountStatus: false, 
                stage: stage
            };
        }
        
        
    }

    private async searchAccount(accountNo: string): Promise<THttpResponse<TFineractSearchResponse> | undefined>{
        this.logger.info(`Request to fineract ${this.fineractConfig.FINERACT_BASE_URL}/${ROUTES.search}?query=${accountNo}&resource=savingsaccount`);
        const res = await this.httpClient.send<TFineractSearchResponse>(
            `${this.fineractConfig.FINERACT_BASE_URL}/${ROUTES.search}?query=${accountNo}&resource=savingsaccount`,
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
        this.logger.info(`Request to fineact ${this.fineractConfig.FINERACT_BASE_URL}/${ROUTES.savingsAccount}/${accountId}`);
        const res = await this.httpClient.send<TFineractGetAccountResponse >(
            `${this.fineractConfig.FINERACT_BASE_URL}/${ROUTES.savingsAccount}/${accountId}`,
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
        this.logger.info(`Request to fineract ${this.fineractConfig.FINERACT_BASE_URL}/${ROUTES.clients}/${clientId}`);
        const res = await this.httpClient.send<TFineractGetClientResponse>(
            `${this.fineractConfig.FINERACT_BASE_URL}/${ROUTES.clients}/${clientId}`,
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
}