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

import { FineractLookupStage, IFineractClient, IdType, PartyType, TFineractConfig } from "./FineractClient/types";
import { ILogger, TLookupPartyInfoResponse, TQuoteResponse, TQuoteRequest } from "./interfaces";

export class CoreConnectorAggregate{
    public IdType : string;
    private logger: ILogger;

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
                    dateOfBirth: "",
                    displayName: lookupRes.data.displayName,
                    extensionList: [ // why do we need this field?
                        {
                            key: "",
                            value: ""
                        }
                    ],
                    firstName: lookupRes.data.firstname,
                    fspId: this.fineractConfig.FINERACT_BANK_ID,
                    idSubValue: "",
                    idType: IdType.IBAN,
                    idValue: accountNo,
                    lastName: lookupRes.data.lastname,
                    merchantClassificationCode: "",
                    middleName: lookupRes.data.firstname,
                    type: PartyType.CONSUMER,
                    supportedCurrencies: lookupRes.currency,
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

        const quoteRes = await this.fineractClient.calculateQuote({accountNo:accountNo});

        if(!quoteRes || !quoteRes.accountStatus){
          // todo: add log here
            return;
        }else{
          // todo: move mapping logic to DTO
            const quoteResponse: TQuoteResponse = {
                expiration: "3092-12-31T23:17:34.658-06:45",
                extensionList: [
                  {
                    "key": "string",
                    "value": "string"
                  }
                ],
                geoCode: {
                  latitude: "34",
                  longitude: "-140"
                },
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

    extractAccountFromIBAN(IBAN:string): string{
        // if(!this.validateIBAN(IBAN)){
        //     throw new Error("IBAN is invalid");
        // } todo think how to validate account numbers
        const accountNo = IBAN.slice(
            this.fineractConfig.FINERACT_BANK_COUNTRY_CODE.length+
            this.fineractConfig.FINERACT_CHECK_DIGITS.length+
            this.fineractConfig.FINERACT_BANK_ID.length+
            this.fineractConfig.FINERACT_ACCOUNT_PREFIX.length
        );
        return accountNo;
    }

    // todo: please, do not comment each line
    validateIBAN(iban: string): boolean {
       // Remove spaces and convert to uppercase
        iban = iban.replace(/\s+/g, '').toUpperCase();

        // Check if IBAN is of the correct length for the specified country
        if (iban.length < 2 || iban.length > 34) {
            return false;
        }

        // Check if IBAN contains only alphanumeric characters
        if (!/^[A-Z0-9]+$/.test(iban)) {
            return false;
        }

        // Move the first 4 characters to the end
        iban = iban.substring(4) + iban.substring(0, 4);

        // Replace letters with digits (A=10, B=11, ..., Z=35)
        iban = iban.replace(/[A-Z]/g, (char) => (char.charCodeAt(0) - 55).toString());

        // Parse the IBAN as a number
        const ibanNumber = BigInt(iban);

        // Check if IBAN is valid (i.e., IBAN number modulo 97 equals 1)
        return ibanNumber % BigInt(97) === BigInt(1);
    }

 }
