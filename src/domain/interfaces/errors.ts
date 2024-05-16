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

'use strict';

import { ILogger } from './infrastructure';
import { loggerFactory } from '../../infra/logger';
import { TRefundErrorDeps } from '../FineractClient';

export class BaseError extends Error {
  constructor(message: string, context: string) {
    const logger: ILogger = loggerFactory({ context: context });
    super(message);
    logger.error(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// another approach with error class
export type ErrorOptions = {
  cause?: Error;
  httpCode?: number;
  mlCode?: string
  details?: unknown;
}

export class BasicError extends Error {
  cause?: Error;
  httpCode?: number;
  mlCode?: string; // Mojaloop error code
  details?: unknown;

  constructor(message: string, options?: ErrorOptions) {
        super(message, options);
        Error.captureStackTrace(this, BasicError);
        this.name = this.constructor.name;
        this.httpCode = options?.httpCode;
        this.mlCode = options?.mlCode;
        this.details = options?.details;
    }
}

export class InvalidAccountNumberError extends BasicError {
    constructor(message = 'Account number length is too short', options?: ErrorOptions) {
        super(message, {
          ...options,
          mlCode: '3101',
          httpCode: 400
        });
    }
}

export class AccountVerificationError extends BaseError {}

export class UnSupportedIdTypeError extends BaseError {}

export class RefundFailedError extends BaseError {
    readonly refundDetails: {
        amount: number;
        fineractAccountId: number;
    };
  // breaks Barbara Liskov's substitution principle!
    constructor(deps: TRefundErrorDeps) {
        super(deps.message, deps.context);
        this.refundDetails = deps.refundDetails;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
