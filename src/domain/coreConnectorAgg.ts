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
import { ILogger, TLookupPartyInfoResponse } from "./interfaces";

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
            return;
        }

        if(lookupRes.stage == FineractLookupStage.CLIENT && lookupRes.status == 200 && lookupRes.currency != null){
            const party = {
                data : {
                    dateOfBirth: "",
                    displayName: lookupRes.data.displayName,
                    extensionList: [
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
            this.logger.info(`Party found \n${JSON.stringify(party)}`);
            return party;
        }else{
            return;
        }
    }

    private extractAccountFromIBAN(IBAN:string): string{
        const accountNo = IBAN.slice(
            this.fineractConfig.FINERACT_BANK_COUNTRY_CODE.length+
            this.fineractConfig.FINERACT_CHECK_DIGITS.length+
            this.fineractConfig.FINERACT_BANK_ID.length+
            this.fineractConfig.FINERACT_ACCOUNT_PREFIX.length
        );
        return accountNo;
    }

 }