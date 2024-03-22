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

import { AxiosClientFactory } from "../../src/infra/axiosHttpClient";
import { CONFIG } from "../../src/core-connector-svc/config";
import { FineractClientFactory } from "../../src/domain/FineractClient";
import { TFineractConfig } from "../../src/domain/FineractClient/types";
import { loggerFactory } from "../../src/infra/logger";
import { CoreConnectorAggregate } from "../../src/domain";


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

jest.setTimeout(50000);

 describe("Core Connector Unit Tests", ()=>{
    test("first test",async ()=>{
        const IBAN = "SK680720000289000000002";
        await coreConnectorAggregate.getParties(IBAN);
    });
 });