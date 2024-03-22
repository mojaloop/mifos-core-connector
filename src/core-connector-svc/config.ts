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

import { config } from 'dotenv';
import { IdType } from '../domain/FineractClient/types';

config(); // todo: we don't need it in production

// todo: use convict to deal with env vars
 export const CONFIG = {
    fineractConfig :{
        FINERACT_BASE_URL: process.env["FINERACT_BASE_URL"] != null ? process.env["FINERACT_BASE_URL"] : null,
        FINERACT_TENTANT_ID: process.env["FINERACT_TENTANT_ID"] != null ? process.env["FINERACT_TENTANT_ID"]: null,
        FINERACT_AUTH_MODE: process.env["FINERACT_AUTH_MODE"] != null ? process.env["FINERACT_AUTH_MODE"]: null,
        FINERACT_USERNAME: process.env["FINERACT_USERNAME"] != null ? process.env["FINERACT_USERNAME"]: null,
        FINERACT_PASSWORD: process.env["FINERACT_PASSWORD"] != null ? process.env["FINERACT_PASSWORD"]: null,
        FINERACT_BANK_ID: process.env["FINERACT_BANK_ID"] != null ? process.env["FINERACT_BANK_ID"]: null,
        FINERACT_ACCOUNT_PREFIX: process.env["FINERACT_ACCOUNT_PREFIX"] != null ? process.env["FINERACT_ACCOUNT_PREFIX"]: "",
        FINERACT_BANK_COUNTRY_CODE: process.env["FINERACT_BANK_COUNTRY_CODE"] != null ? process.env["FINERACT_BANK_COUNTRY_CODE"]: null,
        FINERACT_CHECK_DIGITS: process.env["FINERACT_CHECK_DIGITS"] != null ? process.env["FINERACT_CHECK_DIGITS"]: null,
        FINERACT_ID_TYPE: IdType.IBAN
    },
    server: {
        HOST: process.env["HOST"],
        PORT: process.env["PORT"],
    }
 };
