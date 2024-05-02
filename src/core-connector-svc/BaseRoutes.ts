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

import { ResponseToolkit } from '@hapi/hapi';
import { ResponseValue } from 'hapi';
import { AccountVerificationError, InvalidAccountNumberError, UnSupportedIdTypeError } from '../domain';
import {
    FineractAccountNotActiveError,
    FineractAccountNotFoundError,
    FineractDepositFailedError,
    FineractGetAccountWithIdError,
    FineractGetChargesError,
    FineractGetClientWithIdError,
    FineractWithdrawFailedError,
    SearchFineractAccountError,
} from '../domain/FineractClient';

export class BaseRoutes {
    protected handleResponse(data: unknown, h: ResponseToolkit, statusCode: number = 200) {
        return h.response(data as ResponseValue).code(statusCode);
    }

    protected handleError(error: unknown, h: ResponseToolkit) {
        if (error instanceof InvalidAccountNumberError) {
            return h.response({ status: '3101', message: error.message }).code(400);
        } else if (error instanceof AccountVerificationError) {
            return h
                .response({
                    status: '3200',
                    message: error.message,
                })
                .code(500);
        } else if (error instanceof UnSupportedIdTypeError) {
            return h
                .response({
                    status: '3100',
                    message: error.message,
                })
                .code(500);
        } else if (error instanceof FineractWithdrawFailedError) {
            return h.response({ status: '4000', message: error.message }).code(500);
        } else if (error instanceof SearchFineractAccountError) {
            return h.response({ status: '3200', message: error.message }).code(500);
        } else if (error instanceof FineractAccountNotFoundError) {
            return h.response({ status: '3200', message: error.message }).code(404);
        } else if (error instanceof FineractGetAccountWithIdError) {
            return h.response({ status: '4000', message: error.message }).code(500);
        } else if (error instanceof FineractAccountNotActiveError) {
            return h.response({ status: '4000', message: error.message }).code(500);
        } else if (error instanceof FineractGetClientWithIdError) {
            return h.response({ status: '4000', message: error.message }).code(500);
        } else if (error instanceof FineractDepositFailedError) {
            return h.response({ status: '4000', message: error.message }).code(500);
        } else if (error instanceof FineractGetChargesError) {
            return h.response({ status: '4000', message: error.message }).code(500);
        } else {
            return h.response({ status: '4000', message: 'Unknown Error' }).code(500);
        }
    }
}