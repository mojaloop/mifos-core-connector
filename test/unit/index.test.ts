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
import { randomUUID } from "crypto";
import { AxiosClientFactory } from "../../src/infra/axiosHttpClient";
import { CONFIG } from "../../src/core-connector-svc/config";
import { FineractClientFactory } from "../../src/domain/FineractClient";
import { TFineractConfig } from "../../src/domain/FineractClient/types";
import { loggerFactory } from "../../src/infra/logger";
import { CoreConnectorAggregate, TQuoteRequest } from "../../src/domain";


const logger = loggerFactory({context: "Mifos Core Connector Tests"});
const fineractConfig = CONFIG.fineractConfig as TFineractConfig ;


const httpClient = AxiosClientFactory.createAxiosClientInstance();
const fineractClient = FineractClientFactory.createClient({
    fineractConfig,
    httpClient, 
    logger,
});
const coreConnectorAggregate = new CoreConnectorAggregate(
    fineractConfig,
    fineractClient,
    logger
);

const IBAN = "SK680720000289000000002";

jest.setTimeout(50000);

 describe("Core Connector Aggregate Unit Tests", ()=>{
    test("Aggregate Get Parties. Should return status code 200 for an existent account",async ()=>{
        const res = await coreConnectorAggregate.getParties(IBAN);
        expect(res?.statusCode).toEqual(200);
    });

    test("Aggregate Qoute Request. Should return if account is active ", async ()=>{
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
              "idType": fineractConfig.FINERACT_ID_TYPE,
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
        const res = await coreConnectorAggregate.quoterequest(quoteRequest);

        expect(res).toBeTruthy();
    });
 });