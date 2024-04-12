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

import { randomUUID } from "crypto";
import {
    FineractLookupStage,
    IFineractClient,
    IdType,
    PartyType,
    TFineractConfig,
    TFineractTransactionPayload
 } from "./FineractClient/types";
import {
    ILogger,
    TLookupPartyInfoResponse,
    TQuoteResponse,
    TQuoteRequest,
    TtransferResponse,
    TtransferRequest
} from "./interfaces";

export class CoreConnectorAggregate{
    public IdType : string;
    private logger: ILogger;
    DATE_FORMAT = "dd MM yy";

    constructor(
        private readonly fineractConfig: TFineractConfig,
        private readonly fineractClient: IFineractClient,
        logger: ILogger
    ){
        this.IdType = fineractConfig.FINERACT_ID_TYPE;
        this.logger = logger;
    }

    async getParties(IBAN: string): Promise<TLookupPartyInfoResponse | undefined>{
        this.logger.info(`Get Parties for IBAN ${IBAN}`);
        // extract Account No from IBAN
        const accountNo = this.extractAccountFromIBAN(IBAN);

        if(accountNo.length < 1){
            return;
        }

        // Call Fineract to lookup account
        const lookupRes = await this.fineractClient.lookupPartyInfo(accountNo);

        if(!lookupRes || !lookupRes.data){
            this.logger.warn(`no lookupPartyInfo by accountNo`, { accountNo });
            return;
        }

        if(lookupRes.stage == FineractLookupStage.CLIENT && lookupRes.status == 200 && lookupRes.currency != null){
          // todo: move to DTO
          const party = {
                data : {
                    displayName: lookupRes.data.displayName,
                    firstName: lookupRes.data.firstname,
                    idType: IdType.IBAN,
                    idValue: accountNo,
                    lastName: lookupRes.data.lastname,
                    middleName: lookupRes.data.firstname,
                    type: PartyType.CONSUMER,
                    kycInformation: `${JSON.stringify(lookupRes.data)}`,
                },
                statusCode: lookupRes.status
            };
            this.logger.info(`Party found`, { party });
            return party;
        }else{
            return;
        }
    }

    async quoterequest(quoterequest: TQuoteRequest):Promise<TQuoteResponse | undefined>{
        // Currently fineract currently does not charge for deposits
        if(quoterequest.to.idType != this.IdType){
            throw new Error("Unsupported ID Type");
        }
        this.logger.info(`Get Parties for ${this.IdType} ${quoterequest.to.idValue}`);
        const accountNo = this.extractAccountFromIBAN(quoterequest.to.idValue);
        if(accountNo.length < 1){
            return;
        }

        const quoteRes = await this.fineractClient.calculateQuote({accountNo:accountNo});

        if(!quoteRes || !quoteRes.accountStatus){
          // todo: add log here
            return;
        }else{
          // todo: move mapping logic to DTO
            const quoteResponse: TQuoteResponse = {
                expiration: new Date().toJSON(),
                payeeFspCommissionAmount: "0",
                payeeFspCommissionAmountCurrency: quoterequest.currency,
                payeeFspFeeAmount: "0",
                payeeFspFeeAmountCurrency: quoterequest.currency,
                payeeReceiveAmount: quoterequest.amount,
                payeeReceiveAmountCurrency: quoterequest.currency,
                quoteId: quoterequest.quoteId,
                transactionId: quoterequest.transactionId,
                transferAmount: quoterequest.amount,
                transferAmountCurrency: quoterequest.currency
              };
            return quoteResponse;
        }
    }

    async transfer(transfer: TtransferRequest ): Promise<TtransferResponse | undefined>{
        if(transfer.to.idType != this.IdType){
            throw new Error("Unsupported ID Type");
        }
        this.logger.info(`Transfer for  ${this.IdType} ${transfer.to.idValue}`);
        const accountNo = this.extractAccountFromIBAN(transfer.to.idValue);
        if(accountNo.length < 1){
            return;
        }

        const res = await this.fineractClient.getAccountFineractIdWithAccountNo(accountNo);
        if(!res || res.accountId == null){
            return;
        }
        const date = new Date();
        const transaction : TFineractTransactionPayload = {
            locale: this.fineractConfig.FINERACT_LOCALE,
            dateFormat: this.DATE_FORMAT,
            transactionDate: `${date.getDate()} ${date.getMonth()+1} ${date.getFullYear()}`,
            transactionAmount: transfer.amount,
            paymentTypeId: "1",
            accountNumber: accountNo,
            routingCode: randomUUID(),
            receiptNumber: randomUUID(),
            bankNumber: this.fineractConfig.FINERACT_BANK_ID
        };
        const transferRes = await this.fineractClient.transfer({
            accountId: res.accountId as number,
            transaction: transaction
        });
        if(!transferRes){
            return;
        }
        const transferResponse : TtransferResponse = {
            completedTimestamp : new Date().toJSON(),
            homeTransactionId: transfer.transferId,
            transferState: "COMMITTED"
        };
        return transferResponse;
    }

    extractAccountFromIBAN(IBAN:string): string{
        // todo think how to validate account numbers
        const accountNo = IBAN.slice(
            this.fineractConfig.FINERACT_BANK_COUNTRY_CODE.length+
            this.fineractConfig.FINERACT_CHECK_DIGITS.length+
            this.fineractConfig.FINERACT_BANK_ID.length+
            this.fineractConfig.FINERACT_ACCOUNT_PREFIX.length
        );
        return accountNo;
    }
 }
