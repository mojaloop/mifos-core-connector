/*****
 License
 --------------
 Copyright © 2020-2025 Mojaloop Foundation
 The Mojaloop files are made available by the Mojaloop Foundation under the Apache License, Version 2.0 (the "License") and you may not use these files except in compliance with the License. You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, the Mojaloop files are distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

 Contributors
 --------------
 This is the official list of the Mojaloop project contributors for this file.
 Names of the original copyright holders (individuals or organizations)
 should be listed with a '*' in the first column. People who have
 contributed from an organization can be listed under the organization
 that actually holds the copyright for their contributions (see the
 Mojaloop Foundation for an example). Those individuals should have
 their names indented and be marked with a '-'. Email address can be added
 optionally within square brackets <email>.

 * Mojaloop Foundation
 - Name Surname <name.surname@mojaloop.io>



 - Okello Ivan Elijah <elijahokello90@gmail.com>

 --------------
 ******/

'use strict';

import { TJson } from './types';

export type ErrorOptions = {
    cause?: Error;
    httpCode: number;
    mlCode?: string;
    details?: TJson;
};

type RefundDetails = {
    amount: number;
    fineractAccountId: number;
};

export class BasicError extends Error {
    cause?: Error;
    httpCode?: number;
    mlCode?: string; // Mojaloop error code
    details?: TJson;

    constructor(message: string, options?: ErrorOptions) {
        super(message, options);
        Error.captureStackTrace(this, BasicError);
        this.name = this.constructor.name;
        this.httpCode = options?.httpCode;
        this.mlCode = options?.mlCode;
        this.details = options?.details;
    }
}

export class ValidationError extends BasicError {
    static invalidAccountNumberError() {
        return new ValidationError('Account number length is too short', {
            mlCode: '3101',
            httpCode: 400,
        });
    }

    static accountVerificationError() {
        return new ValidationError('Funds Source Account is not active in Fineract', {
            mlCode: '3200',
            httpCode: 500,
        });
    }

    static unsupportedIdTypeError() {
        return new ValidationError('Unsupported Id Type', {
            mlCode: '3100',
            httpCode: 400,
        });
    }

    static quoteValidationError() {
        return new ValidationError('Quote Validation Failed', {
            mlCode: '5101',
            httpCode: 500,
        });
    }

    static unsupportedCurrency() {
        return new ValidationError('Unsupported Currency', {
            mlCode: '5106',
            httpCode: 500,
        });
    }

    static partyIdNotProvided() {
        return new ValidationError('Party Id not Provided', {
            mlCode: '5000',
            httpCode: 500,
        });
    }

    static transferNotComplete(mlCode: string, httCode: number) {
        return new ValidationError('Transfer Aborted due to error as specified in request body', {
            mlCode: mlCode,
            httpCode: httCode,
        });
    }

    // think, if it's better to move to a separate class
    static refundFailedError(details: RefundDetails) {
        return new ValidationError('Refund Failed', {
            mlCode: '2001',
            httpCode: 500,
            details, // object returned to allow for reconciliation later
        });
    }
}
