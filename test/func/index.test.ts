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

import axios from "axios";
import { randomUUID } from "crypto";
import { CONFIG, Service } from "../../src/core-connector-svc";
import { loggerFactory } from "../../src/infra/logger";
import { TQuoteRequest } from "../../src/domain/interfaces";


jest.setTimeout(1000000);
const logger = loggerFactory({context: "Core Connector Tests"});
const IBAN = "SK680720000289000000002";
const IdType = "IBAN";
const baseurl = `http://${CONFIG.server.HOST?.toString()}:${CONFIG.server.PORT?.toString()}`;

function extractAccountFromIBAN(IBAN:string): string{
    const accountNo = IBAN.slice(
        (CONFIG.fineractConfig.FINERACT_BANK_COUNTRY_CODE as string).length+
        (CONFIG.fineractConfig.FINERACT_CHECK_DIGITS as string).length+
        (CONFIG.fineractConfig.FINERACT_BANK_ID as string).length+
        CONFIG.fineractConfig.FINERACT_ACCOUNT_PREFIX.length
    );
    return accountNo;
}

 describe("Mifos Core Connector Functional Tests", ()=>{
    beforeAll(async ()=>{
        await Service.start();
    });

    afterAll(async ()=>{
        await Service.stop();
    });

    test("GET /parties/IBAN/{ID} Should return party info if it exists in fineract",async ()=>{
        const url = `${baseurl}/parties/IBAN/${IBAN}`;
        const res = await axios.get(url);   
        logger.info(res.data);

        expect(res.data["idValue"]).toEqual(extractAccountFromIBAN(IBAN));
    });

    test("POST /quoterequests Should return quote if party info exists", async ()=>{
        const quoteRequest : TQuoteRequest= {
            "homeR2PTransactionId": "string",
            "amount": "5.6",
            "amountType": "SEND",
            "currency": "AED",
            "expiration": "6000-02-29T20:02:59.152Z",
            "extensionList": [
              {
                "key": "string",
                "value": "string"
              }
            ],
            "feesAmount": "0.02",
            "feesCurrency": "AED",
            "from": {
              "dateOfBirth": "2036-10-31",
              "displayName": "string",
              "extensionList": [
                {
                  "key": "string",
                  "value": "string"
                }
              ],
              "firstName": "string",
              "fspId": "string",
              "idSubValue": "string",
              "idType": "MSISDN",
              "idValue": "string",
              "lastName": "string",
              "merchantClassificationCode": "string",
              "middleName": "string",
              "type": "CONSUMER",
            },
            "geoCode": {
              "latitude": "52",
              "longitude": "+180"
            },
            "initiator": "PAYER",
            "initiatorType": "CONSUMER",
            "note": "string",
            "quoteId": "adbdb5be-d359-300a-bbcf-60d25a2ef3f9",
            "subScenario": "string",
            "to": {
              "dateOfBirth": "2800-02-29",
              "displayName": "string",
              "extensionList": [
                {
                  "key": "string",
                  "value": "string"
                }
              ],
              "firstName": "string",
              "fspId": "string",
              "idSubValue": "string",
              "idType": IdType,
              "idValue": IBAN,
              "lastName": "string",
              "merchantClassificationCode": "string",
              "middleName": "string",
              "type": "CONSUMER"
            },
            "transactionId": randomUUID(),
            "transactionType": "TRANSFER",
            "transactionRequestId": randomUUID(),
          };
        const url = `${baseurl}/quoterequests`;
        const res =  await axios.post(
            url,
            JSON.stringify(quoteRequest),
            {
                headers:{
                    "Content-Type":"application/json"
                }
            }
        );
        expect(res.status).toEqual(200);
    });
 });

 